# Unsaid

Anonymous peer-perspective platform. Ask honestly, hear from people who understand — without anyone knowing it's you.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Framer Motion · Supabase (Postgres, Auth, Row-Level Security)

---

## Quick start

1. **Create a Supabase project** at [supabase.com](https://supabase.com) (free tier is fine).
2. **Create the database.** In the Supabase dashboard open **SQL Editor → New query**, paste the whole of
   `supabase/migrations/20261007000000_init.sql`, and click **Run**.
   (Or with the Supabase CLI: `supabase link --project-ref <ref>` then `supabase db push`.)
3. **Configure auth URLs.** Authentication → URL Configuration:
   - Site URL: `http://localhost:3000` (change to your production URL later)
   - Redirect URLs: add `http://localhost:3000/**` and later `https://your-domain/**`
4. **Add your keys.**
   ```bash
   cp .env.example .env.local
   # fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
   ```
5. **Run it.**
   ```bash
   npm install
   npm run dev
   ```
6. **Make yourself a moderator.** Sign up in the app, then in the SQL Editor run:
   ```sql
   update public.profiles set is_admin = true where username = 'your_username';
   ```
   The admin dashboard is at `/admin` (also linked from Settings).

## Deploy (Vercel)

1. Push this repo to GitHub, then **Import Project** on [vercel.com](https://vercel.com).
2. Add the two `NEXT_PUBLIC_SUPABASE_*` environment variables in Vercel → Settings → Environment Variables.
3. Deploy. Then in Supabase → Authentication → URL Configuration, set the Site URL to your Vercel URL and add
   `https://your-app.vercel.app/**` to Redirect URLs.
4. **Before real users:** Supabase's built-in email sender is heavily rate-limited and meant for testing.
   Set up custom SMTP (Authentication → Emails → SMTP Settings — Resend, Postmark, SES, etc.) and customise
   the confirmation / reset-password templates.

---

## How it works

### Privacy model (enforced by the database, not the UI)

- Every base table has **row-level security: you can only read your own rows.** Another user cannot query
  who wrote a question, even with hand-crafted API calls.
- Everything other people see comes from identity-safe **views** (`public_questions`, `public_answers`,
  `my_feedback_received`) with explicit column lists that never include `author_id`, `replier_id`, or `rater_id`.
- **Column-level grants** mean users can only write the fields they own — nobody can set `is_admin`,
  self-qualify an assessment, or forge a question's author.
- Cross-user effects (notifications, reputation, moderation) run in `SECURITY DEFINER` triggers and functions.
- Email addresses live only in Supabase Auth and are never exposed to other users.

### Rules enforced server-side (Postgres triggers)

| Rule | Where |
|---|---|
| Must activate Asker profile before asking | `before_question_insert` |
| Questions/perspectives with emails, phone numbers, or social handles are rejected | `contains_pii()` |
| Rate limits: 5 questions/hr, 20 perspectives/hr, 20 reports/hr | insert triggers |
| Can only answer in domains you've submitted an assessment for (and weren't marked not-qualified) | `before_answer_insert` |
| Can't answer or rate your own content; one perspective per question | triggers + unique keys |
| Star ratings / categories / notes only count when they come from the person who asked | `before_feedback_insert` |
| 3 independent reports auto-hide content until a moderator reviews it | `after_report_insert` |
| Notifications respect each user's preferences (safety notices always delivered) | `notify()` |

### Matching

`matched_questions()` shows a replier questions from their assessed domains, excluding their own and ones they've
already answered, least-answered first. Askers who chose *"Someone with strong community feedback"* are only shown to
repliers who are **Qualified** in that domain or have 3+ helpful ratings.

### Assessments & qualification

Submitting a domain's assessment saves the full responses and immediately lets you help in that domain.
A moderator reviews responses in `/admin → Assessments` and marks them **Qualified** (badge shown on perspectives) or
**Not qualified** (access to that domain removed). The person is notified either way. There's no automated scoring.

### Safety

The Ask flow detects crisis language and shows real resources (Tele-MANAS 14416 in India, 112 for emergencies,
findahelpline.com elsewhere) without blocking the post. Reports flagged "Someone may be in danger" surface the same
resources. **Before launching publicly, have a plan for who monitors those reports and how quickly.**

---

## Project structure

```
app/                      routes (all data pages are client components behind <AuthGate>)
  admin/                  moderation: stats, report queue, assessment review
  question/[id]/          question + perspectives, feedback, reporting
  u/[username]/           public replier profile
  reset-password/         landing page for the reset email link
components/
  UserProfileProvider.tsx auth session + current user, used everywhere via useProfile()
lib/
  supabase.ts             browser client + friendlyError()
  api.ts                  every read/write the app makes (pages never call Supabase directly)
  useAsync.ts             small data-loading hook
  types.ts                shared types
  assessment-questions.ts 40 assessment questions across 8 domains
supabase/migrations/      the full database schema
```

## Ideas for what's next

- Realtime notifications (Supabase Realtime on the `notifications` table) instead of 60-second polling
- An AI-assisted first pass on reports and crisis detection (server-side, via an Edge Function)
- Follow-up replies between asker and replier (the `reply` notification type is already reserved)
- Pagination / infinite scroll on the home feed once there are more than ~30 questions
- Automated tests (Playwright for flows, pgTAP for the RLS rules)
