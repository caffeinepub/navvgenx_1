# NavvGenX AI

## Current State
Version 49 is live with the v43 layout: orange-to-yellow header, 6 feature cards (Homework Helper, Presentations, Smart Advice, Shopping Guide, Study Helper, Creative AI), floating mic, sliding AI panel, quick links, universal search section, live weather/news widget, NavvAssistant orb, and AI Brain with local logic covering jokes, homework, presentations, fashion, study, music, movies, shopping, and general fallback.

## Requested Changes (Diff)

### Add
- 4 floating tool buttons (bottom-right): Image Generator (🖼️), Video Creator (🎥), Voice Synth (🔊), App Builder (⚙️) — each pre-fills the AI input with a prompt
- Social media search links (Twitter/X, Instagram, TikTok) in AI responses when relevant
- Smarter AI aggregation: for every answer, show source sections (Web Results, YouTube, Shopping, Social) as styled pill links
- API key placeholder config object at top of aiEngine so users can optionally add their own OpenAI/HuggingFace/Google/YouTube/Stability keys
- When image is requested, show Pollinations AI generated image inline in AI response
- Multi-source response format: main answer + source badge row (Wikipedia, DuckDuckGo, Google, YouTube, Shopping, Social)

### Modify
- `getAIResponse` in HomePage.tsx: integrate social media links + YouTube search links + better multi-source aggregation into every response
- AI panel response formatting: render source badges and link pills cleanly
- Floating buttons area: add 4 new tool buttons alongside existing floating mic

### Remove
- Nothing removed; all existing layout and features preserved

## Implementation Plan
1. Update `aiEngine.ts`: add API config placeholders, add `getYouTubeLinks()`, `getSocialLinks()`, `getShoppingLinks()` helpers that return styled link HTML
2. Update `HomePage.tsx` `getAIResponse()`: integrate new helpers, add image generation via Pollinations when image-type query detected, add multi-source link section to every response
3. Update `HomePage.tsx` JSX: add 4 floating tool buttons (Image, Video, Voice, App Builder) near the mic button, each pre-filling AI input
4. Validate and build
