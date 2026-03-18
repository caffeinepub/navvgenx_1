# NavvGenX AI — Version 43

## Current State
- Full-stack AI companion app with chat, health, reminders, sections (Study/Fashion/Health/Business/Love/Career/Law)
- Floating Navv assistant orb present on all pages
- Multi-source AI answering (Wikipedia, DuckDuckGo, REST Countries, Open Library, Wikidata)
- Live weather widget (broken/unreliable) and news headlines (sometimes fails to load)
- PWA install support, 9 icon sizes, responsive design
- Age-based content restrictions, section-specific voice+text greetings
- Chat avatar uses circular 'N' logo; Navv orb shows 'Navv' word
- Profile stores age, ageGroup, interests only
- Reminders exist but no browser push notifications
- No account profile page with name/mobile/gender/photo
- No personalized welcome by name
- No Hindi language option
- No content creation (presentations/speeches/notes)
- No camera in search bar
- No shopping suggestions
- No AI image generation
- No market updates in Business section
- Home search bar does not pass query to Chat

## Requested Changes (Diff)

### Add
- **Extended Account Profile page**: After login/signup, dedicated profile setup page with name, mobile number, gender, profile photo (from camera or gallery), and language preference (English/Hindi). Profile photo appears on account page, chat avatar, and Navv orb when set.
- **Personalized welcome sound**: On home page load (once per session), speak "Hey [name], welcome to NavvGenX" using Web Speech API with user's saved name.
- **Content creation in Chat**: Detect when user asks to make a presentation, speech, homework, notes, essay, etc. Return a formatted, structured document-style answer with sections, bullet points, and proper formatting.
- **Camera/gallery in search bar**: Camera icon in the home page search bar and chat input. Opens camera or gallery to capture/select image. Show image preview in chat, respond with image-based context answer (describe what's in the image and search for related info).
- **Darker answer fonts**: All AI answer text uses a high-contrast dark color (near-black in light mode, near-white in dark mode) for maximum readability.
- **Rain forecast**: In weather widget, add precipitation probability (%), temperature, and humidity prominently displayed. Source from Open-Meteo API which already provides this data.
- **Fix live weather**: Improve reliability — use ip-api.com for location fallback if geolocation denied, then Open-Meteo for weather. Remove dependency on browser geolocation permission as blocker.
- **Fix live news headlines**: Switch news source to GNews API (free tier) or use RSS-to-JSON proxy for reliable headlines. Headlines open in a dedicated Live section/page when clicked.
- **Live section/page**: Dedicated page accessible from nav showing full live news feed, live weather details, and section-specific live updates.
- **Business section market updates**: Show live stock indices (Nifty50, Sensex, S&P500, Nasdaq) using a free finance API or scraping approach, refreshing every 60 seconds.
- **Health section working properly**: Fix health tracker data display. Add reminder notification support using browser Notification API (request permission, fire notifications at reminder time).
- **Home search passes to Chat**: When user types in home page search bar and submits, navigate to Chat page with the query pre-filled and auto-submitted.
- **Shopping suggestions**: When user asks "where to buy X" or "suggest X product", return product suggestions with name, description, and Google Shopping search link.
- **AI image generation**: When user asks to generate/create an image ("create image of sunset", "generate a picture of..."), use a free image generation API (Pollinations AI - free, no key required) to generate and display the image.
- **Navv assistant app control**: Add commands to Navv assistant — "go to [section]", "open health", "set reminder", "change theme" — which trigger actual navigation or app actions.
- **Language option (English/Hindi)**: Full app interface switches to Hindi when selected. All UI labels, nav items, section names, greetings, button text, and AI responses switch to Hindi. Stored in profile.
- **'Your AI companion' tagline in darker font**: The hero tagline on home page uses a dark, high-contrast color that fits the theme.
- **Navv assistant on all pages with full features**: Shopping, content creation, image generation, app control all work through both main chat and Navv assistant.

### Modify
- Backend Profile type: add name (Text), mobile (Text), gender (Text), language (Text), photoUrl (Text) fields
- LiveWidget: fix weather fetch, add rain probability, fix news loading
- NavvAssistant: add app control commands, image generation, content creation
- ChatPage: add camera/gallery button, content creation detection, shopping detection, image generation
- HomePage: pass search query to Chat on submit; personalized welcome by name
- HealthPage: request browser notification permission, fire notifications via Notification API
- RemindersPage: request Notification API permission on load, fire actual browser notifications
- BusinessPage (or business section): add market ticker widget

### Remove
- Nothing removed

## Implementation Plan
1. Update backend Profile type to include name, mobile, gender, language, photoUrl; add saveUserAccount and getUserAccount functions
2. Create AccountPage component with profile form (name, mobile, gender, language, photo upload via camera/gallery)
3. Create useUserAccount hook to read/write the extended profile from backend
4. Fix LiveWidget weather: use ip-api.com fallback for location, improve Open-Meteo call, add precipitation probability display
5. Fix LiveWidget news: switch to a working CORS-friendly RSS/news source
6. Create LivePage that shows full news feed and detailed weather
7. Add camera/gallery button to home search bar and chat input; handle image preview in chat
8. Add content creation detection logic in aiEngine — detect presentation/speech/notes intents and format response as structured document
9. Add AI image generation via Pollinations AI (https://image.pollinations.ai/prompt/{prompt}) — free, no API key
10. Add shopping suggestion logic in aiEngine — detect buy/product queries, return suggestions with Google Shopping links
11. Add Hindi translation map and language context; wrap all UI text in translation function
12. Implement personalized welcome sound using user's saved name
13. Wire home search bar to navigate to Chat with pre-filled query
14. Add browser Notification API support to RemindersPage
15. Add market ticker to Business section using free finance data
16. Add Navv assistant app control commands (navigate, open section, set reminder)
17. Apply darker answer fonts globally (CSS variable / class update)
18. Update profile photo to appear in chat avatar and Navv orb when set
