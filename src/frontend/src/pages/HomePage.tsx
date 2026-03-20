import {
  BookOpen,
  BrainCircuit,
  Camera,
  Lightbulb,
  Mic,
  Search,
  ShoppingBag,
  Sparkles,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { LiveWidget } from "../components/LiveWidget";
import {
  getPollinationsImage,
  getShoppingLinks,
  getSocialLinks,
  getSuggestions,
  getWebSearchLinks,
  getYouTubeLinks,
} from "../utils/aiEngine";

interface HomePageProps {
  onNavigate: (page: string, category?: string) => void;
}

// AI Brain logic
function getAIResponseRaw(query: string): string {
  const q = query.toLowerCase();

  // Funny / joke
  if (
    q.includes("joke") ||
    q.includes("funny") ||
    q.includes("make me laugh") ||
    q.includes("haha")
  ) {
    return `😂 Haha! Here's one for you:\n\n**Why don't scientists trust atoms?** Because they make up everything! 😄\n\n*Okay okay, I felt that one too — hehe!* 🤣 Want another?`;
  }

  // Homework / math / assignment
  if (
    q.includes("homework") ||
    q.includes("assignment") ||
    q.includes("math") ||
    q.includes("solve") ||
    q.includes("equation")
  ) {
    return `📚 **Homework Solution**\n\n**Step-by-Step Approach:**\n1. **Understand the problem** — Read carefully, identify what's asked\n2. **Key concepts** — Apply relevant formulas/principles\n3. **Work through it** — Show all steps clearly\n4. **Verify** — Check your answer makes sense\n\n**Pro Tips:**\n• Break complex problems into smaller parts\n• Draw diagrams when helpful\n• Check units in math/science problems\n\nShare your specific question and I'll solve it step by step! 🚀`;
  }

  // Presentation / slides / PPT
  if (
    q.includes("presentation") ||
    q.includes("ppt") ||
    q.includes("slides") ||
    q.includes("slideshow")
  ) {
    const topic =
      query
        .replace(/make|create|presentation|ppt|slides|about|on|a|an|the/gi, "")
        .trim() || "Your Topic";
    return `📊 **Presentation: ${topic}**\n\n**Slide 1 — Title Slide**\n🎯 ${topic}: A Comprehensive Overview\n\n**Slide 2 — Introduction**\n• What is ${topic}?\n• Why it matters\n• Key objectives\n\n**Slide 3 — Core Concepts**\n• Main concept #1 with explanation\n• Main concept #2 with data\n• Supporting evidence\n\n**Slide 4 — Analysis & Insights**\n• Deep dive into the topic\n• Statistics and facts\n• Expert perspectives\n\n**Slide 5 — Real-World Examples**\n• Case study 1\n• Case study 2\n• Lessons learned\n\n**Slide 6 — Conclusion & Q&A**\n• Key takeaways\n• Next steps\n• Thank you!\n\n✨ *Tip: Add visuals, keep text minimal, and use consistent colors!*`;
  }

  // Fashion / outfit
  if (
    q.includes("outfit") ||
    q.includes("fashion") ||
    q.includes("dress") ||
    q.includes("cloth") ||
    q.includes("wear")
  ) {
    return `👗 **Fashion Advice**\n\n**Outfit Formula that always works:**\n• **Casual:** Slim jeans + plain tee + white sneakers = timeless\n• **Smart casual:** Chinos + button-down + loafers = polished\n• **Formal:** Tailored suit or saree/kurta with accessories\n\n**Color Tips:**\n• Neutrals (black, white, navy, beige) go with everything\n• One statement piece per outfit\n• Match your shoes to your bag\n\n**Seasonal picks:**\n• Summer: Light fabrics, pastels, breathable cotton\n• Winter: Layering, warm tones, cozy knits\n\nTell me the occasion and I'll give you a specific recommendation! 💫`;
  }

  // Study tips
  if (
    q.includes("study") ||
    q.includes("exam") ||
    q.includes("learn") ||
    q.includes("memorize") ||
    q.includes("notes")
  ) {
    return "🎓 **Smart Study Techniques**\n\n**Top 5 Proven Methods:**\n1. **Pomodoro Technique** — 25 min focus, 5 min break. Repeat 4x, then long break\n2. **Active Recall** — Close your notes, write what you remember\n3. **Spaced Repetition** — Review notes after 1 day, 3 days, 1 week, 1 month\n4. **Mind Mapping** — Draw visual connections between concepts\n5. **Teach it back** — Explain the topic as if teaching someone else\n\n**Daily Routine:**\n• Morning: Hardest subjects (peak focus)\n• Afternoon: Practice problems\n• Evening: Review and flashcards\n\n**Bonus:** Sleep 7-8 hours — memory consolidates during sleep! 🧠";
  }

  // Music suggestions
  if (
    q.includes("song") ||
    q.includes("music") ||
    q.includes("playlist") ||
    q.includes("track") ||
    q.includes("punjabi") ||
    q.includes("hindi song")
  ) {
    return "🎵 **Music Recommendations**\n\n**Punjabi Hits:**\n1. Softly — Karan Aujla\n2. Lover — Diljit Dosanjh\n3. GOAT — Diljit Dosanjh\n4. 295 — Sidhu Moosewala\n5. Brown Munde — AP Dhillon\n\n**Bollywood Vibes:**\n1. Kesariya — Arijit Singh\n2. Raataan Lambiyan — Jubin Nautiyal\n3. Tum Hi Ho — Arijit Singh\n4. Ae Dil Hai Mushkil — Arijit Singh\n5. Pal Pal Dil Ke Paas — Arijit Singh\n\n**International Hits:**\n1. Blinding Lights — The Weeknd\n2. Shape of You — Ed Sheeran\n3. As It Was — Harry Styles\n\n🎧 *Tell me your mood or genre for a personalized playlist!*";
  }

  // Movies
  if (
    q.includes("movie") ||
    q.includes("film") ||
    q.includes("watch") ||
    q.includes("series") ||
    q.includes("web series")
  ) {
    return "🎬 **Movie & Series Picks**\n\n**Bollywood (Must Watch):**\n1. 3 Idiots (2009) ⭐ 8.4 — Inspirational comedy\n2. Dangal (2016) ⭐ 8.3 — Sports drama\n3. Zindagi Na Milegi Dobara (2011) ⭐ 8.2 — Adventure\n\n**Hollywood Blockbusters:**\n1. Interstellar (2014) ⭐ 8.7 — Sci-fi masterpiece\n2. Inception (2010) ⭐ 8.8 — Mind-bending thriller\n3. The Dark Knight (2008) ⭐ 9.0 — Action classic\n\n**Web Series:**\n1. Breaking Bad — Crime drama (Netflix)\n2. Mirzapur — Indian crime series (Prime)\n3. Sacred Games — Indian thriller (Netflix)\n\n🍿 *Tell me your preferred genre for tailored picks!*";
  }

  // Shopping
  if (
    q.includes("buy") ||
    q.includes("shopping") ||
    q.includes("price") ||
    q.includes("deal") ||
    q.includes("amazon") ||
    q.includes("flipkart")
  ) {
    return `🛍️ **Shopping Guide**\n\n**Best platforms to shop:**\n• [Amazon India](https://amazon.in) — Electronics, books, daily items\n• [Flipkart](https://flipkart.com) — Indian brands, great deals\n• [Myntra](https://myntra.com) — Fashion & clothing\n• [Meesho](https://meesho.com) — Budget fashion\n\n**Smart Shopping Tips:**\n1. Compare prices across platforms first\n2. Check seller ratings (4+ stars)\n3. Read reviews (especially negative ones)\n4. Look for coupon codes before buying\n5. Use wishlist to track price drops\n\n**Current Hot Deals:**\n• Electronics: Check Amazon's Deal of the Day\n• Fashion: Flipkart Big Billion Days\n• Groceries: BigBasket / JioMart offers\n\nTell me what you want to buy and I'll find the best options! 🎯`;
  }

  // Smart advice / life
  if (
    q.includes("advice") ||
    q.includes("life") ||
    q.includes("career") ||
    q.includes("tips") ||
    q.includes("motivation")
  ) {
    return "💡 **Smart Life Advice**\n\n**Career Growth:**\n• Learn one new skill every 3 months\n• Build your network — LinkedIn is powerful\n• Side projects showcase your abilities\n• Read industry news daily (30 min)\n\n**Personal Growth:**\n• Exercise 30 min daily — boosts energy & mood\n• Journaling clarifies your thoughts\n• Limit social media scrolling to 30 min/day\n• Practice gratitude — write 3 things daily\n\n**Financial Wisdom:**\n• Save at least 20% of your income\n• Start investing early (SIP, mutual funds)\n• Emergency fund = 6 months expenses\n\n**Relationships:**\n• Quality time > gifts\n• Listen more than you speak\n• Express appreciation often\n\n✨ *What specific area of life do you want advice on?*";
  }

  // Creative / creative AI
  if (
    q.includes("story") ||
    q.includes("creative") ||
    q.includes("write") ||
    q.includes("poem") ||
    q.includes("create")
  ) {
    return `✨ **Creative Writing Assistant**\n\n**Story Starter (Sci-fi):**\n*In the year 2157, Aria discovered that the moon wasn't a natural satellite — it was a spacecraft that had been parked there for 4,000 years, and it was finally waking up...*\n\n**Quick Poem:**\n*Stars burn bright in midnight skies,*\n*Dreams take flight as the morning flies,*\n*Every step a story new,*\n*The world is vast, and so are you.*\n\n**Creative prompts for you:**\n• Write about a world where music is banned\n• A letter to your future self in 10 years\n• Describe your perfect day in 100 words\n\nTell me what you want to create and I'll help you build it! 🎨`;
  }

  // General friendly response
  return `🤖 **NavvGenX is here to help!**\n\nYou asked: *"${query}"*\n\n**Here's what I know:**\nNavvGenX can help you with:\n• 📚 Homework & assignments\n• 📊 Creating presentations\n• 🎵 Music & movie recommendations\n• 🛍️ Shopping advice\n• 💡 Life & career tips\n• ✨ Creative writing\n• 🎓 Study techniques\n• 👗 Fashion & style\n\n**Search it further:**\n• [Google](https://www.google.com/search?q=${encodeURIComponent(query)})\n• [Wikipedia](https://en.wikipedia.org/wiki/${encodeURIComponent(query)})\n• [Ask ChatGPT](https://chat.openai.com)\n\n*Ask me anything — I'm your AI friend, always ready to help! 😊*`;
}

function getAIResponse(query: string): string {
  const q = query.toLowerCase();
  const rawText = getAIResponseRaw(query);
  const links: string[] = [];
  // Image / generate
  if (
    q.includes("image") ||
    q.includes("picture") ||
    q.includes("generate image") ||
    q.includes("draw")
  ) {
    links.push(getPollinationsImage(query));
  }
  // Shopping
  if (
    q.includes("buy") ||
    q.includes("shop") ||
    q.includes("price") ||
    q.includes("deal") ||
    q.includes("amazon") ||
    q.includes("flipkart")
  ) {
    links.push(getShoppingLinks(query));
  }
  // Music / movie / video
  if (
    q.includes("song") ||
    q.includes("music") ||
    q.includes("movie") ||
    q.includes("film") ||
    q.includes("watch") ||
    q.includes("video")
  ) {
    links.push(getYouTubeLinks(query));
    links.push(getSocialLinks(query));
  }
  // Social media
  if (
    q.includes("instagram") ||
    q.includes("twitter") ||
    q.includes("tiktok") ||
    q.includes("social")
  ) {
    links.push(getSocialLinks(query));
  }
  // Always append web search
  links.push(getWebSearchLinks(query));
  const linksHtml = links.join("");
  return rawText + (linksHtml ? `\n\n${linksHtml}` : "");
}

const featureCards = [
  {
    icon: "📚",
    title: "Homework Helper",
    desc: "Solve any assignment",
    action: "homework",
    prompt: "Help me with my homework assignment",
  },
  {
    icon: "📊",
    title: "Presentations",
    desc: "Create slides instantly",
    action: "presentation",
    prompt: "Make a presentation on",
  },
  {
    icon: "💡",
    title: "Smart Advice",
    desc: "Life & career tips",
    action: "advice",
    prompt: "Give me smart life and career advice",
  },
  {
    icon: "🛍️",
    title: "Shopping Guide",
    desc: "Best deals & suggestions",
    action: "shopping",
    prompt: "Help me find the best shopping deals",
  },
  {
    icon: "🎓",
    title: "Study Helper",
    desc: "Exam prep & notes",
    action: "study",
    prompt: "How can I study effectively for exams",
  },
  {
    icon: "✨",
    title: "Creative AI",
    desc: "Stories, art, music",
    action: "creative",
    prompt: "Create something creative for me",
  },
];

const quickLinks = [
  { label: "YouTube", url: "https://youtube.com", icon: "▶️" },
  { label: "Amazon", url: "https://amazon.in", icon: "🛒" },
  { label: "Wiki", url: "https://wikipedia.org", icon: "📖" },
  { label: "ChatGPT", url: "https://chat.openai.com", icon: "🤖" },
  { label: "Google Scholar", url: "https://scholar.google.com", icon: "🎓" },
  { label: "Flipkart", url: "https://flipkart.com", icon: "🏪" },
];

const searchEngines = [
  { name: "Bing", url: "https://www.bing.com/search?q=" },
  { name: "DuckDuckGo", url: "https://duckduckgo.com/?q=" },
  { name: "Yahoo", url: "https://search.yahoo.com/search?p=" },
  { name: "Startpage", url: "https://www.startpage.com/do/search?q=" },
  { name: "Yandex", url: "https://yandex.com/search/?text=" },
];

export function HomePage({ onNavigate }: HomePageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [universalSearchQuery, setUniversalSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const s = getSuggestions(searchQuery, "general");
      setSuggestions(s);
      setShowSuggestions(s.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  const handleSearch = (query?: string) => {
    const q = (query ?? searchQuery).trim();
    setShowSuggestions(false);
    if (q) {
      sessionStorage.setItem("navvgenx-initial-query", q);
    }
    onNavigate("chat", "general");
  };

  const handleAISubmit = (query?: string) => {
    const q = (query ?? aiInput).trim();
    if (!q) return;
    setAiLoading(true);
    setAiResponse("");
    setTimeout(
      () => {
        const response = getAIResponse(q);
        setAiResponse(response);
        setAiLoading(false);
        // Save to history
        const history = JSON.parse(
          localStorage.getItem("navvgenx-chat-history") || "[]",
        );
        history.unshift({ query: q, response, timestamp: Date.now() });
        localStorage.setItem(
          "navvgenx-chat-history",
          JSON.stringify(history.slice(0, 50)),
        );
      },
      800 + Math.random() * 800,
    );
  };

  const handleFeatureCardClick = (prompt: string) => {
    setAiInput(prompt);
    setAiResponse("");
    setAiPanelOpen(true);
  };

  const handleVoiceMic = async (forAIPanel = false) => {
    const win = window as Window & typeof globalThis;
    const SpeechRec =
      (win as unknown as { SpeechRecognition?: typeof SpeechRecognition })
        .SpeechRecognition ||
      (
        win as unknown as {
          webkitSpeechRecognition?: typeof SpeechRecognition;
        }
      ).webkitSpeechRecognition;

    if (!SpeechRec) {
      toast.error("Voice input not supported in this browser");
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      await navigator.mediaDevices?.getUserMedia({ audio: true });
    } catch {
      toast.error("Microphone access denied");
      return;
    }

    const recognition = new SpeechRec();
    recognitionRef.current = recognition;
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setIsRecording(false);
      if (forAIPanel) {
        setAiInput(transcript);
        setAiPanelOpen(true);
        setTimeout(() => handleAISubmit(transcript), 100);
      } else {
        setSearchQuery(transcript);
        setTimeout(() => handleSearch(transcript), 100);
      }
    };

    recognition.onerror = () => {
      setIsRecording(false);
      toast.error("Voice input failed. Please try again.");
    };
    recognition.onend = () => setIsRecording(false);
    recognition.start();
    setIsRecording(true);
  };

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      setCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      }, 100);
    } catch {
      toast.error("Camera access denied");
    }
  };

  const closeCamera = () => {
    for (const t of streamRef.current?.getTracks() ?? []) {
      t.stop();
    }
    streamRef.current = null;
    setCameraOpen(false);
  };

  const handleUniversalSearch = () => {
    if (!universalSearchQuery.trim()) return;
    const encoded = encodeURIComponent(universalSearchQuery.trim());
    window.open(`https://www.google.com/search?q=${encoded}`, "_blank");
  };

  const formatAIResponse = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(
        /\[(.*?)\]\((.*?)\)/g,
        '<a href="$2" target="_blank" rel="noreferrer" style="color:#667eea;text-decoration:underline;">$1</a>',
      )
      .replace(/\n/g, "<br />");
  };

  return (
    <div
      className="relative min-h-screen"
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* App Container */}
      <div
        className="mx-auto flex flex-col relative"
        style={{
          maxWidth: 480,
          minHeight: "100vh",
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
        }}
      >
        {/* ===== HEADER ===== */}
        <div
          style={{
            background: "linear-gradient(135deg, #ff6b6b, #feca57)",
            padding: "20px",
            textAlign: "center",
            position: "relative",
            zIndex: 10,
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              background: "linear-gradient(45deg, #fff, #f0f0f0)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: 4,
            }}
          >
            NavvGenX
          </div>
          <div
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.9)",
              fontWeight: 500,
            }}
          >
            AI-Powered Everything
          </div>
          {/* Search bar in header area */}
          <div
            className="flex items-center gap-2 mt-3 rounded-full px-4 py-2"
            style={{ background: "rgba(255,255,255,0.25)" }}
          >
            <Search size={16} className="text-white shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
                if (e.key === "Escape") setShowSuggestions(false);
              }}
              onFocus={() =>
                searchQuery.trim().length >= 2 && setShowSuggestions(true)
              }
              placeholder="Search or ask NavvGenX..."
              className="flex-1 bg-transparent outline-none text-white placeholder:text-white/70 text-sm"
              style={{ minWidth: 0 }}
              data-ocid="home.search_input"
            />
            <button
              type="button"
              onClick={() => openCamera()}
              className="text-white/80 hover:text-white transition-colors"
              title="Camera search"
              data-ocid="home.toggle"
            >
              <Camera size={16} />
            </button>
            <button
              type="button"
              onClick={() => handleVoiceMic(false)}
              className={`transition-colors ${
                isRecording
                  ? "text-red-200 animate-pulse"
                  : "text-white/80 hover:text-white"
              }`}
              title="Voice search"
              data-ocid="home.toggle"
            >
              <Mic size={16} />
            </button>
          </div>

          {/* Suggestions */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute left-4 right-4 rounded-2xl border border-gray-100 shadow-xl z-30 overflow-hidden"
                style={{ top: "100%", background: "white", marginTop: 4 }}
              >
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setSearchQuery(s);
                      setShowSuggestions(false);
                      sessionStorage.setItem("navvgenx-initial-query", s);
                      onNavigate("chat", "general");
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100 last:border-0 flex items-center gap-2"
                  >
                    <Search size={12} className="text-gray-400 shrink-0" />
                    {s}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ===== AI PANEL ===== */}
        <AnimatePresence>
          {aiPanelOpen && (
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-0 z-50 flex flex-col"
              style={{
                background: "rgba(255,255,255,0.98)",
                maxWidth: 480,
                left: "50%",
                transform: aiPanelOpen ? "translateX(-50%)" : "translateX(50%)",
              }}
              data-ocid="home.modal"
            >
              {/* AI Panel header */}
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{
                  background: "linear-gradient(135deg, #667eea, #764ba2)",
                }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{
                      background: "linear-gradient(135deg, #ff6b6b, #feca57)",
                    }}
                  >
                    N
                  </div>
                  <span className="text-white font-bold text-sm">
                    NavvGenX AI
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAiPanelOpen(false);
                    setAiResponse("");
                  }}
                  className="text-white/80 hover:text-white p-1"
                  data-ocid="home.close_button"
                >
                  <X size={20} />
                </button>
              </div>

              {/* AI Panel content */}
              <div className="flex-1 overflow-y-auto p-4">
                {/* Input row */}
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAISubmit()}
                    placeholder="Ask anything... 📚💡👗"
                    autoComplete="off"
                    className="flex-1 px-4 py-3 rounded-full text-sm outline-none"
                    style={{
                      border: "2px solid #e1e5e9",
                      fontSize: 15,
                    }}
                    data-ocid="home.input"
                  />
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => handleAISubmit()}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-sm font-semibold"
                    style={{
                      background: "linear-gradient(135deg, #667eea, #764ba2)",
                    }}
                    data-ocid="home.submit_button"
                  >
                    <BrainCircuit size={14} /> Send
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVoiceMic(true)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border-2 border-gray-200 ${
                      isRecording
                        ? "bg-red-100 text-red-600 border-red-300 animate-pulse"
                        : "bg-white text-gray-700"
                    }`}
                    data-ocid="home.toggle"
                  >
                    <Mic size={14} /> Voice
                  </button>
                  <button
                    type="button"
                    onClick={openCamera}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border-2 border-gray-200 bg-white text-gray-700"
                    data-ocid="home.toggle"
                  >
                    <Camera size={14} /> Camera
                  </button>
                </div>

                {/* Loading */}
                {aiLoading && (
                  <div
                    className="text-center py-8"
                    data-ocid="home.loading_state"
                  >
                    <div
                      className="w-10 h-10 rounded-full border-4 border-gray-200 mx-auto mb-3 animate-spin"
                      style={{ borderTopColor: "#667eea" }}
                    />
                    <p className="text-gray-500 text-sm">AI is thinking...</p>
                  </div>
                )}

                {/* Response */}
                {aiResponse && !aiLoading && (
                  <div
                    className="rounded-2xl p-4 text-sm leading-relaxed"
                    style={{
                      background: "linear-gradient(135deg, #f8f9ff, #e8ecff)",
                      borderLeft: "4px solid #667eea",
                      color: "#1a1a2e",
                      fontWeight: 500,
                    }}
                    data-ocid="home.success_state"
                    // biome-ignore lint/security/noDangerouslySetInnerHtml: formatted AI response
                    dangerouslySetInnerHTML={{
                      __html: formatAIResponse(aiResponse),
                    }}
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== MAIN CONTENT ===== */}
        <div
          className="flex-1 overflow-y-auto"
          style={{ padding: "20px", paddingBottom: "120px" }}
        >
          {/* ---- Section: Feature Grid ---- */}
          <section aria-label="AI Features">
            <h2
              className="text-xs font-semibold uppercase tracking-wider mb-4"
              style={{ color: "#667eea", letterSpacing: "0.1em" }}
            >
              ✦ AI Tools
            </h2>
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
              }}
            >
              {featureCards.map((card, i) => (
                <motion.button
                  key={card.action}
                  type="button"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => handleFeatureCardClick(card.prompt)}
                  className="flex flex-col items-center text-center rounded-2xl cursor-pointer transition-all"
                  style={{
                    background: "rgba(255,255,255,0.85)",
                    padding: "22px 12px",
                    border: "2px solid transparent",
                    boxShadow: "0 2px 12px rgba(102,126,234,0.08)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform =
                      "translateY(-6px)";
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      "#667eea";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                      "0 16px 32px rgba(102,126,234,0.18)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform =
                      "translateY(0)";
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      "transparent";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                      "0 2px 12px rgba(102,126,234,0.08)";
                  }}
                  data-ocid={`home.item.${i + 1}`}
                >
                  <div
                    className="flex items-center justify-center rounded-2xl mb-3 text-2xl"
                    style={{
                      width: 52,
                      height: 52,
                      background: "linear-gradient(135deg, #667eea, #764ba2)",
                    }}
                  >
                    {card.icon}
                  </div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 13,
                      color: "#1a1a2e",
                      marginBottom: 3,
                    }}
                  >
                    {card.title}
                  </div>
                  <div style={{ fontSize: 11, color: "#666" }}>{card.desc}</div>
                </motion.button>
              ))}
            </div>
          </section>

          {/* Section divider */}
          <div
            className="my-6"
            style={{
              height: 1,
              background:
                "linear-gradient(90deg, transparent, #667eea33, transparent)",
            }}
          />

          {/* ---- Section: Live Weather & News ---- */}
          <section aria-label="Live Updates" className="mb-6">
            <h2
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: "#667eea", letterSpacing: "0.1em" }}
            >
              ✦ Live Updates
            </h2>
            <LiveWidget onNavigateToLive={() => onNavigate("live")} />
          </section>

          {/* Section divider */}
          <div
            className="my-6"
            style={{
              height: 1,
              background:
                "linear-gradient(90deg, transparent, #667eea33, transparent)",
            }}
          />

          {/* ---- Section: Quick Categories ---- */}
          <section aria-label="Quick Categories" className="mb-6">
            <h2
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: "#667eea", letterSpacing: "0.1em" }}
            >
              ✦ Explore Topics
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Health", icon: "❤️", cat: "health", color: "#ff6b6b" },
                { label: "Love", icon: "💕", cat: "love", color: "#ff4757" },
                { label: "Study", icon: "📚", cat: "study", color: "#667eea" },
                {
                  label: "Career",
                  icon: "💼",
                  cat: "career",
                  color: "#2ed573",
                },
                {
                  label: "Fashion",
                  icon: "👗",
                  cat: "fashion",
                  color: "#a55eea",
                },
                {
                  label: "Business",
                  icon: "📈",
                  cat: "business",
                  color: "#ffa502",
                },
              ].map((c, i) => (
                <motion.button
                  key={c.cat}
                  type="button"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + i * 0.06 }}
                  onClick={() => onNavigate("chat", c.cat)}
                  className="flex flex-col items-center gap-1.5 rounded-2xl py-4 px-2 cursor-pointer hover:scale-105 transition-all"
                  style={{
                    background: `${c.color}15`,
                    border: `2px solid ${c.color}30`,
                  }}
                  data-ocid="nav.tab"
                >
                  <span className="text-2xl">{c.icon}</span>
                  <span
                    className="text-xs font-semibold"
                    style={{ color: c.color }}
                  >
                    {c.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </section>

          {/* Section divider */}
          <div
            className="my-6"
            style={{
              height: 1,
              background:
                "linear-gradient(90deg, transparent, #667eea33, transparent)",
            }}
          />

          {/* ---- Section: Quick Links ---- */}
          <section aria-label="Quick Links" className="mb-6">
            <h2
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: "#667eea", letterSpacing: "0.1em" }}
            >
              ✦ Quick Links
            </h2>
            <div
              className="grid gap-3"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(95px, 1fr))",
              }}
            >
              {quickLinks.map((link) => (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => window.open(link.url, "_blank")}
                  className="flex flex-col items-center gap-1.5 rounded-2xl py-4 px-2 cursor-pointer transition-all hover:shadow-md hover:-translate-y-1"
                  style={{
                    background: "rgba(255,255,255,0.9)",
                    border: "2px solid transparent",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      "#667eea";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      "transparent";
                  }}
                  data-ocid="home.link"
                >
                  <span className="text-xl">{link.icon}</span>
                  <span
                    className="text-xs font-semibold"
                    style={{ color: "#333" }}
                  >
                    {link.label}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Section divider */}
          <div
            className="my-6"
            style={{
              height: 1,
              background:
                "linear-gradient(90deg, transparent, #667eea33, transparent)",
            }}
          />

          {/* ---- Section: Universal Search ---- */}
          <section aria-label="Universal Search" className="mb-8">
            <h2
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: "#667eea", letterSpacing: "0.1em" }}
            >
              ✦ Universal Search
            </h2>
            <div
              className="rounded-2xl p-4"
              style={{
                background: "linear-gradient(135deg, #0a1628 0%, #1a2744 100%)",
              }}
            >
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={universalSearchQuery}
                  onChange={(e) => setUniversalSearchQuery(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleUniversalSearch()
                  }
                  placeholder="Search the entire web..."
                  className="flex-1 px-4 py-2.5 rounded-full text-sm outline-none"
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    border: "2px solid rgba(201,168,76,0.4)",
                    color: "white",
                  }}
                  data-ocid="home.search_input"
                />
                <button
                  type="button"
                  onClick={handleUniversalSearch}
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: "linear-gradient(135deg, #c9a84c, #f0d060)",
                  }}
                  data-ocid="home.submit_button"
                >
                  <Search size={16} className="text-[#0a1628]" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchEngines.map((engine) => (
                  <button
                    key={engine.name}
                    type="button"
                    onClick={() =>
                      window.open(
                        `${engine.url}${encodeURIComponent(universalSearchQuery || "NavvGenX")}`,
                        "_blank",
                      )
                    }
                    className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:scale-105"
                    style={{
                      background: "rgba(201,168,76,0.15)",
                      border: "1px solid rgba(201,168,76,0.4)",
                      color: "#c9a84c",
                    }}
                    data-ocid="home.button"
                  >
                    {engine.name}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Topic pills */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {[
              "What is AI?",
              "Climate change",
              "History of Rome",
              "Quantum physics",
              "How to invest",
              "Space exploration",
            ].map((pill) => (
              <button
                key={pill}
                type="button"
                onClick={() => {
                  sessionStorage.setItem("navvgenx-initial-query", pill);
                  onNavigate("chat", "general");
                }}
                className="px-4 py-1.5 rounded-full text-xs font-medium transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{
                  background: "rgba(102,126,234,0.08)",
                  border: "1.5px solid rgba(102,126,234,0.2)",
                  color: "#667eea",
                }}
              >
                {pill}
              </button>
            ))}
          </div>

          {/* Footer */}
          <footer
            className="text-center text-xs pb-4"
            style={{ color: "#999" }}
          >
            <Sparkles
              size={12}
              className="inline mr-1"
              style={{ color: "#667eea" }}
            />
            © {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noreferrer"
              style={{ color: "#667eea", textDecoration: "underline" }}
            >
              caffeine.ai
            </a>
          </footer>
        </div>

        {/* ===== FLOATING AI TOOL BUTTONS ===== */}
        <div
          className="fixed z-40 flex flex-col gap-2"
          style={{
            bottom: "calc(10rem + env(safe-area-inset-bottom, 0px))",
            right: 20,
          }}
        >
          <button
            type="button"
            onClick={() => {
              setAiInput("Generate an image of ");
              setAiPanelOpen(true);
            }}
            className="w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-lg"
            style={{ background: "linear-gradient(135deg, #1a2744, #c9a84c)" }}
            title="Image Generator"
            data-ocid="home.secondary_button"
          >
            🖼️
          </button>
          <button
            type="button"
            onClick={() => {
              setAiInput("Find YouTube videos about ");
              setAiPanelOpen(true);
            }}
            className="w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-lg"
            style={{ background: "linear-gradient(135deg, #1a2744, #c9a84c)" }}
            title="Video Search"
            data-ocid="home.secondary_button"
          >
            🎥
          </button>
          <button
            type="button"
            onClick={() => {
              setAiInput("Read this aloud: ");
              setAiPanelOpen(true);
            }}
            className="w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-lg"
            style={{ background: "linear-gradient(135deg, #1a2744, #c9a84c)" }}
            title="Voice Synth"
            data-ocid="home.secondary_button"
          >
            🔊
          </button>
          <button
            type="button"
            onClick={() => {
              setAiInput("Build a complete app that ");
              setAiPanelOpen(true);
            }}
            className="w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-lg"
            style={{ background: "linear-gradient(135deg, #1a2744, #c9a84c)" }}
            title="App Builder"
            data-ocid="home.secondary_button"
          >
            ⚙️
          </button>
        </div>
        {/* ===== FLOATING MIC BUTTON ===== */}
        <button
          type="button"
          onClick={() => handleVoiceMic(true)}
          className="fixed z-40 flex items-center justify-center rounded-full transition-all"
          style={{
            bottom: "calc(5rem + env(safe-area-inset-bottom, 0px))",
            right: 20,
            width: 64,
            height: 64,
            background: isRecording
              ? "linear-gradient(135deg, #ff4757, #ff3838)"
              : "linear-gradient(135deg, #ff6b6b, #feca57)",
            boxShadow: isRecording
              ? "0 0 24px rgba(255,71,87,0.6)"
              : "0 8px 24px rgba(255,107,107,0.45)",
          }}
          aria-label={isRecording ? "Stop recording" : "Voice AI"}
          data-ocid="home.button"
        >
          <Mic size={24} className="text-white" />
        </button>
      </div>

      {/* ===== CAMERA MODAL ===== */}
      <AnimatePresence>
        {cameraOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.92)" }}
            data-ocid="home.modal"
          >
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{ width: "90vw", maxWidth: 400, height: "60vh" }}
            >
              {/* biome-ignore lint/a11y/useMediaCaption: camera stream */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div
                className="absolute bottom-4 left-1/2 flex gap-4"
                style={{ transform: "translateX(-50%)" }}
              >
                <button
                  type="button"
                  onClick={() => {
                    closeCamera();
                    setAiInput(
                      "Analyze what you see in this photo and help me",
                    );
                    setAiPanelOpen(true);
                  }}
                  className="px-5 py-3 rounded-full text-sm font-semibold"
                  style={{
                    background: "rgba(255,255,255,0.9)",
                    color: "#333",
                  }}
                  data-ocid="home.primary_button"
                >
                  📸 Analyze
                </button>
                <button
                  type="button"
                  onClick={closeCamera}
                  className="px-5 py-3 rounded-full text-sm font-semibold"
                  style={{
                    background: "rgba(255,255,255,0.9)",
                    color: "#333",
                  }}
                  data-ocid="home.close_button"
                >
                  ✕ Close
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
