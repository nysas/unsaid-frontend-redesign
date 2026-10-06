# Unsaid — Frontend

Anonymous peer-perspective platform. Real signup/login (localStorage-backed, no fake demo user), one account with two independently-activatable profiles (Asker + Replier), real profile state that only grows as you actually use the product. Built with Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion.

## Run locally

npm install
npm run dev

Then open http://localhost:3000 and sign up — there's no pre-logged-in demo account anymore.

## Auth & profile state (components/UserProfileProvider.tsx)

This is the real source of truth for the whole app, wired in at app/layout.tsx:

- `signup({ email, username })` creates a genuinely blank account — nothing active, zero of everything — and logs you in.
- `login({ email })` restores whatever account/profile is already stored on this device (this is a single-account, browser-local prototype, not multi-user auth).
- `logout()` clears the session but keeps the account so you can log back in.
- `resetPrototype()` (Settings → "Reset prototype data") wipes everything and sends you back to signup, for testing the flow again from zero.
- `AuthGate` (components/AuthGate.tsx) wraps every protected page (/home, /ask, /you, /onboarding, /become-replier, /assessment, /assessment/result, /settings) and redirects to /login if there's no session.

State is structured to map cleanly onto Supabase later — see the `User` / `AskerProfile` / `ReplierProfile` shapes in lib/types.ts. Swap the localStorage reads/writes in UserProfileProvider for real auth + DB calls without touching any page.

## What's real vs. what's mock

- **Real, per-account:** username, bio, identity mark, asker.active, replier.active, questions you've actually asked (lib askQuestion), perspectives you've actually shared (shareAnswer), which domains you've completed an assessment for.
- **Mock, shared/public:** the community feed (lib/mock-data.ts — other people's questions and answers), the admin dashboard, notifications. These are intentionally not tied to the current user, per "mock data is fine for the public community feed."

## Assessments

40 fully-written questions across 8 domains (4 open-ended + 1 MCQ each, lib/assessment-questions.ts). No scoring, evaluation, or pass/fail exists anywhere — completing a domain just marks `assessmentCompleted: true` and shows a placeholder result screen, per the explicit "no evaluation yet" requirement.

## Notes

- Fonts use CSS font-family stacks with system fallbacks rather than next/font/google, since this build environment has no internet access to Google Fonts.
- Login's password field isn't actually validated (no backend to check it against) — kept in the UI for realism but not persisted or checked, to avoid faking real security.
