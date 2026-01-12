# River Results Display Implementation Plan
**Date:** January 11, 2026  
**Project:** River - Content Repurposing Platform  
**Focus:** Authentication-Aware Results Display & Horizontal Card Carousel UX

---

## 🎯 Project Overview

### Objective
Implement a unified, authentication-aware results display system where:
1. **Anonymous users** see results in Framer with a signup CTA
2. **Signed-in users** see results exclusively in the dashboard
3. **Results display** uses horizontal card carousel (one visible card at a time)
4. **Anonymous-to-authenticated migration** works seamlessly when users sign up

### Current State
- ✅ Supabase auth setup complete (email + Google OAuth)
- ✅ Database schema has `user_id` and `anonymous_session_id` columns
- ✅ RLS policies configured
- ❌ Dashboard auto-opens for ALL users (should only open for authenticated)
- ❌ Results display in both Framer and dashboard inconsistently
- ❌ No horizontal card carousel UX
- ❌ Anonymous claim flow not triggering on signup

---

## 📋 Implementation Tasks

### **TASK 1: Audit Current Authentication Flow**
**Priority:** P0 (Critical)  
**Estimated Time:** 30 minutes

**Claude Code Prompt:**
```
Using the /code-review agent from compound-engineering, perform a comprehensive audit of the authentication flow in the River frontend project:

1. Examine `AuthProvider.tsx` to understand:
   - How auth state is managed
   - Where user sessions are stored
   - How anonymous sessions are tracked in localStorage

2. Review `LoginForm.tsx` to identify:
   - Where authentication success is handled
   - Whether the claim flow is called after signup/login
   - Any redirection logic post-authentication

3. Analyze `UseRiverGeneration.tsx` to check:
   - How generation results are processed
   - Whether user authentication status affects result handling
   - If there's logic to conditionally redirect to dashboard

4. Find where the dashboard redirect is triggered when results are loaded

5. Create a markdown file documenting:
   - Current authentication state management architecture
   - Flow diagrams for anonymous and authenticated user journeys
   - Identified bugs and gaps in the implementation
   - Specific files and line numbers that need modification

Output the audit report as: `/home/claude/AUTH_FLOW_AUDIT.md`
```

**Acceptance Criteria:**
- ✅ Complete understanding of current auth state management
- ✅ Identified where dashboard auto-redirect happens
- ✅ Documented gaps in anonymous claim flow
- ✅ Clear list of files requiring changes

---

### **TASK 2: Fix Dashboard Conditional Rendering**
**Priority:** P0 (Critical)  
**Estimated Time:** 1 hour

**Claude Code Prompt:**
```
Using the /implement-feature agent from compound-engineering, fix the dashboard auto-opening behavior:

**Context:**
Currently, when generation results load, the dashboard opens for ALL users. It should ONLY open for authenticated users.

**Requirements:**
1. In `UseRiverGeneration.tsx` (or wherever results are handled):
   - Check authentication status before triggering dashboard redirect
   - For authenticated users: Redirect to dashboard with results
   - For anonymous users: Display results in Framer with signup CTA

2. Add authentication check logic:
   ```typescript
   const { user } = useAuth(); // or however auth context is accessed
   
   if (generationComplete) {
     if (user) {
       // Redirect to dashboard
       router.push(`/dashboard/results/${generationId}`);
     } else {
       // Stay on Framer page, show results with signup CTA
       setShowResults(true);
     }
   }
   ```

3. Ensure results data structure is passed correctly in both scenarios

4. Test scenarios:
   - Anonymous user generates content → sees results in Framer
   - Authenticated user generates content → redirected to dashboard
   - Dashboard displays results correctly for authenticated users

**Files to modify:**
- `frontend/UseRiverGeneration.tsx`
- `frontend/RiverResultsRoot.tsx` (if conditional rendering needed)
- Any routing/navigation logic files

Use the /test-implementation agent to create test cases for both user types.

Output a summary of changes made and test results.
```

**Acceptance Criteria:**
- ✅ Dashboard ONLY opens for authenticated users
- ✅ Anonymous users see results in Framer
- ✅ No console errors during result display
- ✅ Authentication state properly checked before redirect

---

### **TASK 3: Implement Anonymous Claim Flow**
**Priority:** P0 (Critical)  
**Estimated Time:** 1.5 hours

**Claude Code Prompt:**
```
Using the /implement-feature agent from compound-engineering, implement the anonymous-to-authenticated claim flow:

**Context:**
When an anonymous user signs up/logs in, their previous generations (tracked via `anonymous_session_id`) should be migrated to their new `user_id`.

**Requirements:**

1. Create a `claimAnonymousGenerations()` function in `AuthProvider.tsx`:
   ```typescript
   const claimAnonymousGenerations = async (userId: string) => {
     const sessionId = localStorage.getItem('river_session_id');
     if (!sessionId) return;

     try {
       // Update generations table
       await supabase
         .from('generations')
         .update({ 
           user_id: userId, 
           anonymous_session_id: null 
         })
         .eq('anonymous_session_id', sessionId);

       // Update videos table
       await supabase
         .from('videos')
         .update({ 
           user_id: userId, 
           anonymous_session_id: null 
         })
         .eq('anonymous_session_id', sessionId);

       // Clear session ID after successful claim
       localStorage.removeItem('river_session_id');
       
       console.log('Successfully claimed anonymous generations for user:', userId);
     } catch (error) {
       console.error('Error claiming anonymous generations:', error);
     }
   };
   ```

2. Call `claimAnonymousGenerations()` in authentication success handlers:
   - After email signup completes
   - After Google OAuth completes
   - In `LoginForm.tsx` success callback

3. Add error handling for edge cases:
   - Session ID doesn't exist
   - User already has generations (merge conflict)
   - Database update fails

4. Test the complete flow:
   - Anonymous user generates content
   - Signs up with email or Google
   - Verifies generations appear in their dashboard
   - Confirms `anonymous_session_id` is cleared

**Files to modify:**
- `frontend/AuthProvider.tsx`
- `frontend/LoginForm.tsx`

Use the /debug-issue agent if there are migration errors.

Document the implementation with inline comments explaining the claim logic.
```

**Acceptance Criteria:**
- ✅ Claim function executes after successful authentication
- ✅ Anonymous generations appear in user's dashboard
- ✅ `river_session_id` removed from localStorage after claim
- ✅ No duplicate entries created
- ✅ Error handling works for edge cases

---

### **TASK 4: Create Horizontal Card Carousel Component**
**Priority:** P1 (High)  
**Estimated Time:** 2 hours

**Claude Code Prompt:**
```
Using the /implement-feature agent from compound-engineering, create a new horizontal card carousel component:

**Context:**
Results currently display all three cards (Twitter, LinkedIn, Instagram) at once. We need a horizontal scrolling carousel that shows ONE card at a time, regardless of screen size.

**Requirements:**

1. Create new component: `frontend/HorizontalCardCarousel.tsx`
   
2. Component structure:
   ```typescript
   interface HorizontalCardCarouselProps {
     cards: React.ReactNode[]; // Array of card components
     initialIndex?: number;
   }

   export function HorizontalCardCarousel({ cards, initialIndex = 0 }: HorizontalCardCarouselProps) {
     const [currentIndex, setCurrentIndex] = useState(initialIndex);
     
     // Implement smooth horizontal scrolling
     // Add swipe gesture support for mobile
     // Add navigation dots/indicators
     // Add prev/next buttons
   }
   ```

3. UX Requirements:
   - **Desktop:** Arrow buttons on left/right edges + keyboard navigation (← →)
   - **Mobile:** Swipe gestures + arrow buttons
   - **Visual feedback:** 
     - Dot indicators showing position (1/3, 2/3, 3/3)
     - Smooth CSS transitions between cards
     - Card appears centered on screen
   - **Accessibility:** Keyboard navigation, ARIA labels

4. Styling approach:
   - Use CSS `scroll-snap-type: x mandatory` for native scroll behavior
   - Hide overflow: only one card visible at a time
   - Cards should be full-width within container
   - Maintain responsive design (works on mobile, tablet, desktop)

5. Reference implementation pattern:
   ```css
   .carousel-container {
     display: flex;
     overflow-x: auto;
     scroll-snap-type: x mandatory;
     scroll-behavior: smooth;
   }
   
   .carousel-card {
     flex: 0 0 100%;
     scroll-snap-align: center;
   }
   ```

6. Add animation polish:
   - Fade in/out effect when switching cards
   - Smooth momentum scrolling on mobile
   - Prevent accidental multi-card jumps

Use the /optimize-code agent to ensure smooth 60fps animations.

**Files to create:**
- `frontend/HorizontalCardCarousel.tsx`
- `frontend/HorizontalCardCarousel.css` (or styled-components)

Test on multiple devices and screen sizes.
```

**Acceptance Criteria:**
- ✅ Only one card visible at a time
- ✅ Smooth horizontal scrolling works
- ✅ Swipe gestures work on mobile
- ✅ Keyboard navigation works
- ✅ Visual indicators show current position
- ✅ No layout breaks on different screen sizes

---

### **TASK 5: Integrate Carousel into Results Display**
**Priority:** P1 (High)  
**Estimated Time:** 1.5 hours

**Claude Code Prompt:**
```
Using the /implement-feature agent from compound-engineering, integrate the HorizontalCardCarousel into both Framer and Dashboard results displays:

**Context:**
The carousel component needs to work consistently in:
1. Framer page (anonymous users viewing results)
2. Dashboard (authenticated users viewing results)

**Requirements:**

1. Update `RiverResultsRoot.tsx` (Framer):
   ```typescript
   import { HorizontalCardCarousel } from './HorizontalCardCarousel';
   
   export function RiverResultsRoot({ results }) {
     const cards = [
       <TwitterThreadCard data={results.twitter} />,
       <LinkedInPostCard data={results.linkedin} />,
       <InstagramCarouselCard data={results.carousel} />
     ];
     
     return (
       <div className="results-container">
         {!isAuthenticated && (
           <SignUpBanner 
             message="Sign up to save your generations!" 
             onSignUp={handleSignUpClick}
           />
         )}
         <HorizontalCardCarousel cards={cards} />
       </div>
     );
   }
   ```

2. Update Dashboard results view (in `river-dashboard` Next.js app):
   - Import the same `HorizontalCardCarousel` component
   - Ensure styling is consistent with Framer version
   - Pass generation data from Supabase query

3. Add SignUp CTA banner for anonymous users:
   - Position above carousel
   - Clear value proposition: "Sign up to save these results"
   - Click triggers `SignUpModal` component
   - Hide banner for authenticated users

4. Ensure data structure is consistent:
   - Both locations receive same `outputs` format from Pipedream
   - Handle missing platforms gracefully (if user only generated for 2 platforms)

5. Test both flows:
   - Anonymous: Generate → See carousel in Framer → Click signup → Dashboard shows same results
   - Authenticated: Generate → Redirect to dashboard → See carousel

**Files to modify:**
- `frontend/RiverResultsRoot.tsx`
- `river-dashboard/components/GenerationResults.tsx` (or equivalent)
- `frontend/SignUpBanner.tsx` (create if doesn't exist)

Use the /refactor-code agent to ensure code isn't duplicated between Framer and Dashboard.
```

**Acceptance Criteria:**
- ✅ Carousel works in both Framer and Dashboard
- ✅ SignUp CTA visible only for anonymous users
- ✅ Same UX across both platforms
- ✅ Results data structure handled consistently
- ✅ No visual glitches or layout issues

---

### **TASK 6: Fix Dashboard Results Display Logic**
**Priority:** P1 (High)  
**Estimated Time:** 1 hour

**Claude Code Prompt:**
```
Using the /implement-feature agent from compound-engineering, ensure dashboard displays results correctly for authenticated users:

**Context:**
When authenticated users generate content, they should be redirected to dashboard where results are displayed in the carousel format.

**Requirements:**

1. Create/update dashboard route: `/dashboard/results/[generationId]`
   
2. Implement data fetching:
   ```typescript
   // In Next.js dashboard
   const { data: generation, error } = await supabase
     .from('generations')
     .select(`
       id,
       tone,
       platforms,
       created_at,
       video:videos (
         title,
         youtube_video_id,
         original_url
       ),
       outputs (
         platform,
         format,
         content,
         metadata
       )
     `)
     .eq('id', generationId)
     .eq('user_id', user.id) // RLS ensures user can only see their data
     .single();
   ```

3. Transform outputs into card components:
   - Parse `outputs` array
   - Group by platform (twitter, linkedin, carousel)
   - Pass to respective card components

4. Add metadata display above carousel:
   - Video title and thumbnail
   - Generation timestamp
   - Tone used
   - "Regenerate" button that redirects to Framer with pre-filled data

5. Handle edge cases:
   - Generation not found (404 page)
   - User doesn't own generation (403 error)
   - Incomplete generation (show loading/error state)
   - Missing output for a platform

Use the /debug-issue agent if RLS policies cause access issues.

**Files to modify/create:**
- `river-dashboard/app/dashboard/results/[generationId]/page.tsx`
- `river-dashboard/components/GenerationResults.tsx`
- `river-dashboard/components/GenerationMetadata.tsx`

Test with both newly generated and historical generations.
```

**Acceptance Criteria:**
- ✅ Dashboard displays results for authenticated users
- ✅ RLS correctly filters results by user_id
- ✅ Carousel displays all platforms generated
- ✅ Metadata shows video info and generation details
- ✅ "Regenerate" button works correctly
- ✅ Error states handled gracefully

---

### **TASK 7: Add SignUpModal Component**
**Priority:** P1 (High)  
**Estimated Time:** 1 hour

**Claude Code Prompt:**
```
Using the /implement-feature agent from compound-engineering, create a modal that triggers when anonymous users click signup CTA:

**Context:**
Anonymous users see results with a signup banner. Clicking the CTA should open a modal with signup options.

**Requirements:**

1. Create `frontend/SignUpModal.tsx`:
   ```typescript
   interface SignUpModalProps {
     isOpen: boolean;
     onClose: () => void;
     generationId?: string; // To redirect back after signup
   }

   export function SignUpModal({ isOpen, onClose, generationId }: SignUpModalProps) {
     // Modal should include:
     // 1. Value proposition: "Save your generations and access them anywhere"
     // 2. Email signup form (reuse from LoginForm)
     // 3. Google OAuth button
     // 4. "Already have an account? Log in" link
   }
   ```

2. Modal behavior:
   - Backdrop click closes modal
   - ESC key closes modal
   - Smooth fade-in/out animation
   - Focus traps inside modal for accessibility
   - After successful signup:
     - Claim anonymous generations
     - Redirect to dashboard showing current results
     - Show success message

3. Styling:
   - Center modal on screen
   - Responsive (works on mobile)
   - Match River brand aesthetic
   - Clear CTAs with good contrast

4. Integration:
   - Trigger from SignUpBanner click
   - Pass current generation data for context
   - Handle both signup and login flows

Use the /design-ui agent to ensure modal follows best UX practices.

**Files to create:**
- `frontend/SignUpModal.tsx`
- `frontend/SignUpModal.css`

**Files to modify:**
- `frontend/SignUpBanner.tsx` (add onClick handler)

Test modal flow completely from anonymous generation through signup to dashboard.
```

**Acceptance Criteria:**
- ✅ Modal opens on signup CTA click
- ✅ Both email and Google signup work
- ✅ Anonymous generations claimed after signup
- ✅ User redirected to dashboard with results
- ✅ Modal accessible (keyboard nav, screen readers)
- ✅ Responsive design works on mobile

---

### **TASK 8: End-to-End Testing & Validation**
**Priority:** P0 (Critical)  
**Estimated Time:** 2 hours

**Claude Code Prompt:**
```
Using the /test-implementation agent from compound-engineering, create and run comprehensive end-to-end tests:

**Test Scenarios:**

1. **Anonymous User Flow:**
   - Navigate to River Framer page
   - Enter YouTube URL and generate content
   - Verify results display in horizontal carousel (one card at a time)
   - Verify swipe/scroll navigation works
   - Verify signup CTA is visible above results
   - Click signup CTA → modal opens
   - Complete signup with email
   - Verify claim flow executes
   - Verify redirect to dashboard
   - Verify same results appear in dashboard carousel
   - Verify `river_session_id` removed from localStorage

2. **Authenticated User Flow:**
   - Log in to River
   - Navigate to generation form in Framer
   - Enter YouTube URL and generate content
   - Verify automatic redirect to dashboard (NOT staying in Framer)
   - Verify results display in dashboard carousel
   - Verify all three cards accessible via navigation
   - Test keyboard navigation (← → arrows)
   - Test "Regenerate" button

3. **Cross-Device Testing:**
   - Test on mobile (iOS Safari, Android Chrome)
   - Test on tablet (iPad)
   - Test on desktop (Chrome, Firefox, Safari)
   - Verify carousel works on all screen sizes
   - Verify swipe gestures work on touch devices

4. **Edge Cases:**
   - Anonymous user generates, closes browser, returns (session persists)
   - Anonymous user generates, clears localStorage, returns (new session)
   - User generates only 2 platforms (carousel shows 2 cards)
   - Network error during generation
   - Authentication fails during claim flow

Create test report documenting:
- Test cases executed
- Pass/fail status
- Screenshots of key flows
- Identified bugs
- Performance metrics (card transition speed, load times)

Use the /debug-issue agent to fix any failing tests.

Output test report as: `/home/claude/E2E_TEST_REPORT.md`
```

**Acceptance Criteria:**
- ✅ All test scenarios pass
- ✅ No console errors
- ✅ Performance benchmarks met (< 300ms card transitions)
- ✅ Works on all specified devices/browsers
- ✅ Edge cases handled gracefully

---

### **TASK 9: Documentation & Handoff**
**Priority:** P2 (Medium)  
**Estimated Time:** 1 hour

**Claude Code Prompt:**
```
Using the /document-code agent from compound-engineering, create comprehensive documentation:

**Requirements:**

1. Update `AUTH_STRATEGY.md` with:
   - New claim flow implementation details
   - Dashboard conditional rendering logic
   - Anonymous vs authenticated result display differences

2. Create `RESULTS_DISPLAY_UX.md` documenting:
   - Horizontal carousel component architecture
   - Integration points in Framer and Dashboard
   - Swipe gesture implementation
   - Keyboard navigation shortcuts
   - Accessibility features

3. Update `RIVER_PRD.md` to reflect:
   - Completed authentication features
   - New UX patterns (carousel)
   - Updated user flows with screenshots/diagrams

4. Create inline code comments in:
   - `HorizontalCardCarousel.tsx` (explain scroll snap logic)
   - `AuthProvider.tsx` (explain claim flow)
   - `UseRiverGeneration.tsx` (explain conditional redirect)

5. Create video walkthrough (Loom/screen recording):
   - Demonstrate anonymous user flow
   - Demonstrate authenticated user flow
   - Show carousel interaction on mobile and desktop

Output documentation files in project `/docs` folder.
```

**Acceptance Criteria:**
- ✅ All documentation files updated
- ✅ Code comments clear and helpful
- ✅ Architecture diagrams included
- ✅ Video walkthrough recorded
- ✅ Future maintainers can understand implementation

---

## 🎯 Success Metrics

### Functional Requirements
- [ ] Dashboard opens ONLY for authenticated users
- [ ] Anonymous users see results in Framer with signup CTA
- [ ] Horizontal carousel displays one card at a time
- [ ] Swipe/scroll navigation works smoothly
- [ ] Anonymous claim flow executes on signup
- [ ] Results appear correctly in both Framer and Dashboard

### Performance Requirements
- [ ] Card transitions < 300ms
- [ ] No layout shift during result load
- [ ] Smooth 60fps animations
- [ ] Works offline (once loaded)

### UX Requirements
- [ ] Intuitive navigation (users understand how to view all cards)
- [ ] No confusion between Framer and Dashboard experiences
- [ ] Clear value proposition in signup CTA
- [ ] Consistent design language across platforms

---

## 🔄 Rollback Plan

If critical bugs are discovered:
1. Revert to previous commit (before Task 2 changes)
2. Dashboard continues auto-opening for all users (temporary)
3. Prioritize fixing claim flow bugs first
4. Deploy carousel as optional feature flag

---

## 📚 References

- **AUTH_STRATEGY.md** - Current authentication architecture
- **RIVER_PRD.md** - Product requirements and user flows
- **Supabase Docs** - RLS policies and auth methods
- **Framer Docs** - Component integration patterns
- **Next.js Docs** - Dynamic routing and data fetching

---

## 🤝 Collaboration Notes

- Tag Arjun on Notion when each task completes
- Report blockers immediately in Slack #river-dev
- Screenshot UX decisions for design review
- Test on real devices before marking tasks complete

---

**End of Implementation Plan**

This plan should be executed sequentially by Claude Code. Each task builds on the previous one. Prioritize P0 tasks first, then P1.

Good luck! 🚀
