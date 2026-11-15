# MDCAT Prime — Live Site

A new, separate MDCAT Prime web app: the real StudyHub infrastructure
(screens and flows from the StudyHub app) with the ShopFlow design
(teal, Plus Jakarta Sans, ShopFlow-style boxes).

This is a single static file (`index.html`). There is no build step.
Deploy it as a static site (for example by importing this repo into
Vercel). The original StudyHub app and its repo are untouched.

## Backend (live)

- Firebase project: `graphic-mode-k5p7n`
- Firestore named database: `ai-studio-fa3ed221-9d1d-49f7-9a67-0a698e2cdf28`
- Firebase JS SDK v13 (modular, loaded from the Google CDN as ES modules)

All data is live — nothing is demo or session-only:

- **Auth:** Firebase Auth, email and password only. No Google sign-in.
  Register creates a `students/{uid}` document (full name, father's
  name, email, role `student`). Login loads the student profile from
  Firestore. Forgot password sends a real reset link by email.
  Profile edits save to Firestore; password change re-authenticates
  first.
- **Tests:** `tests` where `published == true`, newest first. Starting
  a test loads its questions from `tests/{testId}/questions`, ordered
  by `order`. If a test has no questions saved yet, the page falls back
  to its built-in original MCQs for that subject and shows a clear
  "SAMPLE QUESTIONS" badge.
- **Attempts:** finishing a test scores it exactly like the real
  StudyHub app (marks per question, negative marks if the test sets
  them) and saves an `attempts` document. Home stats and the
  Dashboard / Student Progress screen are computed from the signed-in
  user's real submitted attempts.
- **Notes:** `notes` where `published == true`, with search, subject
  filter, in-app PDF viewer and download.
- **Announcements:** `announcements` where `published == true`,
  shown as Latest Updates on Home (first two).
- **Notifications:** the bell shows the signed-in user's real unread
  notification count.

## Demo login

The login screen has a clearly labelled "Use Demo Account" button. It
signs in through real Firebase Auth with the shared demo account
(`demo@studyhub.pk`). That demo user must exist in Firebase Auth
(email/password) for the button to work; if it does not exist yet, the
button says so instead of faking a login.

## Deploy notes

- Static site: serve `index.html` as-is.
- Add the live site's domain to Firebase Console > Authentication >
  Settings > Authorized domains, otherwise sign-in will be rejected.
- Firestore rules are the StudyHub project's published rules; this repo
  does not change them.
