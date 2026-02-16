# Bug Log

Technical record of bugs found and fixed in River. For user-facing changelog, see [CHANGELOG.md](CHANGELOG.md).

---

## 2025-01-13

### ✅ Fixed: Example Bug Title
**Priority:** High
**Component:** frontend/RiverResultsRoot.tsx
**Issue:** Detailed description of the bug
**Root Cause:** What was wrong
**Fix:** What was changed to fix it
**Commit:** [abc1234](link-to-commit)
**Testing:** How it was verified

---

## 2026-01-15

### ✅ Fixed: Dashboard Crash on Load
**Priority:** High
**Component:** `frontend/UserDashboard.tsx`
**Issue:** Dashboard crashed with "Column does not exist" error (code 42703) when loading.
**Root Cause:** The `fetchUserAndGenerations` query requested `title` from `videos` table and `inputs` from `generations` table, neither of which exist in the Supabase schema.
**Fix:** Removed `title` and `inputs` fields from the Supabase select query.
**Testing:** Verified manually by opening dashboard; crash is resolved and history loads.

### ✅ Fixed: Logged-in Generations Not Claimed
**Priority:** High
**Component:** `frontend/RiverResultsRoot.tsx`
**Issue:** Generations created while already logged in were not appearing in the dashboard.
**Root Cause:** The claim logic (calling the webhook to assign anonymous generation to user) was only triggered on the `SIGNED_IN` auth event. It did not run when an already-authenticated user created a new generation.
**Fix:** Refactored claim logic into `claimGenerations` helper and added a `useEffect` trigger to call it immediately after a successful generation if `isAuthenticated` is true.
**Testing:** Verified by generating a video while logged in; confirmed it immediately claimed and appeared in dashboard.

---

## 2026-02-09

### ✅ Fixed: Missing user_id in Generation Pipeline
**Priority:** High
**Component:** `frontend/UseRiverGeneration.tsx`, `backend/River/validate_input.js`, `backend/River/upsert_video.js`, `backend/River/save_generation.js`
**Issue:** Authenticated users' generations were not attributed to their account. Dashboard required the claim webhook to associate generations.
**Root Cause:** Frontend did not send `user_id` in the generation payload, and backend did not extract or persist it.
**Fix:** Added `user_id` to the full pipeline: frontend sends it from Supabase auth session, `validate_input` extracts it, `upsert_video` and `save_generation` persist it to `videos` and `generations` tables.
**Testing:** Generate while authenticated → verify `user_id` populated in DB → generation appears in dashboard immediately.

### ✅ Fixed: Video Title & Thumbnail Not Persisted
**Priority:** Medium
**Component:** `backend/River/upsert_video.js`, `backend/River/save_generation.js`
**Issue:** `fetch_video_info.js` step was added to fetch video title and thumbnail from YT-API, but its output was never consumed by downstream steps. Titles and thumbnails were not written to DB or returned to frontend.
**Root Cause:** `upsert_video.js` did not read from `steps.fetch_video_info.$return_value`, and `save_generation.js` did not include `title`/`thumbnail_url` in the video object returned to the frontend.
**Fix:** `upsert_video.js` now destructures `title` and `thumbnailUrl` from the fetch step and includes them in the upsert payload. `save_generation.js` now includes `video.title` and `video.thumbnail_url` in both cache-hit and cache-miss return paths.
**Testing:** Generate content → check `videos` table has `title` and `thumbnail_url` populated → results page shows actual video title.

### ✅ Fixed: Scroll Lock During Results Display
**Priority:** High
**Component:** `frontend/HorizontalCardCarousel.tsx`, `frontend/RiverAppRoot.tsx`
**Issue:** Page became unscrollable when generation results displayed inline.
**Root Cause:** Container styles were blocking vertical page scroll.
**Fix:** Updated overflow and positioning styles to allow normal page scrolling while results are visible.
**Testing:** Generate content → verify page scrolls normally during and after results display.

### ✅ Fixed: Success CTA Remained Clickable
**Priority:** Medium
**Component:** `frontend/RiverCTA.tsx`
**Issue:** "There you go" button remained active after successful generation, allowing duplicate submissions.
**Root Cause:** `isDisabled` logic did not account for success state.
**Fix:** Updated disabled condition to include success state, with visual feedback (cursor, opacity).
**Testing:** Complete generation → verify CTA is disabled and unclickable.

---

<!-- Template for new entries:

## YYYY-MM-DD

### ✅ Fixed: Bug Title
**Priority:** High/Medium/Low
**Component:** File or component name
**Issue:** What was broken
**Root Cause:** Why it broke
**Fix:** What changed
**Commit:** [hash](link)
**Testing:** Verification steps

-->
