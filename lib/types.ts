export type Domain =
  | "Relationships & Friendships"
  | "Family"
  | "College & Education"
  | "Career"
  | "Technology"
  | "Money"
  | "Lifestyle"
  | "Personal Growth";

export const DOMAINS: Domain[] = [
  "Relationships & Friendships",
  "Family",
  "College & Education",
  "Career",
  "Technology",
  "Money",
  "Lifestyle",
  "Personal Growth",
];

export type ResponsePreference =
  | "Logical perspective"
  | "Emotional perspective"
  | "Practical advice"
  | "Someone who's been there"
  | "Different perspectives";

export const RESPONSE_PREFERENCES: ResponsePreference[] = [
  "Logical perspective",
  "Emotional perspective",
  "Practical advice",
  "Someone who's been there",
  "Different perspectives",
];

export type MatchingPreference =
  | "Someone who's been there"
  | "Someone with strong community feedback"
  | "A mix of perspectives"
  | "No preference";

export const MATCHING_PREFERENCES: MatchingPreference[] = [
  "Someone who's been there",
  "Someone with strong community feedback",
  "A mix of perspectives",
  "No preference",
];

/**
 * A replier's status in a single domain. No scoring/evaluation exists yet —
 * a domain is either not assessed, or the assessment has been completed and
 * is awaiting a qualification decision that isn't implemented yet.
 */
export interface DomainQualification {
  domain: Domain;
  assessmentCompleted: boolean;
  completedAt?: string;
}

/** Community reputation for OTHER (mock) repliers shown in the public feed. */
export interface Reputation {
  average: number; // 0-5
  ratingsCount: number;
  helpfulPercent: number;
}

/** A question the current user actually asked during this session. */
export interface MyQuestion {
  id: string;
  domain: Domain;
  body: string;
  isAnonymous: boolean;
  responsePreferences: ResponsePreference[];
  matchingPreference: MatchingPreference;
  createdAt: string;
  answerCount: number; // real, starts at 0 — no fabricated replies
}

/** A perspective the current user actually shared on a (mock) community question. */
export interface MyAnswer {
  id: string;
  questionId: string;
  domain: Domain;
  body: string;
  createdAt: string;
  visibleOnProfile: boolean;
  helpfulCount: number; // real, starts at 0
}

export interface AskerProfile {
  active: boolean;
  questionsAsked: MyQuestion[];
}

export interface ReplierProfile {
  active: boolean;
  qualifications: DomainQualification[];
  perspectivesShared: MyAnswer[];
  helpfulRatings: number;
}

/** The real, signed-in user. No hardcoded demo data lives on this shape. */
export interface User {
  id: string;
  email: string;
  username: string;
  bio: string;
  avatarSeed: string;
  hasCompletedOnboarding: boolean;
  asker: AskerProfile;
  replier: ReplierProfile;
}

/** A question from the public/mock community feed — not the current user's own. */
export interface Question {
  id: string;
  domain: Domain;
  body: string;
  isAnonymous: boolean;
  authorUsername: string; // used only if !isAnonymous
  responsePreferences: ResponsePreference[];
  matchingPreference: MatchingPreference;
  createdAt: string;
  answerCount: number;
}

/** An answer from a (mock) community replier — not the current user's own. */
export interface Answer {
  id: string;
  questionId: string;
  replierUsername: string;
  replierAvatarSeed: string;
  isQualified: boolean;
  domains: Domain[];
  reputation: Reputation | null;
  body: string;
  createdAt: string;
  helpfulCount: number;
  visibleOnProfile: boolean;
}

export const FEEDBACK_CATEGORIES = [
  "Helped me understand the situation",
  "Gave me a new perspective",
  "Helped me make a decision",
  "Gave practical advice",
  "Made me feel heard",
  "Wasn't helpful",
] as const;

export interface Notification {
  id: string;
  type:
    | "answer"
    | "reply"
    | "feedback"
    | "assessment"
    | "qualification"
    | "safety";
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

export interface AssessmentQuestionT {
  id: string;
  type: "open" | "mcq";
  question: string;
  options?: string[];
}
