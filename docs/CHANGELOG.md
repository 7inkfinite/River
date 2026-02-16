# Changelog

All notable changes to River will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2026-02-09

### Added
- **Video Titles & Thumbnails**: Backend now fetches video title and thumbnail from YT-API (`fetch_video_info.js`) and persists them to the `videos` table via upsert.
- **user_id Pipeline**: Authenticated users' `user_id` is now passed from frontend through the full backend pipeline (`UseRiverGeneration` → `validate_input` → `upsert_video` → `save_generation`), so generations are immediately attributed without needing the claim webhook.
- **PostGenerationActions**: Navigation CTAs ("Generate New", "Back to Dashboard") shown after successful generation.
- **Infinite Scroll & Date Grouping**: Dashboard now uses infinite scroll with date-grouped dividers instead of loading all generations at once.

### Changed
- **Dashboard Shell**: Redesigned `UserDashboardShell.tsx` with updated status bar and header spacing.
- **Results Page**: Video object returned to frontend now includes `title` and `thumbnail_url` fields, enabling the `VideoHeader` component to show the actual video title instead of "YouTube video (ID)".
- **CTA Disabled on Success**: "There you go" button is now disabled after successful generation to prevent duplicate submissions.

### Fixed
- **Scroll Lock**: Fixed page becoming unscrollable when results display inline (`HorizontalCardCarousel.tsx`, `RiverAppRoot.tsx`).
- **Missing Video Metadata**: `fetch_video_info` output was not consumed by downstream steps — title and thumbnail were never written to DB or returned to frontend. Now wired into `upsert_video.js` and `save_generation.js`.

### Technical
- `upsert_video.js`: Pulls `title` and `thumbnailUrl` from `steps.fetch_video_info.$return_value` and includes them in the Supabase upsert payload.
- `save_generation.js`: Both cache-hit and cache-miss return paths now include `video.title` and `video.thumbnail_url`.
- `validate_input.js`: Extracts and forwards `user_id` from request body.
- `UseRiverGeneration.tsx`: Sends `user_id` from Supabase auth session in generation payload.
- `AuthComponents.tsx`: Updated to support user_id retrieval.

---

## [1.2.0] - 2026-02-01

### Added
- **Dashboard Progress Bar**: New `GenerationsProgressBar` component showing generations used/remaining with "Upgrade" CTA.
- **X (Twitter) Logo**: Custom SVG component replacing the deprecated Twitter bird icon.
- **Platform Icon States**: Active/inactive visual states for platform icons based on generation selection.
- **PostGenerationActions**: New component showing "Saved to dashboard" confirmation after generation.

### Changed
- **Dashboard Status Bar**: Redesigned to match Figma - Home icon on left, "New +" blue pill button and logout icon on right.
- **Dashboard Header**: Greeting text now black (#2F2F2F) instead of blue, with horizontal divider line below.
- **Generation Cards**: Now always show all 3 platform icons (X, LinkedIn, Instagram) with active/inactive states.
- **Platform Icons**: Updated to use X logo instead of Twitter bird throughout the application.

### Technical
- Updated `UserDashboard.tsx` with new Figma-based design implementation.
- Added `XLogo` SVG component for X (Twitter) branding.
- Improved visual consistency with Figma design system.

---

## [1.1.0] - 2026-01-23

### Added
- **Route Protection**: Implemented `ProtectedRoute` component to secure `/dashboard` and `/form`.
- **New Form Page**: dedicated `/form` route for authenticated users.
- **Home Page Logic**: Authenticated users now see a "Go to Dashboard" CTA instead of the form.
- **Success Modal**: Post-auth experience now shows a success message and "Open Manager" button instead of auto-closing.

### Changed
- **Dashboard Navigation**: Removed tab-based navigation. Added "Create New" button pointing to `/form`.
- **Auth Flow**: Improved claim logic and modal behavior.
- **Home Page**: Removed `SignUpCTA` for authenticated users.

### Fixed
- **Framer Integration**: Fixed `AuthGate` type definition for `defaultTab`.
- **Framer Integration**: Fixed `AuthComponents` URL constructor error.
- Fixed dashboard crash caused by querying non-existent `title` and `inputs` columns from Supabase.
- Fixed issue where generations created by an already logged-in user were not automatically claimed/attributed to their account.

---

## [1.0.0] - 2025-01-13

### Added
- Initial public release
- YouTube transcript to social media content generation
- Support for Twitter, LinkedIn, and Instagram carousel formats
- User authentication with Supabase
- Anonymous session tracking
- Deterministic caching system

### Technical
- Frontend: Framer + React components
- Backend: Pipedream serverless workflows
- Database: Supabase PostgreSQL with RLS
- AI: OpenAI gpt-4o-mini

---

<!-- Format for future entries:

## [X.Y.Z] - YYYY-MM-DD

### Added
- Feature description [#PR or commit hash]

### Changed
- Change description [#PR or commit hash]

### Fixed
- Bug fix description [#PR or commit hash]

### Removed
- Removal description [#PR or commit hash]

-->
