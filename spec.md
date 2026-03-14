# NavvGenX

## Current State
NavvGenX is a deployed AI companion web app with:
- Multi-source answer engine (Wikipedia, DuckDuckGo, REST Countries, Open Library, Wikidata, knowledge base)
- Floating Navv assistant orb + main ChatPage
- Section-specific voice intros
- Suggestion dropdown via `getSuggestions()`
- `generateAIResponse()` that stops at first valid source (no aggregation)
- Age-based content filtering

## Requested Changes (Diff)

### Add
- Multi-source answer aggregation: combine Wikipedia + DuckDuckGo + knowledge base answers into one rich response instead of stopping at first hit
- Sources panel at bottom of each answer showing which sources contributed (Wikipedia, DuckDuckGo, Countries, Books, etc.)
- Enhanced suggestion generation: pull from all knowledge base categories plus live query context to always show 6-8 highly relevant suggestions
- "Related questions" suggestions generated from the answer topic
- Answer sections: main answer paragraph, key facts list (if multiple sources found facts), images, sources

### Modify
- `getSuggestions()` — expand to generate topic-specific follow-up suggestions based on answer keywords, not just prefix matching
- `generateAIResponse()` — aggregate ALL source results, merge into comprehensive answer with sections
- NavvAssistant and ChatPage — display source badges on answers

### Remove
- Early-exit logic that returns first valid source and ignores others

## Implementation Plan
1. Rewrite `aiEngine.ts` `generateAIResponse()` to collect all source results and build a merged answer
2. Add `buildAggregatedAnswer()` helper that combines text from multiple sources with attribution
3. Enhance `getSuggestions()` to generate follow-up questions based on matched keywords
4. Update answer display in ChatPage and NavvAssistant to show source badges
5. Validate and deploy
