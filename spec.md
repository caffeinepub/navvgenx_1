# NavvGenX

## Current State
ChatPage and NavvAssistant render AI responses as text, wiki cards, image grids, and quick links. No special handling for URLs (YouTube, social media, or general websites) pasted or returned in messages.

## Requested Changes (Diff)

### Add
- URL detection utility: scans message text for any URLs (YouTube, other video sites, social media, general websites)
- `LinkEmbed` component:
  - YouTube: renders embedded iframe player
  - Other URLs: renders a styled link preview card with icon, domain name, and clickable link to open in new tab
- Auto-detect URLs in both ChatPage message bubbles and NavvAssistant message bubbles, and render LinkEmbed below the message text

### Modify
- ChatPage.tsx: after rendering message text/wiki card, scan message content for URLs and render LinkEmbed components
- NavvAssistant.tsx: same — detect URLs in Navv message text and render embedded link cards

### Remove
- Nothing removed

## Implementation Plan
1. Create `src/frontend/src/utils/linkUtils.ts` — URL detection and YouTube ID extraction helpers
2. Create `src/frontend/src/components/LinkEmbed.tsx` — renders YouTube iframe or generic link card
3. Update `ChatPage.tsx` — integrate LinkEmbed into AI message rendering
4. Update `NavvAssistant.tsx` — integrate LinkEmbed into Navv message rendering
