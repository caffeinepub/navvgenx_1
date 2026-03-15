import { wrapFriendly } from "./friendlyTone";
import {
  fetchGoogleStyleAnswer,
  isCountryQuestion,
} from "./googleAnswerEngine";

export interface SearchResult {
  title: string;
  snippet: string;
  url: string;
}

export interface ImageResult {
  url: string;
  alt: string;
  searchUrl: string;
}

export interface WikiCard {
  title: string;
  extract: string;
  thumbnail?: string;
  url: string;
}

export interface AIResponse {
  text: string;
  searchResults?: SearchResult[];
  imageResults?: ImageResult[];
  isSearch?: boolean;
  suggestions?: string[];
  wikiCard?: WikiCard;
  quickLinks?: { google: string; chatgpt: string };
  sources?: string[];
}

// ─────────────────── Suggestion Generator ───────────────────
const suggestionMap: Record<string, string[]> = {
  health: [
    "How to improve sleep quality naturally",
    "Best foods for boosting immunity",
    "Daily exercise routine for beginners",
    "How to manage stress and anxiety",
    "Benefits of drinking more water",
    "How to lose weight healthily",
    "Best vitamins and supplements to take",
    "Signs of burnout and how to recover",
  ],
  love: [
    "How to build a strong relationship",
    "Signs someone likes you",
    "How to get over a breakup",
    "Tips for long distance relationships",
    "How to improve communication with partner",
    "First date ideas that impress",
    "How to know if you are in love",
    "Ways to show someone you care",
  ],
  study: [
    "Best study techniques for exams",
    "How to improve memory and focus",
    "Pomodoro technique explained",
    "How to take better notes in class",
    "Study schedule template for students",
    "How to stop procrastinating while studying",
    "Best apps for studying and productivity",
    "How to write a good essay fast",
  ],
  career: [
    "How to write a standout resume",
    "Best questions to ask in a job interview",
    "How to negotiate a higher salary",
    "Skills to learn for better career growth",
    "How to get promoted at work",
    "Best side hustles to start in 2026",
    "How to switch careers successfully",
    "Networking tips for introverts",
  ],
  fashion: [
    "Old money outfit ideas for women",
    "Old money aesthetic wardrobe essentials",
    "How to dress quiet luxury style",
    "Dark academia outfit ideas",
    "Y2K fashion outfit ideas",
    "How to build a capsule wardrobe",
    "Best outfit combinations for work",
    "Trending fashion styles in 2026",
    "How to dress for your body type",
    "Cottagecore outfit ideas",
    "Preppy style essentials",
    "Bohemian boho outfit ideas",
    "Streetwear outfit ideas for men",
    "How to style casual outfits to look expensive",
    "Best colour combinations for clothing",
    "Minimalist wardrobe essentials",
  ],
  business: [
    "How to start a business with no money",
    "Best business ideas for 2026",
    "How to write a business plan",
    "Marketing strategies for small businesses",
    "How to get your first clients",
    "Best books for entrepreneurs",
    "How to scale a business fast",
    "Tips for managing business finances",
  ],
  general: [
    "What is artificial intelligence",
    "How does the human brain work",
    "History of ancient civilisations",
    "How to learn any skill faster",
    "What causes climate change",
    "How does the internet work",
    "Best countries to visit in 2026",
    "How to think more creatively",
  ],
  search: [
    "Latest technology trends 2026",
    "Best movies to watch this year",
    "How to invest money wisely",
    "Space exploration discoveries",
    "Healthiest foods in the world",
    "Most spoken languages globally",
    "Future of electric vehicles",
    "World records broken in 2026",
  ],
};

export function getSuggestions(query: string, category = "general"): string[] {
  const q = query.toLowerCase().trim();
  if (q.length < 2) return [];

  const pool = [...(suggestionMap[category] || []), ...suggestionMap.general];

  // Filter suggestions that match the typed query
  const matched = pool.filter(
    (s) =>
      s.toLowerCase().includes(q) ||
      q
        .split(" ")
        .some((word) => word.length > 3 && s.toLowerCase().includes(word)),
  );

  // Generate dynamic query-based completions for any input
  const queryWords = q.split(" ").filter((w) => w.length > 1);
  const dynamic: string[] = [];

  // Question type completions
  if (/^what/.test(q)) {
    dynamic.push(
      `What is ${q.replace(/^what\s*(is|are)?\s*/i, "") || "artificial intelligence"}`,
      `What are the benefits of ${q.replace(/^what\s*(is|are)?\s*/i, "") || "meditation"}`,
      `What causes ${q.replace(/^what\s*(is|are)?\s*/i, "") || "stress"}`,
    );
  } else if (/^who/.test(q)) {
    dynamic.push(
      `Who is ${q.replace(/^who\s*(is|was)?\s*/i, "") || "Elon Musk"}`,
      `Who invented ${q.replace(/^who\s*(invented|created|founded)?\s*/i, "") || "the internet"}`,
    );
  } else if (/^how/.test(q)) {
    dynamic.push(
      `How to ${q.replace(/^how\s*(to|do|does|can|do\s+i)?\s*/i, "") || "learn faster"}`,
      `How does ${q.replace(/^how\s*(does|do|to)?\s*/i, "") || "the brain work"}`,
    );
  } else if (/^why/.test(q)) {
    dynamic.push(
      `Why is ${q.replace(/^why\s*(is|are|does|do)?\s*/i, "") || "sleep important"}`,
      `Why does ${q.replace(/^why\s*(does|do|is)?\s*/i, "") || "stress happen"}`,
    );
  } else {
    // For any other partial input, generate contextual completions
    dynamic.push(
      `What is ${q}`,
      `How to ${q}`,
      `${q} tips and tricks`,
      `Best ${q} guide`,
      `${q} for beginners`,
      `Why ${q} matters`,
    );
  }

  // Add category-specific dynamic suggestions
  if (category === "fashion" || /fashion|outfit|style|wear|dress/.test(q)) {
    dynamic.push(`${q} outfit ideas`, `${q} style guide`, `${q} aesthetic`);
  }
  if (category === "health" || /health|fitness|exercise|diet|sleep/.test(q)) {
    dynamic.push(`${q} health benefits`, `${q} for beginners`, `${q} tips`);
  }
  if (category === "career" || /career|job|work|salary|interview/.test(q)) {
    dynamic.push(`${q} career advice`, `${q} salary guide`, `${q} skills`);
  }

  // Suppress unused variable warning
  void queryWords;

  const allSuggestions = [
    ...matched,
    ...dynamic.filter((s) => s.toLowerCase() !== q && s.length > q.length),
  ];
  return [...new Set(allSuggestions)].slice(0, 8);
}

// ─────────────────── Image Search Helper ───────────────────
export function getImageResults(query: string): ImageResult[] {
  const cleanQuery = query.replace(/^search[:\s]*/i, "").trim();
  const lower = cleanQuery.toLowerCase();
  const googleImagesUrl = `https://www.google.com/search?q=${encodeURIComponent(cleanQuery)}&tbm=isch`;

  const getKeywords = (q: string): string[] => {
    if (/old money|old-money/.test(q))
      return [
        "old money fashion",
        "preppy elegant style",
        "classic menswear",
        "ivy league style",
      ];
    if (/quiet luxury|stealth wealth/.test(q))
      return [
        "quiet luxury fashion",
        "minimalist luxury style",
        "neutral tones fashion",
        "designer minimal outfit",
      ];
    if (/dark academia/.test(q))
      return [
        "dark academia fashion",
        "tweed blazer bookish",
        "vintage intellectual style",
        "academia aesthetic",
      ];
    if (/streetwear|street wear/.test(q))
      return [
        "streetwear fashion",
        "urban street style",
        "hypebeast outfit",
        "sneaker culture fashion",
      ];
    if (/cottagecore/.test(q))
      return [
        "cottagecore aesthetic",
        "floral cottage dress",
        "cottage garden fashion",
        "whimsical nature style",
      ];
    if (/y2k/.test(q))
      return [
        "y2k fashion",
        "2000s style outfit",
        "y2k aesthetic clothing",
        "millennium fashion",
      ];
    if (/fashion|outfit|style|clothing|dress|wear/.test(q))
      return [
        `${cleanQuery} fashion`,
        `${cleanQuery} outfit`,
        `${cleanQuery} style clothing`,
        `${cleanQuery} look`,
      ];
    if (/workout|exercise|gym|fitness|yoga/.test(q))
      return [
        `${cleanQuery}`,
        "fitness workout gym",
        "exercise training",
        "healthy active lifestyle",
      ];
    if (/food|diet|nutrition|meal|recipe|eat/.test(q))
      return [
        `${cleanQuery} food`,
        `${cleanQuery} meal`,
        "healthy food nutrition",
        "gourmet meal",
      ];
    if (/health|wellness|mental health|meditation/.test(q))
      return [
        `${cleanQuery}`,
        "wellness healthy lifestyle",
        "mindfulness calm",
        "healthy living",
      ];
    if (/travel|trip|destination|vacation|tour/.test(q))
      return [
        `${cleanQuery} travel`,
        `${cleanQuery} landscape`,
        `${cleanQuery} tourism`,
        "travel destination scenic",
      ];
    if (/nature|forest|mountain|ocean|beach|sky/.test(q))
      return [
        `${cleanQuery} nature`,
        `${cleanQuery} landscape`,
        "scenic nature photography",
        `${cleanQuery} outdoor`,
      ];
    if (
      /artificial intelligence|ai|machine learning|technology|tech|robot|computer/.test(
        q,
      )
    )
      return [
        "artificial intelligence technology",
        "futuristic technology digital",
        "ai robot computer",
        "tech innovation digital",
      ];
    if (/space|galaxy|universe|planet|star|nasa/.test(q))
      return [
        `${cleanQuery} space`,
        "galaxy stars universe",
        "space exploration nasa",
        "cosmos nebula",
      ];
    if (/business|startup|entrepreneur|company|career|work/.test(q))
      return [
        `${cleanQuery}`,
        "business professional office",
        "entrepreneur startup success",
        "career professional growth",
      ];
    const words = q.split(/\s+/).filter((w) => w.length > 3);
    const main = words.slice(0, 3).join(" ") || q;
    return [
      cleanQuery,
      main,
      `${words[0] || q} ${words[1] || ""}`.trim(),
      `${cleanQuery} background`,
    ];
  };

  const keywords = getKeywords(lower);

  return keywords.map((kw, i) => ({
    url: `https://source.unsplash.com/400x300/?${encodeURIComponent(kw)}&sig=${i + Math.floor(Math.random() * 1000)}`,
    alt: `${cleanQuery} image ${i + 1}`,
    searchUrl: googleImagesUrl,
  }));
}

// ─────────────────── Wikipedia API ───────────────────
export async function fetchWikipediaAnswer(
  query: string,
): Promise<WikiCard | null> {
  try {
    const cleanQuery = query
      .replace(
        /^(what is|what are|who is|who was|how does|how do|explain|tell me about|define|describe|why is|why does|when did|where is|what does|give me info on|give information about|information about|facts about|history of|science of)\s+/i,
        "",
      )
      .replace(/\?+$/, "")
      .trim();

    const queriesToTry = [cleanQuery, query.replace(/\?+$/, "").trim()].filter(
      (q, i, arr) => arr.indexOf(q) === i,
    );

    for (const q of queriesToTry) {
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(q)}&limit=3&format=json&origin=*`;
      const searchRes = await fetch(searchUrl);
      const searchData = await searchRes.json();
      const titles: string[] = searchData[1];
      if (!titles || titles.length === 0) continue;

      for (const title of titles) {
        const summaryRes = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
        );
        if (!summaryRes.ok) continue;
        const summary = await summaryRes.json();
        const extract = summary.extract || "";
        if (extract.length > 80) {
          return {
            title: summary.title || title,
            extract,
            thumbnail: summary.thumbnail?.source,
            url:
              summary.content_urls?.desktop?.page ||
              `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
          };
        }
      }
    }
    return null;
  } catch {
    return null;
  }
}

// ─────────────────── DuckDuckGo Instant Answer ───────────────────
export async function fetchDuckDuckGoAnswer(query: string): Promise<{
  abstract: string;
  abstractSource: string;
  abstractURL: string;
  relatedTopics: string[];
  answer: string;
  answerType: string;
} | null> {
  try {
    const cleanQuery = query.replace(/\?+$/, "").trim();
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(cleanQuery)}&format=json&no_html=1&skip_disambig=1&no_redirect=1`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();

    const abstractText = data.AbstractText || "";
    const answer = data.Answer || "";
    const relatedTopics: string[] = (data.RelatedTopics || [])
      .slice(0, 4)
      .map((t: { Text?: string }) => t.Text || "")
      .filter(Boolean);

    if (abstractText.length > 50 || answer.length > 10) {
      return {
        abstract: abstractText,
        abstractSource: data.AbstractSource || "",
        abstractURL: data.AbstractURL || "",
        relatedTopics,
        answer,
        answerType: data.AnswerType || "",
      };
    }
    return null;
  } catch {
    return null;
  }
}

// ─────────────────── Google News RSS Snippet ───────────────────
export async function fetchGoogleNewsSnippet(
  query: string,
): Promise<{ title: string; snippet: string; url: string }[] | null> {
  try {
    const rssFeedUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
    const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssFeedUrl)}&count=3`;
    const res = await fetch(proxyUrl);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.items || data.items.length === 0) return null;
    return data.items
      .slice(0, 3)
      .map((item: { title: string; description: string; link: string }) => ({
        title: item.title || "",
        snippet: item.description?.replace(/<[^>]+>/g, "").slice(0, 200) || "",
        url: item.link || "",
      }));
  } catch {
    return null;
  }
}

// ─────────────────── Unsplash Images ───────────────────
export function getUnsplashImages(query: string): ImageResult[] {
  const cleanQuery = query.replace(/^search[:\s]*/i, "").trim();
  const lower = cleanQuery.toLowerCase();
  const googleImagesUrl = `https://www.google.com/search?q=${encodeURIComponent(cleanQuery)}&tbm=isch`;

  const getTopicKeywords = (q: string): string[] => {
    if (/old money|old-money/.test(q))
      return [
        "old money fashion",
        "preppy classic style",
        "ivy league menswear",
      ];
    if (/quiet luxury|stealth wealth/.test(q))
      return [
        "quiet luxury fashion",
        "minimalist designer style",
        "neutral luxury outfit",
      ];
    if (/dark academia/.test(q))
      return [
        "dark academia aesthetic",
        "vintage academic style",
        "tweed bookish fashion",
      ];
    if (/streetwear|street wear/.test(q))
      return [
        "streetwear urban style",
        "hypebeast sneaker outfit",
        "street fashion culture",
      ];
    if (/fashion|outfit|style|clothing|dress|wear/.test(q))
      return [
        `${cleanQuery} fashion`,
        `${cleanQuery} outfit look`,
        `${cleanQuery} style`,
      ];
    if (/food|recipe|meal|eat|cook/.test(q))
      return [
        `${cleanQuery} food`,
        `${cleanQuery} dish`,
        `${cleanQuery} cuisine`,
      ];
    if (/travel|trip|destination|vacation/.test(q))
      return [
        `${cleanQuery} travel scenery`,
        `${cleanQuery} landmark`,
        `${cleanQuery} tourism`,
      ];
    if (/nature|landscape|outdoor|forest|mountain|beach/.test(q))
      return [
        `${cleanQuery} landscape`,
        `${cleanQuery} nature scenery`,
        `${cleanQuery} outdoor`,
      ];
    if (/space|galaxy|cosmos|planet|star/.test(q))
      return [
        `${cleanQuery} astronomy`,
        "galaxy nebula cosmos",
        "space stars universe",
      ];
    if (/tech|technology|ai|computer|digital/.test(q))
      return [
        "technology futuristic digital",
        `${cleanQuery} tech`,
        "innovation digital abstract",
      ];
    if (/health|fitness|workout|gym|yoga|wellness/.test(q))
      return [
        `${cleanQuery}`,
        "fitness healthy lifestyle",
        "wellness active life",
      ];
    const words = q.split(/\s+/).filter((w) => w.length > 2);
    return [
      cleanQuery,
      words.slice(0, 2).join(" ") || cleanQuery,
      `${words[0] || cleanQuery} photography`,
    ];
  };

  const keywords = getTopicKeywords(lower);
  return keywords.map((kw, i) => ({
    url: `https://source.unsplash.com/400x300/?${encodeURIComponent(kw)}&sig=${i + Math.floor(Math.random() * 1000)}`,
    alt: `${cleanQuery} image ${i + 1}`,
    searchUrl: googleImagesUrl,
  }));
}

// ─────────────────── Voice / TTS ───────────────────
export function speakText(text: string, onEnd?: () => void): void {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  // Strip markdown-like formatting
  const clean = text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/#+\s/g, "")
    .replace(/•/g, "")
    .replace(/\n\n/g, ". ")
    .replace(/\n/g, ". ")
    .slice(0, 500); // Limit for usability
  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.lang = "en-US";
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  // Pick a good voice if available
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(
    (v) =>
      v.lang === "en-US" &&
      (v.name.includes("Google") ||
        v.name.includes("Samantha") ||
        v.name.includes("Daniel")),
  );
  if (preferred) utterance.voice = preferred;
  if (onEnd) utterance.onend = onEnd;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  window.speechSynthesis?.cancel();
}

// ─────────────────── Greeting / small-talk patterns ───────────────────
const greetingPatterns: { pattern: RegExp; response: string }[] = [
  {
    pattern: /how are you|how r u|how's it going|how are things|how do you do/i,
    response:
      "I'm doing great, thanks for asking! Ready to help you with anything — questions, research, advice, or just a chat. How can I help you today?",
  },
  {
    pattern: /^(hello|hi|hey|sup|what's up|whats up|yo)\b/i,
    response:
      "Hello! Welcome to NavvGenX. I'm your AI companion — ask me anything from science and history to life advice or just have a conversation. What would you like to explore?",
  },
  {
    pattern: /good morning/i,
    response:
      "Good morning! Hope your day is off to a great start. I'm here to help — feel free to ask me anything you'd like to know or talk about.",
  },
  {
    pattern: /good afternoon/i,
    response:
      "Good afternoon! I'm NavvGenX, your AI companion. Whether you need information, advice, or just someone to talk to, I've got you covered.",
  },
  {
    pattern: /good evening|good night/i,
    response:
      "Good evening! I'm available around the clock. What's on your mind tonight — a question, some research, or maybe career or health advice?",
  },
  {
    pattern: /what('s| is) your name|who are you|what are you/i,
    response:
      "I'm NavvGenX AI — a smart assistant inspired by the best of ChatGPT and Google Search. I can answer general knowledge questions, search any topic, give personal advice on health, career, love, and more, or just have a casual conversation with you!",
  },
  {
    pattern: /thank(s| you)|much appreciated/i,
    response:
      "You're very welcome! I'm always happy to help. Is there anything else you'd like to know or explore?",
  },
  {
    pattern: /^(bye|goodbye|see you|cya|take care|later)\b/i,
    response:
      "Goodbye! It was great chatting with you. Come back anytime you have a question or just want to talk. Take care!",
  },
  {
    pattern: /what can you do|what do you know|help me|your capabilities/i,
    response:
      "Great question! Here's what I can do:\n\n• **General Knowledge** — Science, history, tech, math, geography, culture, and more\n• **Search Mode** — Type 'search [topic]' for web-style results with images\n• **Suggestions** — Start typing and I'll suggest ideas to explore\n• **Voice Assistant** — I can speak my answers aloud\n• **Personal Advice** — Health, love, career, study, fashion, and business guidance\n• **Casual Chat** — Greetings, small talk, and everyday conversations\n\nJust type anything — I'll give you a helpful, detailed answer!",
  },
  {
    pattern: /are you (real|human|a robot|an ai|a bot)/i,
    response:
      "I'm an AI — NavvGenX AI to be precise. I'm not human, but I'm designed to be helpful, knowledgeable, and conversational. I can answer your questions, have a real discussion, or help you find information on virtually any topic.",
  },
];

// ─────────────────── Knowledge base ───────────────────
const knowledgeBase: { keywords: RegExp; response: string }[] = [
  // FASHION AESTHETICS — OLD MONEY
  {
    keywords:
      /\b(old money|old money outfit|old money aesthetic|old money style|old money fashion|old money look|old money clothing|inherited wealth style|aristocratic style|prep school style|ivy league style)\b/i,
    response:
      "The **old money aesthetic** is rooted in understated, inherited wealth — the style of old European aristocracy and East Coast American prep schools. It communicates privilege through quality and restraint, not logos or flashiness.\n\n**Key characteristics:**\n• **Neutral, muted palette** — ivory, cream, camel, navy, forest green, burgundy, chocolate brown, grey\n• **Timeless silhouettes** — nothing trendy, everything classic and enduring\n• **Exceptional fabrics** — cashmere, merino wool, fine linen, silk, Harris Tweed\n• **Minimal branding** — no visible logos; the quality speaks for itself\n\n**Essential pieces:**\n• Tailored blazers (navy, camel, plaid) — the cornerstone of the look\n• Oxford button-down shirts in white or light blue\n• Cable-knit and argyle sweaters, cardigans\n• High-waisted wide-leg or pleated trousers\n• Knee-length A-line or pleated skirts\n• Polo shirts (Ralph Lauren, Lacoste)\n• Loafers — especially penny loafers and horsebit loafers (Gucci style)\n• Ballet flats, boat shoes (Sperry), Oxford shoes\n• Structured handbags — saddle bags, top-handle bags\n• Trench coats, wool overcoats\n\n**Preferred brands:** Ralph Lauren, Brooks Brothers, Loro Piana, Brunello Cucinelli, J.Crew, Barbour, Hermès, Burberry\n\n**Styling tips:**\n• Layer a white Oxford under a navy blazer with pearl accessories\n• Mix textures: tweed jacket + smooth silk blouse\n• Invest in one timeless piece over ten trendy items\n• Grooming and posture are as important as the clothes",
  },
  // FASHION AESTHETICS — QUIET LUXURY
  {
    keywords:
      /\b(quiet luxury|quiet luxury outfit|quiet luxury style|quiet luxury aesthetic|stealth wealth|no logo fashion|understated luxury|minimalist luxury)\b/i,
    response:
      "**Quiet luxury** (also called stealth wealth) is the fashion philosophy of wearing extremely high-quality items with zero visible branding — the opposite of logomania. Popularised by shows like Succession and worn by figures like Sofia Richie Grainge and Gwyneth Paltrow.\n\n**Core principles:**\n• No visible logos or branding anywhere\n• Impeccable fit and tailoring — clothes that look like they were made for your body\n• Monochromatic or tonal dressing in camel, ivory, navy, grey, and chocolate\n• Exceptional fabrics: cashmere, fine wool, Italian leather, silk\n\n**Key pieces:**\n• Cashmere everything — turtlenecks, cardigans, coats\n• Perfectly tailored wide-leg trousers in neutral tones\n• Silk or satin slip dresses and tops\n• Clean, minimalist leather handbags (The Row, Toteme, Bottega Veneta)\n• Leather loafers and mules\n• Belted trench coats and wool overcoats\n• Simple gold jewellery — thin chains, stud earrings, delicate bracelets\n\n**Best brands:** The Row, Bottega Veneta, Toteme, Loro Piana, Brunello Cucinelli, Céline, Jil Sander\n\nThe message: true wealth doesn't need to advertise itself.",
  },
  // FASHION AESTHETICS — DARK ACADEMIA
  {
    keywords:
      /\b(dark academia|dark academia outfit|dark academia aesthetic|dark academia style|dark academia fashion|dark academia look)\b/i,
    response:
      "**Dark academia** is a gothic-inspired, literary aesthetic rooted in the visual language of elite British and American universities, classical literature, and autumnal intellectualism.\n\n**Colour palette:** Dark brown, black, forest green, burgundy, deep plum, mustard, cream, and charcoal — always moody and earthy.\n\n**Key pieces:**\n• Tweed and herringbone blazers (oversized for a scholarly look)\n• Oxford shirts — white, black, or dark plaid\n• Knitted vests and cardigans over collared shirts\n• High-waisted pleated trousers (dark colours)\n• Plaid or tartan skirts (knee-length or midi)\n• Turtleneck jumpers — the backbone of the aesthetic\n• Mary Jane shoes, leather Oxfords, loafers, ankle boots\n• Long wool coats in dark tones\n• Berets, flat caps, and vintage-style accessories\n• Leather satchels, structured tote bags\n\n**Key details:** Collared shirts under jumpers, vintage brooches, pocket squares, round glasses, layering in earth tones, corduroy fabric\n\n**Style icons:** Characters from Dead Poets Society, The Secret History (Donna Tartt), A Little Life\n\nThe overall mood: a brooding student surrounded by old books in a candlelit library.",
  },
  // FASHION AESTHETICS — STREETWEAR
  {
    keywords:
      /\b(streetwear|streetwear outfit|streetwear style|streetwear look|streetwear aesthetic|hypebeast|hype beast|streetwear fashion|urban style|urban fashion)\b/i,
    response:
      "**Streetwear** emerged from 1980s–90s skate, surf, and hip-hop cultures in California and New York and has become one of the most influential forces in modern fashion.\n\n**Core elements:**\n• Graphic tees and hoodies — often with bold prints, logos, or artistic imagery\n• Oversized and relaxed fits — comfort is key\n• Sneakers as the centrepiece — Air Jordans, Nike Dunks, Yeezys, New Balance 550s\n• Cargo pants, baggy jeans (wide leg or balloon cut), sweatpants\n• Puffer jackets, varsity/baseball jackets, windbreakers\n• Caps: snapbacks, fitted caps, beanies\n• Layering: hoodie under an oversized jacket, long shirt under short\n\n**Hypebeast sub-culture:** Focuses on limited drops from Supreme, Off-White, BAPE, Palace, Stüssy\n\n**Key brands:** Supreme, Off-White, Stüssy, A Bathing Ape (BAPE), Palace, Carhartt WIP, Jordan Brand, New Balance, Nike, adidas\n\n**How to build a streetwear wardrobe:**\n1. Start with quality basics (plain tees, solid hoodies) in neutral tones\n2. Invest in 1-2 statement sneaker pairs\n3. Add one standout piece per outfit — a graphic tee, bold jacket, or rare cap\n4. Mix high-end with budget pieces for a balanced look",
  },
  // FASHION AESTHETICS — Y2K
  {
    keywords:
      /\b(y2k|y2k outfit|y2k style|y2k aesthetic|y2k fashion|y2k look|2000s fashion|early 2000s fashion|2000s aesthetic|two thousands fashion)\b/i,
    response:
      "**Y2K fashion** is the nostalgic revival of late 1990s and early 2000s style — the era of pop princesses, early internet culture, and maximalist self-expression.\n\n**Defining characteristics:**\n• Iridescent, metallic, and holographic fabrics\n• Low-rise everything — jeans, skirts, trousers\n• Crop tops, baby tees, tube tops, corset tops\n• Micro-mini skirts and shorts\n• Bold, bright, and contrasting colour combinations (hot pink + lime green, silver + white)\n• Embellishments: rhinestones, butterfly motifs, heart prints, celestial patterns\n• Platform shoes, chunky trainers (Buffalo, Steve Madden), kitten heels, flip flops\n• Spaghetti-strap dresses worn over T-shirts (early 2000s)\n\n**Accessories are key:**\n• Velvet chokers, layered necklaces, letter necklaces\n• Micro handbags, mini backpacks, clear bags\n• Tinted sunglasses (oval, oval-rimmed)\n• Hair: low pigtails, side-part with face-framing layers, frosted tips, crimped hair\n\n**Inspo icons:** Britney Spears, Christina Aguilera, Paris Hilton, Destiny's Child, Lizzie McGuire\n\nY2K is about maximum fun and zero apologies — wear it with confidence.",
  },
  // FASHION AESTHETICS — COTTAGECORE
  {
    keywords:
      /\b(cottagecore|cottagecore outfit|cottagecore aesthetic|cottagecore style|cottagecore fashion|fairy core|fairycore|dark cottage|cottage aesthetic|romantic countryside style)\b/i,
    response:
      "**Cottagecore** is a romantic, nature-inspired aesthetic rooted in an idealised, pastoral country life — think English countryside cottages, wildflower meadows, and slow living.\n\n**Colour palette:** Soft pastels — dusty rose, sage green, lavender, buttercup yellow, cream, warm white, terracotta\n\n**Key pieces:**\n• Floral and prairie dresses — long, flowing, and always feminine\n• Puff-sleeve blouses (white, cream, pastel)\n• Linen everything — shirts, trousers, dresses\n• Pinafore dresses and aprons worn as fashion\n• Corsets and bodices layered over blouses\n• Knit cardigans with nature motifs (mushrooms, flowers, birds)\n• Mary Jane shoes, ballet flats, heeled boots, wellington boots\n• Long skirts with ruffled hems\n\n**Key details:** Lace trims, embroidery, smocking, vintage-inspired buttons, natural fibres only\n\n**Accessories:** Wicker baskets as bags, straw hats, pressed flower jewellery, pearl hairpins, ribbon headbands\n\n**Fabrics:** Linen, cotton, broderie anglaise, muslin, silk chiffon\n\nCottagecore is as much a lifestyle as a fashion aesthetic — it pairs with baking bread, foraging, reading, and spending time in nature.",
  },
  // FASHION AESTHETICS — PREPPY
  {
    keywords:
      /\b(preppy|preppy outfit|preppy style|preppy aesthetic|preppy fashion|preppy look|preppy clothes|classic american style|new england style|ivy league fashion)\b/i,
    response:
      "**Preppy style** originated in the American East Coast prep school and Ivy League university culture of the 1950s–80s and remains a beloved, enduring aesthetic.\n\n**Core colours:** Navy, white, red, green, yellow, pink — often in bold colour-blocking or classic stripes\n\n**Key pieces:**\n• Polo shirts (Ralph Lauren is king here) — tucked in\n• Oxford button-down shirts — plain or gingham/plaid\n• Chino trousers and shorts in tan, navy, or pastel\n• Cable-knit or crewneck sweaters (often with varsity-letter motifs)\n• Sweater tied around the shoulders — the ultimate preppy move\n• Blazers — navy blazer with brass buttons is iconic\n• Plaid skirts (pleated, knee-length)\n• Loafers (penny, horsebit) and boat shoes (Sperrys)\n• A-line dresses in pastel or bold stripes\n\n**Pattern play:** Madras plaid, argyle, seersucker, gingham, stripes, houndstooth\n\n**Accessories:** Canvas tote bags, baseball caps, headbands, pearl earrings, gold bangles, belts with novelty buckles\n\n**Key brands:** Ralph Lauren, Vineyard Vines, Lacoste, J.Crew, Brooks Brothers, Lilly Pulitzer, Tommy Hilfiger",
  },
  // FASHION AESTHETICS — BOHEMIAN
  {
    keywords:
      /\b(bohemian|boho|boho outfit|bohemian outfit|boho chic|boho style|boho aesthetic|boho fashion|bohemian fashion|festival fashion|free spirit style)\b/i,
    response:
      "**Bohemian (boho) style** is a free-spirited aesthetic inspired by 1960s–70s counterculture, folk traditions, and an artistic, nomadic way of life.\n\n**Key characteristics:**\n• Flowing, relaxed silhouettes — nothing tight or structured\n• Rich, earthy palette: terracotta, burnt orange, mustard, olive, rust, cream, deep teal\n• Mixed patterns and prints: paisley, floral, ikat, tie-dye, ethnic prints\n\n**Essential pieces:**\n• Maxi dresses and maxi skirts (tiered, flowing, often with fringe or embroidery)\n• Bell-bottom and wide-leg trousers\n• Off-shoulder and peasant blouses\n• Crochet and knit tops, vests, and dresses\n• Fringed jackets, suede jackets\n• Patchwork and embroidered jeans\n• Flowy kimonos used as outerwear\n\n**Footwear:** Suede ankle boots, huarache sandals, gladiator sandals, espadrilles\n\n**Accessories are everything:**\n• Layered necklaces (long pendant chains, beaded, feather)\n• Stacked bangles and rings on every finger\n• Wide-brim felt or straw hats\n• Fringe bags and woven baskets\n• Hoop earrings and ear cuffs\n\n**Fabrics:** Natural — cotton, linen, suede, leather, crochet, macramé",
  },

  // SPACE & ASTRONOMY
  {
    keywords:
      /\b(space|planet|solar system|galaxy|universe|cosmos|nasa|astronaut|moon|mars|sun|star|black hole|asteroid|comet|saturn|jupiter|mercury|venus|neptune|uranus|milky way|orbit|gravity in space)\b/i,
    response:
      "Our solar system is a fascinating cosmic neighbourhood. It contains eight planets orbiting the Sun — Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune. Jupiter is the largest, with a mass greater than all other planets combined.\n\nBeyond our solar system lies the Milky Way galaxy, containing 200-400 billion stars spread across roughly 100,000 light-years. The universe itself is estimated to be about 13.8 billion years old and contains over two trillion galaxies.\n\nBlack holes are among the most mysterious objects in the cosmos — regions of space where gravity is so strong that not even light can escape. The supermassive black hole at the centre of our galaxy is called Sagittarius A*, with a mass four million times that of our Sun. Space exploration continues to push boundaries, from the James Webb Space Telescope capturing images of the early universe to plans for crewed Mars missions in the coming decades.",
  },
  // AI & TECHNOLOGY
  {
    keywords:
      /\b(artificial intelligence|ai|machine learning|deep learning|neural network|chatgpt|gpt|llm|large language model|robot|automation|algorithm|data science|computer vision|natural language processing|nlp|transformer model)\b/i,
    response:
      "Artificial Intelligence (AI) refers to the simulation of human intelligence in machines programmed to think, learn, and solve problems. Modern AI is largely driven by machine learning — a technique where systems learn from data rather than being explicitly programmed.\n\nDeep learning, a subset of machine learning, uses neural networks with many layers to process complex patterns. This powers breakthroughs in image recognition, natural language understanding, and speech synthesis. Large Language Models (LLMs) like GPT-4 are trained on vast text datasets and can generate human-like text, answer questions, write code, and more.\n\nAI is transforming every industry — from healthcare (disease diagnosis) to finance (fraud detection), autonomous vehicles, creative arts, and scientific research. Ethical considerations around AI bias, job displacement, and autonomous decision-making are active areas of research and policy debate.",
  },
  // CLIMATE & ENVIRONMENT
  {
    keywords:
      /\b(climate change|global warming|greenhouse gas|carbon dioxide|co2|ozone layer|deforestation|renewable energy|solar energy|wind energy|fossil fuel|pollution|biodiversity|ecosystem|rainforest|coral reef|sea level|carbon footprint)\b/i,
    response:
      "Climate change refers to long-term shifts in global temperatures and weather patterns, primarily driven since the mid-20th century by human activities — especially the burning of fossil fuels, which releases carbon dioxide and other greenhouse gases into the atmosphere.\n\nThe greenhouse effect is natural and necessary for life, but excessive greenhouse gases trap more heat, raising global temperatures. The effects include rising sea levels, more frequent extreme weather events, melting ice caps, ocean acidification, and threats to biodiversity.\n\nThe Paris Agreement (2015) aims to limit global warming to 1.5°C above pre-industrial levels. Renewable energy sources like solar and wind, electric vehicles, reforestation, and carbon capture technologies are central to climate mitigation strategies. Individual actions — reducing meat consumption, flying less, improving home insulation — also contribute meaningfully.",
  },
  // WORLD HISTORY
  {
    keywords:
      /\b(world war|ww1|ww2|world war 1|world war 2|history|historical|ancient rome|ancient greece|egypt|pharaoh|pyramid|renaissance|industrial revolution|french revolution|roman empire|ottoman|mongol|colonialism|cold war|civil war|revolution|empire|dynasty|civilisation|civilization)\b/i,
    response:
      "World history spans thousands of years of human civilisation. Ancient civilisations — Mesopotamia, Egypt, Greece, Rome, China, and the Indus Valley — laid the foundations of writing, law, philosophy, and governance.\n\nThe Middle Ages saw the rise of feudalism, the spread of major religions, and the growth of trade routes like the Silk Road. The Renaissance (14th–17th century) brought an explosion of art, science, and humanist thought. The Industrial Revolution (18th–19th century) transformed economies from agrarian to industrial, reshaping society profoundly.\n\nThe 20th century was defined by two devastating World Wars. World War I (1914–1918) ended four major empires. World War II (1939–1945) resulted in over 70 million deaths and led to the founding of the United Nations. The subsequent Cold War (1947–1991) shaped global geopolitics through the rivalry between the USA and USSR until the Soviet Union's dissolution.",
  },
  // BIOLOGY & LIFE SCIENCES
  {
    keywords:
      /\b(biology|cell|dna|rna|gene|genetics|evolution|darwin|natural selection|photosynthesis|mitosis|chromosome|protein|virus|bacteria|immune system|vaccine|organism|species|mammal|reptile|amphibian|ecosystem|biodiversity|human body|brain|heart|lungs)\b/i,
    response:
      "Biology is the scientific study of life and living organisms. At its core is the cell — the fundamental unit of life. Cells contain DNA (deoxyribonucleic acid), which encodes the genetic instructions for building and running every living organism.\n\nEvolution by natural selection, first described by Charles Darwin, explains how species change over time. Individuals with traits better suited to their environment are more likely to survive and reproduce, passing those traits to offspring. This process over millions of years accounts for the incredible diversity of life on Earth.\n\nThe human body is an extraordinary system of 37 trillion cells organised into tissues, organs, and systems. The brain — with roughly 86 billion neurons — processes sensory information, coordinates movement, regulates body functions, and underpins consciousness, memory, and emotion. Modern biology merges with technology in fields like genetic engineering, CRISPR gene editing, synthetic biology, and personalised medicine.",
  },
  // GEOGRAPHY & COUNTRIES
  {
    keywords:
      /\b(country|capital|continent|geography|mountain|river|ocean|lake|desert|population|largest country|smallest country|russia|china|usa|india|africa|europe|asia|australia|south america|north america|amazon|nile|everest|himalayas|pacific|atlantic|sahara)\b/i,
    response:
      "Earth's surface is divided into seven continents: Asia, Africa, North America, South America, Antarctica, Europe, and Australia/Oceania. Asia is the largest continent by area and population, home to over 4.7 billion people.\n\nThe world's longest river is the Nile (6,650 km) in Africa, while the Amazon in South America carries the greatest volume of water. Mount Everest in the Himalayas is the world's highest peak at 8,849 metres above sea level. The Pacific Ocean is the largest ocean, covering more area than all the world's landmasses combined.\n\nThe world has 195 countries. Russia is the largest by land area (17.1 million km²), while China and India each have over 1.4 billion people, making them the world's most populous. The smallest country is Vatican City, covering just 0.44 km² within Rome.",
  },
  // FOOD & NUTRITION
  {
    keywords:
      /\b(food|nutrition|diet|vitamin|protein|carbohydrate|fat|calorie|metabolism|healthy eating|recipe|cuisine|ingredient|cooking|meal|vegetarian|vegan|gluten|sugar|organic|superfood|mediterranean diet|keto|intermittent fasting)\b/i,
    response:
      "Nutrition is the science of how food affects health. Macronutrients — carbohydrates, proteins, and fats — provide energy and building materials for the body. Micronutrients — vitamins and minerals — support countless metabolic processes.\n\nA balanced diet rich in whole foods, vegetables, fruits, lean proteins, and healthy fats forms the foundation of good health. The Mediterranean diet, consistently ranked among the healthiest, emphasises olive oil, fish, legumes, whole grains, nuts, and abundant vegetables, and is associated with lower rates of heart disease, diabetes, and certain cancers.\n\nCalorie needs vary by age, sex, and activity level — the average adult needs roughly 2,000–2,500 calories daily. Ultra-processed foods high in sugar, refined carbs, and trans fats are linked to obesity, inflammation, and chronic disease. Staying hydrated (8 glasses of water daily) and managing portion sizes are simple but powerful habits for long-term health.",
  },
  // SPORTS
  {
    keywords:
      /\b(sport|football|soccer|basketball|tennis|cricket|baseball|rugby|athletics|olympics|world cup|fifa|nba|nfl|swimming|cycling|boxing|golf|formula 1|f1|marathon|athlete|championship|tournament)\b/i,
    response:
      "Sports are a universal language that transcend culture, geography, and language. Football (soccer) is the world's most popular sport, with over 4 billion fans globally and the FIFA World Cup drawing the largest single-event television audiences in history.\n\nThe Olympics, held every four years (Summer and Winter editions), represent the pinnacle of athletic achievement, bringing together thousands of athletes from over 200 countries. Basketball, driven by the NBA, has grown into a global phenomenon, while cricket commands a massive following in South Asia, Australia, and the UK.\n\nSports science has transformed athletic performance — data analytics, biomechanics, sports psychology, and nutrition science help athletes optimise their training and recovery. Esports has emerged as a massive competitive industry, with tournaments attracting millions of online viewers and prize pools rivalling traditional sports.",
  },
  // MUSIC
  {
    keywords:
      /\b(music|song|album|artist|band|genre|rock|pop|hip hop|jazz|classical|beatles|mozart|beethoven|beyonce|taylor swift|spotify|playlist|instrument|guitar|piano|violin|drum|concert|festival|lyrics|melody|rhythm|chord)\b/i,
    response:
      "Music is one of humanity's oldest and most universal forms of expression. From ancient drumming rituals to Beethoven's symphonies to modern AI-generated tracks, music continuously evolves while remaining deeply tied to emotion and culture.\n\nClassical music, developed in Europe from the 11th century onwards, produced timeless works by composers like Bach, Mozart, and Beethoven. The 20th century saw explosive diversification — blues and jazz emerged from African-American communities and influenced rock and roll, which then spawned punk, metal, pop, electronic, and hip-hop genres.\n\nToday, streaming platforms like Spotify and Apple Music have democratised music distribution, allowing independent artists to reach global audiences. Music therapy is a recognised clinical practice using music to address physical and mental health conditions. Studies show that music activates multiple brain regions simultaneously — it's uniquely powerful for memory, mood regulation, and even pain management.",
  },
  // MOVIES & ENTERTAINMENT
  {
    keywords:
      /\b(movie|film|cinema|actor|actress|director|oscar|hollywood|animation|streaming|netflix|disney|marvel|dc|avengers|pixar|blockbuster|documentary|screenplay|genre|thriller|comedy|drama|horror|sci-fi|fantasy)\b/i,
    response:
      "Cinema is both an art form and a multi-billion dollar global industry. Since the Lumière brothers' first public film screening in 1895, movies have evolved from silent black-and-white shorts to immersive high-definition spectacles with cutting-edge special effects.\n\nHollywood remains the world's most influential film industry, producing the majority of the highest-grossing films globally. Marvel's Cinematic Universe (MCU) became the highest-grossing film franchise in history. Independent cinema thrives alongside blockbusters, with films like Parasite (2019) achieving mainstream success while challenging the Hollywood model.\n\nStreaming services like Netflix, Disney+, and Amazon Prime have transformed how we consume entertainment, commissioning original content and delivering global hits. The Academy Awards (Oscars) remain the most prestigious film honours. Modern filmmaking integrates CGI, motion capture, AI-assisted editing, and immersive sound design to create experiences impossible just decades ago.",
  },
  // MATHEMATICS
  {
    keywords:
      /\b(math|mathematics|algebra|geometry|calculus|equation|formula|theorem|prime number|fibonacci|pi|infinity|statistics|probability|fraction|percentage|trigonometry|pythagorean|logarithm|derivative|integral|matrix|vector)\b/i,
    response:
      "Mathematics is the language of the universe — a precise, logical system used to describe patterns, quantities, structures, and change. It underpins every science and technology.\n\nArithmetic and algebra deal with numbers and equations. Geometry studies shapes and space — the Pythagorean theorem (a² + b² = c²) is one of mathematics' most famous results. Calculus, developed independently by Newton and Leibniz in the 17th century, describes change and motion, powering everything from physics to economics to machine learning.\n\nPi (π ≈ 3.14159...) is a mathematical constant representing the ratio of a circle's circumference to its diameter — it's irrational, meaning its decimal expansion never ends or repeats. Prime numbers (divisible only by 1 and themselves) remain deeply mysterious; the Riemann Hypothesis about their distribution is one of mathematics' greatest unsolved problems, with a $1 million prize for its proof.",
  },
  // PHYSICS
  {
    keywords:
      /\b(physics|quantum|relativity|einstein|newton|gravity|energy|force|atom|electron|proton|neutron|thermodynamics|wave|light|speed of light|electromagnetism|nuclear|particle|higgs boson|string theory|entropy|momentum|kinetic|potential energy)\b/i,
    response:
      "Physics is the fundamental science that seeks to understand the laws governing matter, energy, space, and time. Classical mechanics, formulated by Isaac Newton in the 17th century, describes the motion of everyday objects with remarkable precision.\n\nAlbert Einstein revolutionised our understanding of space and time with his Special Theory of Relativity (1905) — famously encapsulated in E=mc², showing that mass and energy are interchangeable. His General Theory of Relativity (1915) described gravity not as a force but as the curvature of spacetime caused by mass.\n\nQuantum mechanics describes the behaviour of matter at atomic and subatomic scales, where particles exhibit wave-particle duality and probabilistic behaviour. The Standard Model of particle physics catalogues all known fundamental particles, including the Higgs boson (discovered at CERN in 2012), which gives other particles their mass. Unifying quantum mechanics with general relativity remains one of physics' greatest challenges.",
  },
  // CHEMISTRY
  {
    keywords:
      /\b(chemistry|element|periodic table|atom|molecule|compound|reaction|acid|base|pH|oxidation|carbon|hydrogen|oxygen|nitrogen|bond|covalent|ionic|organic chemistry|polymer|catalyst|electrolysis|isotope|radioactive|nuclear reaction)\b/i,
    response:
      "Chemistry is the science of matter — its composition, properties, structure, and how it transforms through chemical reactions. All matter is composed of atoms, the smallest units that retain the properties of an element. The periodic table, organised by atomic number, lists 118 known elements from hydrogen (lightest) to oganesson.\n\nChemical bonds — covalent (shared electrons), ionic (electron transfer), and metallic — hold atoms together to form molecules and compounds. Water (H₂O), carbon dioxide (CO₂), and table salt (NaCl) are simple but essential compounds.\n\nOrganic chemistry focuses on carbon-based compounds — the basis of all life and most pharmaceuticals, plastics, and fuels. Green chemistry aims to design processes that minimise hazardous substances and waste. Modern applications include drug development, materials science, nanotechnology, and renewable energy storage through advanced battery chemistry.",
  },
  // MEDICINE & HEALTH SCIENCE
  {
    keywords:
      /\b(medicine|disease|symptom|diagnosis|treatment|surgery|vaccine|antibiotic|cancer|diabetes|heart disease|blood pressure|mental health|depression|anxiety|therapy|hospital|doctor|pharmacy|drug|medication|pandemic|epidemic|covid|immune)\b/i,
    response:
      "Medicine is the science and practice of diagnosing, treating, and preventing disease. Modern medicine has transformed human health dramatically — average global life expectancy has risen from around 30 years in 1900 to over 73 years today.\n\nVaccines are among medicine's greatest achievements, eradicating smallpox and nearly eliminating polio. Antibiotics, discovered with penicillin in 1928, have saved hundreds of millions of lives, though antibiotic resistance is an emerging crisis. Cancer treatment has advanced through targeted therapies, immunotherapy, and precision medicine based on genetic profiling.\n\nMental health is increasingly recognised as equally important as physical health. Depression and anxiety disorders affect hundreds of millions globally and are leading causes of disability. Treatment combines psychotherapy, medication, lifestyle interventions, and increasingly, digital health tools. Preventive medicine — regular exercise, balanced diet, not smoking, limiting alcohol, and managing stress — remains the most powerful strategy for long-term health.",
  },
  // PSYCHOLOGY
  {
    keywords:
      /\b(psychology|behaviour|behavior|mind|cognition|emotion|motivation|personality|freud|jung|maslow|cognitive bias|memory|learning theory|social psychology|therapy|counselling|mental health|consciousness|perception|intelligence|iq|introvert|extrovert)\b/i,
    response:
      "Psychology is the scientific study of mind and behaviour, exploring how people think, feel, perceive, and interact. Sigmund Freud pioneered psychoanalysis, emphasising the role of the unconscious mind, while B.F. Skinner's behaviourism focused on observable behaviour and conditioning.\n\nCognitive psychology examines mental processes — memory, problem-solving, language, and decision-making. Cognitive biases — systematic errors in thinking like confirmation bias, anchoring, and the availability heuristic — affect everyone's judgements, even experts. Daniel Kahneman's work on System 1 (fast, intuitive) vs System 2 (slow, deliberate) thinking has been hugely influential.\n\nMaslow's Hierarchy of Needs describes human motivation as a pyramid — from basic physiological needs (food, shelter) through safety, belonging, and esteem to self-actualisation. Social psychology reveals how powerfully our behaviour is shaped by others — conformity experiments like Milgram's obedience studies and Zimbardo's Stanford Prison Experiment showed the disturbing extent of situational influence.",
  },
  // PHILOSOPHY
  {
    keywords:
      /\b(philosophy|ethics|morality|logic|epistemology|metaphysics|ontology|plato|aristotle|socrates|kant|nietzsche|existentialism|stoicism|utilitarianism|consciousness|free will|meaning of life|truth|knowledge|justice|democracy|enlightenment)\b/i,
    response:
      "Philosophy — from the Greek 'love of wisdom' — is the systematic investigation of fundamental questions about existence, knowledge, ethics, and reason. Ancient Greek philosophers laid foundations still debated today: Socrates' dialectic method, Plato's Theory of Forms, and Aristotle's systematic approach to logic and empirical inquiry.\n\nEpistemology asks what knowledge is and how we obtain it. Metaphysics explores the nature of reality — questions like 'Does free will exist?' and 'What makes personal identity continuous over time?' Ethics examines morality — how should we act? Utilitarianism (maximize well-being) and Kant's deontological ethics (duty-based rules) offer contrasting frameworks.\n\nExistentialism, represented by Sartre, Camus, and Kierkegaard, confronts the challenge of creating meaning in an indifferent universe. Stoicism — enjoying a massive modern revival — teaches that we cannot control external events, only our responses to them, and that virtue (wisdom, courage, justice, temperance) is the only true good.",
  },
  // ECONOMICS
  {
    keywords:
      /\b(economics|economy|inflation|gdp|recession|stock market|interest rate|central bank|cryptocurrency|bitcoin|investment|supply and demand|capitalism|socialism|trade|globalisation|unemployment|currency|federal reserve|fiscal policy|monetary policy)\b/i,
    response:
      "Economics studies how individuals, businesses, and governments allocate scarce resources. Microeconomics focuses on individual markets and decisions, while macroeconomics examines entire economies — growth, inflation, unemployment, and trade.\n\nKey concepts: Supply and demand determine prices in free markets. Inflation (rising prices) erodes purchasing power; central banks use interest rates to control it. GDP (Gross Domestic Product) measures an economy's total output. Recessions — two consecutive quarters of negative GDP growth — occur in economic cycles and are addressed through fiscal (government spending/taxes) and monetary (interest rates) policy.\n\nCryptocurrencies like Bitcoin introduced decentralised digital money based on blockchain technology, challenging traditional financial systems. Behavioural economics, pioneered by Kahneman and Thaler, incorporates psychology into economic models, showing that humans often make irrational economic decisions. Income inequality, automation's impact on jobs, and sustainable development are central challenges in contemporary economics.",
  },
  // PROGRAMMING
  {
    keywords:
      /\b(programming|coding|software|python|javascript|java|typescript|c\+\+|rust|go|html|css|react|angular|vue|node|api|database|sql|git|github|algorithm|data structure|web development|app development|backend|frontend|devops|cloud|aws)\b/i,
    response:
      "Programming is the art of giving computers precise instructions to solve problems. Modern software development spans a rich ecosystem of languages — Python dominates data science and AI, JavaScript powers the web (with frameworks like React and Vue), Java and Kotlin are ubiquitous in enterprise and Android, while Rust and Go excel at systems programming with performance and safety.\n\nWeb development divides into frontend (user-facing interfaces with HTML, CSS, JavaScript) and backend (server logic, databases, APIs). Full-stack developers work across both. Databases store and retrieve data — SQL databases (PostgreSQL, MySQL) use relational tables, while NoSQL databases (MongoDB, Redis) offer flexibility for unstructured data.\n\nGit and platforms like GitHub enable version control and collaboration. The software development lifecycle includes planning, design, coding, testing, deployment, and maintenance. Agile methodologies emphasise iterative development and cross-functional teamwork. Cloud platforms (AWS, Google Cloud, Azure) have transformed how software is deployed and scaled.",
  },
  // LANGUAGES & LINGUISTICS
  {
    keywords:
      /\b(language|linguistics|grammar|vocabulary|translation|bilingual|dialect|accent|english|spanish|french|mandarin|arabic|hindi|portuguese|russian|japanese|korean|sign language|etymology|phonetics|syntax|semantics|most spoken language)\b/i,
    response:
      "Language is humanity's most powerful tool — enabling complex communication, culture, and the transmission of knowledge across generations. There are approximately 7,100 languages spoken worldwide, though half are endangered and may disappear within this century.\n\nMandarin Chinese has the most native speakers (~1 billion), while English is the world's most widely spoken second language and the dominant language of international business, science, and the internet. Spanish is the official language of 21 countries with around 500 million native speakers.\n\nLinguistics studies the structure and evolution of language — phonetics (sounds), morphology (word structure), syntax (sentence grammar), and semantics (meaning). Language shapes thought in subtle ways — the Sapir-Whorf hypothesis suggests that the language you speak influences how you perceive reality. Translation and natural language processing (NLP) are challenging because language is full of ambiguity, idiom, and cultural context that defies literal rendering.",
  },
  // MYTHOLOGY & RELIGION
  {
    keywords:
      /\b(mythology|myth|legend|god|goddess|zeus|thor|odin|poseidon|athena|apollo|hercules|norse|greek mythology|roman mythology|egyptian mythology|hinduism|buddhism|christianity|islam|judaism|religion|spiritual|sacred|ritual|creation myth|afterlife)\b/i,
    response:
      "Mythology consists of the sacred stories through which cultures have historically explained the world, human experience, and the cosmos. Greek mythology features a pantheon of gods on Mount Olympus — Zeus (king of gods), Athena (wisdom), Poseidon (seas), Apollo (sun/arts) — alongside heroes like Hercules, Achilles, and Odysseus whose stories explore heroism, fate, and human flaws.\n\nNorse mythology, originating with ancient Germanic peoples, features Odin (the Allfather), Thor (god of thunder), Loki (trickster), and a cosmos structured around the world-tree Yggdrasil. It culminates in Ragnarök — a prophesied apocalypse followed by a new world.\n\nThe world's major religions — Christianity (~2.4bn), Islam (~1.9bn), Hinduism (~1.2bn), Buddhism (~500m), Judaism (~15m) — each offer ethical frameworks, cosmologies, and practices that provide meaning, community, and moral guidance to billions. Comparative religion studies the profound similarities and differences in how human cultures have sought to understand the sacred.",
  },

  // EVERYDAY LIFE ADVICE
  {
    keywords:
      /\b(stress|stressed out|too much stress|overwhelmed|overwhelm)\b/i,
    response:
      "First off — it's completely normal to feel stressed sometimes. Here's what genuinely helps: take a few slow deep breaths right now (seriously, try it). Then break your to-do list into just 3 priorities for today. Step outside for even 10 minutes. Talk to someone you trust. And remember — you don't have to solve everything today. One step at a time.",
  },
  {
    keywords: /\b(sad|feeling down|depressed|unhappy|crying|depression)\b/i,
    response:
      "Hey, I hear you — feeling sad is hard, and it's okay to feel that way. Give yourself permission to feel it without judgment. Talk to someone you trust, even just texting 'I'm having a rough day' can help. Do something small and kind for yourself today: a walk, your favorite food, a show you love. And if it's been going on for a while, please consider speaking with a counselor — that's a real act of strength.",
  },
  {
    keywords: /\b(lonely|alone|no friends|isolated|loneliness)\b/i,
    response:
      "Feeling lonely is one of the most human experiences there is — you're definitely not alone in feeling alone. Start small: reach out to one person this week, even someone you haven't talked to in a while. Join a hobby group, class, or online community around something you love. And be patient with yourself — genuine connections take time to build. You matter more than you know.",
  },
  {
    keywords: /\b(motivation|not motivated|lazy|procrastinat)\b/i,
    response:
      "Lack of motivation is so normal — your brain isn't broken, it's just tired or overwhelmed. Here's a trick that actually works: commit to just 2 minutes of the task. That's it. Most of the time, starting is the hardest part and you'll keep going. Also, tie your tasks to your 'why' — why does this matter to you? And celebrate small wins. Progress, not perfection.",
  },
  {
    keywords:
      /\b(saving money|broke|budget|financial stress|debt|money problems)\b/i,
    response:
      "Money stress is real, but you can absolutely get on top of it. Start with the 50/30/20 rule: 50% of income on needs, 30% on wants, 20% on savings/debt. Track your spending for just one week — you'll spot leaks fast. Build a small emergency fund first (even $500 helps). Automate your savings so you never miss it. The most important step? Start today, even small.",
  },
  {
    keywords: /\b(breakup|heartbreak|relationship problems|partner issues)\b/i,
    response:
      "Relationships are one of the most complex and rewarding parts of life. The foundation is always communication — say what you feel using 'I feel...' statements instead of blame. Make time for each other intentionally. If going through a breakup: feel it fully, lean on friends, avoid going back out of loneliness, and give yourself real time to heal. You will feel better — I promise.",
  },
  {
    keywords: /\b(confidence|self confidence|self esteem|insecure|shyness)\b/i,
    response:
      "Confidence isn't something you either have or don't — it's a skill you build through small actions. Start by doing one thing each day that slightly scares you. Dress in a way that makes YOU feel good. Speak up once in conversations even when nervous. Replace 'I can't' with 'I'm learning to.' And remember: everyone is more focused on themselves than on judging you. You are more capable than you think.",
  },
  {
    keywords:
      /\b(morning routine|productive morning|wake up early|start the day)\b/i,
    response:
      "A solid morning routine can genuinely change your life. Here's a simple one that works: wake up at a consistent time, drink a glass of water immediately, get 10 minutes of sunlight or a short walk, eat something with protein, and do your hardest task first before checking your phone. Avoid the doom-scroll right after waking up — it sets a reactive tone for the whole day.",
  },
  {
    keywords: /\b(work life balance|burnout|overworked|work too much)\b/i,
    response:
      "Burnout is your body and mind saying 'enough.' Real boundaries look like: no work emails after a certain hour, protecting at least one full day off per week, and actually using your vacation time. Communicate your limits at work — most managers respect this more than martyrdom. And invest in something outside of work that genuinely fills you up: a hobby, family time, fitness, anything.",
  },
  {
    keywords: /\b(parenting|kids|toddler|teenager|children advice)\b/i,
    response:
      "Parenting is beautiful and hard at the same time — and no parent has it all figured out. Connection before correction: make sure your child feels safe and heard before discipline. Get on their level, literally — sit on the floor, make eye contact. Consistency matters more than perfection. Be kind to yourself too — a rested, calm parent is the greatest gift to a child.",
  },
  {
    keywords:
      /\b(build a habit|daily routine|new habit|stop a bad habit|habit stacking)\b/i,
    response:
      "Building habits that stick comes down to making them obvious, attractive, easy, and satisfying (the habit loop). Attach your new habit to something you already do — this is called habit stacking. Start ridiculously small: '2 minutes of exercise' instead of '1 hour at the gym.' Track your streak visually — seeing that chain of days is powerful motivation to keep going.",
  },
  {
    keywords: /\b(angry|anger issues|frustrated|rage|annoyed all the time)\b/i,
    response:
      "Anger is completely valid — it's telling you something important. But acting on it impulsively usually makes things worse. Try this: pause before responding (count to 10, take 3 deep breaths, leave the room if needed). Once you're calmer, express how you feel with 'I feel angry when...' rather than attacking the person. Regular exercise and sleep dramatically reduce baseline irritability too.",
  },
  {
    keywords: /\b(bored|nothing to do|kill time|boredom)\b/i,
    response:
      "Boredom is actually a creative invitation! Try: learning something new on YouTube or an app, starting a small project you've been putting off, going for a walk without headphones, calling someone you haven't talked to in a while, reading the first chapter of a book, or trying a new recipe. Boredom often hits when we're understimulated — it's a sign to create something.",
  },
];

// ─────────────────── Category keywords ───────────────────
const healthKeywords =
  /\b(sleep|tired|pain|exercise|diet|water|steps|blood pressure|weight|stress|health|sick|fitness|calories|workout|feel better|wellness|nutrition)\b/i;
const loveKeywords =
  /\b(relationship|crush|dating|lonely|heartbreak|love|partner|ex|breakup|romance|feelings|affection|marriage|miss someone|flirting)\b/i;
const studyKeywords =
  /\b(exam|study|focus|notes|homework|concentration|learn|school|college|university|test|grades|assignment|revision|tutor)\b/i;
const careerKeywords =
  /\b(job|resume|interview|salary|career|promotion|work|boss|freelance|hire|skills|professional|linkedin|portfolio)\b/i;
const fashionKeywords =
  /\b(outfit|clothes|style|wear|trend|fashion|dress|shoes|accessories|wardrobe|aesthetic|look|brand|designer|old money|quiet luxury|dark academia|streetwear|cottagecore|bohemian|preppy|grunge|y2k|athleisure|capsule|minimalist fashion|smart casual|business casual|black tie|formal wear|casual wear|luxury fashion)\b/i;
const businessKeywords =
  /\b(startup|business|money|invest|profit|marketing|brand|product|entrepreneur|revenue|funding|pitch|sales|strategy)\b/i;

function applyTone(text: string, ageGroup: string): string {
  if (ageGroup === "genz") {
    return `${text}\n\n*(fr no cap, hope that helps! 🔥)*`;
  }
  if (ageGroup === "senior") {
    return `${text}\n\nI hope that answers your question clearly. Please feel free to ask if you'd like more detail on any point.`;
  }
  return text;
}

const healthResponses = [
  "Maintaining good health involves three foundational pillars: movement, nutrition, and rest. Aim for at least 150 minutes of moderate aerobic activity per week — brisk walking, cycling, or swimming are excellent options. Strength training twice a week helps preserve muscle mass and boosts metabolism.\n\nNutrition-wise, focus on whole foods: vegetables, fruits, lean proteins, whole grains, and healthy fats like those in olive oil, avocados, and nuts. Minimize ultra-processed foods, excess sugar, and refined carbohydrates, which are linked to inflammation and chronic disease.\n\nSleep is often the most underrated health factor. Adults need 7–9 hours nightly. Poor sleep raises cortisol (stress hormone), increases appetite, impairs immunity, and reduces cognitive function. A consistent sleep schedule — waking and sleeping at the same time daily — dramatically improves sleep quality.",
  "Managing stress effectively is as important as diet and exercise for long-term health. Chronic stress elevates cortisol, contributes to high blood pressure, disrupts sleep, and weakens immunity. Evidence-based strategies include mindfulness meditation (even 10 minutes daily), regular physical activity, time in nature, strong social connections, and limiting news/social media consumption.\n\nFor blood pressure, the DASH diet (Dietary Approaches to Stop Hypertension) is clinically proven — it emphasizes fruits, vegetables, whole grains, and low-fat dairy while reducing sodium and saturated fat. Regular aerobic exercise, reducing alcohol, not smoking, and managing weight are all highly effective.\n\nPreventive health checks — blood pressure, cholesterol, blood glucose, and cancer screenings appropriate for your age — catch problems early when they're most treatable. Don't wait for symptoms.",
];

const loveResponses = [
  "Healthy relationships are built on five foundations: honest communication, mutual respect, trust, shared values, and individual autonomy. The ability to have difficult conversations calmly — expressing needs without blame — is probably the single most important relationship skill.\n\nPsychologist John Gottman's research identified the 'Four Horsemen' that predict relationship breakdown: criticism (attacking character), contempt (eye-rolling, mockery), defensiveness (denying responsibility), and stonewalling (shutting down). Learning to replace these with gentle start-up, appreciation, responsibility, and self-regulation transforms relationship quality.\n\nIf you're navigating a breakup or loneliness, know that grief over a relationship is entirely normal. Allow yourself to process it — suppressing emotions prolongs recovery. Reconnect with your own identity, interests, and friendships. Most people find that the clarity gained after a relationship ends eventually makes space for something healthier.",
  "Attraction and love involve fascinating neuroscience. Early romantic love activates the brain's reward system, flooding it with dopamine — creating the intense focus and euphoria associated with new relationships. Over time, this transitions to attachment, maintained by oxytocin and vasopressin.\n\nFor those wanting to meet someone, authentic connection matters far more than playing games. Shared activities, genuine curiosity about others, and being present in conversations are more attractive than any pickup technique. Online dating works best when you move to video calls quickly and meet in person early — extended text-only communication builds a false sense of intimacy.\n\nSelf-love isn't a cliché — it's practical. Understanding your own needs, values, and patterns through therapy or reflection makes you a better partner and helps you choose more compatible people.",
];

const studyResponses = [
  "The most effective study techniques are backed by cognitive science. Active recall — testing yourself rather than re-reading — is far superior for long-term retention. Spaced repetition, reviewing material at increasing intervals (apps like Anki automate this), exploits how memory consolidates during sleep.\n\nThe Feynman technique is powerful for deep understanding: explain a concept in simple terms as if teaching a child. Wherever you struggle to explain clearly reveals exactly what you haven't truly understood. Interleaved practice — mixing different problem types rather than massing identical ones — feels harder but produces better learning.\n\nFor focus, the Pomodoro technique (25-minute focused blocks with 5-minute breaks) helps manage attention. Eliminate phone notifications — each interruption costs an average 23 minutes to fully regain deep focus. Study in a consistent, dedicated space; the brain associates environments with mental states.",
  "Exam preparation works best when started early. Cramming the night before can help with short-term recall but produces poor long-term retention and increases anxiety. Create a revision schedule working backward from exam dates, allocating more time to weaker areas.\n\nPast papers are invaluable — they reveal the actual style and difficulty of questions and make the exam format familiar. Practice under timed conditions at least once. Mind maps and concept diagrams suit visual learners and help reveal connections between ideas.\n\nExam anxiety is common and manageable. Preparation reduces it significantly. On exam day: deep breathing activates the parasympathetic nervous system and reduces cortisol. Read all questions first, tackle known questions first to build confidence, and manage time carefully.",
];

const careerResponses = [
  "Career growth in the modern economy increasingly depends on building a visible personal brand alongside technical skills. Update your LinkedIn with specific achievements (metrics matter: 'increased sales by 40%' not 'improved sales'), contribute to your field through writing or speaking, and cultivate a genuine network — people hire and recommend those they know and trust.\n\nThe most transferable meta-skills are communication (written and spoken), problem-solving, adaptability, and collaboration. Hard skills in data analysis, project management, and digital literacy are in high demand across virtually every industry.\n\nFor interviews, the STAR method (Situation, Task, Action, Result) structures compelling answers to behavioural questions. Research the company thoroughly — understand their business model, competitors, and recent news. Thoughtful questions at interview's end signal genuine interest and intelligence.",
  "Salary negotiation is a skill most people never practice but all should. Research market rates on Glassdoor, LinkedIn Salary, and industry surveys before any negotiation. Never give the first number if you can avoid it — ask what their budgeted range is.\n\nWhen negotiating, anchor high (above your actual target) to allow movement, and justify with specific market data and your unique contributions. Remember that total compensation includes benefits, flexibility, development budget, and equity — sometimes negotiating these is easier than base salary.\n\nFor career transitions, identify transferable skills from your current role, fill knowledge gaps through targeted courses (Coursera, edX, LinkedIn Learning), and lean on network connections in your target field for informational interviews. Most roles are filled before they're publicly advertised.",
];

const fashionResponses = [
  "Building a versatile wardrobe starts with mastering fit — a well-tailored basic piece always outperforms an ill-fitting designer item. Invest in quality essentials that transcend trends: a crisp white shirt, dark denim, a well-cut blazer, a merino wool jumper, and clean leather shoes or trainers in neutral tones.\n\nThe capsule wardrobe concept — 30–40 versatile pieces that combine into 100+ outfits — saves money, decision fatigue, and closet space. A cohesive 3-colour palette (two neutrals + one accent) makes mixing and matching effortless and ensures everything works together.\n\nSustainable fashion is increasingly important: fast fashion accounts for 10% of global carbon emissions and produces 92 million tons of textile waste annually. Second-hand platforms like Depop and Vinted offer great-quality pieces at fraction of retail price. Buying fewer, better items and caring for them properly (following care labels, using quality hangers, storing properly) extends their life significantly.",
];

const businessResponses = [
  "Building a successful business begins with solving a genuine problem for a specific, well-defined customer. Many startups fail not from poor execution but from building something people don't actually want. Validate your idea before investing heavily: interview potential customers, build an MVP (Minimum Viable Product), and get real users before optimising.\n\nDistribution is often underestimated relative to product. The best product doesn't win — the best-distributed product does. Define your customer acquisition channels early: SEO/content, social media, partnerships, paid advertising, or sales. Know your unit economics: customer acquisition cost (CAC) and lifetime value (LTV) must make mathematical sense.\n\nCash flow, not profit, kills most businesses. Keep overheads lean, especially in the early stages, and maintain at least 6 months of operating capital as runway. Revenue solves most startup problems — prioritise it over premature scaling.",
];

export function generateSearchResults(query: string): SearchResult[] {
  const cleanQuery = query.replace(/^search[:\s]*/i, "").trim();
  return [
    {
      title: `${cleanQuery} - Complete Guide 2026`,
      snippet: `Discover everything about ${cleanQuery}. Our comprehensive guide covers the latest insights, expert tips, and actionable strategies to help you succeed.`,
      url: `https://www.wikipedia.org/wiki/${encodeURIComponent(cleanQuery)}`,
    },
    {
      title: `Top Facts About ${cleanQuery}`,
      snippet: `Explore the most important aspects of ${cleanQuery}. From fundamentals to advanced concepts, this resource covers it all with clear explanations and examples.`,
      url: `https://www.google.com/search?q=${encodeURIComponent(cleanQuery)}`,
    },
    {
      title: `${cleanQuery}: Latest News & Updates 2026`,
      snippet: `Stay up-to-date with the latest developments in ${cleanQuery}. Breaking news, expert analysis, and community discussions all in one place.`,
      url: `https://news.google.com/search?q=${encodeURIComponent(cleanQuery)}`,
    },
    {
      title: `${cleanQuery} — In-Depth Analysis`,
      snippet: `A deep dive into ${cleanQuery}, covering history, current state, key players, and future outlook. Essential reading for anyone wanting to understand this topic fully.`,
      url: `https://scholar.google.com/scholar?q=${encodeURIComponent(cleanQuery)}`,
    },
  ];
}

// ─────────────────── Detect if query warrants images ───────────────────
function shouldShowImages(message: string, category: string): boolean {
  const visualTopics =
    /\b(fashion|outfit|clothes|style|food|recipe|travel|nature|space|planet|animal|art|design|architecture|city|landscape|sport|fitness|workout|health tips|beauty|makeup|hairstyle|interior|car|technology|gadget|plant|flower|ocean|mountain|beach|forest|sunset|sunrise|old money|quiet luxury|dark academia|streetwear|cottagecore|bohemian|preppy|aesthetic|look|hair|room decor|nails|jewelry|sneakers|handbag|luxury|brand)\b/i;
  return (
    /^search[:\s]/i.test(message) ||
    visualTopics.test(message) ||
    category === "fashion" ||
    category === "search"
  );
}

// ─────────────────── Age-based Content Filter ───────────────────
const ADULT_KEYWORDS =
  /\b(porn|pornography|sex|sexual|nude|naked|explicit|erotic|xxx|hentai|rape|incest|pedophil|adult content|onlyfans|casino|gambling|bet|wager|slot machine|drug|cocaine|heroin|meth|marijuana|weed|alcohol|liquor|beer|wine|whiskey|vodka|smoke|cigarette|tobacco|vape|suicide|self.harm|cutting|kill yourself|how to die|murder|torture|gore|violence|weapon|gun|knife|bomb|terror|hack|darkweb|dark web|human trafficking)\b/i;
const TEEN_ADULT_KEYWORDS =
  /\b(porn|pornography|sex|sexual|nude|naked|explicit|erotic|xxx|hentai|rape|incest|pedophil|adult content|onlyfans|cocaine|heroin|meth|suicide|self.harm|cutting|kill yourself|gore|torture|bomb|terror|human trafficking|darkweb|dark web)\b/i;

export function getAgeRestriction(age: number): {
  level: "child" | "teen" | "adult";
  blocked: RegExp | null;
} {
  if (age < 13) return { level: "child", blocked: ADULT_KEYWORDS };
  if (age < 18) return { level: "teen", blocked: TEEN_ADULT_KEYWORDS };
  return { level: "adult", blocked: null };
}

export function isContentBlocked(message: string, age: number): boolean {
  const { blocked } = getAgeRestriction(age);
  if (!blocked) return false;
  return blocked.test(message);
}

function getBlockedMessage(age: number): AIResponse {
  const level = age < 13 ? "child" : "teen";
  const msg =
    level === "child"
      ? "Hey there! That topic isn't available for your age group. Try asking me about science, animals, space, stories, games, or anything fun and educational! 🌟"
      : "That topic isn't available for users under 18. You can ask me about career tips, study strategies, fitness, technology, fashion, travel, or anything age-appropriate. What else can I help you with?";
  return {
    text: msg,
    suggestions:
      level === "child"
        ? [
            "Tell me about space",
            "Fun animal facts",
            "How does the internet work",
            "Cool science experiments",
          ]
        : [
            "Career tips for teens",
            "Study tips for exams",
            "Healthy lifestyle habits",
            "Technology trends 2026",
          ],
    quickLinks: {
      google: "https://www.google.com",
      chatgpt: "https://chat.openai.com",
    },
  };
}

// ─────────────────── Recommendation Engine ───────────────────
const recommendations: Record<
  string,
  { keywords: RegExp; response: string }[]
> = {
  music: [
    {
      keywords:
        /punjabi|bhangra|ap dhillon|sidhu moosewala|diljit|karan aujla|shubh|gurnam bhullar|babbu maan|jazzy b|gippy|harrdy sandhu/i,
      response: `Here are some awesome Punjabi songs you'll love! 🎵

**Top Punjabi Hits:**
• **Lover** – Diljit Dosanjh
• **Brown Munde** – AP Dhillon, Gurinder Gill
• **295** – Sidhu Moosewala
• **Softly** – Karan Aujla
• **Levels** – Sidhu Moosewala
• **Excuses** – AP Dhillon
• **Attention** – AP Dhillon
• **Ikk Pal** – AP Dhillon
• **Yeah Baby** – Garry Sandhu
• **Tere Te** – AP Dhillon
• **Botal** – Gurnam Bhullar
• **Vibe** – Sidhu Moosewala

**Rising Artists to Watch:**
• Shubh – "Elevated", "No Love"
• Harrdy Sandhu – "Bijlee Bijlee"
• Jassa Dhillon – "Excuses"

Search any of these on Spotify, YouTube Music, or Gaana for the full experience! Want Bhangra party hits, romantic Punjabi songs, or sad Punjabi tracks?`,
    },
    {
      keywords: /bollywood|hindi song|hindi music|hindi film song|filmi/i,
      response: `Here are some amazing Bollywood songs across moods! 🎶

**Party Hits:**
• **Kesariya** – Arijit Singh (Brahmastra)
• **Srivalli** – Allu Arjun (Pushpa)
• **Butta Bomma** – Armaan Malik
• **Manike** – Yohani

**Romantic:**
• **Raataan Lambiyan** – Jubin Nautiyal
• **Tere Bin** – Atif Aslam
• **Tera Ban Jaunga** – Akhil Sachdeva
• **Pehli Dafa** – Atif Aslam

**Sad / Emotional:**
• **Arijit Singh Mashup** – Various
• **Tum Hi Ho** – Aashiqui 2
• **Channa Mereya** – ADHM

**Retro Classics:**
• Kishore Kumar, Lata Mangeshkar, Mohammed Rafi timeless hits

Want specific recommendations by mood, era, or artist?`,
    },
    {
      keywords: /english song|english music|pop song|pop music|western music/i,
      response: `Here are top English songs across genres! 🎵

**Pop Hits 2024-2025:**
• **Flowers** – Miley Cyrus
• **Cruel Summer** – Taylor Swift
• **As It Was** – Harry Styles
• **Blinding Lights** – The Weeknd
• **Stay** – Kid Laroi & Justin Bieber

**R&B / Soul:**
• **Golden Hour** – JVKE
• **Ghost** – Justin Bieber
• **Leave the Door Open** – Bruno Mars

**Hip-Hop:**
• Drake, Kendrick Lamar, J. Cole latest releases
• **God's Plan** – Drake
• **HUMBLE** – Kendrick Lamar

**Indie / Alternative:**
• **Heat Waves** – Glass Animals
• **My Universe** – Coldplay x BTS

Want more by artist, genre, or mood?`,
    },
    {
      keywords: /rap song|rap music|hip hop song|hip-hop|drill|trap/i,
      response: `Here are the hottest rap & hip-hop tracks! 🎤

**Global Rap:**
• **God's Plan** – Drake
• **HUMBLE** – Kendrick Lamar
• **SICKO MODE** – Travis Scott
• **Rockstar** – Post Malone
• **Lucid Dreams** – Juice WRLD

**UK Drill / Afrobeats:**
• **Essence** – Wizkid
• **Peru** – Fireboy DML
• **Overdue** – Central Cee

**Desi Rap (Punjabi/Hindi):**
• **295** – Sidhu Moosewala
• **Brown Munde** – AP Dhillon
• **Karan Aujla** – latest mixtapes

Want underground gems or mainstream hits? I can also suggest by era or sub-genre!`,
    },
    {
      keywords:
        /sad song|sad music|heartbreak song|emotional song|breakup song/i,
      response: `Here are some beautiful sad songs for when you need to feel it all... 💔

**English:**
• **Someone Like You** – Adele
• **The Night We Met** – Lord Huron
• **Skinny Love** – Bon Iver
• **Fix You** – Coldplay
• **Happier** – Ed Sheeran

**Hindi/Bollywood:**
• **Channa Mereya** – Arijit Singh
• **Tum Hi Ho** – Arijit Singh
• **Kabira** – Yeh Jawaani Hai Deewani

**Punjabi:**
• **295** – Sidhu Moosewala
• **Kinna Sona** – Suraj Hua Maddham
• **Yaarian** – Harbhajan Mann

**Late Night Vibes:**
• **Creepin'** – The Weeknd
• **Ghost Town** – Post Malone

Want a full playlist by mood? I can suggest more!`,
    },
    {
      keywords:
        /workout song|gym song|gym music|exercise music|motivational song|hype song/i,
      response: `Here are the best workout & gym bangers to push harder! 💪🔥

**Hype / Energy:**
• **POWER** – Kanye West
• **Till I Collapse** – Eminem
• **Eye of the Tiger** – Survivor
• **Lose Yourself** – Eminem
• **Can't Hold Us** – Macklemore

**EDM / Electronic:**
• **Levels** – Avicii
• **Clarity** – Zedd
• **Animals** – Martin Garrix

**Rap / Hip-Hop:**
• **HUMBLE** – Kendrick Lamar
• **Berzerk** – Eminem
• **Jump** – Kris Kross

**Modern Bangers:**
• **Blinding Lights** – The Weeknd
• **Rockstar** – Post Malone

Perfect for warmup, lifting, or cardio – want a tailored playlist?`,
    },
    {
      keywords:
        /love song|romantic song|song for girlfriend|song for boyfriend|wedding song/i,
      response: `Here are some beautiful love songs to set the mood! ❤️🎵

**Romantic English:**
• **Perfect** – Ed Sheeran
• **All of Me** – John Legend
• **A Thousand Years** – Christina Perri
• **Thinking Out Loud** – Ed Sheeran
• **Can't Help Falling in Love** – Elvis Presley

**Bollywood Romance:**
• **Raataan Lambiyan** – Jubin Nautiyal
• **Kesariya** – Arijit Singh
• **Tera Ban Jaunga** – Akhil Sachdeva

**Punjabi Romance:**
• **Lover** – Diljit Dosanjh
• **Pehle Pehle Pyar Mein** – Harshdeep Kaur
• **Tere Naal Naal** – Jazzy B

Want songs for a specific occasion like wedding, anniversary, or first date?`,
    },
  ],
  movies: [
    {
      keywords:
        /bollywood movie|hindi movie|hindi film|indian movie|desi film/i,
      response: `Here are must-watch Bollywood movies! 🎬

**Recent Blockbusters:**
• **Pathaan** (2023) – Action, Shah Rukh Khan
• **Jawan** (2023) – Shah Rukh Khan
• **Animal** (2023) – Ranbir Kapoor
• **Rocky Aur Rani** (2023) – Ranveer Singh

**All-Time Classics:**
• **3 Idiots** – Comedy/Drama
• **Dangal** – Sports/Drama
• **Dilwale Dulhania Le Jayenge** – Romance
• **Lagaan** – Period Drama

**Thrillers/Action:**
• **Gangs of Wasseypur** – Crime Saga
• **Andhadhun** – Psychological Thriller
• **Drishyam 2** – Mystery

Want recommendations by genre, actor, or era?`,
    },
    {
      keywords:
        /hollywood movie|english movie|american movie|action movie|superhero movie/i,
      response: `Here are top Hollywood movies to watch! 🎥

**Action/Superhero:**
• **Avengers: Endgame** – Marvel epic
• **Top Gun: Maverick** – Tom Cruise
• **John Wick** series – Keanu Reeves
• **Mission: Impossible** series

**Drama/Oscar Winners:**
• **Oppenheimer** (2023)
• **Everything Everywhere All at Once** (2022)
• **Parasite** (2019)

**Sci-Fi/Thriller:**
• **Inception** – Christopher Nolan
• **Interstellar** – Christopher Nolan
• **The Matrix** trilogy

**Comedy:**
• **The Grand Budapest Hotel**
• **Game Night**
• **Knives Out**

Want picks by genre, director, or decade?`,
    },
    {
      keywords: /scary movie|horror movie|horror film|thriller movie/i,
      response: `Here are the best horror & thriller movies! 😱

**Modern Horror:**
• **Get Out** (2017) – Jordan Peele
• **Hereditary** (2018) – Slow burn
• **A Quiet Place** (2018) – Tense silence
• **The Conjuring** series

**Psychological Thrillers:**
• **Parasite** (2019)
• **Gone Girl** (2014)
• **Silence of the Lambs** (1991)

**Classic Horror:**
• **The Shining** – Kubrick
• **Halloween** (1978)
• **It** – Stephen King

**Supernatural:**
• **The Haunting of Hill House** (Netflix)
• **Sinister** (2012)

Want jumpscares, psychological, or supernatural horror specifically?`,
    },
  ],
  food: [
    {
      keywords:
        /punjabi recipe|punjabi food|punjabi dish|sarson|makki|butter chicken|dal makhani|amritsari/i,
      response: `Here are amazing Punjabi dishes you should try! 🍛

**Classic Punjabi Meals:**
• **Butter Chicken** (Murgh Makhani) – creamy tomato curry
• **Dal Makhani** – slow-cooked black lentils with butter
• **Sarson Da Saag + Makki Di Roti** – mustard greens + cornbread
• **Chole Bhature** – chickpea curry + fried bread
• **Rajma Chawal** – kidney bean curry with rice
• **Amritsari Kulcha** – stuffed bread from Amritsar

**Street Food:**
• **Aloo Tikki Chaat** – spiced potato patties
• **Golgappa/Pani Puri** – crispy shells with tangy water
• **Lassi** – sweet/salty yogurt drink

**Desserts:**
• **Phirni** – rice pudding
• **Gulab Jamun** – milk dumplings in syrup
• **Pinni** – wheat and jaggery sweet

Want the recipe for any of these? I can walk you through it step by step!`,
    },
    {
      keywords:
        /breakfast recipe|breakfast idea|what to eat for breakfast|morning food/i,
      response: `Here are delicious breakfast ideas to start your day right! 🌅

**Quick & Easy (under 10 min):**
• Scrambled eggs with toast
• Greek yogurt with berries and honey
• Overnight oats (prep the night before)
• Avocado toast with poached egg
• Banana smoothie with peanut butter

**Desi Breakfasts:**
• Poha (flattened rice) with onions and peanuts
• Upma – semolina porridge
• Paratha with curd and pickle
• Idli + Sambar + Coconut Chutney

**Weekend Treats:**
• Pancakes with maple syrup
• French toast
• Full English breakfast
• Masala omelette

Want the recipe for any of these? Or tell me if you want vegetarian, high-protein, or quick options!`,
    },
  ],
  general: [
    {
      keywords:
        /book to read|good book|recommend book|book recommendation|suggest book|reading list/i,
      response: `Here are some excellent books across genres! 📚

**Personal Growth:**
• **Atomic Habits** – James Clear
• **The Psychology of Money** – Morgan Housel
• **Think Again** – Adam Grant
• **Deep Work** – Cal Newport

**Fiction/Stories:**
• **The Alchemist** – Paulo Coelho
• **Sapiens** – Yuval Noah Harari
• **The Kite Runner** – Khaled Hosseini
• **Ikigai** – Héctor García

**Thrillers:**
• **Gone Girl** – Gillian Flynn
• **The Girl with the Dragon Tattoo** – Stieg Larsson
• **Da Vinci Code** – Dan Brown

**Desi Authors:**
• **The White Tiger** – Aravind Adiga
• **A Fine Balance** – Rohinton Mistry
• **2 States** – Chetan Bhagat

Want recommendations by genre, topic, or author?`,
    },
    {
      keywords:
        /web series|series to watch|tv show|netflix show|what to watch|binge watch/i,
      response: `Here are must-watch shows and series! 📺

**Netflix Hits:**
• **Mirzapur** – Indian crime drama (Hindi)
• **Sacred Games** – Indian thriller
• **Scam 1992** – Indian finance drama
• **Money Heist** – Spanish heist drama
• **Stranger Things** – Sci-fi thriller
• **Wednesday** – Gothic comedy

**Global Hits:**
• **Breaking Bad** – Crime drama (GOAT)
• **Game of Thrones** – Fantasy epic
• **Squid Game** – Korean survival
• **The Crown** – British royals

**Comedy:**
• **The Office** – Workplace comedy
• **Brooklyn Nine-Nine** – Cop comedy
• **Friends** – Classic sitcom

Want picks by language, genre, or platform?`,
    },
    {
      keywords:
        /travel|place to visit|tourist spot|vacation|holiday destination|where to go/i,
      response: `Here are amazing places to visit! ✈️

**India Must-Visits:**
• **Rajasthan** – Forts, palaces, desert
• **Kerala** – Backwaters, beaches, spice gardens
• **Himachal Pradesh** – Mountains, snow, trekking
• **Goa** – Beaches, nightlife, seafood
• **Varanasi** – Spiritual, ancient ghats

**International Dream Destinations:**
• **Bali, Indonesia** – Temples, rice terraces, beaches
• **Tokyo, Japan** – Culture, food, technology
• **Paris, France** – Art, food, romance
• **Dubai, UAE** – Luxury, shopping, skyline
• **Maldives** – Crystal water, overwater bungalows

**Budget Travel:**
• Vietnam, Thailand, Nepal, Sri Lanka

Want tips for budget travel, best seasons, or a specific country?`,
    },
  ],
};

function getRecommendation(query: string, category: string): string | null {
  const lower = query.toLowerCase();
  const suggestWords =
    /suggest|recommend|give me|list|show me|what are some|best|top|popular/i;
  const mediaWords =
    /song|music|movie|film|show|series|book|place|food|dish|recipe|travel|destination|album|artist|playlist|track/i;
  const isRecommendationQuery =
    (suggestWords.test(query) && mediaWords.test(query)) ||
    suggestWords.test(query);

  if (!isRecommendationQuery && category !== "entertainment") return null;

  const allEntries = [
    ...recommendations.music,
    ...recommendations.movies,
    ...recommendations.food,
    ...recommendations.general,
  ];

  for (const entry of allEntries) {
    if (entry.keywords.test(lower) || entry.keywords.test(query)) {
      return entry.response;
    }
  }

  // Category-level match (e.g. "suggest some songs" without specifying genre)
  if (/(song|music|track|playlist|album)/i.test(lower)) {
    return `Here are some great songs across popular genres! 🎵

**Punjabi Hits:** Brown Munde (AP Dhillon), 295 (Sidhu Moosewala), Lover (Diljit Dosanjh)

**Bollywood:** Kesariya (Arijit Singh), Raataan Lambiyan (Jubin Nautiyal), Channa Mereya

**English Pop:** Flowers (Miley Cyrus), As It Was (Harry Styles), Cruel Summer (Taylor Swift)

**Hip-Hop/Rap:** God's Plan (Drake), HUMBLE (Kendrick Lamar), Lose Yourself (Eminem)

**Sad Vibes:** Someone Like You (Adele), The Night We Met (Lord Huron), Tum Hi Ho (Arijit)

Tell me your mood or preferred language and I'll give you a more personalised list! 🎧`;
  }

  if (/(movie|film|watch|cinema)/i.test(lower)) {
    return `Here are some great movies to watch! 🎬

**Bollywood:** Animal, Pathaan, 3 Idiots, Dangal, Andhadhun

**Hollywood:** Oppenheimer, Top Gun: Maverick, Avengers: Endgame, Inception, Parasite

**South Indian:** RRR, Pushpa, KGF 2, Vikram

**Korean:** Squid Game (series), Parasite, Train to Busan

Want recommendations by genre (action, romance, thriller, comedy) or language?`;
  }

  return null;
}

export async function generateAIResponse(
  message: string,
  activeCategory: string,
  ageGroup: string,
  userAge = 99,
): Promise<AIResponse> {
  // Age-based content filter
  if (isContentBlocked(message, userAge)) {
    return getBlockedMessage(userAge);
  }
  const lower = message.toLowerCase().trim();
  const quickLinks = {
    google: `https://www.google.com/search?q=${encodeURIComponent(message)}`,
    chatgpt: `https://chat.openai.com/?q=${encodeURIComponent(message)}`,
  };
  const suggestions = getSuggestions(message, activeCategory);

  // ── Search mode ──
  if (/^search[:\s]/i.test(lower) || /\bsearch for\b/i.test(lower)) {
    const query = message
      .replace(/^search[:\s]*/i, "")
      .replace(/search for /i, "")
      .trim();
    const results = generateSearchResults(query);
    const imageResults = getImageResults(query);
    const querySuggestions = getSuggestions(query, activeCategory);
    let knowledgeAnswer = "";
    for (const entry of knowledgeBase) {
      if (entry.keywords.test(query)) {
        knowledgeAnswer = entry.response;
        break;
      }
    }
    const [googleResultSearch, wikiResultSearch, ddgResultSearch] =
      await Promise.allSettled([
        fetchGoogleStyleAnswer(query),
        fetchWikipediaAnswer(query),
        fetchDuckDuckGoAnswer(query),
      ]);
    const googleAnswerSearch =
      googleResultSearch.status === "fulfilled"
        ? googleResultSearch.value
        : null;
    const wikiCardSearch =
      wikiResultSearch.status === "fulfilled" ? wikiResultSearch.value : null;
    const ddgSearch =
      ddgResultSearch.status === "fulfilled" ? ddgResultSearch.value : null;

    let mainText = knowledgeAnswer;
    if (
      !mainText &&
      googleAnswerSearch &&
      googleAnswerSearch.answer.length > 80
    ) {
      mainText = googleAnswerSearch.answer;
    }
    if (!mainText && ddgSearch?.abstract) {
      mainText = ddgSearch.abstract;
      if (ddgSearch.relatedTopics.length > 0) {
        mainText += `\n\n**Related topics:**\n${ddgSearch.relatedTopics
          .slice(0, 3)
          .map((t) => `• ${t}`)
          .join("\n")}`;
      }
    }
    if (!mainText) {
      mainText =
        wikiCardSearch?.extract ??
        `Here are the top results for "${query}". Explore the links below or ask me to explain any aspect in detail.`;
    }
    return {
      text: `**Search results for "${query}":**\n\n${mainText}`,
      searchResults: results,
      imageResults,
      isSearch: true,
      suggestions: querySuggestions,
      wikiCard: !knowledgeAnswer && wikiCardSearch ? wikiCardSearch : undefined,
      quickLinks,
    };
  }

  // ── Greetings & small talk ──
  for (const { pattern, response } of greetingPatterns) {
    if (pattern.test(lower)) {
      return { text: applyTone(response, ageGroup), quickLinks };
    }
  }

  // ── Recommendation queries (songs, movies, food, travel, etc.) ──
  const recommendationAnswer = getRecommendation(message, activeCategory);
  if (recommendationAnswer) {
    const imageResults = getImageResults(message);
    return {
      text: recommendationAnswer,
      imageResults,
      suggestions,
      quickLinks,
      sources: ["NavvGenX Knowledge Base"],
    };
  }

  // ── Fashion / Lifestyle aesthetics (knowledge base is best source) ──

  // ── Fashion / Lifestyle aesthetics (knowledge base is best source) ──
  const isFashionQuery =
    activeCategory === "fashion" || fashionKeywords.test(lower);
  if (isFashionQuery) {
    for (const entry of knowledgeBase) {
      if (entry.keywords.test(lower)) {
        const imageResults = getImageResults(message);
        return {
          text: applyTone(entry.response, ageGroup),
          imageResults,
          suggestions,
          quickLinks,
          sources: ["Knowledge Base"],
        };
      }
    }
  }

  // ── Parallel fetch: ALL sources simultaneously ──
  const [googleResult, wikiResult, ddgResult] = await Promise.allSettled([
    fetchGoogleStyleAnswer(message),
    fetchWikipediaAnswer(message),
    fetchDuckDuckGoAnswer(message),
  ]);
  const googleAnswer =
    googleResult.status === "fulfilled" ? googleResult.value : null;
  const wikiCard = wikiResult.status === "fulfilled" ? wikiResult.value : null;
  const ddgData = ddgResult.status === "fulfilled" ? ddgResult.value : null;

  // ── Aggregate ALL sources ──
  const sourceParts: string[] = [];
  const usedSources: string[] = [];

  // 1. Google-style structured answer (country, book, person, definition)
  if (googleAnswer && googleAnswer.answer.length > 80) {
    sourceParts.push(googleAnswer.answer);
    if (googleAnswer.type === "country") usedSources.push("REST Countries API");
    else if (googleAnswer.source === "Open Library")
      usedSources.push("Open Library");
    else usedSources.push("Wikipedia");
  }

  // 2. DuckDuckGo direct instant answer
  if (ddgData?.answer && ddgData.answer.length > 5) {
    const ddgText = `**${ddgData.answer}**${ddgData.abstract ? `\n${ddgData.abstract}` : ""}`;
    if (!sourceParts.some((p) => p.includes(ddgData.answer ?? ""))) {
      sourceParts.push(ddgText);
      usedSources.push("DuckDuckGo");
    }
  } else if (ddgData?.abstract && ddgData.abstract.length > 80) {
    if (!sourceParts.some((p) => p.length > 80)) {
      sourceParts.push(ddgData.abstract);
    } else {
      // Add as additional context if it adds new info
      const existing = sourceParts[0] ?? "";
      if (!existing.includes(ddgData.abstract.slice(0, 40))) {
        sourceParts.push(ddgData.abstract);
      }
    }
    usedSources.push("DuckDuckGo");
  }

  // 3. Wikipedia card extract
  if (wikiCard?.extract && wikiCard.extract.length > 80) {
    const existing = sourceParts.join(" ");
    if (!existing.includes(wikiCard.extract.slice(0, 50))) {
      sourceParts.push(wikiCard.extract);
      if (!usedSources.includes("Wikipedia")) usedSources.push("Wikipedia");
    } else if (!usedSources.includes("Wikipedia")) {
      usedSources.push("Wikipedia");
    }
  }

  // 4. Knowledge base
  let kbMatch = "";
  for (const entry of knowledgeBase) {
    if (entry.keywords.test(lower)) {
      kbMatch = entry.response;
      break;
    }
  }
  if (kbMatch) {
    usedSources.push("Knowledge Base");
    if (sourceParts.length === 0) {
      sourceParts.push(kbMatch);
    }
  }

  // ── Build aggregated answer ──
  if (sourceParts.length > 0) {
    let finalText = sourceParts[0];

    // Merge second source if it adds meaningful new content
    if (sourceParts.length > 1) {
      const second = sourceParts[1];
      const firstWords = finalText.toLowerCase().slice(0, 100);
      const secondStart = second.toLowerCase().slice(0, 40);
      if (!firstWords.includes(secondStart) && second.length > 60) {
        finalText += `\n\n**Additional context:**\n${second}`;
      }
    }

    // Add DuckDuckGo related topics
    if (ddgData?.relatedTopics && ddgData.relatedTopics.length > 0) {
      finalText += `\n\n**Related topics:**\n${ddgData.relatedTopics
        .slice(0, 3)
        .map((t) => `• ${t}`)
        .join("\n")}`;
    }

    // Follow-up suggestions from topic
    const topicWord = message
      .replace(/^(what|who|how|why|tell me about)\s*/i, "")
      .slice(0, 30);
    const followUpSuggestions = [
      ...suggestions,
      `Tell me more about ${topicWord}`,
      `History of ${topicWord}`,
      `Why is ${topicWord} important`,
    ]
      .filter((s, i, a) => a.indexOf(s) === i)
      .slice(0, 8);

    const imageResults: ImageResult[] = wikiCard?.thumbnail
      ? [
          {
            url: wikiCard.thumbnail,
            alt: wikiCard.title,
            searchUrl: `https://www.google.com/search?q=${encodeURIComponent(message)}&tbm=isch`,
          },
          ...getUnsplashImages(message).slice(0, 3),
        ]
      : shouldShowImages(lower, activeCategory)
        ? getImageResults(message)
        : [];

    return {
      text: wrapFriendly(applyTone(finalText, ageGroup), message),
      suggestions: followUpSuggestions,
      imageResults: imageResults.length > 0 ? imageResults : undefined,
      wikiCard: wikiCard || undefined,
      quickLinks,
      sources: usedSources,
    };
  }

  // ── Category-specific advice fallback ──
  const buildCatResponse = (responses: string[], cat: string): AIResponse => {
    const r = responses[Math.floor(Math.random() * responses.length)];
    const imageResults = shouldShowImages(lower, cat)
      ? getImageResults(message)
      : undefined;
    return {
      text: wrapFriendly(applyTone(r, ageGroup), message),
      suggestions,
      imageResults,
      quickLinks,
      sources: ["Knowledge Base"],
    };
  };

  if (activeCategory === "health" || healthKeywords.test(lower)) {
    return buildCatResponse(healthResponses, "health");
  }
  if (activeCategory === "love" || loveKeywords.test(lower)) {
    return buildCatResponse(loveResponses, "love");
  }
  if (activeCategory === "study" || studyKeywords.test(lower)) {
    return buildCatResponse(studyResponses, "study");
  }
  if (activeCategory === "career" || careerKeywords.test(lower)) {
    return buildCatResponse(careerResponses, "career");
  }
  if (isFashionQuery) {
    return buildCatResponse(fashionResponses, "fashion");
  }
  if (activeCategory === "business" || businessKeywords.test(lower)) {
    return buildCatResponse(businessResponses, "business");
  }

  // ── Ultimate fallback ──
  return {
    text: wrapFriendly(
      applyTone(
        `I searched multiple sources for "${message}" but couldn't find a specific answer. Try rephrasing your question, or use the "Search Google" button below for the most up-to-date results. You can also try asking "what is [topic]", "who is [person]", or "how does [thing] work" for better results.`,
        ageGroup,
      ),
      message,
    ),
    suggestions,
    quickLinks,
  };
}
