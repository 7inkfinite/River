# River Product Requirements Document (PRD)

**Version:** 1.0  
**Last Updated:** January 5, 2026  
**Owner:** Arjun  
**Status:** Phase 1 - MVP Development

---

## Executive Summary

River is an AI-powered content repurposing tool that transforms YouTube videos into platform-specific social media content (Twitter threads, LinkedIn posts, Instagram carousels). This PRD defines the scope, architecture, and implementation roadmap for Phase 1, which aims to deliver a functional MVP with authentication and basic dashboard capabilities.

**Phase 1 Goal:** Enable users to generate content, authenticate to save their work, and view past generations in a dedicated dashboard.

---

## Product Vision

### What River Does
- Accepts YouTube URLs and generates tailored content for multiple platforms
- Provides iterative refinement with platform-specific tweaking
- Offers a calm, intentional workflow: generate → review → tweak → regenerate → publish
- Stores user generations with proper versioning and caching

### Core Value Proposition
- **Speed:** Generate platform-optimized content in seconds
- **Quality:** AI-powered content that understands platform conventions
- **Flexibility:** Easy iteration and platform-specific regeneration
- **Organization:** Dashboard for managing and accessing past generations

---

## Current System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRAMER (Marketing Site)                  │
│  - Landing pages, forms, pricing                            │
│  - React/TSX components embedded in Framer                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              FRAMER EMBEDDED COMPONENTS (River App)         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ RiverAppRoot.tsx (Provider wrapper)                  │   │
│  │  ├── UseRiverGeneration.tsx (State management)      │   │
│  │  ├── RiverCTA.tsx (Input form)                      │   │
│  │  └── RiverResultsRoot.tsx (Results display)         │   │
│  │      ├── TwitterThreadCard.tsx                       │   │
│  │      ├── LinkedInPostCard.tsx                        │   │
│  │      └── InstagramCarouselCard.tsx                   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │ HTTP POST with JWT
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   PIPEDREAM WORKFLOW (Backend)              │
│  1. validate_input.js       - Parse & validate input        │
│  2. upsert_video.js         - Store video metadata         │
│  3-9. [Transcript Pipeline] - Extract YouTube subtitles    │
│  10. check_cache.js         - Deterministic cache lookup   │
│  11. [Gap - TBD]            - Additional processing         │
│  12. Call_openAI_API.js     - Generate platform content    │
│  13. save_generation.js     - Persist to database          │
│  14. return_http_response   - Return results to Framer     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     SUPABASE (Database)                     │
│  Tables:                                                    │
│    - auth.users (Supabase Auth, built-in)                  │
│    - videos (YouTube metadata + user_id)                   │
│    - generations (generation metadata + user_id)           │
│    - outputs (platform-specific content)                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              NEXT.JS DASHBOARD (river-dashboard)            │
│  - Separate Next.js app deployed on Vercel                 │
│  - Queries Supabase directly (RLS enforces access)         │
│  - Lists user's past generations with filtering/search     │
│  - Shares auth with Framer app (same Supabase project)    │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend (Marketing)** | Framer | Landing pages, forms, public site |
| **Frontend (App)** | React/TSX in Framer | Core app functionality |
| **Frontend (Dashboard)** | Next.js 16 + React 19 | User dashboard for generations |
| **Backend** | Pipedream (Node.js) | Serverless workflow orchestration |
| **Database** | Supabase (PostgreSQL) | Data persistence + Auth |
| **LLM** | OpenAI (gpt-4o-mini) | Content generation |
| **Auth** | Supabase Auth | Email + Google OAuth |
| **Deployment** | Vercel | Next.js dashboard hosting |
| **Version Control** | GitHub | Code repository |

---

## Database Schema

### Current Tables

```sql
-- Videos table
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  youtube_video_id TEXT UNIQUE NOT NULL,
  original_url TEXT NOT NULL,
  title TEXT,
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id),  -- ✅ TO BE ADDED
  anonymous_session_id UUID                  -- ✅ TO BE ADDED
);

-- Generations table (one per video + tone + platforms combo)
CREATE TABLE generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  tone TEXT NOT NULL,
  platforms TEXT[] NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  prompt_version TEXT,
  cache_key TEXT UNIQUE NOT NULL,
  extra_options JSONB,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id),  -- ✅ TO BE ADDED
  anonymous_session_id UUID                  -- ✅ TO BE ADDED
);

-- Outputs table (stores per-platform content)
CREATE TABLE outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  generation_id UUID REFERENCES generations(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  format TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_videos_youtube_id ON videos(youtube_video_id);
CREATE INDEX idx_videos_user_id ON videos(user_id);        -- ✅ TO BE ADDED
CREATE INDEX idx_videos_session_id ON videos(anonymous_session_id);  -- ✅ TO BE ADDED
CREATE INDEX idx_generations_video_id ON generations(video_id);
CREATE INDEX idx_generations_cache_key ON generations(cache_key);
CREATE INDEX idx_generations_user_id ON generations(user_id);  -- ✅ TO BE ADDED
CREATE INDEX idx_generations_session_id ON generations(anonymous_session_id);  -- ✅ TO BE ADDED
CREATE INDEX idx_outputs_generation_id ON outputs(generation_id);
```

---

## Phase 1: Core Functionality & Authentication

### Success Criteria
✅ **Users can:**
1. Visit the app and generate content without signing up (anonymous mode)
2. Sign up or log in with Email or Google
3. View their past generations in a dashboard
4. Copy generated content for posting
5. Regenerate content with tweaks
6. Access their data across devices (authenticated users only)

### User Flow

#### Anonymous User Flow
```
1. User visits River → 2. Enters YouTube URL + preferences
→ 3. Generates content → 4. Views & copies content
→ 5. [Session stored in localStorage for 30 days]
→ 6. Prompted to "Sign up to save your generations"
```

#### Authenticated User Flow
```
1. User signs up/logs in → 2. Enters YouTube URL + preferences
→ 3. Generates content (associated with user_id)
→ 4. Views content → 5. Visits dashboard → 6. Sees full generation history
```

#### Anonymous-to-Authenticated Conversion
```
1. Anonymous user generates content (tracked via session_id)
→ 2. User signs up/logs in
→ 3. **Claim Flow**: Anonymous generations transferred to user_id
→ 4. Session cleared → 5. User now sees all content in dashboard
```

---

## Epic 1: Authentication Infrastructure

### Story 1.1: Supabase Auth Setup ✅ COMPLETED
**Priority:** P0 (Blocker)
**Estimate:** 2 hours
**Status:** ✅ Done

**Tasks:**
- [x] Enable Supabase Auth in project settings
- [x] Configure Email provider (enable email/password signup)
- [x] Set up Google OAuth provider
  - [x] Create Google Cloud Console project
  - [x] Configure OAuth consent screen
  - [x] Add authorized redirect URIs
  - [x] Copy Client ID and Secret to Supabase
- [x] Enable email verification (recommended but optional for MVP)
- [x] Test auth providers in Supabase dashboard

**Acceptance Criteria:**
- Email signup creates a user in `auth.users`
- Google OAuth successfully authenticates
- Users receive verification emails (if enabled)

---

### Story 1.2: Database Schema Updates ✅ COMPLETED
**Priority:** P0 (Blocker)
**Estimate:** 1 hour
**Status:** ✅ Done

**Tasks:**
- [x] Run SQL migration to add `user_id` columns to `videos` and `generations`
- [x] Run SQL migration to add `anonymous_session_id` columns to `videos` and `generations`
- [x] Create indexes for new columns
- [x] Enable Row Level Security (RLS) on all tables
- [x] Create RLS policies:
  - [x] `videos`: Users can view/insert their own videos
  - [x] `generations`: Users can view their own generations
  - [x] `outputs`: Users can view outputs from their generations
- [x] Test RLS policies with test user accounts

**SQL Migration:**
```sql
-- Add user_id and anonymous_session_id columns
ALTER TABLE videos
ADD COLUMN user_id UUID REFERENCES auth.users(id),
ADD COLUMN anonymous_session_id UUID;

ALTER TABLE generations
ADD COLUMN user_id UUID REFERENCES auth.users(id),
ADD COLUMN anonymous_session_id UUID;

-- Create indexes
CREATE INDEX idx_videos_user_id ON videos(user_id);
CREATE INDEX idx_videos_session_id ON videos(anonymous_session_id);
CREATE INDEX idx_generations_user_id ON generations(user_id);
CREATE INDEX idx_generations_session_id ON generations(anonymous_session_id);

-- Enable RLS
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE outputs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own videos" ON videos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own videos" ON videos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own generations" ON generations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own generations" ON generations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own outputs" ON outputs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM generations
      WHERE generations.id = outputs.generation_id
      AND generations.user_id = auth.uid()
    )
  );
```

**Acceptance Criteria:**
- Migrations run without errors
- RLS policies correctly isolate user data
- Anonymous users can still generate (with `anonymous_session_id`)

---

### Story 1.3: Frontend Auth Components (Framer) ✅ COMPLETED
**Priority:** P0 (Blocker)
**Estimate:** 4 hours
**Status:** ✅ Done

**Tasks:**
- [x] Install `@supabase/supabase-js` in Framer project
- [x] Create auth components with Supabase integration
  - [x] Initialize Supabase client
  - [x] Handle session state
  - [x] Implement loading and error states
- [x] Create `AuthComponents.tsx` with comprehensive features
  - [x] AuthPrompt component for signup CTA
  - [x] SignUpModal with Sign In/Sign Up toggle
  - [x] Email/password input fields with validation
  - [x] "Sign in with Google" button with OAuth integration
  - [x] Loading states with spinner animations
  - [x] Error and success message handling
  - [x] SVG illustration from design reference
  - [x] Terms & Conditions links
- [x] Update `RiverResultsRoot.tsx`
  - [x] Integrate AuthPrompt below results
  - [x] Add modal state management
  - [x] Changed layout from vertical to horizontal
- [x] Update `ResultsPreview.tsx`
  - [x] Changed layout from vertical to horizontal
- [x] Anonymous session ID management (already implemented in `UseRiverGeneration.tsx`)
  - [x] Generate UUID on first visit
  - [x] Store in localStorage as `river_session_id`
  - [x] Pass session_id to API when not authenticated

**Files Modified/Created:**
```
/frontend/
  ├── AuthComponents.tsx         (NEW - 884 lines)
  │   ├── AuthPrompt component
  │   ├── SignUpModal component
  │   ├── ConfirmButton component
  │   └── GoogleSignInButton component
  ├── RiverResultsRoot.tsx       (UPDATED - horizontal layout + auth integration)
  ├── ResultsPreview.tsx         (UPDATED - horizontal layout)
  └── UseRiverGeneration.tsx     (Already has session ID management)
```

**Implementation Details:**
- Horizontal card layout with 420px fixed-width cards
- Container maxWidth increased to 1400px for better horizontal display
- Form validation: email regex, password min 6 chars, name required
- Supabase integration: `signUp()`, `signInWithPassword()`, `signInWithOAuth()`
- SVG illustration positioned at modal bottom with opacity
- Loading spinner during auth operations
- Auto-close modal on successful authentication
- Responsive design with maxWidth 90vw and maxHeight 90vh
- Accessibility: Escape key to close, background click to close

**Acceptance Criteria:**
- ✅ Users can sign up with email
- ✅ Users can log in with Google OAuth
- ✅ Form validation provides real-time feedback
- ✅ Loading states show during authentication
- ✅ Error messages display for auth failures
- ✅ Success messages confirm successful operations
- ✅ Modal closes automatically on success
- ✅ Anonymous users can still use the app
- ✅ Horizontal layout displays cards side-by-side
- ✅ Design matches provided reference (colors, fonts, SVG)

---

### Story 1.4: Backend Auth Integration (Pipedream)
**Priority:** P0 (Blocker)  
**Estimate:** 3 hours

**Tasks:**
- [ ] Update `validate_input.js` (Step 2)
  - [ ] Extract `Authorization` header from request
  - [ ] Verify JWT token with Supabase
  - [ ] Extract `user_id` from token claims
  - [ ] Extract `session_id` from request body (for anonymous users)
  - [ ] Determine if user is authenticated or anonymous
  - [ ] Pass `user_id` or `anonymous_session_id` to downstream steps
- [ ] Update `upsert_video.js` (Step 3)
  - [ ] Associate video with `user_id` (if authenticated)
  - [ ] Associate video with `anonymous_session_id` (if anonymous)
- [ ] Update `check_cache.js` (Step 10)
  - [ ] Include `user_id` or `anonymous_session_id` in cache key
  - [ ] Ensure cache is scoped to user/session
- [ ] Update `save_generation.js` (Step 13)
  - [ ] Save `user_id` with generation (if authenticated)
  - [ ] Save `anonymous_session_id` with generation (if anonymous)
  - [ ] Ensure outputs are linked correctly

**JWT Verification Example:**
```javascript
// validate_input.js
const authHeader = steps.trigger.event.headers['authorization'];
const sessionId = steps.trigger.event.body?.session_id;

let userId = null;
let anonymousSessionId = null;

if (authHeader && authHeader.startsWith('Bearer ')) {
  const token = authHeader.replace('Bearer ', '');
  
  const { data: { user }, error } = await this.supabase.auth.getUser(token);
  
  if (error || !user) {
    return { error: 'Invalid authentication token' };
  }
  
  userId = user.id;
} else if (sessionId) {
  anonymousSessionId = sessionId;
}

// Pass to next steps
return {
  ...steps.trigger.event.body,
  user_id: userId,
  anonymous_session_id: anonymousSessionId
};
```

**Acceptance Criteria:**
- Authenticated requests include `user_id` in database records
- Anonymous requests include `anonymous_session_id` in database records
- Invalid tokens return clear error messages
- Cache keys are properly scoped to prevent cross-user leaks

---

### Story 1.5: Claim Flow (Anonymous → Authenticated)
**Priority:** P1 (High)  
**Estimate:** 2 hours

**Tasks:**
- [ ] Create `claimAnonymousGenerations()` function in `AuthProvider`
- [ ] Call claim function after successful signup/login
- [ ] Update database:
  - [ ] Transfer `anonymous_session_id` generations to `user_id`
  - [ ] Clear `anonymous_session_id` after transfer
- [ ] Clear localStorage `river_session_id` after claim
- [ ] Handle edge cases:
  - [ ] Duplicate generations (same cache_key)
  - [ ] Partial failures
  - [ ] Already-claimed sessions

**Claim Function:**
```typescript
const claimAnonymousGenerations = async (userId: string) => {
  const sessionId = localStorage.getItem('river_session_id');
  if (!sessionId) return;

  const { error } = await supabase
    .from('generations')
    .update({ 
      user_id: userId, 
      anonymous_session_id: null 
    })
    .eq('anonymous_session_id', sessionId);

  if (!error) {
    localStorage.removeItem('river_session_id');
  }
};
```

**Acceptance Criteria:**
- Anonymous generations transfer to user account on signup
- No duplicate generations created
- Session ID cleared after successful claim
- User immediately sees claimed generations in dashboard

---

### Story 1.6: User Experience Enhancements
**Priority:** P1 (High)  
**Estimate:** 3 hours

**Tasks:**
- [ ] Add "Sign up to save your generations" prompt for anonymous users
- [ ] Show user email/avatar in app header
- [ ] Add logout button
- [ ] Handle session expiry gracefully
  - [ ] Show "Session expired" message
  - [ ] Redirect to login
  - [ ] Preserve current work
- [ ] Add "Forgot password" flow
- [ ] Update `RiverCTA.tsx` to show user info when logged in

**Acceptance Criteria:**
- Anonymous users see prompt to sign up
- Authenticated users see their email and logout button
- Session expiry doesn't lose user's work
- Password reset emails are sent successfully

---

## Epic 2: Dashboard Implementation

### Story 2.1: Dashboard Setup (Next.js)
**Priority:** P0 (Blocker)  
**Estimate:** 2 hours

**Tasks:**
- [ ] Initialize Next.js 16 project (`river-dashboard`)
- [ ] Install dependencies:
  - [ ] `@supabase/supabase-js`
  - [ ] `@supabase/ssr` (for Next.js server-side auth)
  - [ ] UI library (Tailwind CSS already configured)
- [ ] Configure environment variables:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Create Supabase client utilities
- [ ] Set up GitHub repository
- [ ] Configure Vercel deployment
- [ ] Connect GitHub repo to Vercel

**File Structure:**
```
/river-dashboard/
  ├── app/
  │   ├── layout.tsx          (Root layout with auth)
  │   ├── page.tsx            (Dashboard home)
  │   ├── login/
  │   │   └── page.tsx        (Login page)
  │   └── generations/
  │       └── [id]/
  │           └── page.tsx    (Single generation view)
  ├── components/
  │   ├── GenerationCard.tsx  (Display generation summary)
  │   ├── GenerationList.tsx  (List all generations)
  │   └── PlatformContent.tsx (Display platform-specific content)
  ├── lib/
  │   ├── supabase/
  │   │   ├── client.ts       (Browser client)
  │   │   └── server.ts       (Server client)
  │   └── utils.ts
  └── types/
      └── database.types.ts   (Generated from Supabase)
```

**Acceptance Criteria:**
- Dashboard runs locally on `localhost:3000`
- Dashboard deploys successfully to Vercel
- Environment variables configured correctly
- Supabase client can authenticate users

---

### Story 2.2: Dashboard Auth Integration
**Priority:** P0 (Blocker)  
**Estimate:** 2 hours

**Tasks:**
- [ ] Create auth middleware for protected routes
- [ ] Implement login page (`/login`)
- [ ] Share auth session with Framer app (same Supabase project)
- [ ] Redirect unauthenticated users to login
- [ ] Handle SSR auth state correctly

**Middleware Example:**
```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user && request.nextUrl.pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|login).*)'],
};
```

**Acceptance Criteria:**
- Users are redirected to login if not authenticated
- Auth state is shared between Framer app and dashboard
- SSR correctly handles auth state

---

### Story 2.3: Generations List View
**Priority:** P0 (Blocker)  
**Estimate:** 4 hours

**Tasks:**
- [ ] Create `GenerationList.tsx` component
- [ ] Query Supabase for user's generations
  - [ ] Fetch generations with related `videos` and `outputs`
  - [ ] Order by `created_at DESC`
  - [ ] Implement pagination (10 per page)
- [ ] Display generation cards with:
  - [ ] Video title
  - [ ] Platforms generated for
  - [ ] Creation date
  - [ ] "View" button
- [ ] Add loading state
- [ ] Add empty state ("No generations yet")
- [ ] Add error handling

**Query Example:**
```typescript
const { data: generations, error } = await supabase
  .from('generations')
  .select(`
    id,
    tone,
    platforms,
    created_at,
    video:videos (
      id,
      youtube_video_id,
      original_url,
      title
    ),
    outputs (
      id,
      platform,
      format,
      content,
      metadata
    )
  `)
  .order('created_at', { ascending: false })
  .limit(10);
```

**Acceptance Criteria:**
- Dashboard displays user's past generations
- RLS correctly filters to current user's data
- Pagination works smoothly
- Empty state is user-friendly

---

### Story 2.4: Single Generation View
**Priority:** P1 (High)  
**Estimate:** 3 hours

**Tasks:**
- [ ] Create `/generations/[id]` dynamic route
- [ ] Fetch single generation with all outputs
- [ ] Display platform-specific content:
  - [ ] Twitter thread with proper formatting
  - [ ] LinkedIn post
  - [ ] Instagram carousel with slide navigation
- [ ] Add copy buttons for each platform
- [ ] Add "Regenerate" button (redirects to Framer app)
- [ ] Show generation metadata:
  - [ ] Tone used
  - [ ] Platforms generated
  - [ ] Cache status
  - [ ] Creation timestamp

**Acceptance Criteria:**
- Individual generation view shows all content clearly
- Copy functionality works for all platforms
- Regenerate button preserves context and redirects correctly

---

### Story 2.5: Dashboard UI/UX Polish
**Priority:** P2 (Medium)  
**Estimate:** 3 hours

**Tasks:**
- [ ] Add search/filter functionality
  - [ ] Filter by platform
  - [ ] Search by video title
  - [ ] Filter by date range
- [ ] Add sorting options (date, platform, tone)
- [ ] Implement responsive design (mobile-friendly)
- [ ] Add loading skeletons
- [ ] Add keyboard shortcuts (optional)
- [ ] Add export functionality (copy all content at once)

**Acceptance Criteria:**
- Dashboard is fully responsive
- Search and filters work smoothly
- UI feels polished and professional

---

## Epic 3: Data Management & Cleanup

### Story 3.1: Anonymous Data Cleanup Job
**Priority:** P2 (Medium)  
**Estimate:** 2 hours

**Tasks:**
- [ ] Create Supabase Edge Function or Cron Job
- [ ] Delete anonymous generations older than 30 days
- [ ] Delete orphaned outputs
- [ ] Log cleanup actions

**SQL Query:**
```sql
DELETE FROM generations
WHERE user_id IS NULL
  AND anonymous_session_id IS NOT NULL
  AND created_at < NOW() - INTERVAL '30 days';
```

**Acceptance Criteria:**
- Anonymous data is cleaned up after 30 days
- Authenticated data is never deleted automatically
- Cleanup job runs daily

---

### Story 3.2: Delete Existing Test Data
**Priority:** P0 (Blocker - Do this before Phase 1 launch)  
**Estimate:** 30 minutes

**Tasks:**
- [ ] Back up current data (just in case)
- [ ] Delete all existing rows from `videos`, `generations`, `outputs`
- [ ] Verify tables are empty
- [ ] Test full workflow with fresh data

**SQL:**
```sql
DELETE FROM outputs;
DELETE FROM generations;
DELETE FROM videos;
```

**Acceptance Criteria:**
- All test data is removed
- Fresh start for Phase 1 launch

---

## Epic 4: Testing & Launch Preparation

### Story 4.1: End-to-End Testing
**Priority:** P0 (Blocker)  
**Estimate:** 3 hours

**Test Cases:**
- [ ] **Anonymous User Flow:**
  1. Visit app without auth
  2. Generate content
  3. View results
  4. Copy content
  5. Verify session_id stored in localStorage
- [ ] **Authenticated User Flow:**
  1. Sign up with email
  2. Verify email (if enabled)
  3. Generate content
  4. View results in dashboard
  5. Verify user_id associated with generation
- [ ] **Claim Flow:**
  1. Generate content anonymously
  2. Sign up
  3. Verify anonymous content appears in dashboard
- [ ] **Dashboard Flow:**
  1. Log in
  2. View generations list
  3. Open single generation
  4. Copy content
  5. Regenerate (redirect to Framer app)

**Acceptance Criteria:**
- All test cases pass
- No critical bugs found
- User experience is smooth

---

### Story 4.2: Performance & Security Audit
**Priority:** P1 (High)  
**Estimate:** 2 hours

**Tasks:**
- [ ] Verify RLS policies are correctly configured
- [ ] Test for data leaks between users
- [ ] Ensure service role key is never exposed in frontend
- [ ] Add rate limiting for anonymous users (5 requests/hour)
- [ ] Add rate limiting for authenticated users (50 requests/hour)
- [ ] Test cache key collisions
- [ ] Verify JWT expiry handling

**Acceptance Criteria:**
- No security vulnerabilities found
- Performance is acceptable (<3s for generation)
- Rate limits prevent abuse

---

### Story 4.3: Documentation Updates
**Priority:** P2 (Medium)  
**Estimate:** 2 hours

**Tasks:**
- [ ] Update README with Phase 1 status
- [ ] Document API contracts
- [ ] Document auth flow
- [ ] Document dashboard setup
- [ ] Create user guide (basic usage)

**Acceptance Criteria:**
- Documentation is clear and up-to-date
- New developers can onboard using docs

---

## Non-Functional Requirements

### Performance
- **Generation Time:** <5 seconds for typical YouTube video
- **Dashboard Load Time:** <2 seconds for 100 generations
- **Database Query Time:** <500ms for most queries

### Security
- **Auth:** Supabase Auth with JWT tokens
- **Data Isolation:** RLS policies enforce user data separation
- **API Security:** No service role key in frontend code
- **Rate Limiting:** Prevent abuse from anonymous and authenticated users

### Scalability
- **Database:** Supabase free tier supports 500MB + 50K MAU
- **Backend:** Pipedream serverless scales automatically
- **Frontend:** Vercel CDN for dashboard

### Monitoring
- **Error Tracking:** Implement basic error logging in Pipedream
- **User Analytics:** Track generation counts (optional for Phase 1)

---

## Success Metrics (Phase 1)

- [ ] **Core Functionality:** 100% of critical user flows work
- [ ] **Authentication:** Users can sign up, log in, and claim anonymous data
- [ ] **Dashboard:** Users can view and access all past generations
- [ ] **Performance:** 95% of generations complete within 5 seconds
- [ ] **Security:** Zero data leaks or security incidents

---

## Future Phases (Post-Phase 1)

### Phase 2: Content Library & Editing
- Advanced content organization (tags, folders)
- In-dashboard editing of generated content
- Content templates and presets
- Bulk operations (delete, export)

### Phase 3: Multi-Platform Scheduling
- Direct posting to Twitter, LinkedIn, Instagram
- Scheduling functionality
- Queue management
- Analytics and engagement tracking

### Phase 4: Input Source Expansion
- Blog post URLs as input
- Direct text input (paste transcript)
- File upload (PDF, DOCX)
- Podcast RSS feed support

### Phase 5: Team Features
- Team accounts with multiple users
- Role-based permissions
- Shared content library
- Collaboration features

---

## Appendix: Key Files Reference

### Canonical Sources of Truth
These files define River's authoritative behavior:
- `frontend/UseRiverGeneration.tsx` — Frontend state & behavior
- `backend/save_generation.js` — Persistence logic
- `contracts/payloads/river-output-v1.json` — Output structure

### API Contracts

#### Input Contract (`framer-form-output-v1.json`)
```json
{
  "youtube_url": "string (required)",
  "tone": "string (optional, defaults to 'creator-friendly, punchy')",
  "platforms": ["twitter" | "linkedin" | "carousel"],
  "force_regen": "boolean (optional)",
  "tweak_instructions": "string (optional)",
  "extra_options": {
    "target_platform": "twitter | linkedin | carousel | null"
  },
  "session_id": "string (for anonymous users)"
}
```

#### Output Contract (`river-output-v1.json`)
```json
{
  "video": { "id": "uuid", "youtube_video_id": "string", "title": "string", ... },
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
```

---

## Open Questions / Decisions Needed

1. **Email Verification:** Should we require email verification for signup? (Recommended: Optional for MVP)
2. **Rate Limits:** Are 5 req/hour (anonymous) and 50 req/hour (authenticated) appropriate? (Adjust based on usage)
3. **Data Retention:** Should anonymous data be deleted after 30 days? (Recommended: Yes)
4. **Dashboard URL:** Should dashboard be on a subdomain (e.g., `dashboard.river.com`) or separate domain? (Decision: Separate for MVP, migrate later)
5. **Google OAuth Setup:** Who will create the Google Cloud Console project? (Action: Arjun)

---

## Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| Jan 5, 2026 | 1.0 | Initial PRD created based on AUTH_STRATEGY.md and project context | Claude |

---

**End of Document**
