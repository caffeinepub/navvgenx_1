# NavvGenX AI

## Current State
A premium AI companion app (Version 43) with chat, sections (Study, Fashion, Health, Law, Career, Business, Love, Live), floating Navv assistant, account page, live weather, news feed, reminders, content creation, and PWA support. Multiple issues reported.

## Requested Changes (Diff)

### Add
- Multi-engine search links (Bing, DuckDuckGo, Yahoo, Startpage, Yandex) embedded in NavvGenX style inside search results — no foreign styling, fully NavvGenX-branded
- Onboarding page immediately after first sign-in/sign-up: collect name, mobile, gender, age (manual text input), profile photo (camera/gallery), language (English/Hindi)
- Full Hindi language mode: when Hindi selected, ALL UI text, section labels, greetings, nav items, buttons translate to Hindi (except app name "NavvGenX AI"); AI answers in Hindi
- Personalized home greeting sound: "Hello [name], welcome to NavvGenX" using speech synthesis with correct pronunciation
- Speech synthesis fix: "NavvGenX" pronounced as "Nav Gen X" (spelled phonetically for SpeechSynthesis)
- Section greeting fix: use phonetic "Nav Gen X" in all spoken greetings

### Modify
- **Live news fix**: Replace BBC RSS (blocked by CORS) with a working news source — use multiple CORS-friendly APIs: NewsAPI.org free tier (https://newsdata.io free), GNews API, or fallback to curated static headlines with links to real news sites. Primary: use https://api.rss2json.com/v1/api.json?rss_url=https://feeds.bbci.co.uk/news/rss.xml as proxy for BBC RSS
- **Reminders fix**: Use browser Notification API with setInterval checking; request permission on reminder creation; show reminder notification at correct time; store reminders in localStorage
- **Presentation creation fix**: When user asks "make a presentation on X", generate a proper multi-slide formatted HTML presentation output with title slide, content slides, conclusion — rendered inline as styled cards
- **Navv assistant answers**: Improve answer routing — for study/how-to questions give specific actionable advice; for "how can I study" give proper study tips, not unrelated content
- **Mobile More section**: Section buttons in mobile "More" drawer should use bright, visible colors (gold, teal, coral, purple) for text/icons so they're readable on dark navy background
- **Install logo fix**: Update PWA manifest icons to use `purpose: "any maskable"` and generate a properly padded icon with safe zone so it doesn't appear compressed on mobile home screens
- **Home search → Chat**: Typing in home search bar and pressing Enter navigates to Chat with query pre-filled and auto-searches
- Improve mobile responsiveness across all pages — larger touch targets, better spacing, readable text

### Remove
- Nothing removed

## Implementation Plan
1. Fix news feed in LiveWidget.tsx — use rss2json proxy API instead of direct BBC RSS
2. Fix reminders in RemindersPage.tsx — proper Notification API integration with localStorage persistence
3. Fix Navv assistant answer logic in NavvAssistant.tsx — better routing for study/how-to/general questions
4. Fix speech synthesis pronunciation — replace "NavvGenX" with phonetic "Nav Gen X" everywhere speech is used
5. Fix personalized greeting in App.tsx/HomePage.tsx — say "Hello [name], welcome to Nav Gen X"
6. Add multi-engine search links in ChatPage.tsx results — NavvGenX styled chips for Bing, DuckDuckGo, Yahoo, Startpage, Yandex
7. Add onboarding flow in App.tsx — detect first login, show AccountSetup page before home
8. Add Hindi language context — translate all UI strings based on language preference stored in localStorage
9. Fix mobile More section colors — use distinct bright colors per section
10. Fix PWA manifest — add maskable icons with proper padding
11. Fix presentation creation — generate proper slide-style output
12. Improve overall mobile layout — safe areas, touch targets, readable fonts
