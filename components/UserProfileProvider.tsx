"use client";
import { createContext, useContext, useEffect, useState } from "react";
import {
  Domain,
  MatchingPreference,
  MyAnswer,
  MyQuestion,
  ResponsePreference,
  User,
} from "@/lib/types";

const ACCOUNT_KEY = "unsaid-account-v1"; // { id, email, username } — survives logout
const PROFILE_KEY = "unsaid-profile-v3"; // full User — survives logout
const SESSION_KEY = "unsaid-session-v1"; // "1" | null — cleared on logout

interface Account {
  id: string;
  email: string;
  username: string;
}

function newId() {
  return Math.random().toString(36).slice(2, 10);
}

function blankUser(account: Account): User {
  return {
    id: account.id,
    email: account.email,
    username: account.username,
    bio: "",
    avatarSeed: account.username,
    hasCompletedOnboarding: false,
    asker: { active: false, questionsAsked: [] },
    replier: { active: false, qualifications: [], perspectivesShared: [], helpfulRatings: 0 },
  };
}

interface ProfileContextValue {
  user: User | null;
  isLoggedIn: boolean;
  mounted: boolean;
  signup: (input: { email: string; username: string }) => { ok: boolean; error?: string };
  login: (input: { email: string }) => { ok: boolean; error?: string; user?: User };
  logout: () => void;
  resetPrototype: () => void;
  completeOnboarding: (choice: "ask" | "help" | "both") => void;
  activateAsker: () => void;
  submitReplierAssessments: (domains: Domain[]) => void;
  updateProfile: (patch: { username?: string; bio?: string; avatarSeed?: string }) => void;
  askQuestion: (input: {
    domain: Domain;
    body: string;
    isAnonymous: boolean;
    responsePreferences: ResponsePreference[];
    matchingPreference: MatchingPreference;
  }) => void;
  shareAnswer: (input: {
    questionId: string;
    domain: Domain;
    body: string;
    visibleOnProfile: boolean;
  }) => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function UserProfileProvider({ children }: { children: React.ReactNode }) {
  // Always start logged out with no user, so server and client first render match.
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem(SESSION_KEY);
    const storedProfile = localStorage.getItem(PROFILE_KEY);
    if (session === "1" && storedProfile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing persisted client-only session on mount, required to avoid SSR mismatch
      setUser(JSON.parse(storedProfile));
      setIsLoggedIn(true);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !user) return;
    localStorage.setItem(PROFILE_KEY, JSON.stringify(user));
  }, [user, mounted]);

  function signup(input: { email: string; username: string }): { ok: boolean; error?: string } {
    const existingAccount = localStorage.getItem(ACCOUNT_KEY);
    if (existingAccount) {
      return { ok: false, error: "An account already exists on this device. Try logging in instead." };
    }
    const account: Account = { id: newId(), email: input.email.trim(), username: input.username.trim() };
    const fresh = blankUser(account);
    localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
    localStorage.setItem(PROFILE_KEY, JSON.stringify(fresh));
    localStorage.setItem(SESSION_KEY, "1");
    setUser(fresh);
    setIsLoggedIn(true);
    return { ok: true };
  }

  function login(input: { email: string }): { ok: boolean; error?: string; user?: User } {
    const storedAccount = localStorage.getItem(ACCOUNT_KEY);
    const storedProfile = localStorage.getItem(PROFILE_KEY);
    if (!storedAccount || !storedProfile) {
      return { ok: false, error: "No account found on this device. Sign up first." };
    }
    const account: Account = JSON.parse(storedAccount);
    if (account.email.toLowerCase() !== input.email.trim().toLowerCase()) {
      return { ok: false, error: "That email doesn't match the account on this device." };
    }
    const profile: User = JSON.parse(storedProfile);
    localStorage.setItem(SESSION_KEY, "1");
    setUser(profile);
    setIsLoggedIn(true);
    return { ok: true, user: profile };
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
    setIsLoggedIn(false);
  }

  function resetPrototype() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(ACCOUNT_KEY);
    localStorage.removeItem(PROFILE_KEY);
    setUser(null);
    setIsLoggedIn(false);
  }

  function completeOnboarding(choice: "ask" | "help" | "both") {
    setUser((u) =>
      u
        ? {
            ...u,
            hasCompletedOnboarding: true,
            asker: { ...u.asker, active: choice === "ask" || choice === "both" ? true : u.asker.active },
          }
        : u
    );
  }

  function activateAsker() {
    setUser((u) => (u ? { ...u, asker: { ...u.asker, active: true } } : u));
  }

  function submitReplierAssessments(domains: Domain[]) {
    setUser((u) => {
      if (!u) return u;
      const now = new Date().toISOString();
      return {
        ...u,
        replier: {
          ...u.replier,
          active: true,
          qualifications: [
            ...u.replier.qualifications.filter((q) => !domains.includes(q.domain)),
            ...domains.map((domain) => ({ domain, assessmentCompleted: true, completedAt: now })),
          ],
        },
      };
    });
  }

  function updateProfile(patch: { username?: string; bio?: string; avatarSeed?: string }) {
    setUser((u) =>
      u
        ? {
            ...u,
            username: patch.username ?? u.username,
            bio: patch.bio ?? u.bio,
            avatarSeed: patch.avatarSeed ?? u.avatarSeed,
          }
        : u
    );
  }

  function askQuestion(input: {
    domain: Domain;
    body: string;
    isAnonymous: boolean;
    responsePreferences: ResponsePreference[];
    matchingPreference: MatchingPreference;
  }) {
    setUser((u) => {
      if (!u) return u;
      const question: MyQuestion = {
        id: `mine-${newId()}`,
        domain: input.domain,
        body: input.body,
        isAnonymous: input.isAnonymous,
        responsePreferences: input.responsePreferences,
        matchingPreference: input.matchingPreference,
        createdAt: new Date().toISOString(),
        answerCount: 0,
      };
      return { ...u, asker: { ...u.asker, questionsAsked: [question, ...u.asker.questionsAsked] } };
    });
  }

  function shareAnswer(input: {
    questionId: string;
    domain: Domain;
    body: string;
    visibleOnProfile: boolean;
  }) {
    setUser((u) => {
      if (!u) return u;
      const answer: MyAnswer = {
        id: `mine-${newId()}`,
        questionId: input.questionId,
        domain: input.domain,
        body: input.body,
        createdAt: new Date().toISOString(),
        visibleOnProfile: input.visibleOnProfile,
        helpfulCount: 0,
      };
      return {
        ...u,
        replier: { ...u.replier, perspectivesShared: [answer, ...u.replier.perspectivesShared] },
      };
    });
  }

  return (
    <ProfileContext.Provider
      value={{
        user,
        isLoggedIn,
        mounted,
        signup,
        login,
        logout,
        resetPrototype,
        completeOnboarding,
        activateAsker,
        submitReplierAssessments,
        updateProfile,
        askQuestion,
        shareAnswer,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within UserProfileProvider");
  return ctx;
}
