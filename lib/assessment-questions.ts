import { AssessmentQuestionT, Domain } from "./types";

/**
 * Assessment question bank. Each domain has exactly 5 questions:
 * 4 open-ended / scenario-based, and exactly 1 multiple-choice.
 *
 * IMPORTANT: this file is data only — no scoring, evaluation, or
 * pass/fail logic lives here or anywhere in the frontend yet.
 */
export const assessmentQuestions: Record<Domain, AssessmentQuestionT[]> = {
  "Relationships & Friendships": [
    {
      id: "rel-1",
      type: "open",
      question:
        "Your friend tells you they're thinking about ending a six-year friendship. They're scared they'll regret it. What would you say to them?",
    },
    {
      id: "rel-2",
      type: "open",
      question:
        "Someone tells you they feel like they're always the one making plans and reaching out, and they're thinking about distancing themselves from the group. What would you say to them?",
    },
    {
      id: "rel-3",
      type: "open",
      question:
        "A friend admits they said something hurtful to their partner in the middle of an argument and doesn't know how to bring it up again without it turning into another fight. What would you suggest?",
    },
    {
      id: "rel-4",
      type: "open",
      question:
        "Someone tells you their best friend started hanging out with a new group and they feel replaced, but they don't want to seem needy or possessive. How would you help them think about it?",
    },
    {
      id: "rel-5",
      type: "mcq",
      question:
        "Your friend hasn't replied to you for six hours and you start thinking they're upset with you. What would be the most helpful response?",
      options: [
        "Keep messaging them until they answer.",
        "Assume they don't want to talk to you anymore.",
        "Give them some space and avoid assuming what they're thinking.",
        "Ask another friend why they're ignoring you.",
      ],
    },
  ],

  Family: [
    {
      id: "fam-1",
      type: "open",
      question:
        "Someone says their parents constantly compare them to a sibling and it's affecting their confidence, but they don't want to cause a fight by bringing it up. How would you help them think about this?",
    },
    {
      id: "fam-2",
      type: "open",
      question:
        "A younger sibling asks you to keep a secret from their parents about something that sounds genuinely risky. What would you say to them?",
    },
    {
      id: "fam-3",
      type: "open",
      question:
        "Someone tells you their parents are getting divorced and keep asking them to \"pick a side\" without realizing they're doing it. What would you say to them?",
    },
    {
      id: "fam-4",
      type: "open",
      question:
        "Someone feels guilty for wanting space from a parent who relies on them emotionally more than feels healthy. How would you help them think through that guilt?",
    },
    {
      id: "fam-5",
      type: "mcq",
      question:
        "A friend tells you their parent read their private messages without asking. They're not sure if it's controlling or if they're overreacting. What's the most helpful response?",
      options: [
        "Tell them it's definitely controlling, no question.",
        "Ask what about it felt wrong to them, specifically.",
        "Tell them their parent probably had a good reason.",
        "Tell them to stop overreacting and move on.",
      ],
    },
  ],

  "College & Education": [
    {
      id: "col-1",
      type: "open",
      question:
        "A student is failing a class they need for their major and is scared to tell their parents, who paid for the semester. What would you say to them?",
    },
    {
      id: "col-2",
      type: "open",
      question:
        "Someone got into their dream school but their closest friends are all going somewhere else, and now they're second-guessing their choice. What would you tell them?",
    },
    {
      id: "col-3",
      type: "open",
      question:
        "A student feels like everyone around them has already figured out their major and career path, and they still have no idea what they want to do. How would you help them think about it?",
    },
    {
      id: "col-4",
      type: "open",
      question:
        "Someone is considering dropping out of a program they worked hard to get into, because it isn't what they expected, but they're worried about disappointing people. What would you say?",
    },
    {
      id: "col-5",
      type: "mcq",
      question:
        "A classmate asks to copy your assignment the night before it's due because they're overwhelmed. What's the most helpful response?",
      options: [
        "Just let them copy it, it's not a big deal.",
        "Refuse and say nothing else.",
        "Offer to help them understand it enough to do their own, even if it's late.",
        "Report them to the professor immediately.",
      ],
    },
  ],

  Career: [
    {
      id: "car-1",
      type: "open",
      question:
        "Someone has two job offers — one pays more but feels unstable, the other pays less but seems secure. How would you help them think it through?",
    },
    {
      id: "car-2",
      type: "open",
      question:
        "Someone feels like a fraud two years into their career, despite consistently good feedback from their manager. How would you help them think about that?",
    },
    {
      id: "car-3",
      type: "open",
      question:
        "A friend got passed over for a promotion they were expecting, and they're deciding whether to say something to their manager or let it go. What would you tell them?",
    },
    {
      id: "car-4",
      type: "open",
      question:
        "Someone is considering quitting a stable job to try something they're passionate about, but they're scared of regretting it either way. What would you say to them?",
    },
    {
      id: "car-5",
      type: "mcq",
      question:
        "A coworker takes credit for an idea you both worked on in a meeting with your manager. What's the most helpful next step?",
      options: [
        "Say nothing and let it go, it's not worth the conflict.",
        "Call them out loudly in front of the manager right then.",
        "Talk to them privately first, then loop in your manager if needed.",
        "Start taking credit for their ideas in return.",
      ],
    },
  ],

  Technology: [
    {
      id: "tech-1",
      type: "open",
      question:
        "A teenager asks whether it's safe to share their location with an online friend they've never met in person. What would you tell them?",
    },
    {
      id: "tech-2",
      type: "open",
      question:
        "Someone says a stranger online has been messaging them constantly and it's starting to feel uncomfortable, but they don't want to seem dramatic by blocking them. What would you say?",
    },
    {
      id: "tech-3",
      type: "open",
      question:
        "Someone admits they've been comparing their life to what they see online and it's making them feel worse about themselves, even though they know it's not the full picture. How would you help them think about it?",
    },
    {
      id: "tech-4",
      type: "open",
      question:
        "A friend found out an old photo of them is being shared out of context in a group chat they're not part of. What would you tell them to do?",
    },
    {
      id: "tech-5",
      type: "mcq",
      question:
        "A friend's ex keeps viewing their story within seconds of posting, and it's making them anxious. What's the most helpful response?",
      options: [
        "Tell them to post something to make the ex jealous.",
        "Tell them views don't mean anything and to try not to read into it.",
        "Encourage them to mute or restrict the account if it's affecting their peace.",
        "Tell them to confront the ex about it directly.",
      ],
    },
  ],

  Money: [
    {
      id: "mon-1",
      type: "open",
      question:
        "Someone just got their first paycheck and has no idea how much to save versus spend. What's the first thing you'd tell them?",
    },
    {
      id: "mon-2",
      type: "open",
      question:
        "A friend lent a family member money and it's been months without repayment, but bringing it up feels awkward. What would you tell them?",
    },
    {
      id: "mon-3",
      type: "open",
      question:
        "Someone feels embarrassed that they can't keep up financially with the friend group they hang out with. How would you help them think about it?",
    },
    {
      id: "mon-4",
      type: "open",
      question:
        "Someone is considering taking on debt to fund something meaningful to them — like a move or a course — but they're anxious about the risk. What would you say to help them think it through?",
    },
    {
      id: "mon-5",
      type: "mcq",
      question:
        "A friend asks to borrow money from you for the third time this year, and hasn't paid back the first two. What's the most helpful response?",
      options: [
        "Lend it again without saying anything, to avoid conflict.",
        "Refuse and stop talking to them about it.",
        "Be honest that you're not comfortable lending again until the rest is repaid.",
        "Lend it but tell other friends not to trust them with money.",
      ],
    },
  ],

  Lifestyle: [
    {
      id: "life-1",
      type: "open",
      question:
        "Someone feels like their daily routine is making them unhappy but they don't know what to change first. What would you suggest?",
    },
    {
      id: "life-2",
      type: "open",
      question:
        "A friend says they feel guilty for wanting a quiet weekend alone instead of seeing people, like they're letting everyone down. What would you tell them?",
    },
    {
      id: "life-3",
      type: "open",
      question:
        "Someone is trying to cut back on drinking around their friend group but is worried about how people will react. How would you help them think about it?",
    },
    {
      id: "life-4",
      type: "open",
      question:
        "A friend says they feel like they're always exhausted, but they don't want to see a doctor because they're scared of what it might mean. What would you say?",
    },
    {
      id: "life-5",
      type: "mcq",
      question:
        "A friend has been cancelling plans for weeks and seems withdrawn, but insists they're \"just tired.\" What's the most helpful response?",
      options: [
        "Stop inviting them since they keep cancelling anyway.",
        "Tell them they need to get over it and show up.",
        "Gently check in and let them know you're around whenever they're ready.",
        "Ask mutual friends to pressure them into coming out.",
      ],
    },
  ],

  "Personal Growth": [
    {
      id: "pg-1",
      type: "open",
      question:
        "Someone keeps starting new habits and quitting within a week — the gym, journaling, learning an instrument. How would you help them think about building consistency?",
    },
    {
      id: "pg-2",
      type: "open",
      question:
        "A friend says they don't know who they are outside of being \"the responsible one\" for everyone else. What would you say to them?",
    },
    {
      id: "pg-3",
      type: "open",
      question:
        "Someone feels stuck comparing where they are in life to people they grew up with, even though they know comparison isn't fair. How would you help them think about it?",
    },
    {
      id: "pg-4",
      type: "open",
      question:
        "A friend keeps apologizing for things that aren't their fault, almost automatically, and doesn't seem to notice they're doing it. What would you say to them?",
    },
    {
      id: "pg-5",
      type: "mcq",
      question:
        "A friend tells you they failed at something they'd worked toward for a long time and feel like giving up entirely. What's the most helpful response?",
      options: [
        "Tell them everything happens for a reason and move on.",
        "Let them sit with how it feels before jumping to advice.",
        "Tell them they should have expected it.",
        "Immediately list what they should try next.",
      ],
    },
  ],
};

export function questionCountLabel(domain: Domain) {
  const count = assessmentQuestions[domain].length;
  return `${count} questions · ~${count * 2} minutes`;
}
