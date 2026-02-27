# River: Technical Implementation Documentation

> **Audience:** LLMs and technical contributors
> **Purpose:** Understand system architecture, data flow, and implementation logic
> **Last Updated:** January 2026

---

## Architecture Overview

```
Frontend (Framer/React) → Pipedream Workflows → Supabase (PostgreSQL) → OpenAI API
                       ← HTTP Responses        ← REST API             ← JSON Output
```

**Tech Stack:**
- Frontend: React (Framer framework)
- Backend: Pipedream (Node.js serverless workflows)
- Database: Supabase (PostgreSQL + Auth)
- AI: OpenAI gpt-4o-mini (JSON mode)
- External: RapidAPI (YouTube subtitles + video info)

Home Page (/)                     Dashboard Page (/dashboard)      Form Page (/form)
┌─────────────────────────┐      ┌─────────────────────────┐      ┌─────────────────────────┐
│ AuthGateProvider        │      │ AuthGateProvider        │      │ AuthGateProvider        │
│  └─ RiverProvider       │      │  └─ HOC: ProtectedRoute │      │  └─ HOC: ProtectedRoute │
│      └─ RiverAppRoot    │      │      └─ UserDashboard   │      │      └─ FormPageRoot    │
│          ├─ CTA/Results │      └─────────────────────────┘      └─────────────────────────┘
│          └─ SignUpCTA   │
└─────────────────────────┘

**Key Points:**
- **Route Protection**: `/dashboard` and `/form` are wrapped in `ProtectedRoute`, which redirects anonymous users to `/`.
- **Home Page Logic**: `RiverAppRoot` conditionally renders the form (anonymous) or a "Go to Dashboard" CTA (authenticated).
- **Navigation**: Dashboard has no tabs; "Create New" button links to `/form`.
- **AuthGate**: Owns the single auth listener and claim orchestration.

---

## Component Reference Map

### Frontend Components

| Component | File | Purpose | Key Responsibilities |
|-----------|------|---------|---------------------|
| RiverAppRoot | `frontend/RiverAppRoot.tsx` | Root wrapper | Conditionally renders form or Dashboard redirect based on auth |
| AuthGate | `frontend/AuthGate.tsx` | Auth state provider | Single auth listener, claim orchestration, refreshKey, modal state |
| UseRiverGeneration | `frontend/UseRiverGeneration.tsx` | State management | Context + API calls + session ID management |
| RiverCTA | `frontend/RiverCTA.tsx` | Form interface | URL validation, platform selection, generate action |
| RiverResultsRoot | `frontend/RiverResultsRoot.tsx` | Results orchestrator | Normalization, uses AuthGate context, PostAuthCTA |
| HorizontalCardCarousel | `frontend/HorizontalCardCarousel.tsx` | Navigation UI | Position-based rendering, keyboard/swipe navigation |
| TwitterThreadCard | `frontend/TwitterThreadCard.tsx` | Twitter display | Thread rendering, edit mode, copy, regenerate |
| LinkedInPostCard | `frontend/LinkedInPostCard.tsx` | LinkedIn display | Post rendering, edit mode, copy, regenerate |
| InstagramCarouselCard | `frontend/InstagramCarouselCard.tsx` | Instagram display | Slide navigation, aspect ratio toggle |
| AuthComponents | `frontend/AuthComponents.tsx` | Auth UI | SignUpModal (with success view), AuthPrompt, Supabase client |
| SignUpCTA | `frontend/SignUpCTA.tsx` | Sign-up button | Hidden on protected pages & when authenticated |
| UserDashboard | `frontend/UserDashboard.tsx` | History view | Fetches and displays user generations with status bar, progress bar, and generation cards |
| UserDashboardShell | `frontend/UserDashboardShell.tsx` | Dashboard UI | Shell for dashboard, handles "Create New" navigation |
| RiverLoader | `frontend/RiverLoader.tsx` | Loading animation | Reusable river-themed SVG wave loader (brand blue #4688f7) |
| PostGenerationActions | `frontend/PostGenerationActions.tsx` | Post-generation UI | Shows "Saved to dashboard" confirmation and "Start New Generation" button |
| DashboardPageRoot | `frontend/DashboardPageRoot.tsx` | Dashboard root | Framer component for /dashboard, uses ProtectedRoute |
| FormPageRoot | `frontend/FormPageRoot.tsx` | Form page root | Framer component for /form, uses ProtectedRoute |
| ProtectedRoute | `frontend/ProtectedRoute.tsx` | Auth Guard | Redirects anonymous users to home |
| DashboardRedirectCTA | `frontend/DashboardRedirectCTA.tsx` | Home CTA | "Go to Dashboard" button for logged-in users |

### Backend Workflows

#### Main Workflow (River)

| Step | File | Function | Input | Output |
|------|------|----------|-------|--------|
| 1 | `backend/River/trigger.json` | HTTP trigger | POST request | `steps.trigger.event` |
| 2 | `backend/River/validate_input.js` | Parse/validate | URL, tone, platforms, user_id | Normalized params |
| 3 | `backend/River/fetch_video_info.js` | Fetch video metadata | Video ID | Title, thumbnail URL, metadata |
| 4 | `backend/River/upsert_video.js` | Video persistence | Video ID, URL, title, thumbnail | Video object with UUID |
| 5 | `backend/River/sub_endpoint.json` | Fetch subtitles | Video ID | Subtitle tracks array |
| 6 | `backend/River/sub_pick.js` | Select track / check cache | Tracks array, video row | Selected track OR cached transcript (skip flag) |
| 7 | `backend/River/fetch_timedtext.js` | Conditionally fetch XML | Track URL (or skip flag) | Raw XML or `{ skipped: true }` |
| 8 | `backend/River/parse_sub.js` | Parse XML / pass through | XML string (or skip flag) | Transcript text |
| 9 | `backend/River/transcript_final.js` | Normalize | Parsed text (or cached transcript) | Normalized transcript |
| 10 | `backend/River/extract_transcript.js` | Extract segments | Transcript | Segments + metadata |
| 11 | `backend/River/check_cache.js` | Cache lookup | Cache key | Hit/miss + outputs |
| 12 | `backend/River/Call_openAI_API.js` | Generate content | Transcript, params | Platform outputs |
| 13 | `backend/River/save_generation.js` | Persist results | Generation data | Complete result |
| 14 | `backend/River/return_http_response` | Return to frontend | Result object | HTTP 200 JSON |

#### Auth Workflow (River Auth)

| Step | File | Function | Input | Output |
|------|------|----------|-------|--------|
| 1 | Built-in | HTTP trigger | POST request | Request body |
| 2 | `backend/River Auth/validate_request.js` | Parse request | Body | `{ anonymousSessionId, userId }` |
| 3 | `backend/River Auth/claim_anonymous_generations.js` | Claim ownership | Session ID, User ID | `{ claimed: { videos, generations } }` |
| 4 | Built-in | Return response | Claim result | HTTP 200 JSON |

---

## Data Flow Diagrams

### Generate Flow (First-Time Anonymous User)

```
1. User submits form
   ↓
2. Frontend: getOrCreateSessionId()
   - Check localStorage for "river_session_id"
   - Generate crypto.randomUUID() if missing
   - Store in localStorage
   ↓
3. Frontend: fetch(WEBHOOK_URL, { body: { ...inputs, session_id, user_id } })
   ↓
4. Backend Step 1 (trigger): Receive HTTP POST
   ↓
5. Backend Step 2 (validate_input): Parse and normalize
   - Extract videoId from URL
   - Normalize platforms array
   - Validate tone
   - Extract user_id (if authenticated)
   ↓
6. Backend Step 3 (fetch_video_info): Fetch video metadata
   - Call YT-API for title and thumbnail
   - Select highest quality thumbnail
   - Fallback to YouTube default thumbnail URL
   ↓
7. Backend Step 4 (upsert_video): Database operation
   - INSERT INTO videos (youtube_video_id, original_url, title, thumbnail_url, user_id, anonymous_session_id)
   - ON CONFLICT UPDATE last_used_at, title, thumbnail_url
   - RETURN video row (includes all columns)
   ↓
8. Backend Steps 5-10 (transcript pipeline): Extract transcript
   - sub_pick checks if video already has a stored transcript (from a previous run)
   - If cached: sets skipSubtitleFetch flag, skips RapidAPI entirely
   - If not cached: fetches subtitles via RapidAPI, parses XML, normalizes
   ↓
9. Backend Step 11 (check_cache): Query cache
   - Build cache_key = [video.id, tone, platforms.sort(), "v1"].join("|")
   - Query generations WHERE cache_key = ? AND status = 'success'
   - If hit: PATCH ownership (user_id or anonymous_session_id) onto cached generation, then RETURN
   - If miss: CONTINUE to Step 12
   ↓
9. Backend Step 12 (call_openai): Generate content
   - Build system + user prompts
   - Call OpenAI API (gpt-4o-mini, JSON mode)
   - Parse response
   ↓
10. Backend Step 13 (save_generation): Persist to DB
    - INSERT INTO generations (video_id, tone, platforms, cache_key, user_id, anonymous_session_id)
    - INSERT INTO outputs (generation_id, platform, format, content, metadata) × N
    ↓
11. Backend Step 14 (return_response): Format and return
    - Build result object with video (including title, thumbnail_url) + generation + outputs
    - Return HTTP 200 with JSON
    ↓
12. Frontend: Receive response
    - Normalize result
    - Update state.status = "success"
    - Render HorizontalCardCarousel with platform cards
```

### Authentication + Claim Flow

**AuthGate Orchestration (Single Source of Truth)**

AuthGate (`frontend/AuthGate.tsx`) manages all auth state and claim logic. This eliminates dual auth listeners and race conditions.

**Flow: User Signs Up from Home Page**
```
1. User clicks "Sign Up" button
   ↓
2. AuthGate opens SignUpModal (via openSignUpModal())
   ↓
3. User authenticates via Supabase Auth
   ↓
4. AuthGate's onAuthStateChange listener fires (SIGNED_IN, INITIAL_SESSION, or TOKEN_REFRESHED)
   - All three events are handled; returning OAuth users may fire INITIAL_SESSION instead of SIGNED_IN
   - hasProcessedSignIn ref prevents duplicate claims across events
   ↓
5. AuthGate checks localStorage for "river_session_id"
   ↓
6. If found: AuthGate calls claim webhook, awaits completion
   - Sets claimComplete = false during claim
   - POST to CLAIM_WEBHOOK_URL with { anonymous_session_id, user_id }
   - ALL generations/videos sharing that anonymous_session_id are claimed (no limit)
   ↓
7. AuthGate increments refreshKey, sets authReady = true
   ↓
8. localStorage cleared ONLY if claim returned > 0 items
   - If claim fails or returns 0, river_session_id is preserved for retry
   ↓
9. Components remount with fresh data (keyed by refreshKey)
```

**Key State Flags:**
- `authReady`: True when auth has been checked AND claim is complete
- `refreshKey`: Increments after sign-in/claim to force clean remounts
- `isAuthenticated`: True when session exists

**Flow: User Visits /dashboard Directly**
```
1. DashboardPageRoot wraps UserDashboardShell in AuthGateProvider
   ↓
2. UserDashboardShell waits for authReady = true
   - Shows loading spinner while auth/claim in progress
   ↓
3. If not authenticated: ProtectedRoute redirects to /
   ↓
4. If authenticated: Shows UserDashboardShell
   - Header has "Create New" button -> links to /form
   - Main area shows UserDashboard (history list)
```

**Common Claim Logic (Backend - unchanged):**
1. Backend Auth Step 2 (validate_request): Parse and validate UUIDs
   ↓
2. Backend Auth Step 3 (claim_anonymous_generations):
    - UPDATE videos SET user_id = ?, anonymous_session_id = NULL
      WHERE anonymous_session_id = ? AND user_id IS NULL
    - UPDATE generations SET user_id = ?, anonymous_session_id = NULL
      WHERE anonymous_session_id = ? AND user_id IS NULL
   ↓
3. Backend Auth Step 4: Return { success: true, claimed: { videos, generations } }

### Tweak/Regenerate Flow

```
1. User clicks "Edit" on TwitterThreadCard
   ↓
2. Card enters edit mode (tweakOpen = true)
   ↓
3. User types tweak instructions in textarea
   ↓
4. User clicks "Regenerate" button
   ↓
5. Frontend: riverAPI.regenerate({
     tweak_instructions: "...",
     force_regen: true,
     extra_options: { target_platform: "twitter" }
   })
   ↓
6. Frontend: POST to WEBHOOK_URL with:
   - Original inputs (youtube_url, tone, platforms)
   - force_regen: true
   - tweak_instructions
   - extra_options.target_platform
   ↓
7. Backend: Follows same flow but:
   - sub_pick detects stored transcript on the video row → skips RapidAPI subtitle fetch
   - fetch_timedtext, parse_sub, and transcript_final all pass through with skip flag
   - Skips cache (force_regen = true)
   - Calls OpenAI with tweak_instructions appended to prompt
   - Only generates for target_platform
   ↓
8. Backend Step 13 (save_generation):
   - DELETE FROM outputs WHERE generation_id = ? AND platform = 'twitter'
   - INSERT new twitter output
   - Keep linkedin + carousel outputs intact
   ↓
9. Frontend: Receive response
   - Normalize result
   - Update state with new twitter thread
   - Render updated TwitterThreadCard
   - Exit edit mode (tweakOpen = false)
```

---

## Code Implementation Details

### Session ID Management

**File:** `frontend/UseRiverGeneration.tsx:25-35`

```typescript
const getOrCreateSessionId = (): string => {
  if (typeof window === "undefined") return ""
  let sessionId = localStorage.getItem("river_session_id")
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    localStorage.setItem("river_session_id", sessionId)
  }
  return sessionId
}
```

**Usage in generate():**
```typescript
const body = {
  ...inputs,
  session_id: getOrCreateSessionId(),
  user_id: await getUserId()  // from Supabase auth session
}
```

**Key Points:**
- Session ID persists across page refreshes
- Generated once per browser (not per session)
- Cleared only after successful claim
- Used to track anonymous generations
- Authenticated users send `user_id` directly for immediate attribution

### Cache Key Generation

**File:** `backend/River/check_cache.js:15-25`

```javascript
const PROMPT_VERSION = "v1"

function buildCacheKey(videoId, tone, platforms, extraOptions = null) {
  const normalizedTone = tone.toLowerCase().trim()
  const sortedPlatforms = [...new Set(platforms)].sort().join(",")

  const sortedExtraOptions = extraOptions
    ? JSON.stringify(sortKeys(extraOptions))
    : null

  return [
    videoId,
    normalizedTone,
    sortedPlatforms,
    PROMPT_VERSION,
    sortedExtraOptions
  ].filter(Boolean).join("|")
}
```

**Example Output:**
```
"f336d0bc-b841-465b-8045-024475c079dd|creator-friendly, punchy|carousel,linkedin,twitter|v1"
```

**Key Points:**
- Deterministic (same inputs → same key)
- Version-aware (bump `PROMPT_VERSION` to invalidate all caches)
- Sorted platforms (order-independent)
- Includes extraOptions for targeting

### OpenAI API Call

**File:** `backend/River/Call_openAI_API.js:40-80`

```javascript
const response = await fetch("https://api.openai.com/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${process.env.OPEN_API_KEY}`
  },
  body: JSON.stringify({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.7,
    response_format: { type: "json_object" }
  })
})
```

**System Prompt Structure:**
1. Safety guardrails (no hate, harassment, etc.)
2. Content integrity rules (respect original spirit)
3. Output format requirements (JSON structure)
4. Platform-specific guidelines

**User Prompt Structure:**
```
## TONE
{tone}

## REQUESTED PLATFORMS
{platforms}

## TARGET PLATFORM (if tweaking)
{targetPlatform}

## USER TWEAK REQUEST (if provided)
{tweakInstructions}

## VIDEO META
- videoId: {videoId}
- language: {language}
- autoGenerated: {isAutoGenerated}

## TRANSCRIPT
{transcript} (truncated to 8000 chars)

## TASK
Generate content for the requested platforms...

## RULES
Output must be valid JSON with structure:
{
  "tweet_thread": [...],
  "linkedin_post": "...",
  "carousel_slides": [...]
}
```

### Result Normalization

**File:** `frontend/RiverResultsRoot.tsx:150-250`

```typescript
function normalizeRiverResult(raw: any): NormalizedRiverResult {
  // Extract core fields
  const { video, generation, inputs, outputs, dbOutputs, fromCache } = raw

  // Initialize result object
  const result: NormalizedRiverResult = {
    fromCache: fromCache || false,
    videoId: video?.id || "",
    youtubeId: video?.youtube_video_id || "",
    originalUrl: video?.original_url || "",
    videoTitle: video?.title || "",
    generationId: generation?.id || "",
    tone: generation?.tone || inputs?.tone || "",
    platforms: generation?.platforms || inputs?.platforms || [],
    receivedAt: new Date().toISOString(),
    raw
  }

  // Normalize Twitter
  if (outputs?.twitter) {
    const tweets = outputs.twitter.tweets || []
    result.twitterThread = {
      tweets,
      threadText: tweets.join("\n\n")
    }
  }

  // Normalize LinkedIn
  if (outputs?.linkedin) {
    result.linkedInPost = {
      post: outputs.linkedin.post || ""
    }
  }

  // Normalize Instagram carousel
  if (outputs?.carousel) {
    let slides = outputs.carousel.slides || []

    // Fallback: parse from raw content if metadata missing
    if (slides.length === 0 && outputs.carousel.raw) {
      slides = outputs.carousel.raw
        .split(/\n{2,}/)
        .map(s => s.trim())
        .filter(s => s.length > 0)
    }

    result.instagramCarousel = { slides }
  }

  return result
}
```

**Key Points:**
- Handles multiple output structures (normalized + raw)
- Fallbacks for missing metadata
- Preserves raw response for debugging
- Type-safe output structure

### Authentication Integration

**File:** `frontend/AuthComponents.tsx:10-20`

```typescript
const supabaseUrl = "https://YOUR_PROJECT.supabase.co"
const supabaseAnonKey = "YOUR_SUPABASE_ANON_KEY"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

**AuthGate Provider:** `frontend/AuthGate.tsx`

AuthGate provides a centralized auth context with claim orchestration:

```typescript
type AuthGateContextType = {
    session: any
    user: any
    isAuthenticated: boolean
    authReady: boolean           // true when auth checked AND claim complete
    refreshKey: number           // increments after sign-in/claim
    defaultTab: "create" | "dashboard"
    showSignUpModal: boolean
    openSignUpModal: () => void
    closeSignUpModal: () => void
}
```

**Hook Usage:** `useAuthGate()`

```typescript
// In any component wrapped by AuthGateProvider
const {
    isAuthenticated,
    authReady,
    refreshKey,
    openSignUpModal,
    closeSignUpModal,
} = useAuthGate()

// Example: Wait for auth before rendering
if (!authReady) {
    return <LoadingSpinner />
}

// Example: Trigger sign-up modal
<button onClick={openSignUpModal}>Sign Up</button>

// Example: Force remount after claim
<UserDashboard key={refreshKey} />
```

**Key State Distinctions:**

| State | Meaning |
|-------|---------|
| `isAuthenticated` | Session exists (user is logged in) |
| `authReady` | Auth has been checked AND any claim is complete |
| `refreshKey` | Counter that increments after sign-in/claim |

**Why `authReady` matters:**
- Prevents UserDashboard from mounting before claim completes
- Eliminates the need for artificial delays (no more 300ms setTimeout)
- Ensures data fetching happens with correct user context

**Why `refreshKey` matters:**
- Forces clean remount of UserDashboard after claim
- Ensures fresh data fetch without stale state
- Used as React `key` prop: `<UserDashboard key={refreshKey} />`

**Auth Listener (Single Instance):** `frontend/AuthGate.tsx:89-122`

```typescript
const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, newSession) => {
        const wasAuthenticated = !!session
        const nowAuthenticated = !!newSession

        setSession(newSession)

        // Handle sign-in event
        if (!wasAuthenticated && nowAuthenticated && newSession?.user) {
            const anonymousSessionId = localStorage.getItem("river_session_id")

            if (anonymousSessionId) {
                setClaimComplete(false)
                await claimGenerations(newSession)
                setClaimComplete(true)
                setDefaultTab("dashboard")
            } else {
                setDefaultTab("dashboard")
            }

            setRefreshKey((prev) => prev + 1)
            // Modal stays open to show success view (handled by AuthComponents)
        }

        // Handle sign-out event
        if (wasAuthenticated && !nowAuthenticated) {
            setDefaultTab("create")
            setClaimComplete(true)
        }
    }
)
```

**Key Points:**
- Single auth listener in AuthGate (not in RiverResultsRoot)
- Handles SIGNED_IN, INITIAL_SESSION, and TOKEN_REFRESHED events (covers all OAuth/email flows)
- Claim runs before authReady becomes true
- refreshKey increments after claim to force clean remounts
- localStorage only cleared on successful claim (>0 items), preserved on failure for retry
- Modal closes automatically on successful auth

### Claim Workflow Implementation

**File:** `backend/River Auth/claim_anonymous_generations.js`

```javascript
export default defineComponent({
  async run({ steps, $ }) {
    // Defensive body unwrapping (handles Pipedream double-nesting + string bodies)
    let body = steps.trigger.event.body;
    if (body && typeof body === "string") {
      try { body = JSON.parse(body); } catch (e) { /* leave as-is */ }
    }
    if (body && body.body && typeof body.body === "object") {
      body = body.body;
    }

    const { anonymous_session_id, user_id } = body;

    // Use service role key to bypass RLS
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Update videos — claims ALL matching rows (no limit)
    const { data: claimedVideos, error: videosError } = await supabase
      .from("videos")
      .update({
        user_id: user_id,
        anonymous_session_id: null
      })
      .eq("anonymous_session_id", anonymous_session_id)
      .is("user_id", null)
      .select()

    if (videosError) throw videosError

    // Update generations — claims ALL matching rows (no limit)
    const { data: claimedGenerations, error: generationsError } = await supabase
      .from("generations")
      .update({
        user_id: user_id,
        anonymous_session_id: null
      })
      .eq("anonymous_session_id", anonymous_session_id)
      .is("user_id", null)
      .select()

    if (generationsError) throw generationsError

    $.respond({
      status: 200,
      body: {
        success: true,
        claimed: {
          videos: claimedVideos?.length || 0,
          generations: claimedGenerations?.length || 0
        }
      }
    })
  }
})
```

**Key Points:**
- Uses service role key (bypasses RLS)
- Defensively unwraps request body (handles Pipedream's double-nesting and string encoding)
- Claims ALL records matching the anonymous_session_id — no per-user limit
- Updates only unclaimed records (WHERE user_id IS NULL)
- Returns count of claimed records
- Idempotent (safe to call multiple times — second call returns 0 since records are already claimed)

---

## Database Schema & Queries

### Videos Table

```sql
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  youtube_video_id TEXT UNIQUE NOT NULL,
  original_url TEXT,
  title TEXT,
  thumbnail_url TEXT,
  user_id UUID REFERENCES auth.users(id),
  anonymous_session_id UUID,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_videos_user_id ON videos(user_id);
CREATE INDEX idx_videos_anonymous_session_id ON videos(anonymous_session_id);
```

**Common Query (Upsert):** `backend/River/upsert_video.js`

The upsert includes `title` and `thumbnail_url` from `steps.fetch_video_info.$return_value` (conditionally, only if present):
```sql
INSERT INTO videos (youtube_video_id, original_url, title, thumbnail_url, user_id, anonymous_session_id)
VALUES ($1, $2, $3, $4, $5, $6)
ON CONFLICT (youtube_video_id)
DO UPDATE SET
  last_used_at = NOW(),
  title = COALESCE(EXCLUDED.title, videos.title),
  thumbnail_url = COALESCE(EXCLUDED.thumbnail_url, videos.thumbnail_url),
  user_id = COALESCE(videos.user_id, EXCLUDED.user_id),
  anonymous_session_id = COALESCE(videos.anonymous_session_id, EXCLUDED.anonymous_session_id)
RETURNING *;
```

### Generations Table

```sql
CREATE TABLE generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES videos(id),
  user_id UUID REFERENCES auth.users(id),
  anonymous_session_id UUID,
  tone TEXT NOT NULL,
  platforms TEXT[] NOT NULL,
  status TEXT DEFAULT 'pending',
  prompt_version TEXT DEFAULT 'v1',
  cache_key TEXT,
  extra_options JSONB,
  inputs JSONB,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_generations_user_id ON generations(user_id);
CREATE INDEX idx_generations_anonymous_session_id ON generations(anonymous_session_id);
CREATE INDEX idx_generations_cache_key ON generations(cache_key);
CREATE INDEX idx_generations_video_id ON generations(video_id);
```

**Common Query (Cache Lookup):** `backend/River/check_cache.js`
```sql
SELECT g.*,
  COALESCE(
    json_agg(
      json_build_object(
        'id', o.id,
        'platform', o.platform,
        'format', o.format,
        'content', o.content,
        'metadata', o.metadata
      )
    ) FILTER (WHERE o.id IS NOT NULL),
    '[]'
  ) as outputs
FROM generations g
LEFT JOIN outputs o ON o.generation_id = g.id
WHERE g.cache_key = $1
  AND g.status = 'success'
GROUP BY g.id
LIMIT 1;
```

**Common Query (User Generations):** `frontend/RiverResultsRoot.tsx`
```typescript
const { data: generations } = await supabase
  .from("generations")
  .select(`
    id, created_at, tone, platforms, inputs,
    video:videos!inner(
      id, title, youtube_video_id, original_url
    ),
    outputs(
      id, platform, format, content, metadata
    )
  `)
  .eq("user_id", userId)
  .order("created_at", { ascending: false })
```

### Outputs Table

```sql
CREATE TABLE outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  generation_id UUID NOT NULL REFERENCES generations(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  format TEXT NOT NULL,
  content TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_outputs_generation_id ON outputs(generation_id);
CREATE INDEX idx_outputs_platform ON outputs(platform);
```

**Common Query (Insert Outputs):** `backend/River/save_generation.js`
```javascript
const outputRecords = [
  {
    generation_id: generationId,
    platform: "twitter",
    format: "thread",
    content: outputs.tweet_thread.join("\n\n"),
    metadata: {
      type: "tweet_thread",
      tweet_count: outputs.tweet_thread.length,
      tweets: outputs.tweet_thread
    }
  },
  {
    generation_id: generationId,
    platform: "linkedin",
    format: "post",
    content: outputs.linkedin_post,
    metadata: {
      type: "linkedin_post",
      char_count: outputs.linkedin_post.length
    }
  }
  // ... carousel
]

const { data, error } = await supabase
  .from("outputs")
  .insert(outputRecords)
  .select()
```

---

## Key Algorithms

### Subtitle Selection Priority (with Transcript Caching)

**File:** `backend/River/sub_pick.js`

```javascript
// Priority 0: Use cached transcript from video row (avoids RapidAPI entirely)
const video = steps.upsert_video?.$return_value?.video
if (video?.transcript) {
  return {
    skipSubtitleFetch: true,
    url: null,
    cachedTranscript: video.transcript,
    cachedLanguage: video.transcript_language || "en",
  }
}

// Priority 1: Exact English
const subs = steps.sub_endpoint.$return_value?.subtitles || []
let selected = subs.find(s => s.languageCode === "en")

// Priority 2: Any English variant (en-US, en-GB, etc.)
if (!selected) {
  selected = subs.find(s => (s.languageCode || "").startsWith("en"))
}

// Priority 3: First available
if (!selected) selected = subs[0]

if (!selected?.url) throw new Error("No subtitle track URL found")
return selected
```

**Key change:** When a video already has a stored transcript (from a previous generation), sub_pick returns a `skipSubtitleFetch` flag. This propagates through `fetch_timedtext`, `parse_sub`, and `transcript_final` — all three steps detect the flag and pass through without calling external APIs. This is critical for **tweaks/regenerations**, which re-run the full pipeline but don't need to re-fetch subtitles.

### XML Parsing

**File:** `backend/River/parse_sub.js:15-40`

```javascript
function parseTimedtext(xml) {
  // Match all <text>...</text> nodes
  const textMatches = xml.matchAll(/<text[^>]*>(.*?)<\/text>/gs)

  const segments = []
  for (const match of textMatches) {
    let text = match[1]

    // Decode HTML entities
    text = text
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")

    // Strip <br> tags
    text = text.replace(/<br\s*\/?>/g, " ")

    // Clean whitespace
    text = text.trim()

    if (text.length > 0) {
      segments.push(text)
    }
  }

  return segments.join(" ")
}
```

### Transcript Truncation

**File:** `backend/River/Call_openAI_API.js:25-35`

```javascript
function truncateTranscript(fullText, maxChars = 8000) {
  if (fullText.length <= maxChars) {
    return fullText
  }

  // Truncate to nearest sentence boundary
  let truncated = fullText.slice(0, maxChars)
  const lastPeriod = truncated.lastIndexOf(".")

  if (lastPeriod > maxChars * 0.8) {
    truncated = truncated.slice(0, lastPeriod + 1)
  }

  return truncated + "... [transcript truncated]"
}
```

---

## Configuration Reference

### Environment Variables (Pipedream)

**Main Workflow:**
- `SUPABASE_URL` - Database API endpoint
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (RLS bypass)
- `OPEN_API_KEY` - OpenAI API key
- `RAPIDAPI_KEY` - RapidAPI key for YT-API (video info + subtitles)
- `PUBLIC_INGEST_KEY` - Optional webhook authentication

**Auth Workflow:**
- `SUPABASE_URL` - Same as main workflow
- `SUPABASE_SERVICE_ROLE_KEY` - Same as main workflow

### Hardcoded Configuration (Frontend)

**File:** `frontend/AuthComponents.tsx:10-15`
```typescript
const supabaseUrl = "https://YOUR_PROJECT.supabase.co"
const supabaseAnonKey = "YOUR_SUPABASE_ANON_KEY"
```

**File:** `frontend/UseRiverGeneration.tsx:10`
```typescript
const WEBHOOK_URL = "https://YOUR_MAIN_WEBHOOK.m.pipedream.net"
```

**File:** `frontend/AuthGate.tsx:51`
```typescript
const CLAIM_WEBHOOK_URL = "YOUR_CLAIM_WEBHOOK_URL_HERE"
```

Note: The claim webhook is now called from AuthGate (not RiverResultsRoot) as part of the centralized auth orchestration.

### MCP Configuration

**File:** `.mcp.json`
```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=YOUR_PROJECT_REF"
    }
  }
}
```

---

## API Contracts

### Input Contract (framer-form-output-v1.json)

```typescript
interface GenerateRequest {
  youtube_url: string                    // Required
  tone?: string                          // Default: "creator-friendly, punchy"
  platforms: string[]                    // ["twitter", "linkedin", "carousel"]
  force_regen?: boolean                  // Skip cache if true
  tweak_instructions?: string            // Instructions for regeneration
  extra_options?: {
    target_platform?: "twitter" | "linkedin" | "carousel"
  }
  session_id?: string                    // Added by frontend (anonymous users)
  user_id?: string                       // Added by frontend (authenticated users)
}
```

### Output Contract (river-output-v1.json)

```typescript
interface GenerateResponse {
  video: {
    id: string                           // UUID
    youtube_video_id: string
    original_url: string
    title?: string                       // From YT-API via fetch_video_info
    thumbnail_url?: string               // From YT-API via fetch_video_info
  }
  generation: {
    id: string                           // UUID
    video_id: string
    tone: string
    platforms: string[]
    status: "success" | "error"
    prompt_version: "v1"
    cache_key: string | null
    completed_at: string                 // ISO-8601
    extra_options?: object
    anonymous_session_id?: string
  }
  inputs: {
    tone: string
    platforms: string[]
    force_regen?: boolean
    tweak_instructions?: string
    extra_options?: object
  }
  outputs: {
    twitter?: {
      platform: "twitter"
      format: "thread"
      tweets: string[]
      raw: string
    }
    linkedin?: {
      platform: "linkedin"
      format: "post"
      post: string
    }
    carousel?: {
      platform: "carousel"
      format: "slides"
      slides: string[]
    }
  }
  dbOutputs: OutputRow[]                 // Raw database records
  fromCache: boolean
}
```

### Claim Webhook Contract

**Request:**
```typescript
interface ClaimRequest {
  anonymous_session_id: string           // UUID from localStorage
  user_id: string                        // UUID from Supabase Auth
}
```

**Response:**
```typescript
interface ClaimResponse {
  success: boolean
  claimed: {
    videos: number                       // Count of claimed videos
    generations: number                  // Count of claimed generations
  }
}
```

---

## Error Handling

### Frontend Error Handling

**File:** `frontend/UseRiverGeneration.tsx:80-100`

```typescript
try {
  const response = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Generation failed")
  }

  const data = await response.json()
  return data

} catch (error) {
  console.error("Generation error:", error)
  setState(prev => ({
    ...prev,
    status: "error",
    error: error.message || "An unexpected error occurred"
  }))
  throw error
}
```

### Backend Error Handling

**File:** `backend/River/validate_input.js:60-70`

```javascript
if (!youtube_url || typeof youtube_url !== "string") {
  return $.flow.exit({
    statusCode: 400,
    body: { error: "youtube_url is required and must be a string" }
  })
}

if (!isValidYouTubeUrl(youtube_url)) {
  return $.flow.exit({
    statusCode: 400,
    body: { error: "Invalid YouTube URL format" }
  })
}
```

**File:** `backend/River/Call_openAI_API.js:100-110`

```javascript
try {
  const response = await fetch(OPENAI_API_URL, { ... })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`OpenAI API error: ${response.status} ${errorText}`)
  }

  const data = await response.json()
  return data.choices[0].message.content

} catch (error) {
  console.error("OpenAI call failed:", error)

  return $.flow.exit({
    statusCode: 500,
    body: {
      error: "Content generation failed",
      details: error.message
    }
  })
}
```

---

## Performance Optimizations

### 1. Caching Strategy

**Impact:** 70-80% reduction in OpenAI API calls

**Implementation:**
- Deterministic cache keys
- Database-level cache lookup before OpenAI call
- Instant return for cache hits
- Version-based cache invalidation

### 2. Position-Based Carousel Rendering

**Impact:** Smooth 60fps animations, no layout thrashing

**Implementation:** `frontend/HorizontalCardCarousel.tsx:150-180`
```typescript
cards.map((card, index) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      top: 0,
      width: "100%",
      transform: `translateX(${(index - currentIndex) * 100}%)`,
      opacity: index === currentIndex ? 1 : 0,
      pointerEvents: index === currentIndex ? "auto" : "none",
      transition: "all 400ms cubic-bezier(0.25,0.1,0.25,1)"
    }}
  >
    {card}
  </div>
))
```

**Benefits:**
- GPU-accelerated transforms
- No DOM scroll API
- Consistent across devices

### 3. Transcript Truncation

**Impact:** Reduces OpenAI token usage by 50-70%

**Implementation:**
- Truncate to 8000 chars (approx 2000 tokens)
- Prefer sentence boundaries
- Most videos need only first 10-15 minutes

### 4. Transcript Caching (Skip Subtitle Fetch)

**Impact:** Eliminates RapidAPI calls on tweaks/regenerations

**Implementation:**
- `save_generation.js` stores the transcript on the `videos` table after first successful generation
- On subsequent runs, `sub_pick.js` checks for a stored transcript on the video row
- If found, sets `skipSubtitleFetch: true` and returns the cached transcript
- `fetch_timedtext.js`, `parse_sub.js`, and `transcript_final.js` all detect the skip flag and pass through
- Avoids RapidAPI 400 errors when subtitle endpoints become unavailable

**Benefit:** Tweaks and regenerations never touch RapidAPI, making them faster and more reliable.

### 5. Selective Platform Regeneration

**Impact:** Reduces generation time and cost by 66%

**Implementation:**
- Only generate target platform when tweaking
- Delete only target platform outputs
- Keep other platforms intact
- Return full set of outputs

### 6. Database Indexing

**Impact:** Sub-10ms query times for user generations

**Indexes:**
- `idx_videos_user_id` - User history queries
- `idx_generations_cache_key` - Cache lookups
- `idx_outputs_generation_id` - Output joins
- `idx_videos_anonymous_session_id` - Anonymous tracking
- `idx_generations_anonymous_session_id` - Claim queries

---

## Security Implementation

### Row-Level Security (RLS)

**File:** Supabase Dashboard → Database → RLS Policies

```sql
-- Videos: Users can only see their own
CREATE POLICY "Users can view own videos" ON videos
  FOR SELECT USING (auth.uid() = user_id);

-- Generations: Users can only see their own
CREATE POLICY "Users can view own generations" ON generations
  FOR SELECT USING (auth.uid() = user_id);

-- Outputs: Users can see outputs through generation ownership
CREATE POLICY "Users can view own outputs" ON outputs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM generations
      WHERE generations.id = outputs.generation_id
      AND generations.user_id = auth.uid()
    )
  );
```

### Service Role Key Usage

**Purpose:** Bypass RLS for system operations (claim workflow)

**File:** `backend/River Auth/claim_anonymous_generations.js:10`

```javascript
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY    // NOT anon key
)
```

**Security:** Service role key is:
- Stored in Pipedream environment variables (encrypted)
- Never exposed to frontend
- Used only for authorized system operations
- Limited to claim workflow (isolated Pipedream workflow)

### API Key Protection

**OpenAI Key:**
- Stored in Pipedream environment variables
- Never exposed to frontend
- Rotatable without code changes

**Supabase Anon Key:**
- Safe to expose (public by design)
- Protected by RLS policies
- User-specific access control

---

## Testing Strategy

### Manual Testing Checklist

**Anonymous User Flow:**
- [ ] Generate without signing up
- [ ] Verify session ID in localStorage
- [ ] Close and reopen browser, verify persistence
- [ ] Generate second video, verify same session ID
- [ ] Sign up, verify claim webhook called
- [ ] Verify localStorage cleared
- [ ] Verify dashboard shows both generations

**Authenticated User Flow:**
- [ ] Sign in immediately
- [ ] Generate content
- [ ] Verify no session ID in localStorage
- [ ] Verify generation saved to user account
- [ ] Open dashboard, verify generation listed
- [ ] Sign out, verify dashboard clears

**Tweak Flow:**
- [ ] Generate content for all platforms
- [ ] Click Edit on Twitter card
- [ ] Enter tweak instructions
- [ ] Click Regenerate
- [ ] Verify only Twitter updates
- [ ] Verify LinkedIn + carousel unchanged

**Cache Flow:**
- [ ] Generate content for video A
- [ ] Note generation time (~15 seconds)
- [ ] Generate again with same settings
- [ ] Note instant response (< 1 second)
- [ ] Verify "fromCache: true" in response
- [ ] Force regen, verify new content
- [ ] Change tone, verify new generation

### Edge Cases

**URL Validation:**
- Test with youtube.com/watch?v=...
- Test with youtu.be/...
- Test with youtube.com/shorts/...
- Test with invalid URLs

**Subtitle Handling:**
- Test with auto-generated captions
- Test with manual captions
- Test with no captions (should error)
- Test with non-English captions

**Authentication:**
- Test Google OAuth flow
- Test email signup flow
- Test existing email error
- Test invalid email format
- Test weak password error

---

## Deployment Information

### Frontend (Framer)

**Hosting:** Framer's built-in hosting
**URL:** Custom domain or framer.website subdomain
**Deployment:** Automatic on publish from Framer editor

### Backend (Pipedream)

**Hosting:** Pipedream's serverless infrastructure
**Webhook URLs:**
- Main: `https://YOUR_MAIN_WEBHOOK.m.pipedream.net`
- Auth: `https://YOUR_CLAIM_WEBHOOK.m.pipedream.net`

**Deployment:** Automatic on save in Pipedream editor

### Database (Supabase)

**Project Ref:** `YOUR_PROJECT_REF`
**Region:** Auto-selected by Supabase
**Connection:** REST API (no persistent connections)

---

## Monitoring & Observability

### Logs

**Pipedream Logs:**
- Accessible in workflow run history
- Shows each step's inputs, outputs, errors
- Retention: 30 days (free tier)

**Supabase Logs:**
- Query performance logs
- Auth event logs
- Error logs

### Metrics to Track

**Business Metrics:**
- Total generations (count)
- Cache hit rate (%)
- Anonymous → authenticated conversion rate (%)
- Average time to publish (seconds)
- Platform distribution (%)

**Technical Metrics:**
- OpenAI API latency (ms)
- Database query latency (ms)
- Webhook success rate (%)
- Error rate by step (%)

---

## Future Enhancements

### Short-Term (Technical Debt)

1. **Add retry logic** for OpenAI API failures
   - Exponential backoff
   - Max 3 retries
   - Graceful degradation

2. **Implement webhook authentication**
   - HMAC signature verification
   - Prevent abuse

3. **Add rate limiting**
   - Per user: 10 generations/hour
   - Per IP: 50 generations/hour

4. **Optimize transcript processing**
   - Parallel subtitle fetch + parse
   - Stream processing for large transcripts

### Medium-Term (Features)

1. **Bulk generation**
   - Process multiple videos in single request
   - Queue system for background processing
   - Progress tracking

2. **Export functionality**
   - JSON export
   - CSV export
   - Direct integrations (Buffer, Hootsuite)

3. **Advanced search**
   - Full-text search on content
   - Filter by date, platform, tone
   - Sort by relevance

4. **Team collaboration**
   - Shared workspaces
   - Comments on generations
   - Approval workflows

---

## Troubleshooting Guide

### Common Issues

**Issue:** "No subtitle track URL found" or "No subtitles available"
- **Cause:** Video has no captions, OR RapidAPI returned a 400/error
- **Note:** On tweaks/regenerations, this should not occur because `sub_pick` checks for a cached transcript stored on the `videos` table. If the video was processed once successfully, the transcript is reused automatically.
- **Solution:** For first-time videos, user must ensure captions exist. If RapidAPI is down, retry later.

**Issue:** "Generation failed" with 500 error
- **Cause:** OpenAI API timeout or quota exceeded
- **Solution:** Check OpenAI dashboard, verify API key, retry

**Issue:** "Claimed 0 generations" after signup
- **Cause:** Session ID mismatch or already claimed
- **Solution:** Check localStorage for `river_session_id`, verify claim webhook logs

**Issue:** Dashboard shows empty after signup
- **Cause:** User signed up before generating content
- **Solution:** Expected behavior - generate content to populate dashboard

**Issue:** Carousel not navigating on mobile
- **Cause:** Touch event handlers not working
- **Solution:** Check touch threshold (50px), verify event listeners attached

---

## Code Style & Conventions

### Naming Conventions

**Frontend:**
- Components: PascalCase (e.g., `TwitterThreadCard`)
- Hooks: camelCase with `use` prefix (e.g., `useRiverGeneration`)
- Props: camelCase (e.g., `tweakOpen`, `onToggleTweak`)
- State: camelCase (e.g., `currentIndex`, `isAuthenticated`)

**Backend:**
- Files: snake_case (e.g., `validate_input.js`)
- Functions: camelCase (e.g., `buildCacheKey`)
- Constants: UPPER_SNAKE_CASE (e.g., `PROMPT_VERSION`)

### File Organization

**Frontend:** Component-per-file, colocated with hooks
**Backend:** Step-per-file, numbered in workflow order
**Database:** Single migration file per schema change

### Comment Style

**Do:** Explain WHY, not WHAT
```typescript
// Use service role key to bypass RLS for system operations
const supabase = createClient(url, serviceRoleKey)
```

**Don't:** Redundant comments
```typescript
// Create supabase client
const supabase = createClient(url, key)
```

---

## References

### External Documentation

- [Pipedream Docs](https://pipedream.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Framer Code Components](https://www.framer.com/developers/)

### Internal Documents

- `OVERVIEW.md` - Non-technical project overview
- `claude.md` - Session-based directives for LLM assistance
- `backend/River Auth/RIVER_AUTH_WORKFLOW_SETUP.md` - Auth workflow setup guide

---

**Last Updated:** February 2026
**Document Version:** 1.2
