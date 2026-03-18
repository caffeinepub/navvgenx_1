# NavvGenX AI

## Current State
Version 43 codebase with: login, onboarding (AgeSetup), account page, chat with multi-source AI, live widget (weather + news), reminders, health, sections with greetings, Navv floating assistant, dark/light mode, PWA, Hindi i18n.

## Requested Changes (Diff)

### Add
- **History page**: New `HistoryPage.tsx` showing combined chat + search query history stored in localStorage. Add `history` nav item with a clock icon.
- **Onboarding flow after sign-in**: After first login, show a full-screen onboarding modal/page (same fields as AccountPage: name, mobile, gender, age, language, photo). Store `navvgenx-onboarded` flag in localStorage. Skip if already completed.
- **Reminder fixes**: Change reminder interval check from 60s to 30s. Track fired reminders using a `Set` keyed by `id+time+date` stored in sessionStorage to avoid double-firing. Add toast + browser notification both.
- **Presentation generation**: In the AI engine and chat, detect presentation/speech/homework/notes keywords and return rich structured HTML slide cards styled in navy/gold.
- **Navv study answer fix**: Improve keyword routing in NavvAssistant to properly detect study/how to study/learning questions and return detailed study tips.
- **Mobile More section colors**: Each item in the More drawer gets a unique bright color: Study=blue, Love=pink, Fashion=purple, Health=green, Career=orange, Business=teal, Search=indigo, Live=red, Account=gold.
- **Mobile layout fixes**: Ensure all text fits on small screens. Add `text-sm` caps, `truncate`/`break-words`, safe-area insets (`pb-safe`), and proper scroll areas so nothing is hidden behind the bottom nav bar.
- **Speech pronunciation fix**: Replace all `NavvGenX` speech text with `Nav Gen X` using a helper function. Add a small delay (300ms) before speaking the welcome greeting to ensure voices are loaded.
- **Personalized greeting with name**: Read `navvgenx-account` from localStorage, extract name, build greeting "Hello [name], welcome to Nav Gen X" and speak it. Play once per session using `sessionStorage` flag.
- **PWA icon fix**: Add `purpose: "any maskable"` to manifest icons and use `contain` background in manifest `background_color` so logo is not compressed on mobile home screen.

### Modify
- **useNews.ts**: Add more fallback RSS sources (Reuters, India Today, Hindu) via a fallback chain. If all fail, return curated static fallback articles so the widget never shows "could not load" error.
- **RemindersPage.tsx**: Change interval from 60s to 30s. Track fired reminders in sessionStorage. Auto-request notification permission on mount.
- **App.tsx**: Add history nav item and page routing. Add onboarding modal after login. Fix mobile bottom nav More drawer section colors. Fix speech greeting to use name from account.
- **NavvAssistant.tsx**: Fix study question routing. Add presentation/speech/notes generation logic.

### Remove
- Nothing removed

## Implementation Plan
1. Fix `useNews.ts` with multi-fallback chain and static fallback articles
2. Fix `RemindersPage.tsx` with 30s interval, sessionStorage dedup, auto-permission
3. Create `HistoryPage.tsx` with localStorage-based history
4. Create `OnboardingModal.tsx` full-screen first-time setup
5. Update `App.tsx`: add history route, onboarding modal trigger, fix More drawer colors, fix speech greeting with name + delay
6. Fix presentation/study answers in AI engine and NavvAssistant
7. Fix PWA manifest icons with maskable
8. Ensure full mobile responsiveness across all pages
