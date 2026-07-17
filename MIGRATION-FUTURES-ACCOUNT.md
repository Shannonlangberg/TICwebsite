# TIC → One Futures Account (migration plan)

**Goal:** TIC stops having its own logins. One Futures account (the futures-OS
Supabase project, `dzgiirkdmrtzbchrlebe`) signs you into the Futures OS app,
TIC, and (from day one) Total Church. Approved by Shannon 2026-07-16.

## Why now
TIC has very few users — migrating logins today is nearly free. Total Church
must be built on the shared auth from the start (never gets its own).

## Target architecture
- **Auth:** futures-OS Supabase (`NEXT_PUBLIC_SUPABASE_URL/ANON_KEY` in this
  repo's Netlify env swap to the futures-OS project).
- **Person linkage:** auth user → `people` via the existing greenhouse-claim
  pattern (`people.greenhouse_uuid = auth user id`); signups without a person
  go through the `greenhouse-signup` edge function which creates/matches one.
- **Content:** TIC's `videos` table moves into futures-OS `tic_modules`
  (needs added columns: `slug`, `description`, `vimeo_id`, `vimeo_hash`,
  `published`). Seed from this repo's Supabase before cutover.
- **Progress:** `video_progress` (user-keyed) → futures-OS `tic_progress`
  (person-keyed). Milestones `tic_enrolled` / `tic_completed` written directly
  — the tic-webhook bridge becomes unnecessary and can be retired.
- **Questions:** new futures-OS table `tic_questions (id, person_id,
  module_id, question_text, created_at)` with RLS: person sees own, staff CP+
  see campus.

## Steps
1. futures-OS migration: extend `tic_modules`, create `tic_questions`.
2. Export this repo's `videos` rows → insert as `tic_modules` (keep order).
3. Rewrite data layer here: `src/lib/supabase/*` env swap; queries in
   `app/videos/*`, `app/admin/*`, signup/login pages target the new tables;
   signup calls `greenhouse-signup` (gets person match + welcome email) instead
   of local `auth.signUp` + profiles trigger.
4. PCO sync: keep `syncNewChristian` for the NC checkbox; person linkage now
   carries `pco_person_id` from the shared record automatically.
5. Migrate the handful of existing TIC users: create futures-OS auth users
   (send password-set invite), map their progress by email.
6. Cut Netlify env over, deploy, retire `TIC_WEBHOOK_SECRET` + webhook calls.

## Don't forget
- `people.tic_unlocked_at` gates access for new Christians — TIC can check it
  to show the "unlocked" experience.
- Grow funnel (Heartbeat) reads `tic_enrolled`/`tic_completed` milestones and
  `tic_progress` — writing those directly keeps every dashboard working.
