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

## Implementation Phases

### Phase 1: Core Authentication (MVP)
- [ ] Enable Supabase Auth (Email + Google provider)
- [ ] Create AuthProvider.tsx for Framer
- [ ] Create LoginForm.tsx component
- [ ] Update validate_input.js to verify JWT
- [ ] Add user_id columns to database
- [ ] Basic RLS policies

### Phase 2: Data Association
- [ ] Update upsert_video.js to save user_id
- [ ] Update save_generation.js to save user_id
- [ ] Update check_cache.js to scope cache by user
- [ ] Create migration for existing data

### Phase 3: User Experience
- [ ] Add logout functionality
- [ ] Show user email/avatar in UI
- [ ] Handle session expiry gracefully
- [ ] Add "forgot password" flow

### Phase 4: Dashboard Preparation
- [ ] Document shared auth architecture for river-dashboard
- [ ] Consider adding user profile table (display name, preferences)
- [ ] Add API endpoint for listing user's generations

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

## Open Questions

1. **Legacy data handling**: What to do with existing generations without user_id?
   - Option A: Assign to an "admin" account
   - Option B: Leave null, exclude from user dashboards
   - Option C: Delete and start fresh

2. **Anonymous usage**: Should users be able to generate without logging in?
   - If yes: Need separate "anonymous" flow, convert to user later
   - If no: Simpler auth gate, all generations tracked

3. **Team/Org support**: Future consideration for shared workspaces?
   - Affects database schema (add organization_id?)
   - Can be added later without breaking changes

---

## Next Steps

1. Finalize decisions on open questions
2. Set up Google OAuth credentials in Google Cloud Console
3. Enable Supabase Auth providers
4. Begin Phase 1 implementation
