"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase, friendlyError } from "@/lib/supabase";
import * as api from "@/lib/api";
import {
  Domain,
  DomainQualification,
  MatchingPreference,
  NotificationPrefs,
  ResponsePreference,
  User,
} from "@/lib/types";

type Result = { ok: boolean; error?: string };

const DEFAULT_PREFS: NotificationPrefs = { answer: true, feedback: true, assessment: true, safety: true };

interface ProfileContextValue {
  user: User | null;
  isLoggedIn: boolean;
  /** true once the initial session check has finished (safe to redirect) */
  mounted: boolean;
  configured: boolean;
  refresh: () => Promise<void>;
  signup: (input: { email: string; username: string; password: string }) => Promise<Result & { needsConfirmation?: boolean }>;
  login: (input: { email: string; password: string }) => Promise<Result & { user?: User }>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<Result>;
  updatePassword: (password: string) => Promise<Result>;
  deleteAccount: () => Promise<Result>;
  completeOnboarding: (choice: "ask" | "help" | "both") => Promise<Result>;
  activateAsker: () => Promise<Result>;
  submitReplierAssessments: (
    submissions: { domain: Domain; responses: { questionId: string; answer: string }[] }[]
  ) => Promise<Result>;
  updateProfile: (patch: { username?: string; bio?: string; avatarSeed?: string }) => Promise<Result>;
  updateNotificationPrefs: (prefs: NotificationPrefs) => Promise<Result>;
  askQuestion: (input: {
    domain: Domain;
    body: string;
    isAnonymous: boolean;
    responsePreferences: ResponsePreference[];
    matchingPreference: MatchingPreference;
  }) => Promise<Result & { id?: string }>;
  shareAnswer: (input: { questionId: string; body: string; visibleOnProfile: boolean }) => Promise<Result>;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

async function loadUser(session: Session): Promise<User> {
  const sb = supabase();
  const uid = session.user.id;

  const [profileRes, subsRes, myQuestions, myAnswers, feedback] = await Promise.all([
    sb.from("profiles").select("*").eq("id", uid).single(),
    sb.from("assessment_submissions").select("domain,status,submitted_at,reviewer_note").eq("user_id", uid),
    api.fetchMyQuestions(),
    api.fetchMyAnswers(),
    api.fetchFeedbackReceived(),
  ]);
  if (profileRes.error) throw profileRes.error;
  if (subsRes.error) throw subsRes.error;
  const p = profileRes.data;

  const qualifications: DomainQualification[] = (subsRes.data ?? []).map((s) => ({
    domain: s.domain as Domain,
    assessmentCompleted: true,
    status: s.status,
    completedAt: s.submitted_at,
    reviewerNote: s.reviewer_note,
  }));

  return {
    id: uid,
    email: session.user.email ?? "",
    username: p.username,
    bio: p.bio,
    avatarSeed: p.avatar_seed,
    hasCompletedOnboarding: p.has_completed_onboarding,
    isAdmin: p.is_admin,
    notificationPrefs: { ...DEFAULT_PREFS, ...(p.notification_prefs ?? {}) },
    asker: { active: p.asker_active, questionsAsked: myQuestions },
    replier: {
      active: p.replier_active,
      qualifications,
      perspectivesShared: myAnswers,
      helpfulRatings: feedback.filter((f) => f.helpful).length,
    },
  };
}

export function UserProfileProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);
  const sessionRef = useRef<Session | null>(null);

  const hydrate = useCallback(async (session: Session | null) => {
    sessionRef.current = session;
    if (!session) {
      setUser(null);
      return null;
    }
    try {
      const u = await loadUser(session);
      setUser(u);
      return u;
    } catch (err) {
      console.error("Failed to load profile", err);
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- nothing to load without a backend
      setMounted(true);
      return;
    }
    const sb = supabase();
    let cancelled = false;

    sb.auth.getSession().then(async ({ data }) => {
      await hydrate(data.session);
      if (!cancelled) setMounted(true);
    });

    const { data: sub } = sb.auth.onAuthStateChange((event, session) => {
      // Defer: calling Supabase inside this callback synchronously can deadlock.
      setTimeout(() => {
        if (event === "SIGNED_OUT") {
          sessionRef.current = null;
          setUser(null);
        } else if (event === "SIGNED_IN" || event === "USER_UPDATED") {
          if (session?.user.id !== sessionRef.current?.user.id || event === "USER_UPDATED") {
            void hydrate(session);
          }
        } else if (session) {
          sessionRef.current = session;
        }
      }, 0);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [hydrate]);

  const refresh = useCallback(async () => {
    if (sessionRef.current) await hydrate(sessionRef.current);
  }, [hydrate]);

  /** Run a mutation, refresh the user, and translate errors. */
  const run = useCallback(
    async (fn: () => Promise<unknown>, fallback?: string): Promise<Result> => {
      try {
        await fn();
        await refresh();
        return { ok: true };
      } catch (err) {
        return { ok: false, error: friendlyError(err, fallback) };
      }
    },
    [refresh]
  );

  const updateOwnProfile = (patch: Record<string, unknown>) => async () => {
    const uid = sessionRef.current?.user.id;
    if (!uid) throw new Error("Not signed in");
    const { error } = await supabase().from("profiles").update(patch).eq("id", uid);
    if (error) throw error;
  };

  async function signup(input: { email: string; username: string; password: string }) {
    try {
      const username = input.username.trim();
      if (!(await api.usernameAvailable(username))) {
        return { ok: false, error: "That username is taken (or uses characters other than letters, numbers, _ and .)." };
      }
      const { data, error } = await supabase().auth.signUp({
        email: input.email.trim(),
        password: input.password,
        options: {
          data: { username },
          emailRedirectTo: `${window.location.origin}/onboarding`,
        },
      });
      if (error) throw error;
      // Supabase returns a user with no identities when the email is already registered.
      if (data.user && data.user.identities?.length === 0) {
        return { ok: false, error: "An account with that email already exists. Try logging in." };
      }
      if (!data.session) return { ok: true, needsConfirmation: true };
      await hydrate(data.session);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: friendlyError(err) };
    }
  }

  async function login(input: { email: string; password: string }) {
    try {
      const { data, error } = await supabase().auth.signInWithPassword({
        email: input.email.trim(),
        password: input.password,
      });
      if (error) throw error;
      const u = await hydrate(data.session);
      if (!u) return { ok: false, error: "Signed in, but your profile couldn't be loaded. Try again." };
      return { ok: true, user: u };
    } catch (err) {
      return { ok: false, error: friendlyError(err) };
    }
  }

  async function logout() {
    await supabase().auth.signOut();
    sessionRef.current = null;
    setUser(null);
  }

  async function requestPasswordReset(email: string): Promise<Result> {
    const { error } = await supabase().auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return error ? { ok: false, error: friendlyError(error) } : { ok: true };
  }

  async function updatePassword(password: string): Promise<Result> {
    const { error } = await supabase().auth.updateUser({ password });
    return error ? { ok: false, error: friendlyError(error) } : { ok: true };
  }

  async function deleteAccount(): Promise<Result> {
    try {
      await api.deleteMyAccount();
      sessionRef.current = null;
      setUser(null);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: friendlyError(err) };
    }
  }

  const value: ProfileContextValue = {
    user,
    isLoggedIn: !!user,
    mounted,
    configured: isSupabaseConfigured,
    refresh,
    signup,
    login,
    logout,
    requestPasswordReset,
    updatePassword,
    deleteAccount,
    completeOnboarding: (choice) =>
      run(
        updateOwnProfile({
          has_completed_onboarding: true,
          ...(choice === "ask" || choice === "both" ? { asker_active: true } : {}),
        })
      ),
    activateAsker: () => run(updateOwnProfile({ asker_active: true })),
    submitReplierAssessments: (subs) =>
      run(async () => {
        for (const s of subs) await api.submitAssessment(s.domain, s.responses);
      }, "Couldn't save your assessment. Your answers are still here — try again."),
    updateProfile: (patch) =>
      run(
        updateOwnProfile({
          ...(patch.username !== undefined ? { username: patch.username.trim() } : {}),
          ...(patch.bio !== undefined ? { bio: patch.bio.trim() } : {}),
          ...(patch.avatarSeed !== undefined ? { avatar_seed: patch.avatarSeed } : {}),
        }),
        "Couldn't save. Usernames must be 3–24 letters, numbers, _ or . and not already taken."
      ),
    updateNotificationPrefs: (prefs) => run(() => api.updateNotificationPrefs(prefs)),
    askQuestion: async (input) => {
      let id: string | undefined;
      const res = await run(async () => {
        id = await api.createQuestion(input);
      });
      return { ...res, id };
    },
    shareAnswer: (input) => run(() => api.createAnswer(input)),
  };

  return (
    <ProfileContext.Provider value={value}>
      {!isSupabaseConfigured && (
        <div className="border-b border-danger bg-surface px-5 py-3 text-center text-sm text-danger">
          Backend not configured — copy <code>.env.example</code> to <code>.env.local</code> and add your
          Supabase URL and key (see README).
        </div>
      )}
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within UserProfileProvider");
  return ctx;
}
