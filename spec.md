# NavvGenX AI

## Current State
The app is a full-featured AI companion with Home, Chat, Health, Live, Account, Creative AI, More sections. The home page has: logo area with styled 'NavvGenX' text + 'AI' subtitle, profile avatar, assistant name tag, a search bar, an AI panel, and a LiveWidget component. The More drawer shows sections with varying bright colors. The app name still reads 'NAVVURA AI' in some utility files (now fixed). The NGX logo image exists.

## Requested Changes (Diff)

### Add
- NGX abbreviation logo (new image generated) displayed ONCE at top of home screen replacing the styled text logo
- Three compact info columns on home screen: Weather card, Top News card, Business/Market card — each with distinct but theme-consistent accent color
- More content on home screen to feel professional and full-page (assistant name tag when set, date/time, quick action row)
- NavvGenX name in ALL remaining places: AgeSetup, i18n, aiEngine, etc. (already done via sed)

### Modify
- Home screen: Remove duplicate app name text. Show NGX logo image + "NavvGenX AI" wordmark ONCE only. Remove the old styled shimmer text block.
- Home screen: Show profile photo + assistant custom name (one row, below logo)
- Home screen: Add 3-column preview strip (Weather / News / Business) each ~120px tall compact cards with distinct accent borders — clicking opens Live section
- More section: Use a single consistent accent color per section (Study=blue, Fashion=pink, Love=red, Career=amber, Business=emerald, Law=purple, History=slate) — no random colors, always theme-matched
- Logo.tsx: Use the new NGX logo image already at /assets/generated/ngx-logo-transparent.dim_512x512.png
- PWA manifest: already correct with NavvGenX AI name and navvgenx-icon-512 image
- Install banner: text says 'Install NavvGenX AI'
- All greeting/response text already fixed to say NavvGenX AI

### Remove
- The old animated shimmer 'NavvGenX' + 'AI' text block from home (replaced by logo image + clean wordmark)
- Any remaining 'NAVVURA' strings (already done)
- Duplicate app name renders on home

## Implementation Plan
1. Update Logo.tsx to render the NGX image logo cleanly
2. Rewrite the HomeSection header: NGX logo image + 'NavvGenX AI' text once, profile avatar row, assistant name
3. Add WeatherPreviewCard, NewsPreviewCard, MarketPreviewCard as compact 3-column strip using existing useWeather and useNews hooks
4. Update More section section colors to a fixed per-section palette
5. Ensure no overlapping elements — use proper gap/padding throughout
6. Keep all other sections (Chat, Health, etc.) unchanged functionally
