# NavvGenX AI

## Current State
Version 61 is live. The app has a splash screen (shows after login), home page with NGX logo below app name, search bar that carries queries to chat via sessionStorage, Creative AI with 5-source image fallback chain, Training section with timer and AI review, and a chat page that scrolls down when answers load.

## Requested Changes (Diff)

### Add
- Training section: real countdown/countup timer with start/pause/reset, workout type selector, per-exercise advice cards shown before/during timer
- Search engine API links in AI answers (DuckDuckGo, Bing, Google search links relevant to the exact question asked)
- Chat generation effect: streaming-style text animation while answer generates, chat container stays fixed/doesn't scroll the whole page

### Modify
- Splash popup: show immediately on app open, do NOT wait for isLoggedIn — show it to everyone on first open of session
- Remove NGX logo element that appears below the app name on home page
- Home search bar: when user submits query from home page, it opens chat AND the text is already pre-filled/sent — no need to retype
- AI answers: give precise answers matching the question intent, not keyword analysis; remove automatic photo grid unless user specifically asks for images/photos; provide relevant search engine links per question
- Live news: use multiple RSS/news API sources (NewsAPI, BBC RSS via cors proxy, GNews, or similar) to show current world news correctly
- Training section: replace AI review tab with real workout timer (start/pause/reset), activity selector, and advice for each exercise type shown as cards
- Fashion section logo: change from current icon to a more professional fashion-appropriate icon (Shirt or similar from lucide)
- Creative AI image generation: improve prompt encoding so generated image matches description more closely (use detailed prompt engineering, add style modifiers)
- Chat page scroll behavior: messages container uses overflow-y: auto with fixed height, new messages appear at bottom without page-level scroll; show a pulsing "generating..." indicator while loading

### Remove
- Unnecessary photo grid shown by default on every AI answer
- NGX logo element below the "NavvGenX AI" title on home page

## Implementation Plan
1. Fix splash: change `{showSplash && isLoggedIn}` to `{showSplash}` so it shows immediately
2. Home page: find and remove the NGX logo JSX below the title h1
3. Chat scroll: wrap messages list in a fixed-height scrollable div, scroll to bottom programmatically on new messages
4. AI answer quality: rewrite `getHomePanelResponse`/`aiEngine` to use question intent detection and return precise answers; strip auto-image-grid; add search engine links row
5. Live news: replace current news fetch with RSS-over-CORS or GNews free API endpoint
6. Training page: rebuild with real timer (setInterval-based), activity picker, per-exercise advice cards, no AI review
7. Fashion icon: update More section item for Fashion to use Shirt icon
8. Creative AI: improve image prompt engineering with style/quality modifiers
9. Chat streaming effect: add char-by-char or word-by-word reveal animation on AI messages
