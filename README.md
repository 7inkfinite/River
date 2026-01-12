
River 🌊

River is an AI-powered system that repurposes YouTube videos into high-quality, platform-specific social content — Twitter threads, LinkedIn posts, and Instagram carousels.

It is designed to feel calm, intentional, and iterative: generate → review → tweak → regenerate → publish.
What River Does

    Accepts a YouTube URL, tone instructions, and target platforms
    Extracts and cleans the video transcript via YouTube API
    Checks cache for existing generations (deterministic cache keys)
    Generates platform-specific content using OpenAI (gpt-4o-mini)
    Stores generations and outputs in Supabase with proper versioning
    Returns structured results back to Framer for display and iteration
    Supports tweaking with platform-specific regeneration and cache bypass

Supported Platforms

    Twitter / X — 8-12 tweet threads with natural formatting
    LinkedIn — 120-220 word professional posts
    Instagram — 4-5 slide carousel decks with visual hierarchy

System Architecture
    Framer (UI) 
  → Pipedream (workflow orchestration) 
    → OpenAI (content generation)
    → Supabase (persistence + cache)
  → Framer (results + tweaks)

Technology Stack
Layer	Technology
Frontend	Framer (React/TSX), lucide-react
Backend	Pipedream (Node.js serverless workflows)
LLM	OpenAI API (gpt-4o-mini with JSON mode)
Database	Supabase (PostgreSQL + REST API)
Transcript Source	YouTube API via RapidAPI (yt-api)
Repository Structure

/River/
├── frontend/                       # Framer canvas components (React/TSX)
│   ├── RiverAppRoot.tsx            # Root provider wrapper
│   ├── UseRiverGeneration.tsx      # State management hook & provider
│   ├── RiverCTA.tsx                # Main CTA button & form
│   ├── RiverResultsRoot.tsx        # Results display with carousel & auth
│   ├── AuthComponents.tsx          # Supabase auth (signup/signin modals)
│   ├── UserDashboard.tsx           # User generation history dashboard
│   ├── HorizontalCardCarousel.tsx  # Single-card carousel component
│   ├── TwitterThreadCard.tsx       # Twitter content display & edit
│   ├── LinkedInPostCard.tsx        # LinkedIn content display & edit
│   ├── InstagramCarouselCard.tsx   # Instagram carousel display & edit
│   ├── DashboardPreview.tsx        # Dashboard preview component
│   └── SignUpModalPreview.tsx      # Sign-up modal preview component
│
├── backend/                        # Pipedream workflow steps (Node.js)
│   ├── validate_input.js           # Parse YouTube URL, tone, platforms
│   ├── upsert_video.js             # Store/update video in Supabase
│   ├── sub_pick.js                 # Select best subtitle track
│   ├── parse_sub.js                # Parse subtitle XML
│   ├── transcript_final.js         # Normalize transcript data
│   ├── extract_transcript.js       # Format transcript segments
│   ├── check_cache.js              # Deterministic cache lookup
│   ├── Call_openAI_API.js          # Generate content via OpenAI
│   ├── save_generation.js          # Persist generation + outputs
│   ├── claim_anonymous_generations.js  # Claim webhook (service role key)
│   └── return_http_response        # Return result to Framer
│
├── docs/                           # Documentation
│   ├── AUTH_STRATEGY.md            # Authentication strategy & architecture
│   ├── AUTH_FLOW_AUDIT.md          # Authentication flow audit report
│   ├── IMPLEMENTATION_SUMMARY.md   # Feature implementation summary
│   ├── RIVER_PRD.md                # Product requirements document
│   └── RIVER_RESULTS_DISPLAY_IMPLEMENTATION_PLAN.md  # Implementation plan
│
└── contracts/                      # Data structure definitions (JSON schemas)
    └── payloads/
        ├── framer-form-output-v1.json  # Input contract
        └── river-output-v1.json        # Output contract

Data Flow
Initial Generation Flow

    User submits YouTube URL + platforms in Framer
    validate_input.js — Extracts video ID, normalizes tone/platforms
    upsert_video.js — Creates or updates video record in Supabase
    Transcript Pipeline — Fetches subtitles, parses XML, normalizes text
    check_cache.js — Looks up existing generation by deterministic cache key
    If cache miss:
        Call_openAI_API.js — Generates platform-specific content
        save_generation.js — Persists generation + outputs to Supabase
    return_http_response — Returns structured JSON to Framer
    User reviews results and can copy or tweak

Tweak/Regeneration Flow

    User opens tweak editor on any platform card
    Submits optional tweak_instructions with force_regen=true
    Can specify target_platform to regenerate only one platform
    Pipedream bypasses cache, reuses same transcript
    OpenAI applies tweak instructions to generate updated content
    Replaces outputs in Supabase (keeps generation record)
    Results update in Framer without losing previous state

Caching Strategy

River uses deterministic cache keys to ensure consistent, correct results:

cache_key = `${video_id}|${tone_normalized}|${platforms_sorted}|${PROMPT_VERSION}|${extra_options}`

Cache Behavior:

    Hit — Return cached generation + outputs immediately (fromCache: true)
    Miss — Call OpenAI, save generation + outputs (fromCache: false)
    Force Regen — Bypass cache when force_regen=true (tweak flow)

Normalized Fields:

    tone — lowercase, trimmed
    platforms — lowercased, sorted alphabetically
    extra_options — stably stringified (sorted keys)

Key Components
Frontend (React/TSX)

UseRiverGeneration.tsx — State management hook

    Manages generation state: idle, loading, success, error
    Handles generate() and regenerate() (tweak) actions
    Tracks lastAction ownership (generate vs tweak)
    Webhook URL: https://eo8cimuv49hq45d.m.pipedream.net
    Supports force_regen and tweak_instructions
    Supports extra_options for platform targeting

RiverCTA.tsx — Main call-to-action button & form

    YouTube URL validation and parsing
    Platform selection (multi-select)
    Tone input with extra instructions
    Loading states with phase animation
    Error messaging with auto-dismiss

Platform Cards — Display & edit components

    TwitterThreadCard — Thread display, edit mode, copy, regenerate
    InstagramCarouselCard — Carousel with navigation, aspect ratio toggle
    LinkedInPostCard — Single post display and tweak interface

Backend (Pipedream/Node.js)

validate_input.js (Step 2)

    Extracts video ID from formats: youtube.com, youtu.be, shorts
    Normalizes tone, platforms, handles force_regen
    Supports tweak_instructions and extra_options

check_cache.js (Step 10)

    Deterministic cache key generation
    Returns cache hit or miss
    Reconstructs outputs from cached generation

Call_openAI_API.js (Step 12)

    Uses gpt-4o-mini model with JSON mode
    System prompt defines safety guardrails
    Generates for single or multiple platforms
    Returns: tweet_thread[], linkedin_post, carousel_slides[]

save_generation.js (Step 13) — KEY PERSISTENCE LAYER

    Decides if cache hit should be used
    Normalizes outputs to platform-specific format
    Upserts generation row (one per video + tone + platforms combo)
    Deletes old outputs, inserts new ones with metadata
    Returns complete result structure to Framer

Database Schema (Supabase)

-- Videos table
CREATE TABLE videos (
  id UUID PRIMARY KEY,
  youtube_video_id TEXT UNIQUE,
  original_url TEXT,
  title TEXT,
  user_id UUID REFERENCES auth.users(id),          -- Authenticated user owner
  anonymous_session_id UUID,                        -- Anonymous session tracking
  last_used_at TIMESTAMP,
  created_at TIMESTAMP
);

-- Generations table (one per video + tone + platforms combo)
CREATE TABLE generations (
  id UUID PRIMARY KEY,
  video_id UUID REFERENCES videos(id),
  user_id UUID REFERENCES auth.users(id),          -- Authenticated user owner
  anonymous_session_id UUID,                        -- Anonymous session tracking
  tone TEXT,
  platforms TEXT[],
  status TEXT,
  prompt_version TEXT,
  cache_key TEXT,
  extra_options JSONB,
  inputs JSONB,                                     -- Original generation inputs
  completed_at TIMESTAMP,
  created_at TIMESTAMP
);

-- Outputs table (stores per-platform content)
CREATE TABLE outputs (
  id UUID PRIMARY KEY,
  generation_id UUID REFERENCES generations(id),
  platform TEXT,
  format TEXT,
  content TEXT,
  metadata JSONB,
  created_at TIMESTAMP
);

API Contracts
Input Contract (framer-form-output-v1.json)

{
  "youtube_url": "string (required)",
  "tone": "string (optional, defaults to 'creator-friendly, punchy')",
  "platforms": ["twitter" | "linkedin" | "carousel"],
  "force_regen": "boolean (optional)",
  "tweak_instructions": "string (optional)",
  "extra_options": {
    "target_platform": "twitter | linkedin | carousel | null"
  }
}

Output Contract (river-output-v1.json)

{
  "video": { "id": "uuid", "youtube_video_id": "string", ... },
  "generation": { "id": "uuid", "tone": "string", "platforms": [...], ... },
  "inputs": { "tone": "string", "platforms": [...], ... },
  "outputs": {
    "twitter": { "platform": "twitter", "tweets": [...], "raw": "..." },
    "linkedin": { "platform": "linkedin", "post": "..." },
    "carousel": { "platform": "carousel", "slides": [...] }
  },
  "dbOutputs": [...],
  "fromCache": boolean
}

Canonical Sources of Truth

The following files define River's authoritative behavior:

    frontend/UseRiverGeneration.tsx — Frontend state & behavior
    backend/save_generation.js — Persistence logic
    contracts/payloads/river-output-v1.json — Output structure

If documentation and code ever disagree, these files win.
Design Philosophy

River optimizes for:

    Calm feedback loops — Results never vanish mid-regen; previous state stays visible
    Explicit state ownership — Clear distinction between generate vs tweak actions
    Cache correctness — Deterministic keys ensure consistency and prevent stale data
    Human-readable structure — Outputs designed for easy parsing by both LLMs and humans
    Platform flexibility — Easy to extend to new platforms without architectural changes

This is a system meant to scale without becoming brittle.
Authentication & User Management

River supports both anonymous and authenticated usage:

Anonymous Users:

    Generate content without creating an account
    Session tracked via localStorage (river_session_id UUID)
    Generations stored with anonymous_session_id
    Can sign up later to claim all anonymous generations

Authenticated Users:

    Email/password signup via Supabase Auth
    Google OAuth support
    All generations stored with user_id
    Access to user dashboard showing generation history
    View and copy previous generations

Anonymous-to-Authenticated Migration:

    When anonymous user signs up/signs in:
    1. Global auth listener detects authentication event
    2. Calls Pipedream claim webhook with session ID and user ID
    3. Webhook uses service role key to bypass RLS
    4. Updates videos and generations tables: user_id set, anonymous_session_id cleared
    5. localStorage river_session_id removed
    6. User dashboard opens showing claimed generations

Claim Webhook (backend/claim_anonymous_generations.js):

    Endpoint: https://eo8cimuv49hq45d.m.pipedream.net/claim
    Method: POST with { anonymous_session_id, user_id }
    Uses SUPABASE_SERVICE_ROLE_KEY to bypass RLS
    Updates both videos and generations tables
    Returns { success: true, claimed: { videos: N, generations: M } }

UI Components:

    AuthPrompt — Sign-up banner shown to anonymous users after generation
    SignUpModal — Email/password and Google OAuth authentication modal
    UserDashboard — Fullscreen dashboard with two views:
        List View: Grid of all user generations with metadata
        Detail View: Full carousel display of generation outputs
    HorizontalCardCarousel — Single-card carousel with navigation

External Services & Integrations
Service	Purpose	Integration
OpenAI API	Content generation (gpt-4o-mini)	Direct POST to /v1/chat/completions
RapidAPI (yt-api)	YouTube subtitle/transcript fetching	HTTP GET with API key headers
YouTube API	Direct subtitle XML retrieval	Timedtext endpoint
Supabase	Database + REST API	HTTPS REST calls with service role key
Pipedream	Webhook ingestion + workflow orchestration	HTTP POST receiver
Development Status

Status: In active development

Recently Completed (feature/horizontal-layout-with-auth):

    ✅ Authentication system with Supabase (email + Google OAuth)
    ✅ Anonymous session tracking with automatic claim on signup
    ✅ Pipedream webhook for anonymous generation claiming (service role key)
    ✅ Horizontal card carousel (one card visible at a time)
    ✅ User dashboard with generation history
    ✅ Results display with carousel integration
    ✅ Auth-aware UI (conditional sign-up prompts)
    ✅ Snap scroll with keyboard & swipe navigation
    ✅ Complete authentication flow for anonymous → authenticated migration

Previously Completed:

    ✅ HTTP response webhook integration
    ✅ save_generation component (Step 13)
    ✅ OpenAI API call implementation
    ✅ Check cache functionality
    ✅ Transcript extraction pipeline
    ✅ Instagram carousel support
Workflow Pipeline (14 Steps)
Step	Component	Purpose
1	trigger.json	HTTP webhook listener
2	validate_input.js	Parse YouTube URL, tone, platforms
3	upsert_video.js	Store/update video in Supabase
4	sub_endpoint.json	Call RapidAPI for available subtitles
5	sub_pick.js	Select best subtitle track
6	fetch_timedtext.json	Fetch subtitle XML from YouTube
7	parse_sub.js	Parse XML, extract subtitle text
8	transcript_final.js	Normalize and clean transcript
9	extract_transcript.js	Format transcript segments
10	check_cache.js	Deterministic cache lookup
11	(step name TBD)	(gap in documentation)
12	Call_openAI_API.js	Generate content via OpenAI
13	save_generation.js	Persist generation + outputs
14	return_http_response	Return final result to Framer
License

(To be determined)

River — Repurpose with intention. Generate with calm. Iterate with confidence.
