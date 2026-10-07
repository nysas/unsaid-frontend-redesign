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

export type QualificationStatus = "submitted" | "qualified" | "not_qualified";

/**
 * A replier's status in a single domain. Submitting an assessment lets you
 * help in that domain right away; a human reviewer (admin panel) can later
 * mark it qualified (shows a badge) or not qualified (removes access).
 */
export interface DomainQualification {
  domain: Domain;
  assessmentCompleted: boolean;
  status: QualificationStatus;
  completedAt?: string;
  reviewerNote?: string | null;
}

export interface Reputation {
  average: number; // 0-5
  ratingsCount: number;
  helpfulPercent: number;
}

/** A question as anyone may see it. Never carries the author's id. */
export interface Question {
  id: string;
  domain: Domain;
  body: string;
  isAnonymous: boolean;
  authorUsername: string | null; // null when anonymous
  responsePreferences: ResponsePreference[];
  matchingPreference: MatchingPreference;
  createdAt: string;
  answerCount: number;
  status: "visible" | "hidden" | "removed";
  isMine: boolean;
}

/** A perspective as anyone may see it. */
export interface Answer {
  id: string;
  questionId: string;
  domain: Domain;
  replierUsername: string;
  replierAvatarSeed: string;
  isQualified: boolean;
  domains: Domain[]; // domains the replier is qualified in
  reputation: Reputation | null;
  body: string;
  createdAt: string;
  helpfulCount: number;
  visibleOnProfile: boolean;
  status: "visible" | "hidden" | "removed";
  isMine: boolean;
  myFeedback: boolean | null; // what the viewer said, if anything
}

export type MyQuestion = Question;
export type MyAnswer = Answer;

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

export interface NotificationPrefs {
  answer: boolean;
  feedback: boolean;
  assessment: boolean;
  safety: boolean;
}

/** The signed-in user, assembled from several tables. */
export interface User {
  id: string;
  email: string;
  username: string;
  bio: string;
  avatarSeed: string;
  hasCompletedOnboarding: boolean;
  isAdmin: boolean;
  notificationPrefs: NotificationPrefs;
  asker: AskerProfile;
  replier: ReplierProfile;
}

export interface ReceivedFeedback {
  id: string;
  answerId: string;
  helpful: boolean;
  rating: number | null;
  categories: string[];
  note: string | null;
  createdAt: string;
}

export interface PublicProfile {
  username: string;
  bio: string;
  avatarSeed: string;
  replierActive: boolean;
  qualifiedDomains: Domain[];
  assessedDomains: Domain[];
  answersCount: number;
  reputation: (Reputation & { helpfulCount: number }) | null;
  perspectives: { id: string; domain: Domain; body: string; createdAt: string; helpfulCount: number }[];
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
  link: string | null;
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

export const REPORT_REASONS = [
  "Contains identifying information",
  "Harassment or bullying",
  "Unhelpful / dismissive",
  "Spam or self-promotion",
  "Someone may be in danger",
  "Something else",
] as const;
