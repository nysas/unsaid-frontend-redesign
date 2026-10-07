/**
 * Every read/write the app makes goes through here. Pages never talk to
 * Supabase directly, so swapping or extending the backend stays local.
 *
 * Other users' data is only ever read from the identity-safe views
 * (public_questions, public_answers, my_feedback_received) and RPCs.
 */
import { supabase } from "@/lib/supabase";
import {
  Answer,
  Domain,
  MatchingPreference,
  Notification,
  NotificationPrefs,
  PublicProfile,
  Question,
  ReceivedFeedback,
  ResponsePreference,
} from "@/lib/types";

/* ---------- row mappers ---------- */

type QuestionRow = {
  id: string; domain: Domain; body: string; is_anonymous: boolean; author_username: string | null;
  response_preferences: ResponsePreference[]; matching_preference: MatchingPreference;
  status: Question["status"]; created_at: string; answer_count: number; is_mine: boolean;
};

export function toQuestion(r: QuestionRow): Question {
  return {
    id: r.id,
    domain: r.domain,
    body: r.body,
    isAnonymous: r.is_anonymous,
    authorUsername: r.author_username,
    responsePreferences: r.response_preferences ?? [],
    matchingPreference: r.matching_preference,
    status: r.status,
    createdAt: r.created_at,
    answerCount: r.answer_count,
    isMine: r.is_mine,
  };
}

type AnswerRow = {
  id: string; question_id: string; body: string; created_at: string; status: Answer["status"];
  visible_on_profile: boolean; domain: Domain; replier_username: string; replier_avatar_seed: string;
  is_qualified: boolean; qualified_domains: Domain[]; helpful_count: number;
  ratings_count: number | null; average: number | null; helpful_percent: number | null;
  is_mine: boolean; my_feedback: boolean | null;
};

export function toAnswer(r: AnswerRow): Answer {
  return {
    id: r.id,
    questionId: r.question_id,
    domain: r.domain,
    body: r.body,
    createdAt: r.created_at,
    status: r.status,
    visibleOnProfile: r.visible_on_profile,
    replierUsername: r.replier_username,
    replierAvatarSeed: r.replier_avatar_seed,
    isQualified: r.is_qualified,
    domains: r.qualified_domains ?? [],
    helpfulCount: r.helpful_count,
    reputation:
      r.ratings_count && r.ratings_count > 0
        ? { average: r.average ?? 0, ratingsCount: r.ratings_count, helpfulPercent: r.helpful_percent ?? 0 }
        : null,
    isMine: r.is_mine,
    myFeedback: r.my_feedback,
  };
}

function check<T>(res: { data: T | null; error: unknown }): T {
  if (res.error) throw res.error;
  return res.data as T;
}

/* ---------- questions ---------- */

export async function fetchFeed(limit = 30): Promise<Question[]> {
  const rows = check(
    await supabase()
      .from("public_questions")
      .select("*")
      .eq("status", "visible")
      .eq("is_mine", false)
      .order("created_at", { ascending: false })
      .limit(limit)
  ) as QuestionRow[];
  return rows.map(toQuestion);
}

export async function fetchQuestion(id: string): Promise<Question | null> {
  const row = check(await supabase().from("public_questions").select("*").eq("id", id).maybeSingle());
  return row ? toQuestion(row as QuestionRow) : null;
}

export async function fetchMyQuestions(): Promise<Question[]> {
  const rows = check(
    await supabase().from("public_questions").select("*").eq("is_mine", true).order("created_at", { ascending: false })
  ) as QuestionRow[];
  return rows.map(toQuestion);
}

export async function fetchMatchedQuestions(): Promise<Question[]> {
  const rows = check(await supabase().rpc("matched_questions")) as QuestionRow[];
  return rows.map(toQuestion);
}

export async function createQuestion(input: {
  domain: Domain;
  body: string;
  isAnonymous: boolean;
  responsePreferences: ResponsePreference[];
  matchingPreference: MatchingPreference;
}): Promise<string> {
  const row = check(
    await supabase()
      .from("questions")
      .insert({
        domain: input.domain,
        body: input.body.trim(),
        is_anonymous: input.isAnonymous,
        response_preferences: input.responsePreferences,
        matching_preference: input.matchingPreference,
      })
      .select("id")
      .single()
  ) as { id: string };
  return row.id;
}

export async function deleteQuestion(id: string) {
  check(await supabase().from("questions").delete().eq("id", id));
}

/* ---------- answers ---------- */

export async function fetchAnswers(questionId: string): Promise<Answer[]> {
  const rows = check(
    await supabase()
      .from("public_answers")
      .select("*")
      .eq("question_id", questionId)
      .order("created_at", { ascending: true })
  ) as AnswerRow[];
  return rows.map(toAnswer);
}

export async function fetchMyAnswers(): Promise<Answer[]> {
  const rows = check(
    await supabase().from("public_answers").select("*").eq("is_mine", true).order("created_at", { ascending: false })
  ) as AnswerRow[];
  return rows.map(toAnswer);
}

export async function createAnswer(input: { questionId: string; body: string; visibleOnProfile: boolean }) {
  check(
    await supabase().from("answers").insert({
      question_id: input.questionId,
      body: input.body.trim(),
      visible_on_profile: input.visibleOnProfile,
    })
  );
}

export async function setAnswerVisibility(id: string, visibleOnProfile: boolean) {
  check(await supabase().from("answers").update({ visible_on_profile: visibleOnProfile }).eq("id", id));
}

export async function deleteAnswer(id: string) {
  check(await supabase().from("answers").delete().eq("id", id));
}

/* ---------- feedback & reports ---------- */

export async function giveFeedback(input: {
  answerId: string;
  helpful: boolean;
  rating?: number;
  categories?: string[];
  note?: string;
}) {
  check(
    await supabase().from("feedback").insert({
      answer_id: input.answerId,
      helpful: input.helpful,
      rating: input.rating ?? null,
      categories: input.categories ?? [],
      note: input.note?.trim() || null,
    })
  );
}

export async function fetchFeedbackReceived(): Promise<ReceivedFeedback[]> {
  const rows = check(
    await supabase().from("my_feedback_received").select("*").order("created_at", { ascending: false })
  ) as { id: string; answer_id: string; helpful: boolean; rating: number | null; categories: string[]; note: string | null; created_at: string }[];
  return rows.map((r) => ({
    id: r.id,
    answerId: r.answer_id,
    helpful: r.helpful,
    rating: r.rating,
    categories: r.categories ?? [],
    note: r.note,
    createdAt: r.created_at,
  }));
}

export async function reportContent(input: {
  targetType: "question" | "answer";
  targetId: string;
  reason: string;
  details?: string;
}) {
  check(
    await supabase().from("reports").insert({
      target_type: input.targetType,
      target_id: input.targetId,
      reason: input.reason,
      details: input.details?.trim() || null,
    })
  );
}

/* ---------- assessments ---------- */

export async function submitAssessment(domain: Domain, responses: { questionId: string; answer: string }[]) {
  check(await supabase().from("assessment_submissions").insert({ domain, responses }));
}

/* ---------- notifications ---------- */

export async function fetchNotifications(): Promise<Notification[]> {
  const rows = check(
    await supabase().from("notifications").select("*").order("created_at", { ascending: false }).limit(100)
  ) as { id: string; type: Notification["type"]; title: string; body: string; link: string | null; read: boolean; created_at: string }[];
  return rows.map((r) => ({
    id: r.id,
    type: r.type,
    title: r.title,
    body: r.body,
    link: r.link,
    read: r.read,
    createdAt: r.created_at,
  }));
}

export async function unreadNotificationCount(): Promise<number> {
  const { count, error } = await supabase()
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("read", false);
  if (error) throw error;
  return count ?? 0;
}

export async function markAllNotificationsRead() {
  check(await supabase().from("notifications").update({ read: true }).eq("read", false));
}

/* ---------- profiles ---------- */

export async function usernameAvailable(username: string): Promise<boolean> {
  return check(await supabase().rpc("username_available", { p_username: username })) as boolean;
}

export async function fetchPublicProfile(username: string): Promise<PublicProfile | null> {
  return check(await supabase().rpc("public_profile", { p_username: username })) as PublicProfile | null;
}

export async function updateNotificationPrefs(prefs: NotificationPrefs) {
  const { data } = await supabase().auth.getUser();
  if (!data.user) throw new Error("Not signed in");
  check(await supabase().from("profiles").update({ notification_prefs: prefs }).eq("id", data.user.id));
}

export async function deleteMyAccount() {
  check(await supabase().rpc("delete_my_account"));
  await supabase().auth.signOut();
}

/* ---------- admin ---------- */

export interface AdminStats {
  users: number;
  questions: number;
  answers: number;
  qualifiedRepliers: number;
  pendingReports: number;
  pendingAssessments: number;
}

export interface AdminReport {
  targetType: "question" | "answer";
  targetId: string;
  reasons: string[];
  reportCount: number;
  firstReportedAt: string;
  snippet: string;
  targetStatus: string;
}

export interface AdminAssessment {
  id: string;
  username: string;
  domain: Domain;
  responses: { questionId: string; answer: string }[];
  status: string;
  reviewerNote: string | null;
  submittedAt: string;
}

export async function adminStats(): Promise<AdminStats> {
  return check(await supabase().rpc("admin_stats")) as AdminStats;
}

export async function adminReports(): Promise<AdminReport[]> {
  const rows = check(await supabase().rpc("admin_list_reports")) as {
    target_type: "question" | "answer"; target_id: string; reasons: string[]; report_count: number;
    first_reported_at: string; snippet: string; target_status: string;
  }[];
  return rows.map((r) => ({
    targetType: r.target_type,
    targetId: r.target_id,
    reasons: r.reasons,
    reportCount: r.report_count,
    firstReportedAt: r.first_reported_at,
    snippet: r.snippet,
    targetStatus: r.target_status,
  }));
}

export async function adminResolveReport(targetType: string, targetId: string, action: "dismiss" | "remove") {
  check(
    await supabase().rpc("admin_resolve_report", {
      p_target_type: targetType,
      p_target_id: targetId,
      p_action: action,
    })
  );
}

export async function adminAssessments(status = "submitted"): Promise<AdminAssessment[]> {
  const rows = check(await supabase().rpc("admin_list_assessments", { p_status: status })) as {
    id: string; username: string; domain: Domain; responses: { questionId: string; answer: string }[];
    status: string; reviewer_note: string | null; submitted_at: string;
  }[];
  return rows.map((r) => ({
    id: r.id,
    username: r.username,
    domain: r.domain,
    responses: r.responses,
    status: r.status,
    reviewerNote: r.reviewer_note,
    submittedAt: r.submitted_at,
  }));
}

export async function adminReviewAssessment(id: string, status: "qualified" | "not_qualified", note?: string) {
  check(await supabase().rpc("admin_review_assessment", { p_id: id, p_status: status, p_note: note ?? null }));
}
