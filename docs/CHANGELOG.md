# Changelog

All notable changes to River will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- New features and capabilities

### Changed
- Changes to existing functionality

### Fixed
- Fixed dashboard crash caused by querying non-existent `title` and `inputs` columns from Supabase.
- Fixed issue where generations created by an already logged-in user were not automatically claimed/attributed to their account.
- Bug fixes

### Removed
- Removed features

### Security
- Security fixes

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
