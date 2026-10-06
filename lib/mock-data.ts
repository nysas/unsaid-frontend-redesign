import { Answer, Domain, Notification, Question } from "./types";

export const mockQuestions: Question[] = [
  {
    id: "q1",
    domain: "Relationships & Friendships",
    body: "I don't know whether I should leave my friend group. I feel like I'm always the one reaching out, and lately it just feels one-sided.",
    isAnonymous: true,
    authorUsername: "",
    responsePreferences: ["Different perspectives", "Practical advice"],
    matchingPreference: "A mix of perspectives",
    createdAt: "2026-08-26T10:20:00Z",
    answerCount: 4,
  },
  {
    id: "q2",
    domain: "Career",
    body: "I got an internship offer from a big company but the pay is really low and it's not in my city. My parents want me to take it for the name on my resume. Is that actually worth it?",
    isAnonymous: false,
    authorUsername: "techbro21",
    responsePreferences: ["Practical advice", "Someone who's been there"],
    matchingPreference: "Someone who's been there",
    createdAt: "2026-08-25T18:05:00Z",
    answerCount: 7,
  },
  {
    id: "q3",
    domain: "Family",
    body: "My parents keep comparing me to my older sibling and I'm tired of pretending it doesn't bother me. How do I bring this up without starting a huge fight?",
    isAnonymous: true,
    authorUsername: "",
    responsePreferences: ["Emotional perspective", "Practical advice"],
    matchingPreference: "No preference",
    createdAt: "2026-08-25T09:00:00Z",
    answerCount: 2,
  },
  {
    id: "q4",
    domain: "Technology",
    body: "Is it worth learning to build my own portfolio site from scratch, or should I just use a template? I want to get into design eventually.",
    isAnonymous: false,
    authorUsername: "midnightcoffee",
    responsePreferences: ["Practical advice", "Logical perspective"],
    matchingPreference: "A mix of perspectives",
    createdAt: "2026-08-24T14:40:00Z",
    answerCount: 5,
  },
  {
    id: "q5",
    domain: "Money",
    body: "I just started my first job and I have no idea how much I should actually be saving versus spending. Where do people even start?",
    isAnonymous: true,
    authorUsername: "",
    responsePreferences: ["Practical advice"],
    matchingPreference: "Someone with strong community feedback",
    createdAt: "2026-08-23T21:15:00Z",
    answerCount: 3,
  },
  {
    id: "q6",
    domain: "Personal Growth",
    body: "I keep starting things and quitting after a week. It's happened with the gym, journaling, learning guitar. How do I actually build consistency?",
    isAnonymous: true,
    authorUsername: "",
    responsePreferences: ["Someone who's been there", "Different perspectives"],
    matchingPreference: "A mix of perspectives",
    createdAt: "2026-08-23T08:30:00Z",
    answerCount: 6,
  },
  {
    id: "q7",
    domain: "Relationships & Friendships",
    body: "I don't know if I'm staying in this relationship because I still love them or because I'm scared of being alone.",
    isAnonymous: true,
    authorUsername: "",
    responsePreferences: ["Emotional perspective", "Different perspectives"],
    matchingPreference: "Someone who's been there",
    createdAt: "2026-08-27T11:00:00Z",
    answerCount: 3,
  },
  {
    id: "q8",
    domain: "Career",
    body: "Everyone around me seems to know what they're doing except me. I'm two years into my career and still feel like I'm faking it.",
    isAnonymous: true,
    authorUsername: "",
    responsePreferences: ["Emotional perspective", "Someone who's been there"],
    matchingPreference: "A mix of perspectives",
    createdAt: "2026-08-27T09:40:00Z",
    answerCount: 1,
  },
];

export const mockAnswers: Record<string, Answer[]> = {
  q1: [
    {
      id: "a1",
      questionId: "q1",
      replierUsername: "midnightcoffee",
      replierAvatarSeed: "midnightcoffee",
      isQualified: true,
      domains: ["Relationships & Friendships"],
      reputation: { average: 4.8, ratingsCount: 46, helpfulPercent: 94 },
      body: "One-sided effort is exhausting, and it's okay to name that out loud instead of just fading out. Try telling one person specifically how it's felt for you, rather than the whole group at once — it's less overwhelming and gives them a real chance to respond. If nothing changes after that, drifting away isn't giving up, it's just being honest about where the friendship actually is.",
      createdAt: "2026-08-26T12:00:00Z",
      helpfulCount: 12,
      visibleOnProfile: true,
    },
    {
      id: "a2",
      questionId: "q1",
      replierUsername: "quietstorm",
      replierAvatarSeed: "quietstorm",
      isQualified: true,
      domains: ["Relationships & Friendships", "Personal Growth"],
      reputation: { average: 4.5, ratingsCount: 18, helpfulPercent: 88 },
      body: "Ask yourself if you'd miss the group itself or just the idea of having one. Sometimes we hold on to friendships out of habit, not connection. Worth sitting with that before deciding whether it's a conversation or a quiet exit.",
      createdAt: "2026-08-26T13:10:00Z",
      helpfulCount: 5,
      visibleOnProfile: false,
    },
  ],
  q2: [
    {
      id: "a3",
      questionId: "q2",
      replierUsername: "techbro21",
      replierAvatarSeed: "techbro21",
      isQualified: true,
      domains: ["Career", "Technology"],
      reputation: { average: 4.6, ratingsCount: 31, helpfulPercent: 90 },
      body: "The name on your resume matters less than what you actually did there. If you'll get real responsibility and a good manager, it can be worth the short-term pay cut. If it's mostly prestige with busywork, it's not.",
      createdAt: "2026-08-25T19:30:00Z",
      helpfulCount: 9,
      visibleOnProfile: true,
    },
  ],
};

export const mockNotifications: Notification[] = [
  {
    id: "n1",
    type: "answer",
    title: "Someone shared a perspective",
    body: "@midnightcoffee responded to your question about your friend group.",
    createdAt: "2026-08-27T09:00:00Z",
    read: false,
  },
  {
    id: "n2",
    type: "feedback",
    title: "You received feedback",
    body: "Someone said your perspective helped.",
    createdAt: "2026-08-26T17:20:00Z",
    read: false,
  },
  {
    id: "n3",
    type: "qualification",
    title: "You're a Qualified Replier for Career",
    body: "You passed the Career assessment. You can start answering questions in this domain.",
    createdAt: "2026-08-24T11:00:00Z",
    read: true,
  },
  {
    id: "n4",
    type: "assessment",
    title: "Assessment result ready",
    body: "Your Family assessment has been reviewed.",
    createdAt: "2026-08-22T08:00:00Z",
    read: true,
  },
  {
    id: "n5",
    type: "safety",
    title: "A question you posted needed review",
    body: "We removed some identifying details before publishing it.",
    createdAt: "2026-08-20T15:40:00Z",
    read: true,
  },
];

export function getQuestionsForDomains(domains: Domain[]): Question[] {
  return mockQuestions.filter((q) => domains.includes(q.domain));
}

export function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
