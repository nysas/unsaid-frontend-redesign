-- =====================================================================
-- UNSAID — initial schema
--
-- Privacy model (the important part):
--   * Base tables are locked down by RLS: you can only read your OWN rows.
--   * Everything other people see goes through the public_* views, which
--     expose an explicit column list and never include author_id /
--     replier_id / rater_id. An asker's identity cannot be queried by
--     another user, even with a hand-written API call.
--   * Cross-user side effects (notifications, counters, moderation) run in
--     SECURITY DEFINER triggers/functions so clients never need wider access.
-- =====================================================================

-- ---------- Domain type ------------------------------------------------
create domain public.unsaid_domain as text check (value in (
  'Relationships & Friendships', 'Family', 'College & Education', 'Career',
  'Technology', 'Money', 'Lifestyle', 'Personal Growth'
));

-- ---------- Tables -----------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null check (username ~ '^[A-Za-z0-9_.]{3,24}$'),
  bio text not null default '' check (char_length(bio) <= 140),
  avatar_seed text not null default 'quiet' check (char_length(avatar_seed) <= 40),
  has_completed_onboarding boolean not null default false,
  asker_active boolean not null default false,
  replier_active boolean not null default false,
  is_admin boolean not null default false,
  notification_prefs jsonb not null default
    '{"answer": true, "feedback": true, "assessment": true, "safety": true}'::jsonb,
  created_at timestamptz not null default now()
);
create unique index profiles_username_lower_idx on public.profiles (lower(username));

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  domain public.unsaid_domain not null,
  body text not null check (char_length(trim(body)) between 11 and 1500),
  is_anonymous boolean not null default true,
  response_preferences text[] not null default '{}',
  matching_preference text not null default 'No preference' check (matching_preference in (
    'Someone who''s been there', 'Someone with strong community feedback',
    'A mix of perspectives', 'No preference'
  )),
  status text not null default 'visible' check (status in ('visible', 'hidden', 'removed')),
  created_at timestamptz not null default now()
);
create index questions_author_idx on public.questions (author_id);
create index questions_domain_created_idx on public.questions (domain, created_at desc);

create table public.answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions (id) on delete cascade,
  replier_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  body text not null check (char_length(trim(body)) between 20 and 2000),
  visible_on_profile boolean not null default false,
  status text not null default 'visible' check (status in ('visible', 'hidden', 'removed')),
  created_at timestamptz not null default now(),
  unique (question_id, replier_id)
);
create index answers_question_idx on public.answers (question_id);
create index answers_replier_idx on public.answers (replier_id);

create table public.assessment_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  domain public.unsaid_domain not null,
  responses jsonb not null check (jsonb_typeof(responses) = 'array'),
  status text not null default 'submitted' check (status in ('submitted', 'qualified', 'not_qualified')),
  reviewer_note text check (char_length(reviewer_note) <= 500),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  unique (user_id, domain)
);

create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  answer_id uuid not null references public.answers (id) on delete cascade,
  rater_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  helpful boolean not null,
  rating smallint check (rating between 1 and 5),
  categories text[] not null default '{}',
  note text check (char_length(note) <= 300),
  created_at timestamptz not null default now(),
  unique (answer_id, rater_id)
);
create index feedback_answer_idx on public.feedback (answer_id);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  target_type text not null check (target_type in ('question', 'answer')),
  target_id uuid not null,
  reason text not null check (char_length(reason) between 3 and 120),
  details text check (char_length(details) <= 500),
  status text not null default 'pending' check (status in ('pending', 'dismissed', 'actioned')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references public.profiles (id) on delete set null,
  unique (reporter_id, target_type, target_id)
);
create index reports_target_idx on public.reports (target_type, target_id);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null check (type in ('answer', 'reply', 'feedback', 'assessment', 'qualification', 'safety')),
  title text not null,
  body text not null,
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index notifications_user_idx on public.notifications (user_id, created_at desc);

-- ---------- Helpers ----------------------------------------------------
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- Insert a notification, respecting the recipient's preferences.
create or replace function public.notify(
  p_user uuid, p_type text, p_title text, p_body text, p_link text default null
) returns void language plpgsql security definer set search_path = public as $$
declare
  pref_key text := case p_type
    when 'answer' then 'answer' when 'reply' then 'answer'
    when 'feedback' then 'feedback'
    when 'assessment' then 'assessment' when 'qualification' then 'assessment'
    else 'safety' end;
  enabled boolean;
begin
  select coalesce((notification_prefs ->> pref_key)::boolean, true) into enabled
  from public.profiles where id = p_user;
  -- safety notices are always delivered
  if enabled is distinct from false or pref_key = 'safety' then
    insert into public.notifications (user_id, type, title, body, link)
    values (p_user, p_type, p_title, p_body, p_link);
  end if;
end $$;
revoke execute on function public.notify(uuid, text, text, text, text) from public, anon, authenticated;

-- Server-side mirror of the client PII check (emails, phone numbers, socials).
create or replace function public.contains_pii(t text)
returns boolean language sql immutable as $$
  select t ~* '([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}|(\+?\d{1,3}[-.\s]?)?\y\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\y|instagram\.com|snapchat|wa\.me/)';
$$;

-- ---------- New-user bootstrap ----------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare uname text;
begin
  uname := nullif(trim(new.raw_user_meta_data ->> 'username'), '');
  -- Never block signup: fall back to a generated handle if the requested one
  -- is invalid or was taken between the availability check and signup.
  if uname is null
     or uname !~ '^[A-Za-z0-9_.]{3,24}$'
     or exists (select 1 from public.profiles where lower(username) = lower(uname)) then
    uname := 'user' || right(replace(new.id::text, '-', ''), 12);
  end if;
  insert into public.profiles (id, username, avatar_seed) values (new.id, uname, uname);
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.username_available(p_username text)
returns boolean language sql stable security definer set search_path = public as $$
  select p_username ~ '^[A-Za-z0-9_.]{3,24}$'
     and not exists (select 1 from public.profiles where lower(username) = lower(p_username));
$$;
grant execute on function public.username_available(text) to anon, authenticated;

-- ---------- Question rules --------------------------------------------
create or replace function public.before_question_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.profiles where id = new.author_id and asker_active) then
    raise exception 'Activate your Asker profile before asking.' using errcode = 'P0001';
  end if;
  if public.contains_pii(new.body) then
    raise exception 'This might make you identifiable. Remove contact details and try again.' using errcode = 'P0001';
  end if;
  if (select count(*) from public.questions
      where author_id = new.author_id and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'You''ve asked a lot this hour. Take a breath and try again a little later.' using errcode = 'P0001';
  end if;
  new.status := 'visible';
  new.created_at := now();
  return new;
end $$;
create trigger questions_before_insert before insert on public.questions
  for each row execute function public.before_question_insert();

-- ---------- Answer rules ----------------------------------------------
create or replace function public.before_answer_insert()
returns trigger language plpgsql security definer set search_path = public as $$
declare q record;
begin
  select author_id, domain, status into q from public.questions where id = new.question_id;
  if q is null or q.status <> 'visible' then
    raise exception 'This question is no longer available.' using errcode = 'P0001';
  end if;
  if q.author_id = new.replier_id then
    raise exception 'You can''t share a perspective on your own question.' using errcode = 'P0001';
  end if;
  if not exists (
    select 1 from public.assessment_submissions
    where user_id = new.replier_id and domain = q.domain and status <> 'not_qualified'
  ) then
    raise exception 'Complete the % assessment to share perspectives here.', q.domain using errcode = 'P0001';
  end if;
  if public.contains_pii(new.body) then
    raise exception 'Please don''t share contact details in a perspective.' using errcode = 'P0001';
  end if;
  if (select count(*) from public.answers
      where replier_id = new.replier_id and created_at > now() - interval '1 hour') >= 20 then
    raise exception 'You''ve shared a lot this hour. Try again a little later.' using errcode = 'P0001';
  end if;
  new.status := 'visible';
  new.created_at := now();
  return new;
end $$;
create trigger answers_before_insert before insert on public.answers
  for each row execute function public.before_answer_insert();

create or replace function public.after_answer_insert()
returns trigger language plpgsql security definer set search_path = public as $$
declare q record;
begin
  select author_id, domain into q from public.questions where id = new.question_id;
  perform public.notify(
    q.author_id, 'answer', 'Someone shared a perspective',
    'A new perspective arrived on your ' || q.domain || ' question.',
    '/question/' || new.question_id
  );
  return new;
end $$;
create trigger answers_after_insert after insert on public.answers
  for each row execute function public.after_answer_insert();

-- ---------- Feedback rules --------------------------------------------
create or replace function public.before_feedback_insert()
returns trigger language plpgsql security definer set search_path = public as $$
declare a record;
begin
  select an.replier_id, an.status, q.author_id as asker_id
    into a
  from public.answers an join public.questions q on q.id = an.question_id
  where an.id = new.answer_id;
  if a is null or a.status <> 'visible' then
    raise exception 'This perspective is no longer available.' using errcode = 'P0001';
  end if;
  if a.replier_id = new.rater_id then
    raise exception 'You can''t rate your own perspective.' using errcode = 'P0001';
  end if;
  -- Detailed feedback (stars, categories, note) is reserved for the person who asked.
  if a.asker_id <> new.rater_id then
    new.rating := null; new.categories := '{}'; new.note := null;
  end if;
  new.created_at := now();
  return new;
end $$;
create trigger feedback_before_insert before insert on public.feedback
  for each row execute function public.before_feedback_insert();

create or replace function public.after_feedback_insert()
returns trigger language plpgsql security definer set search_path = public as $$
declare rid uuid; qid uuid;
begin
  select replier_id, question_id into rid, qid from public.answers where id = new.answer_id;
  if new.helpful then
    perform public.notify(
      rid, 'feedback', 'Your perspective helped someone',
      coalesce(nullif(new.note, ''), 'Someone marked your perspective as helpful.'),
      '/question/' || qid
    );
  end if;
  return new;
end $$;
create trigger feedback_after_insert after insert on public.feedback
  for each row execute function public.after_feedback_insert();

-- ---------- Assessment rules ------------------------------------------
create or replace function public.before_assessment_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.status := 'submitted';
  new.reviewer_note := null;
  new.reviewed_at := null;
  new.submitted_at := now();
  return new;
end $$;
create trigger assessment_before_insert before insert on public.assessment_submissions
  for each row execute function public.before_assessment_insert();

create or replace function public.after_assessment_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.profiles set replier_active = true where id = new.user_id;
  return new;
end $$;
create trigger assessment_after_insert after insert on public.assessment_submissions
  for each row execute function public.after_assessment_insert();

create or replace function public.after_assessment_review()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status and new.status in ('qualified', 'not_qualified') then
    perform public.notify(
      new.user_id, 'qualification',
      case when new.status = 'qualified'
        then 'You''re qualified in ' || new.domain
        else 'Your ' || new.domain || ' assessment was reviewed' end,
      coalesce(nullif(new.reviewer_note, ''),
        case when new.status = 'qualified'
          then 'Your perspectives in this domain will now show a Qualified badge.'
          else 'Thanks for taking the time. You can keep helping in your other domains.' end),
      '/you'
    );
  end if;
  return new;
end $$;
create trigger assessment_after_review after update on public.assessment_submissions
  for each row execute function public.after_assessment_review();

-- ---------- Report rules ----------------------------------------------
create or replace function public.before_report_insert()
returns trigger language plpgsql security definer set search_path = public as $$
declare owner uuid;
begin
  if new.target_type = 'question' then
    select author_id into owner from public.questions where id = new.target_id;
  else
    select replier_id into owner from public.answers where id = new.target_id;
  end if;
  if owner is null then
    raise exception 'That content no longer exists.' using errcode = 'P0001';
  end if;
  if owner = new.reporter_id then
    raise exception 'You can''t report your own post.' using errcode = 'P0001';
  end if;
  if (select count(*) from public.reports
      where reporter_id = new.reporter_id and created_at > now() - interval '1 hour') >= 20 then
    raise exception 'Too many reports this hour.' using errcode = 'P0001';
  end if;
  new.status := 'pending';
  new.created_at := now();
  return new;
end $$;
create trigger reports_before_insert before insert on public.reports
  for each row execute function public.before_report_insert();

-- Three independent pending reports hide content until a moderator looks.
create or replace function public.after_report_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.reports
      where target_type = new.target_type and target_id = new.target_id and status = 'pending') >= 3 then
    if new.target_type = 'question' then
      update public.questions set status = 'hidden' where id = new.target_id and status = 'visible';
    else
      update public.answers set status = 'hidden' where id = new.target_id and status = 'visible';
    end if;
  end if;
  return new;
end $$;
create trigger reports_after_insert after insert on public.reports
  for each row execute function public.after_report_insert();

-- ---------- Row-level security ----------------------------------------
alter table public.profiles enable row level security;
alter table public.questions enable row level security;
alter table public.answers enable row level security;
alter table public.assessment_submissions enable row level security;
alter table public.feedback enable row level security;
alter table public.reports enable row level security;
alter table public.notifications enable row level security;

create policy "own profile" on public.profiles for select using (id = auth.uid());
create policy "update own profile" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

create policy "own questions" on public.questions for select using (author_id = auth.uid());
create policy "ask" on public.questions for insert with check (author_id = auth.uid());
create policy "delete own question" on public.questions for delete using (author_id = auth.uid());

create policy "own answers" on public.answers for select using (replier_id = auth.uid());
create policy "answer" on public.answers for insert with check (replier_id = auth.uid());
create policy "edit own answer visibility" on public.answers for update using (replier_id = auth.uid()) with check (replier_id = auth.uid());
create policy "delete own answer" on public.answers for delete using (replier_id = auth.uid());

create policy "own submissions" on public.assessment_submissions for select using (user_id = auth.uid());
create policy "submit" on public.assessment_submissions for insert with check (user_id = auth.uid());

create policy "own feedback" on public.feedback for select using (rater_id = auth.uid());
create policy "give feedback" on public.feedback for insert with check (rater_id = auth.uid());

create policy "own reports" on public.reports for select using (reporter_id = auth.uid());
create policy "report" on public.reports for insert with check (reporter_id = auth.uid());

create policy "own notifications" on public.notifications for select using (user_id = auth.uid());
create policy "mark read" on public.notifications for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "clear notification" on public.notifications for delete using (user_id = auth.uid());

-- Column-level privileges: clients can only write the columns they own.
revoke all on public.profiles, public.questions, public.answers, public.assessment_submissions,
  public.feedback, public.reports, public.notifications from anon, authenticated;

grant select on public.profiles to authenticated;
grant update (username, bio, avatar_seed, has_completed_onboarding, asker_active, notification_prefs)
  on public.profiles to authenticated;

grant select, delete on public.questions to authenticated;
grant insert (domain, body, is_anonymous, response_preferences, matching_preference) on public.questions to authenticated;

grant select, delete on public.answers to authenticated;
grant insert (question_id, body, visible_on_profile) on public.answers to authenticated;
grant update (visible_on_profile) on public.answers to authenticated;

grant select on public.assessment_submissions to authenticated;
grant insert (domain, responses) on public.assessment_submissions to authenticated;

grant select on public.feedback to authenticated;
grant insert (answer_id, helpful, rating, categories, note) on public.feedback to authenticated;

grant select on public.reports to authenticated;
grant insert (target_type, target_id, reason, details) on public.reports to authenticated;

grant select, delete on public.notifications to authenticated;
grant update (read) on public.notifications to authenticated;

-- ---------- Public read models (identity-safe views) -------------------
-- Views run with the owner's rights, so they can read across users, but
-- their column lists are the only thing anyone else can ever see.

create view public.replier_reputation as
select
  an.replier_id,
  count(f.id) filter (where f.rating is not null)::int as ratings_count,
  coalesce(round(avg(f.rating)::numeric, 1), 0)::float as average,
  case when count(f.id) = 0 then 0
       else round(100.0 * count(f.id) filter (where f.helpful) / count(f.id))::int end as helpful_percent,
  count(f.id) filter (where f.helpful)::int as helpful_count
from public.answers an
join public.feedback f on f.answer_id = an.id
where an.status = 'visible'
group by an.replier_id;
revoke all on public.replier_reputation from anon, authenticated; -- internal only

create view public.public_questions as
select
  q.id, q.domain, q.body, q.is_anonymous,
  case when q.is_anonymous then null else p.username end as author_username,
  q.response_preferences, q.matching_preference, q.status, q.created_at,
  (select count(*) from public.answers a where a.question_id = q.id and a.status = 'visible')::int as answer_count,
  (q.author_id = auth.uid()) as is_mine
from public.questions q
join public.profiles p on p.id = q.author_id
where auth.uid() is not null
  and (q.status = 'visible' or q.author_id = auth.uid());

create view public.public_answers as
select
  a.id, a.question_id, a.body, a.created_at, a.status, a.visible_on_profile,
  q.domain,
  p.username as replier_username,
  p.avatar_seed as replier_avatar_seed,
  exists (select 1 from public.assessment_submissions s
          where s.user_id = a.replier_id and s.domain = q.domain and s.status = 'qualified') as is_qualified,
  coalesce((select array_agg(s.domain::text order by s.domain)
            from public.assessment_submissions s
            where s.user_id = a.replier_id and s.status = 'qualified'), '{}') as qualified_domains,
  (select count(*) from public.feedback f where f.answer_id = a.id and f.helpful)::int as helpful_count,
  r.ratings_count, r.average, r.helpful_percent,
  (a.replier_id = auth.uid()) as is_mine,
  (select f.helpful from public.feedback f where f.answer_id = a.id and f.rater_id = auth.uid()) as my_feedback
from public.answers a
join public.questions q on q.id = a.question_id
join public.profiles p on p.id = a.replier_id
left join public.replier_reputation r on r.replier_id = a.replier_id
where auth.uid() is not null
  and (a.replier_id = auth.uid() or (a.status = 'visible' and q.status = 'visible'));

-- Feedback a replier received — without who gave it.
create view public.my_feedback_received as
select f.id, f.answer_id, f.helpful, f.rating, f.categories, f.note, f.created_at
from public.feedback f
join public.answers a on a.id = f.answer_id
where a.replier_id = auth.uid();

grant select on public.public_questions, public.public_answers, public.my_feedback_received to authenticated;

-- ---------- RPCs -------------------------------------------------------

-- Questions a replier should see: their assessed domains, not their own,
-- not already answered, honouring the asker's matching preference.
create or replace function public.matched_questions()
returns setof public.public_questions
language sql stable security definer set search_path = public as $$
  select pq.*
  from public.public_questions pq
  join public.questions q on q.id = pq.id
  where pq.status = 'visible'
    and q.author_id <> auth.uid()
    and pq.domain in (
      select domain from public.assessment_submissions
      where user_id = auth.uid() and status <> 'not_qualified')
    and not exists (select 1 from public.answers a where a.question_id = pq.id and a.replier_id = auth.uid())
    and (
      pq.matching_preference <> 'Someone with strong community feedback'
      or exists (select 1 from public.assessment_submissions s
                 where s.user_id = auth.uid() and s.domain = pq.domain and s.status = 'qualified')
      or coalesce((select helpful_count from public.replier_reputation where replier_id = auth.uid()), 0) >= 3
    )
  order by pq.answer_count asc, pq.created_at desc
  limit 50;
$$;
grant execute on function public.matched_questions() to authenticated;

create or replace function public.public_profile(p_username text)
returns json language sql stable security definer set search_path = public as $$
  select case when auth.uid() is null then null else (
    select json_build_object(
      'username', p.username,
      'bio', p.bio,
      'avatarSeed', p.avatar_seed,
      'replierActive', p.replier_active,
      'qualifiedDomains', coalesce((select json_agg(s.domain order by s.domain) from public.assessment_submissions s
                                    where s.user_id = p.id and s.status = 'qualified'), '[]'::json),
      'assessedDomains', coalesce((select json_agg(s.domain order by s.domain) from public.assessment_submissions s
                                   where s.user_id = p.id and s.status <> 'not_qualified'), '[]'::json),
      'answersCount', (select count(*) from public.answers a where a.replier_id = p.id and a.status = 'visible'),
      'reputation', (select json_build_object('average', r.average, 'ratingsCount', r.ratings_count,
                                              'helpfulPercent', r.helpful_percent, 'helpfulCount', r.helpful_count)
                     from public.replier_reputation r where r.replier_id = p.id),
      'perspectives', coalesce((
        select json_agg(json_build_object(
                 'id', a.id, 'domain', q.domain, 'body', a.body, 'createdAt', a.created_at,
                 'helpfulCount', (select count(*) from public.feedback f where f.answer_id = a.id and f.helpful))
               order by a.created_at desc)
        from public.answers a join public.questions q on q.id = a.question_id
        where a.replier_id = p.id and a.visible_on_profile and a.status = 'visible' and q.status = 'visible'
      ), '[]'::json)
    )
    from public.profiles p where lower(p.username) = lower(p_username)
  ) end;
$$;
grant execute on function public.public_profile(text) to authenticated;

create or replace function public.delete_my_account()
returns void language plpgsql security definer set search_path = public, auth as $$
begin
  if auth.uid() is null then raise exception 'Not signed in.'; end if;
  delete from auth.users where id = auth.uid();
end $$;
grant execute on function public.delete_my_account() to authenticated;

-- ---------- Admin RPCs (all check is_admin()) ---------------------------
create or replace function public.admin_stats()
returns json language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Not authorised.'; end if;
  return json_build_object(
    'users', (select count(*) from public.profiles),
    'questions', (select count(*) from public.questions where status <> 'removed'),
    'answers', (select count(*) from public.answers where status <> 'removed'),
    'qualifiedRepliers', (select count(distinct user_id) from public.assessment_submissions where status = 'qualified'),
    'pendingReports', (select count(*) from public.reports where status = 'pending'),
    'pendingAssessments', (select count(*) from public.assessment_submissions where status = 'submitted')
  );
end $$;

create or replace function public.admin_list_reports()
returns table (
  target_type text, target_id uuid, reasons text[], report_count int,
  first_reported_at timestamptz, snippet text, target_status text
) language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Not authorised.'; end if;
  return query
  select r.target_type, r.target_id,
         array_agg(distinct r.reason), count(*)::int, min(r.created_at),
         coalesce((select left(q.body, 200) from public.questions q where q.id = r.target_id),
                  (select left(a.body, 200) from public.answers a where a.id = r.target_id), '[deleted]'),
         coalesce((select q.status from public.questions q where q.id = r.target_id),
                  (select a.status from public.answers a where a.id = r.target_id), 'removed')
  from public.reports r
  where r.status = 'pending'
  group by r.target_type, r.target_id
  order by count(*) desc, min(r.created_at);
end $$;

create or replace function public.admin_resolve_report(p_target_type text, p_target_id uuid, p_action text)
returns void language plpgsql security definer set search_path = public as $$
declare owner uuid;
begin
  if not public.is_admin() then raise exception 'Not authorised.'; end if;
  if p_action not in ('dismiss', 'remove') then raise exception 'Unknown action.'; end if;

  if p_target_type = 'question' then
    update public.questions set status = case when p_action = 'remove' then 'removed' else 'visible' end
      where id = p_target_id returning author_id into owner;
  else
    update public.answers set status = case when p_action = 'remove' then 'removed' else 'visible' end
      where id = p_target_id returning replier_id into owner;
  end if;

  update public.reports
     set status = case when p_action = 'remove' then 'actioned' else 'dismissed' end,
         resolved_at = now(), resolved_by = auth.uid()
   where target_type = p_target_type and target_id = p_target_id and status = 'pending';

  if p_action = 'remove' and owner is not null then
    perform public.notify(owner, 'safety', 'Something you posted was removed',
      'A moderator removed your ' || p_target_type || ' for breaking community guidelines.', null);
  end if;
end $$;

create or replace function public.admin_list_assessments(p_status text default 'submitted')
returns table (id uuid, username text, domain text, responses jsonb, status text,
               reviewer_note text, submitted_at timestamptz)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Not authorised.'; end if;
  return query
  select s.id, p.username, s.domain::text, s.responses, s.status, s.reviewer_note, s.submitted_at
  from public.assessment_submissions s join public.profiles p on p.id = s.user_id
  where s.status = p_status
  order by s.submitted_at;
end $$;

create or replace function public.admin_review_assessment(p_id uuid, p_status text, p_note text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Not authorised.'; end if;
  if p_status not in ('qualified', 'not_qualified', 'submitted') then raise exception 'Unknown status.'; end if;
  update public.assessment_submissions
     set status = p_status, reviewer_note = nullif(trim(p_note), ''), reviewed_at = now()
   where id = p_id;
end $$;

grant execute on function public.admin_stats(), public.admin_list_reports(),
  public.admin_resolve_report(text, uuid, text), public.admin_list_assessments(text),
  public.admin_review_assessment(uuid, text, text), public.is_admin() to authenticated;
