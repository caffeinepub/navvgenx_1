# NAVVURA AI

## Current State
The app is currently named NavvGenX AI. It has a unified layout with a home page, chat, health, live, account, history sections and a floating Navv assistant. The home page contains a search bar, "What can I help you with" prompt section, quick links grid, universal search section, and floating mic/tool buttons. The app supports Hindi/English language toggle in account settings. The AI assistant orb shows "Navv" text.

## Requested Changes (Diff)

### Add
- NAVVURA AI branding everywhere (name, logo, sound, manifest, page title)
- New professional NAVVURA AI logo on home page (from /assets/generated/navvura-logo-full.dim_600x200.png) with animated effects (subtle glow/shimmer) visible in both dark and light themes
- New app icon (from /assets/generated/navvura-icon-512.dim_512x512.png) as PWA icon - also used as 72/96/128/144/152/180/192/384/512 icons in manifest
- AI assistant orb label dynamically shows user's custom name (from account settings) instead of static "Navv"
- When AI assistant cannot answer, it suggests a specific section (e.g. "The Health section can help you with this" / "The Study section has resources for this") and navigates there if user agrees
- Edit button on sent messages in chat - allows user to edit their question and re-send
- Image upload in chat: user can attach an image, then type a question about it; AI interprets the image context
- Creative AI section fully functional: image generation (Pollinations AI), video search links (YouTube), voice synthesis (Web Speech API), app builder template output
- Section suggestion symbols (professional icons from Lucide) next to section recommendations
- Professional dark/light theme with Space Grotesk font, minimal expensive colors

### Modify
- Home page: Remove "What can I help you with" text, quick links grid, universal search section, floating mic button, floating tool buttons. Keep only: NAVVURA AI logo at top with effect, feature section cards, AI assistant orb
- Move quick links, universal search, and "What can I help" section to ChatPage/SearchPage
- Account page: Remove Hindi language option - English only
- Welcome sound: Change spoken text from "Welcome to NavvGenX" to "Welcome to NAVVURA AI" (clear pronunciation)
- Section greeting: Change from "I am NavvGenX, your [expert]" to "I am NAVVURA AI, your [expert]" (or user's custom name)
- All localStorage keys: replace navvgenx- prefix with navvura-
- All text references "NavvGenX" → "NAVVURA AI" or "NAVVURA"
- Logo component: render NAVVURA AI logo image instead of NavvGenX text
- Manifest: update name, short_name, icons to NAVVURA AI
- Page title: NAVVURA AI
- Less emoji throughout - replace decorative emojis with Lucide icons or remove entirely; keep only functional ones
- AI response text: professional tone, fewer emojis in responses
- CSS class names that say navvgenx-* can keep internal names but displayed text updates
- App link/URL title shows NAVVURA AI

### Remove
- Hindi language toggle in Account settings
- Hindi translations in i18n.ts / all Hindi text
- "What can I help you with" heading on home page
- Quick links section from home page
- Universal search section from home page
- Floating mic button from home page (keep it inside chat page only)
- Floating tool buttons (Image, Video, Voice, App Builder) from home page floating position - move them inside Creative AI section or Chat page
- All NavvGenX references in user-visible text

## Implementation Plan
1. Update manifest.json: name → "NAVVURA AI", short_name → "NAVVURA", all icon paths → navvura-icon-512.dim_512x512.png (use same file for all sizes)
2. Update index.css: rename gradient text class display names if needed, update font imports to ensure Space Grotesk is loaded from Google Fonts
3. Update Logo.tsx: display /assets/generated/navvura-logo-full.dim_600x200.png with animated shimmer/glow effect
4. Update App.tsx:
   - Replace all "NavvGenX" user-visible strings with "NAVVURA AI"
   - Replace localStorage keys navvgenx-* with navvura-*
   - Home page section: remove quickLinks render, remove universalSearch render, remove "What can I help you with" heading, remove floating mic button JSX, remove floating tool buttons JSX
   - Add NAVVURA AI logo (Logo component) at top of home with animated glow effects
   - Move quickLinks and universal search JSX into ChatPage and/or SearchPage
   - Update welcome sound to say "Welcome to NAVVURA AI"
   - Remove all Hindi-related code and i18n language toggle
   - Reduce emojis throughout - replace with icons
5. Update NavvAssistant.tsx:
   - Orb label: read assistantName from localStorage (navvura-account key), display that name
   - When AI cannot provide a good answer: detect low-confidence responses, add section suggestion logic that maps question topics to sections, display "The [Section] section can help with this" with a navigation button
6. Update ChatPage.tsx:
   - Add edit button to user messages (pencil icon on hover)
   - Add image attachment button in input area; when image attached, prepend image context to AI query
   - Move quick links and universal search here
   - Keep floating mic button here
7. Update AccountPage.tsx: remove language preference field (English only)
8. Update aiEngine.ts: update any NavvGenX branding in response strings to NAVVURA AI; reduce emoji usage
9. Update i18n.ts: English only, remove Hindi translations
10. Generate additional icon sizes or reference the 512 icon for all PWA sizes
