# NavvGenX

## Current State
NavvGenX is a full-stack AI companion app with Chat, Health, Reminders, and Home pages. It has voice greeting on load, Wikipedia knowledge panels, Unsplash images, and text-to-speech for answers.

## Requested Changes (Diff)

### Add
- A floating virtual AI assistant widget ("Navv") visible on all pages, inspired by Gemini/ChatGPT assistant bubbles
- When the assistant opens/activates, it plays a voice greeting: "I am Navv, how can I help you?"
- The assistant has a chat interface where the user can type or speak, and Navv responds with text + voice (TTS)
- The assistant has an animated avatar/orb that pulses when speaking
- The widget is a floating button (bottom-right) that expands into a full assistant panel

### Modify
- App.tsx: import and render the new NavvAssistant component globally

### Remove
- Nothing removed

## Implementation Plan
1. Create `src/frontend/src/components/NavvAssistant.tsx` — floating button + expanded chat panel with:
   - Open/close toggle with animated orb button
   - On open: speak "I am Navv, how can I help you?"
   - Chat input (text + voice via Web Speech API)
   - AI response logic (reusing existing answer/knowledge base patterns from ChatPage)
   - TTS playback of every response
   - Animated waveform/pulse when speaking
2. Wire NavvAssistant into App.tsx (render at root level)
