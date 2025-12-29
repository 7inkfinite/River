# River 🌊

River is an AI-powered system that repurposes YouTube videos into
high-quality, platform-specific social content — Twitter threads,
LinkedIn posts, and Instagram carousels.

It is designed to feel calm, intentional, and iterative:
generate → review → tweak → regenerate → publish.

---

## What River Does

1. Accepts a YouTube URL and optional tone instructions
2. Extracts and cleans the video transcript
3. Generates platform-specific content using an LLM
4. Stores generations and outputs in Supabase
5. Returns structured results back to Framer for display and iteration

Supported platforms:
- Twitter / X (threads)
- LinkedIn (single post)
- Instagram (carousel slides)

---

## System Architecture (High Level)

Framer (UI)
→ Pipedream (workflow orchestration)
→ OpenAI (content generation)
→ Supabase (persistence + cache)
→ Framer (results + tweaks)

---

## Repository Structure (To be Filled)

---

## Canonical Sources of Truth

The following files define River’s authoritative behavior:

- `frontend/UseRiverGeneration.tsx`
- `backend/pipedream/save_generation.ts`
- `contracts/payloads/river-output.v1.json`

If documentation and code ever disagree, **these files win**.

---

## Design Philosophy

River optimizes for:
- Calm feedback loops (results never vanish mid-regen)
- Explicit state ownership (generate vs tweak)
- Cache correctness (deterministic outputs)
- Human-readable structure (LLMs + humans)

This is a system meant to scale without becoming brittle.

---

## Status

River is currently in active development.
Instagram carousel support has been recently added and is being refined.
