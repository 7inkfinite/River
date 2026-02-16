# River: YouTube to Social Media Content Repurposer

## What is River?

River transforms YouTube videos into ready-to-publish social media content for Twitter, LinkedIn, and Instagram. Instead of manually watching a video and crafting posts, River does it automatically by reading the video's transcript and using AI to create platform-optimized content.

## The Big Picture

**Input:** Paste a YouTube URL
**Output:** Get professionally formatted content for Twitter threads, LinkedIn posts, and Instagram carousels

**Philosophy:** Calm, intentional iteration. Generate → review → tweak → regenerate → publish.

## How It Works (Simple Version)

1. **You paste a YouTube URL** into River's form on the website
2. **River fetches the video's transcript** from YouTube's subtitle system
3. **AI reads the transcript** and creates content tailored for each social platform
4. **You review the results** in a beautiful carousel interface
5. **Tweak anything you want** by clicking "Edit" and requesting changes
6. **Copy and paste** to your social platforms when satisfied

## The Three Pieces

### 1. The Website (Frontend)

Built with Framer and React. This is what you see and interact with:

- **Form page:** Where you paste YouTube URLs and choose platforms (available at `/` for everyone and `/form` for signed-in users)
- **Results page:** Shows your generated content in cards (Twitter, LinkedIn, Instagram)
- **User dashboard:** See all your previous generations (protected route)
- **Sign up/Login:** Email or Google authentication

### 2. The Backend Brain (Pipedream Workflows)

Two separate serverless workflows that run the logic:

**Main Workflow (Video Processing):**
- Receives your YouTube URL
- Fetches the video title and thumbnail from YouTube (via YT-API)
- Fetches the transcript from YouTube
- Checks if we've already generated content for this video (cache)
- Calls OpenAI to generate social content
- Saves everything to the database (including video title and thumbnail)
- Returns results to the website

**Auth Workflow (User Migration):**
- When you sign up after using River anonymously, this workflow "claims" your previous generations
- Transfers ownership from anonymous session to your account

### 3. The Database (Supabase)

PostgreSQL database that stores:

- **Videos:** YouTube video IDs, titles, thumbnails, and metadata
- **Generations:** Each time you generate content, tracked with tone, platforms, and user attribution
- **Outputs:** The actual Twitter threads, LinkedIn posts, and carousel slides
- **Users:** Your account information (handled by Supabase Auth)

## Key Features

### Smart Caching

If you (or someone else) already generated content for the same video with the same settings, River instantly returns the cached result instead of calling the AI again. This:
- Saves money on API costs
- Gives you consistent results
- Makes regeneration instant

### Anonymous Usage + Sign Up Later

You can use River without signing up. Your generations are tracked by a "session ID" stored in your browser. When you decide to sign up, River automatically transfers all your anonymous work to your account.

### Platform-Specific Generation

Each platform has its own format requirements:

- **Twitter:** 8-12 tweet thread with strong hooks and scannable text
- **LinkedIn:** 120-220 word post with clear structure and professional tone
- **Instagram:** 4-5 slide captions, each 1-2 lines, optimized for carousel format

### Tweak Mode

Don't like the first result? Click "Edit" on any card and type instructions like:
- "Make the hook more engaging"
- "Add more examples in slides 2-3"
- "Keep it more casual"

River regenerates just that platform while keeping the rest intact.

## The User Journey

### First-Time Anonymous User

1. Visit River website
2. Paste YouTube URL (e.g., a tech review video)
3. Choose platforms (Twitter + LinkedIn)
4. Click "Generate"
5. Wait ~15 seconds
6. See results in carousel
7. Copy Twitter thread to clipboard
8. Paste into Twitter
9. See "Sign up to save your work" prompt
10. Close browser

### Returning Anonymous User

11. Visit River again (session ID still in browser)
12. Generate content from new video
13. Decide to sign up (realizes they want to keep history)
14. Click "Sign Up"
15. Enter email/password or use Google
16. See success modal with claimed generations count
17. Click "Open My Dashboard"
18. View generation history in dashboard

### Authenticated Power User

1. Sign in immediately
2. Land on Home page, see "Go to Dashboard" button
3. Go to Dashboard, click "Create New"
4. Navigate to dedicated form page (`/form`)
5. Generate content (automatically attributed to your account via `user_id`)
6. See "Saved to dashboard" confirmation with navigation options
7. Click "Back to Dashboard" to view history with video thumbnails and titles
8. Scroll through date-grouped generations with infinite scroll
9. Click any generation to view/edit
10. Edit, regenerate, and copy
11. Come back next week, all history preserved

## Technical Highlights (Non-Technical Explanation)

### Serverless Architecture

No servers to manage. Each component runs independently:
- Frontend hosted on Framer
- Backend runs on Pipedream (auto-scales)
- Database hosted by Supabase
- AI processing through OpenAI

**Benefit:** Pay only for what you use, no maintenance, scales automatically.

### Real-Time Transcript Processing

River doesn't rely on YouTube's API for transcripts. Instead:
1. Uses RapidAPI to find available subtitle tracks
2. Prefers English auto-generated captions
3. Downloads raw XML format directly from YouTube
4. Parses and normalizes into clean text
5. Feeds to AI within seconds

**Benefit:** Works with any YouTube video that has captions (most do).

### Deterministic Caching

Cache keys are generated using:
- Video ID
- Tone setting
- Platform selection
- Prompt version

This means identical inputs ALWAYS produce identical outputs (or fetch from cache).

**Benefit:** Predictable, reliable, fast.

### Row-Level Security

Your generations are isolated from other users at the database level. Even if someone guessed your generation ID, they couldn't access it.

**Benefit:** Your content is private and secure.

## Business Model Potential

River is currently built as a product prototype. Potential monetization strategies:

1. **Freemium:** 5 generations/month free, unlimited for $19/month
2. **Usage-Based:** $0.50 per generation (transparent OpenAI costs)
3. **Team Plans:** $49/month for 5 users with shared workspace
4. **White-Label:** License River to agencies for $299/month
5. **Enterprise:** Custom pricing for high-volume users

## Success Metrics

Current implementation tracks:
- Total generations
- Cache hit rate
- Platforms used
- User retention (anonymous → authenticated conversion)
- Average time to publish
- Regeneration frequency

## Why River Works

**For Content Creators:**
- Saves 30-60 minutes per video repurposing
- Maintains quality with AI assistance
- Keeps your voice with tone controls
- No learning curve (paste URL, done)

**For Marketing Teams:**
- Consistent output quality
- Fast iteration cycles
- Audit trail of all generations
- Collaborative workflows (future)

**For Solo Entrepreneurs:**
- Free to start (anonymous usage)
- Cheap to scale (caching reduces costs)
- No technical knowledge required
- Export-ready content

## The Strategy

River is positioned as a **calm, intentional content repurposing tool** rather than a "generate and spray" automation platform. This differentiation matters:

### What River Is:
- A creative assistant for thoughtful content adaptation
- A time-saver that maintains quality
- A tool that respects the original content's integrity

### What River Is Not:
- An automated spam generator
- A clickbait headline maker
- A content mill for quantity over quality

This positioning attracts:
- Professional creators who value their brand
- B2B marketers who need quality
- Educators repurposing lectures
- Podcasters expanding reach

## Future Vision

### Short-Term (Next 3 Months)
- Export functionality (JSON, text files)
- Search and filter in dashboard
- Regenerate from history
- Custom tone presets

### Medium-Term (6-12 Months)
- Bulk generation (process multiple videos)
- Webhook integrations (Buffer, Later, Hootsuite)
- Team collaboration features
- Advanced analytics

### Long-Term (1-2 Years)
- Multi-language support
- Video clip extraction (find best moments)
- Platform-specific scheduling
- A/B testing frameworks
- Custom AI model fine-tuning

## Getting Started (For New Users)

1. Visit River website
2. Paste any YouTube URL
3. Choose Twitter + LinkedIn
4. Use default tone: "creator-friendly, punchy"
5. Click Generate
6. Wait 15 seconds
7. Review results
8. Click Edit if you want changes
9. Copy and publish

No account required. No credit card. No commitment.

---

**River: From YouTube to social media in seconds, with care.**
