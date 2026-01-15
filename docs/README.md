# River: YouTube to Social Media Content Repurposer

Transform YouTube videos into platform-optimized social media content using AI.

## Documentation

- **[OVERVIEW.md](docs/OVERVIEW.md)** - Project overview, user journeys, business strategy
- **[TECHNICAL.md](docs/TECHNICAL.md)** - Technical architecture and implementation details
- **[claude.md](docs/claude.md)** - Session directives for LLM assistance

## Project Status

- **[CHANGELOG.md](docs/CHANGELOG.md)** - Release history and notable changes
- **[BUGLOG.md](docs/BUGLOG.md)** - Detailed bug fix history

## Architecture

- **Frontend:** Framer + React components (see TECHNICAL.md)
- **Backend:** Pipedream serverless workflows (included in this repo)
- **Database:** Supabase PostgreSQL + Auth
- **AI:** OpenAI gpt-4o-mini

## Backend Setup

The `backend/` directory contains Pipedream workflow steps. To deploy:

1. Create a Pipedream account
2. Import workflows from `backend/River/` and `backend/River Auth/`
3. Set environment variables in Pipedream:
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` - From Supabase settings
   - `OPEN_API_KEY` - Your OpenAI API key

## Frontend Setup

Frontend components are Framer code components. See TECHNICAL.md for:
- Component architecture
- State management patterns
- Integration with backend webhooks

To use:
1. Copy component code into Framer
2. Update hardcoded values:
   - Webhook URLs (from Pipedream)
   - Supabase credentials
3. Deploy via Framer

## Security

- Backend workflows use environment variables (no secrets in code)
- Frontend requires hardcoded values for Framer compatibility
- Supabase anon keys are public by design (protected by RLS)
- Service role keys must never be exposed in frontend

## Tech Stack

- React (Framer framework)
- Pipedream (serverless workflows)
- Supabase (PostgreSQL + Auth)
- OpenAI (gpt-4o-mini)
- RapidAPI (YouTube subtitles)

## License

MIT License

## Contact

For questions or collaborations, please open an issue or reach out via GitHub.
