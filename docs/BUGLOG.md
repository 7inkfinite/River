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
