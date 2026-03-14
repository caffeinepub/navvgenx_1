# NavvGenX

## Current State
NavvGenX is a live AI companion app with a Chat page (using `aiEngine.ts` for AI responses) and a floating Navv assistant (`NavvAssistant.tsx` with `getNavvAnswer()`). Both currently give informational/factual answers but lack warm, human-friendly conversational tone and everyday life advice.

## Requested Changes (Diff)

### Add
- Friendly, human conversational openers/closers in both Navv and Chat responses (e.g. "Hey, good question!", "Honestly...", "Here's what I'd tell a friend:", "Hope that helps!", etc.)
- Everyday life advice category covering: relationships, stress, money, career, parenting, motivation, productivity, loneliness, self-confidence, daily habits, work-life balance, morning routines
- Friendly follow-up prompts at the end of answers (e.g. "Want me to go deeper on this?", "Let me know if you have follow-up questions!")
- Natural casual greetings/small-talk handling ("I'm bored", "I need help", "I'm stressed", "I'm sad", "I'm happy")

### Modify
- `src/frontend/src/utils/aiEngine.ts`: Wrap all `generateAIResponse` responses with friendly human-like tone. Add everyday advice topics. Add warm openers and follow-up closers.
- `src/frontend/src/components/NavvAssistant.tsx`: Update `getNavvAnswer()` to use the same friendly tone. Add everyday life advice topics. Add warm closers.

### Remove
- Nothing removed

## Implementation Plan
1. Create a shared `friendlyTone.ts` utility with: friendly openers array, friendly closers array, `wrapWithFriendlyTone(answer, query)` helper that picks a natural opener + closer
2. Update `aiEngine.ts` `generateAIResponse` to use `wrapWithFriendlyTone` on all responses, and add everyday life advice topics
3. Update `NavvAssistant.tsx` `getNavvAnswer()` to call the same helper and add everyday advice topics
