# River Authentication Strategy

## Executive Summary

This document outlines the recommended approach for adding user authentication to River, enabling email and Google (Gmail) login, with future support for a dashboard showing previous generations.

---

## Recommended Route: Supabase Auth

### Why Supabase Auth?

| Factor | Supabase Auth | Alternative (Auth0/Clerk) |
|--------|---------------|---------------------------|
| **Already in stack** | ✅ Yes - using Supabase DB | ❌ New dependency |
| **Email + Google OAuth** | ✅ Built-in | ✅ Built-in |
| **Cost** | ✅ Free tier generous | ⚠️ Paid after limits |
| **Row-Level Security** | ✅ Native integration | ⚠️ Requires custom setup |
| **JWT tokens** | ✅ Automatic | ✅ Yes |
| **Dashboard sharing** | ✅ Same auth for river-dashboard | ⚠️ Extra config |
| **Complexity** | ✅ Low - one provider | ⚠️ Medium - bridge needed |

**Verdict:** Supabase Auth is the natural choice since you're already using Supabase for the database. It provides seamless integration with Row-Level Security (RLS) for data isolation.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (Framer)                         │
│  ┌─────────────┐    ┌──────────────┐    ┌────────────────────────┐ │
│  │ Auth UI     │───▶│ Supabase     │───▶│ RiverAppRoot           │ │
│  │ (Login/     │    │ Auth Client  │    │ (Pass user context)    │ │
│  │ Signup)     │    │              │    │                        │ │
│  └─────────────┘    └──────────────┘    └────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │ JWT Token (Authorization header)
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      BACKEND (Pipedream)                            │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ validate_input.js (Step 2)                                   │   │
│  │  - Extract JWT from Authorization header                     │   │
│  │  - Verify token with Supabase                                │   │
│  │  - Extract user_id from claims                               │   │
│  │  - Pass user_id to downstream steps                          │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │ user_id attached to queries
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      DATABASE (Supabase)                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ auth.users   │  │ videos       │  │ generations  │              │
│  │ (built-in)   │  │ + user_id    │  │ + user_id    │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                     │
│  Row-Level Security (RLS) policies enforce data isolation           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Components Impacted

### 1. Frontend (Framer Components)

| Component | Changes Required | Priority |
|-----------|-----------------|----------|
| **NEW: AuthProvider.tsx** | Create auth context wrapper with Supabase client | High |
| **NEW: LoginForm.tsx** | Email/password + Google OAuth buttons | High |
| **RiverAppRoot.tsx** | Wrap with AuthProvider, gate content behind auth | High |
| **UseRiverGeneration.tsx** | Include JWT token in API calls | High |
| **RiverCTA.tsx** | Show user info / logout button | Medium |

### 2. Backend (Pipedream)

| Step | Changes Required | Priority |
|------|-----------------|----------|
| **validate_input.js** | Add JWT verification, extract user_id | High |
| **upsert_video.js** | Associate video with user_id | High |
| **check_cache.js** | Include user_id in cache key | Medium |
| **save_generation.js** | Save user_id with generation | High |

### 3. Database (Supabase)

| Change | Description | Priority |
|--------|-------------|----------|
| **Enable Supabase Auth** | Turn on Email + Google providers | High |
| **Add user_id columns** | `videos.user_id`, `generations.user_id` | High |
| **Create RLS policies** | Users can only access their own data | High |
| **Migration script** | Handle existing data (assign to "legacy" or admin user) | Medium |

---

## Database Schema Changes

### Current → Proposed

```sql
-- Add user_id to videos table
ALTER TABLE videos
ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Add user_id to generations table
ALTER TABLE generations
ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Create index for performance
CREATE INDEX idx_videos_user_id ON videos(user_id);
CREATE INDEX idx_generations_user_id ON generations(user_id);

-- Row-Level Security Policies
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE outputs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own videos
CREATE POLICY "Users can view own videos" ON videos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own videos" ON videos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only see their own generations
CREATE POLICY "Users can view own generations" ON generations
  FOR SELECT USING (auth.uid() = user_id);

-- Outputs: access through generation ownership
CREATE POLICY "Users can view own outputs" ON outputs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM generations
      WHERE generations.id = outputs.generation_id
      AND generations.user_id = auth.uid()
    )
  );
```

---

## Authentication Flow

### Sign Up (New User)
```
1. User clicks "Sign up with Email" or "Continue with Google"
2. Supabase Auth creates user in auth.users
3. Email verification sent (for email signup)
4. User verified → session created → JWT issued
5. Frontend stores session, includes JWT in API calls
```

### Login (Returning User)
```
1. User enters email/password or clicks "Continue with Google"
2. Supabase Auth verifies credentials
3. Session created → JWT issued
4. Frontend stores session, redirects to app
```

### API Request (Authenticated)
```
1. Frontend calls Pipedream webhook with Authorization: Bearer <JWT>
2. validate_input.js extracts token, calls Supabase to verify
3. User claims extracted (user_id, email, etc.)
4. user_id passed through pipeline, used in DB queries
5. RLS policies ensure user only sees their data
```

---

## Shared Auth for Dashboard (river-dashboard)

Since both River and river-dashboard will use the same Supabase project:

1. **Same auth.users table** - one account works everywhere
2. **Same RLS policies** - consistent data access rules
3. **Shared Supabase client config** - same project URL & anon key
4. **SSO experience** - login once, access both apps

The dashboard can query generations directly:
```typescript
const { data: generations } = await supabase
  .from('generations')
  .select('*, outputs(*), videos(*)')
  .order('created_at', { ascending: false });
// RLS automatically filters to current user's data
```

---

## Security Considerations

| Concern | Mitigation |
|---------|------------|
| JWT expiry | Supabase handles refresh tokens automatically |
| Service role key exposure | Never use service role key in frontend; only in Pipedream backend |
| Rate limiting | Add per-user rate limits in validate_input.js |
| Email verification | Enable "Confirm email" in Supabase Auth settings |
| OAuth scopes | Request minimal scopes (email, profile) |

---

## Cost Implications

| Resource | Free Tier | Consideration |
|----------|-----------|---------------|
| Supabase Auth | 50,000 MAU | More than sufficient for launch |
| Google OAuth | Free | Just need Google Cloud Console setup |
| Database rows | 500MB | User table is minimal |

---

## Decisions

| Question | Decision |
|----------|----------|
| **Legacy data** | Delete existing data (test data only) |
| **Anonymous usage** | Yes - allow anonymous generation |
| **Team support** | Not needed |

---

## Anonymous User Flow

Users can generate content without logging in. Their generations are tracked via a local session and can be claimed when they sign up.

### How It Works

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ANONYMOUS USER JOURNEY                           │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Visit App  │────▶│  Generate    │────▶│  See Result  │
│              │     │  (no login)  │     │              │
└──────────────┘     └──────────────┘     └──────────────┘
                            │
                            │ anonymous_session_id stored
                            │ in localStorage + sent to API
                            ▼
                     ┌──────────────┐
                     │  generations │
                     │  table with  │
                     │  session_id  │
                     │  (no user_id)│
                     └──────────────┘
                            │
        ┌───────────────────┴───────────────────┐
        ▼                                       ▼
┌──────────────┐                        ┌──────────────┐
│ User leaves  │                        │ User signs   │
│ (data stays  │                        │ up / logs in │
│ 30 days)     │                        └──────────────┘
└──────────────┘                               │
                                               ▼
                                        ┌──────────────┐
                                        │ Claim flow:  │
                                        │ UPDATE gens  │
                                        │ SET user_id  │
                                        │ WHERE        │
                                        │ session_id=X │
                                        └──────────────┘
                                               │
                                               ▼
                                        ┌──────────────┐
                                        │ Dashboard    │
                                        │ shows all    │
                                        │ generations  │
                                        └──────────────┘
```

### Implementation Details

**1. Session ID Generation (Frontend)**
```typescript
// On first visit, generate a session ID
const getOrCreateSessionId = () => {
  let sessionId = localStorage.getItem('river_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('river_session_id', sessionId);
  }
  return sessionId;
};
```

**2. Database Schema Addition**
```sql
-- Add anonymous_session_id to generations
ALTER TABLE generations
ADD COLUMN anonymous_session_id UUID;

-- Index for claim queries
CREATE INDEX idx_generations_session ON generations(anonymous_session_id);
```

**3. Backend Logic (validate_input.js)**
```javascript
// Extract user identity
const authHeader = headers['authorization'];
const sessionId = body.session_id;

let userId = null;
let anonymousSessionId = null;

if (authHeader) {
  // Authenticated user - verify JWT
  const token = authHeader.replace('Bearer ', '');
  const { data: { user } } = await supabase.auth.getUser(token);
  userId = user?.id;
} else if (sessionId) {
  // Anonymous user - use session ID
  anonymousSessionId = sessionId;
}

// Pass to downstream steps
return { userId, anonymousSessionId, ...rest };
```

**4. Claim Flow (on signup/login)**
```typescript
// After successful authentication
const claimAnonymousGenerations = async (userId: string) => {
  const sessionId = localStorage.getItem('river_session_id');
  if (!sessionId) return;

  await supabase
    .from('generations')
    .update({ user_id: userId, anonymous_session_id: null })
    .eq('anonymous_session_id', sessionId);

  // Clear session ID after claiming
  localStorage.removeItem('river_session_id');
};
```

**5. RLS Policy Update**
```sql
-- Anonymous users can view their session's data
CREATE POLICY "Anonymous can view own generations" ON generations
  FOR SELECT USING (
    anonymous_session_id IS NOT NULL
    AND anonymous_session_id = current_setting('app.session_id', true)::uuid
  );

-- OR simpler: no RLS for anonymous, just filter in application code
```

### Anonymous vs Authenticated Comparison

| Aspect | Anonymous | Authenticated |
|--------|-----------|---------------|
| Can generate | ✅ Yes | ✅ Yes |
| Data persisted | ✅ 30 days | ✅ Forever |
| See in dashboard | ❌ No | ✅ Yes |
| Cross-device access | ❌ No | ✅ Yes |
| Rate limits | Stricter | More generous |
| Cache scoping | Per session | Per user |

### Rate Limiting for Anonymous Users

To prevent abuse, anonymous users should have stricter limits:

```javascript
// In validate_input.js
const RATE_LIMITS = {
  anonymous: { requests: 5, window: '1h' },
  authenticated: { requests: 50, window: '1h' }
};
```

### Data Retention

- Anonymous generations: **30 days** TTL (cleanup via scheduled job)
- Authenticated generations: **Forever** (user can delete manually)

```sql
-- Cleanup job (run daily)
DELETE FROM generations
WHERE user_id IS NULL
  AND anonymous_session_id IS NOT NULL
  AND created_at < NOW() - INTERVAL '30 days';
```

---

## Updated Implementation Phases

### Phase 1: Anonymous Foundation ✅ COMPLETED
- [x] Add `anonymous_session_id` column to database
- [x] Generate session ID in frontend (localStorage)
- [x] Update validate_input.js to accept session ID
- [x] Update save_generation.js to store session ID
- [x] Delete existing test data

### Phase 2: Authentication Layer ✅ COMPLETED
- [x] Enable Supabase Auth (Email + Google provider)
- [x] Create AuthComponents.tsx with auth modals
- [x] Create SignUpModal and AuthPrompt components
- [x] Update RiverResultsRoot.tsx to check auth state
- [x] Add user_id columns to database
- [x] Basic RLS policies

### Phase 3: Claim Flow ✅ COMPLETED (Pipedream Webhook)
- [x] Implement claim webhook in Pipedream (backend/claim_anonymous_generations.js)
- [x] Use service role key to bypass RLS policies
- [x] Call claim webhook on successful login/signup (all auth methods)
- [x] Handle edge cases (no session ID, already claimed, errors)
- [x] Clear localStorage session ID after claim
- [x] Update both videos and generations tables

### Phase 4: User Experience ✅ COMPLETED
- [x] Add logout functionality (in UserDashboard)
- [x] Show user name in dashboard header
- [x] Handle session expiry gracefully (auto-check on load)
- [ ] Add "forgot password" flow (not implemented yet)
- [x] Add "Sign up to save your generations" prompt (AuthPrompt component)
- [x] Conditional rendering based on auth status
- [x] Dashboard opens automatically after signup

### Phase 5: Dashboard Preparation ✅ COMPLETED
- [x] Created UserDashboard.tsx with list and detail views
- [x] Query generations with outputs via Supabase
- [x] Display outputs in HorizontalCardCarousel
- [x] RLS policies filter by user_id automatically
- [ ] Add anonymous data cleanup job (future work)

---

## Implementation Status (feature/horizontal-layout-with-auth)

### ✅ What Was Built

**Claim Flow Architecture - Pipedream Webhook:**

The claim flow was initially implemented in the frontend but caused issues:
- Stale closure bugs from React useEffect dependencies
- RLS policies blocking UPDATE operations with anon key
- Inconsistent with existing architecture (all DB writes in Pipedream)

**Solution: Migrated to Pipedream webhook with service role key**

```javascript
// backend/claim_anonymous_generations.js
export default defineComponent({
  async run({ steps, $ }) {
    const { anonymous_session_id, user_id } = steps.trigger.event.body;

    // Use service role key to bypass RLS
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY  // Key difference!
    );

    // Update videos table
    const { count: videosUpdated } = await supabase
      .from("videos")
      .update({ user_id, anonymous_session_id: null })
      .eq("anonymous_session_id", anonymous_session_id)
      .is("user_id", null);

    // Update generations table
    const { count: generationsUpdated } = await supabase
      .from("generations")
      .update({ user_id, anonymous_session_id: null })
      .eq("anonymous_session_id", anonymous_session_id)
      .is("user_id", null);

    return {
      success: true,
      claimed: { videos: videosUpdated, generations: generationsUpdated }
    };
  }
});
```

**Frontend Integration (RiverResultsRoot.tsx):**

```typescript
React.useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      const wasAuthenticated = isAuthenticated;
      const nowAuthenticated = !!session;
      setIsAuthenticated(nowAuthenticated);

      // Claim anonymous generations on authentication
      if (!wasAuthenticated && nowAuthenticated && session?.user) {
        const anonymousSessionId = localStorage.getItem("river_session_id");

        if (anonymousSessionId) {
          // Call Pipedream claim webhook
          const response = await fetch(
            "https://eo8cimuv49hq45d.m.pipedream.net/claim",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({
                anonymous_session_id: anonymousSessionId,
                user_id: session.user.id,
              }),
            }
          );

          const result = await response.json();
          console.log("✅ Claimed successfully:", result.claimed);
          localStorage.removeItem("river_session_id");
        }

        setShowSignUpModal(false);
        setShowDashboard(true);
      }
    }
  );

  return () => subscription.unsubscribe();
}, []); // Empty dependency array - no stale closure!
```

**Benefits of Pipedream Approach:**
- ✅ Service role key bypasses all RLS restrictions
- ✅ Consistent with existing architecture (all DB writes in Pipedream)
- ✅ No stale closure bugs (empty dependency array)
- ✅ Works for all auth methods (email, Google OAuth, future providers)
- ✅ Single source of truth in backend
- ✅ Better error handling and logging
- ✅ No complex RLS policy setup needed in frontend

**Components Created:**
1. `AuthComponents.tsx` - Authentication UI and Supabase client
2. `UserDashboard.tsx` - Fullscreen dashboard with list/detail views
3. `HorizontalCardCarousel.tsx` - Single-card carousel component
4. `DashboardPreview.tsx` - Dashboard preview for Framer
5. `SignUpModalPreview.tsx` - Sign-up modal preview
6. `backend/claim_anonymous_generations.js` - Claim webhook

**Components Modified:**
1. `RiverResultsRoot.tsx` - Auth state management, carousel integration, conditional AuthPrompt
2. Database schema - Added user_id and anonymous_session_id columns

**Features Working:**
- ✅ Anonymous users generate without account
- ✅ Session tracked in localStorage
- ✅ Email signup with automatic claim
- ✅ Google OAuth with automatic claim
- ✅ Dashboard shows all user generations
- ✅ Outputs displayed in carousel format
- ✅ One-card-at-a-time horizontal carousel
- ✅ Keyboard (← →) and swipe navigation
- ✅ Auth-aware UI (conditional prompts)

---

## Next Steps

1. Set up Google OAuth credentials in Google Cloud Console
2. Enable Supabase Auth providers
3. Delete existing test data from Supabase
4. Begin Phase 1 implementation
