import {
  ExternalLink,
  Maximize2,
  Mic,
  MicOff,
  Send,
  Speaker,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  type AIResponse,
  generateAIResponse,
  getSuggestions,
} from "../utils/aiEngine";
import { wrapFriendly } from "../utils/friendlyTone";
import { extractUrls } from "../utils/linkUtils";
import LinkEmbed from "./LinkEmbed";

interface Message {
  id: string;
  role: "navv" | "user";
  text: string;
  timestamp: Date;
  isLoading?: boolean;
  wikiCard?: AIResponse["wikiCard"];
  images?: AIResponse["imageResults"];
  quickLinks?: AIResponse["quickLinks"];
  sources?: string[];
  suggestedSection?: {
    section: string;
    label: string;
    page: string;
    category?: string;
  };
}

interface NavvAssistantProps {
  darkMode?: boolean;
  userAge?: number;
  onNavigate?: (page: string, category?: string) => void;
  profilePhotoUrl?: string;
}

// ─── NavvLogo SVG ────────────────────────────────────────────────────────────
function NavvLogo({
  size = 32,
  dark = false,
}: { size?: number; dark?: boolean }) {
  const gold = dark ? "oklch(0.78 0.15 75)" : "oklch(0.65 0.14 75)";
  const navy = dark ? "oklch(0.08 0.022 265)" : "oklch(0.10 0.020 265)";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Navv logo"
    >
      <circle
        cx="20"
        cy="20"
        r="19"
        stroke={gold}
        strokeWidth="1.5"
        fill={navy}
      />
      <circle
        cx="20"
        cy="20"
        r="14"
        stroke={gold}
        strokeWidth="0.5"
        strokeOpacity="0.35"
        fill="none"
      />
      <text
        x="20"
        y="27"
        textAnchor="middle"
        fontFamily="'Space Grotesk', Arial, sans-serif"
        fontWeight="700"
        fontSize="11"
        fill={gold}
        letterSpacing="-0.5"
      >
        Navv
      </text>
    </svg>
  );
}

// ─── Knowledge base ────────────────────────────────────────────────────────────
function getNavvAnswer(query: string): string {
  const q = query.toLowerCase().trim();

  if (
    /^(hi|hello|hey|good morning|good afternoon|good evening|howdy|sup|yo)/.test(
      q,
    )
  ) {
    const replies = [
      "Hey hey! So happy you're here. What's on your mind today?",
      "Hi there! I'm your AI bestie. Ask me literally anything!",
      "Hey! Great to see you. What can I help you with?",
      "Hello! No question is too big or too small — I'm all yours!",
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  }

  if (/how are you|how do you do|what's up|wassup|how r u/.test(q)) {
    const replies = [
      "I'm doing amazing, thanks for asking! That actually means a lot. Now tell me — how are YOU doing? What's going on today?",
      "Honestly? Pretty great! I love chatting with people. What's on your mind?",
      "I'm here and ready to help with literally anything! But more importantly — how are you doing?",
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  }

  if (
    /what can you do|what do you know|your capabilities|help me with/.test(q)
  ) {
    return wrapFriendly(
      "I can help you with a wide range of topics! Ask me about fashion & style, health & fitness, technology, travel destinations, food & recipes, science & space, history, sports, music, business & careers, coding, or any general knowledge question. I also speak my answers aloud — just listen!",
      query,
    );
  }

  if (/stress|stressed out|too much stress|overwhelmed/.test(q)) {
    return wrapFriendly(
      "First off — it's completely normal to feel stressed sometimes. Here's what genuinely helps: take a few slow deep breaths right now (seriously, try it). Then break your to-do list into just 3 priorities for today. Step outside for even 10 minutes. Talk to someone you trust. And remember — you don't have to solve everything today. One step at a time.",
      query,
    );
  }

  if (/sad|feeling down|depressed|unhappy|crying/.test(q)) {
    return wrapFriendly(
      "Hey, I hear you — feeling sad is hard, and it's okay to feel that way. Give yourself permission to feel it without judgment. Talk to someone you trust, even just texting 'I'm having a rough day' can help. Do something small and kind for yourself today: a walk, your favorite food, a show you love. And if it's been going on for a while, please consider speaking with a counselor — that's a real act of strength.",
      query,
    );
  }

  if (
    /motivat|inspire|inspiration|feel motivated|need motivation|keep going|don.t give up|failing/.test(
      q,
    )
  ) {
    return wrapFriendly(
      "Here's a dose of real motivation for you!\n\n\"Every expert was once a beginner. Every pro was once an amateur.\"\n\nThe difference between people who succeed is consistency. Show up every single day, even when you don't feel like it.\n\nQuick motivation boost:\n- Write down 3 things you're grateful for right now\n- Recall your biggest achievement so far\n- Set ONE small goal for today and complete it\n- Remember: discomfort is the price of growth\n\nYou've got this! What specific challenge are you facing?",
      query,
    );
  }

  if (
    /how can i study|study tips|how to study|help me study|i want to study|best way to study|study better|improve study|focus on study/.test(
      q,
    )
  ) {
    return wrapFriendly(
      "Here are 7 powerful study techniques that actually work:\n\n1) Pomodoro Technique - Study 25 min, break 5 min. After 4 rounds take a longer break.\n\n2) Active Recall - Test yourself instead of re-reading. Close notes and recall from memory.\n\n3) Spaced Repetition - Review after 1 day, 3 days, 1 week, 1 month.\n\n4) Mind Maps - Visualize connections between topics. Great for complex subjects.\n\n5) Teach Someone - Explain a concept aloud. If you can teach it, you understand it.\n\n6) Eliminate Distractions - Phone away, quiet space. Retention improves by 30%.\n\n7) Sleep Well - Memory consolidates during deep sleep. Never skip sleep to study.\n\nWhich subject are you studying? I can give you specific tips!",
      query,
    );
  }

  if (
    /suggest|recommend|what should i|give me ideas|what are some good|tell me about some/.test(
      q,
    )
  ) {
    if (/song|music|playlist|singer|artist|album/.test(q)) {
      return wrapFriendly(
        "Here are some great music suggestions!\n\nPunjabi/Bollywood: Kesariya (Arijit Singh), Tum Hi Ho, Raataan Lambiyan, Ik Vaari Aa (Pritam)\n\nInternational Pop: Blinding Lights (The Weeknd), Shape of You (Ed Sheeran), As It Was (Harry Styles)\n\nFocus/Study Music: Lo-fi Hip Hop, Hans Zimmer soundtracks, Ludovico Einaudi piano\n\nWhat genre or mood are you looking for? I'll make a tailored list!",
        query,
      );
    }
    if (/movie|film|watch|show|series|web series|netflix/.test(q)) {
      return wrapFriendly(
        "Here are top movie/show recommendations!\n\nBollywood: 3 Idiots, Dangal, PK, Zindagi Na Milegi Dobara, Queen\n\nHollywood: The Shawshank Redemption, Inception, Interstellar, The Dark Knight, Forrest Gump\n\nWeb Series: Breaking Bad, Money Heist, Mirzapur, Sacred Games, Scam 1992\n\nFeel-Good: Friends, Brooklyn Nine-Nine, The Office, Panchayat\n\nWhat mood or genre do you prefer?",
        query,
      );
    }
    return wrapFriendly(
      "I'd love to give you suggestions! Could you be a bit more specific? For example:\n- Suggest some Punjabi songs\n- Recommend a good movie\n- Give me ideas for a business\n- Suggest healthy breakfast options\n\nTell me more and I'll give you a personalized list!",
      query,
    );
  }

  const topic = query.replace(/[?!.]/g, "").trim();
  return `Hey! Great question about "${topic}"! 😊\n\nHere's what I know:\n\n**About ${topic}:**\n• This is a fascinating topic that many people want to learn more about!\n• The best approach is to start with the fundamentals and build understanding step by step\n• There are many excellent resources — Wikipedia, YouTube tutorials, and academic sources are perfect starting points\n\n**My recommendations:**\n1. Break it into smaller, specific questions\n2. Try hands-on experience whenever possible\n3. Connect with communities and experts in this area\n4. Use multiple sources for a well-rounded perspective\n\nWhat specific aspect of ${topic} would you like to explore deeper? I'm here to help with everything! 🚀`;
}

// ─── Sound wave bars ────────────────────────────────────────────────────────────
function SoundWaves() {
  const gold = "oklch(0.78 0.15 75)";
  return (
    <div className="flex items-center gap-0.5 h-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={i}
          className="w-0.5 rounded-full"
          style={{ background: gold }}
          animate={{ height: [4, 12, 4, 8, 4] }}
          transition={{
            duration: 0.8,
            repeat: Number.POSITIVE_INFINITY,
            delay: i * 0.12,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ─── Loading dots ─────────────────────────────────────────────────────────────
function LoadingDots() {
  const gold = "oklch(0.78 0.15 75)";
  return (
    <div className="flex items-center gap-1.5 py-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2.5 h-2.5 rounded-full"
          style={{ background: gold }}
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -5, 0] }}
          transition={{
            duration: 0.7,
            repeat: Number.POSITIVE_INFINITY,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ─── WikiCard ─────────────────────────────────────────────────────────────────
function WikiCard({
  card,
}: {
  card: NonNullable<AIResponse["wikiCard"]>;
}) {
  const gold = "oklch(0.78 0.15 75)";
  const navy = "oklch(0.08 0.022 265)";
  return (
    <div
      className="mt-3 rounded-xl overflow-hidden"
      style={{
        border: `1px solid ${gold}30`,
        background: `${navy}60`,
      }}
    >
      {card.thumbnail && (
        <img
          src={card.thumbnail}
          alt={card.title}
          className="w-full h-32 object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      )}
      <div className="p-3">
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-1"
          style={{ color: gold }}
        >
          {card.title}
        </p>
        <p className="text-xs leading-relaxed opacity-80 text-white">
          {card.extract.slice(0, 300)}
          {card.extract.length > 300 ? "…" : ""}
        </p>
        <a
          href={card.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 mt-2 text-xs hover:opacity-100 opacity-70 transition-opacity"
          style={{ color: gold }}
        >
          Read more on Wikipedia
          <ExternalLink size={10} />
        </a>
      </div>
    </div>
  );
}

// ─── Image grid ───────────────────────────────────────────────────────────────
function ImageGrid({
  images,
}: {
  images: NonNullable<AIResponse["imageResults"]>;
}) {
  const gold = "oklch(0.78 0.15 75)";
  const shown = images.slice(0, 3);
  return (
    <div className="mt-3 flex gap-2">
      {shown.map((img) => (
        <a
          key={img.url}
          href={img.searchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 overflow-hidden rounded-lg"
          style={{ border: `1px solid ${gold}20` }}
        >
          <img
            src={img.url}
            alt={img.alt}
            className="w-full object-cover"
            style={{ height: 72 }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </a>
      ))}
    </div>
  );
}

// ─── Quick link pills ─────────────────────────────────────────────────────────
function QuickLinks({
  links,
}: {
  links: NonNullable<AIResponse["quickLinks"]>;
}) {
  const gold = "oklch(0.78 0.15 75)";
  const navy = "oklch(0.08 0.022 265)";
  return (
    <div className="mt-3 flex gap-2 flex-wrap">
      <a
        href={links.google}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:opacity-100 opacity-75"
        style={{
          border: `1px solid ${gold}40`,
          color: gold,
          background: `${navy}60`,
        }}
      >
        <ExternalLink size={9} />
        Search Google
      </a>
      <a
        href={links.chatgpt}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:opacity-100 opacity-75"
        style={{
          border: `1px solid ${gold}40`,
          color: gold,
          background: `${navy}60`,
        }}
      >
        <ExternalLink size={9} />
        Ask ChatGPT
      </a>
    </div>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────
function MessageBubble({
  msg,
  onSpeak,
  onNavigate,
}: {
  msg: Message;
  onSpeak: (text: string) => void;
  onNavigate?: (page: string, category?: string) => void;
}) {
  const gold = "oklch(0.78 0.15 75)";
  const navy = "#0a1628";
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className={`flex ${
        msg.role === "user" ? "justify-end" : "justify-start"
      } group`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {msg.role === "navv" && (
        <div className="flex-shrink-0 mr-2 mt-1">
          <NavvLogo size={28} dark={true} />
        </div>
      )}
      <div className="max-w-[78%] flex flex-col">
        <div
          className="rounded-2xl px-4 py-3 text-sm leading-relaxed"
          style={
            msg.role === "navv"
              ? {
                  background: "oklch(0.15 0.028 265)",
                  color: "oklch(0.92 0.008 80)",
                  borderRadius: "4px 18px 18px 18px",
                  borderLeft: `3px solid ${gold}`,
                }
              : {
                  background: `linear-gradient(135deg, ${gold}, oklch(0.65 0.14 68))`,
                  color: navy,
                  fontWeight: "600",
                  borderRadius: "18px 4px 18px 18px",
                }
          }
        >
          {msg.isLoading ? (
            <div className="flex flex-col gap-1">
              <span className="text-xs opacity-60">Thinking…</span>
              <LoadingDots />
            </div>
          ) : (
            <>
              <span className="whitespace-pre-wrap">{msg.text}</span>
              {msg.wikiCard && <WikiCard card={msg.wikiCard} />}
              {msg.images && msg.images.length > 0 && (
                <ImageGrid images={msg.images} />
              )}
              {msg.quickLinks && <QuickLinks links={msg.quickLinks} />}
              {msg.sources && msg.sources.length > 0 && (
                <div className="flex flex-wrap items-center gap-1 mt-2">
                  <span className="text-xs opacity-50">Sources:</span>
                  {msg.sources.map((src) => (
                    <span
                      key={src}
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: `${gold}20`, color: gold }}
                    >
                      {src}
                    </span>
                  ))}
                </div>
              )}
              {extractUrls(msg.text).map((url) => (
                <LinkEmbed key={url} url={url} />
              ))}
              {msg.suggestedSection && onNavigate && (
                <button
                  type="button"
                  onClick={() =>
                    onNavigate(
                      msg.suggestedSection!.page,
                      msg.suggestedSection!.category,
                    )
                  }
                  className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                  style={{
                    border: `1px solid ${gold}40`,
                    color: gold,
                    background: "oklch(0.12 0.02 265)",
                  }}
                >
                  Open {msg.suggestedSection.label} section
                </button>
              )}
            </>
          )}
        </div>
        {/* Speak button on hover for AI messages */}
        {msg.role === "navv" && !msg.isLoading && hovered && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            type="button"
            onClick={() => onSpeak(msg.text)}
            className="self-start mt-1 p-1.5 rounded-lg transition-colors"
            style={{ color: `${gold}80`, background: "oklch(0.15 0.02 265)" }}
            aria-label="Speak this message"
          >
            <Speaker size={13} />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────
export function NavvAssistant({
  // darkMode prop reserved for future use
  userAge = 99,
  onNavigate,
  profilePhotoUrl,
}: NavvAssistantProps) {
  const gold = "oklch(0.78 0.15 75)";
  const navyDark = "#0a1628";

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Get assistant name fresh each time
  const getAssistantName = () =>
    localStorage.getItem("navvura-assistant-name") || "NAVVURA";

  // Scroll when messages change - messages in dep triggers re-run
  // biome-ignore lint/correctness/useExhaustiveDependencies: messages change should trigger scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const speak = useCallback(
    (text: string) => {
      if (isMuted || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(
        text.replace(/[*#_`]/g, "").slice(0, 300),
      );
      utterance.volume = 1.0;
      utterance.rate = 0.85;
      utterance.pitch = 1.1;

      const setVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        const preferred = voices.find(
          (v) =>
            v.name.includes("Google UK English Female") ||
            v.name.includes("Samantha") ||
            v.name.includes("Karen") ||
            v.name.toLowerCase().includes("female"),
        );
        if (preferred) utterance.voice = preferred;
      };

      if (window.speechSynthesis.getVoices().length > 0) {
        setVoice();
      } else {
        window.speechSynthesis.addEventListener("voiceschanged", setVoice, {
          once: true,
        });
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    },
    [isMuted],
  );

  // Open: show welcome message using current assistant name
  // biome-ignore lint/correctness/useExhaustiveDependencies: getAssistantName reads localStorage intentionally fresh
  useEffect(() => {
    if (isOpen && !hasGreeted) {
      setHasGreeted(true);
      const name = getAssistantName();
      const greetMsg: Message = {
        id: "greeting",
        role: "navv",
        text: `Hi! I'm ${name}, your AI companion. How can I help you today? 🌟`,
        timestamp: new Date(),
      };
      setMessages([greetMsg]);
      setTimeout(() => {
        speak(`Hi! I'm ${name}, your AI companion. How can I help you today?`);
        inputRef.current?.focus();
      }, 400);
    }
    // Refresh name when reopened
    if (!isOpen) {
      setHasGreeted(false);
      setMessages([]);
    }
  }, [isOpen, hasGreeted, speak]);

  useEffect(() => {
    if (!isOpen) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
    }
  }, [isOpen]);

  const handleInputChange = (val: string) => {
    setInputText(val);
    if (val.trim().length > 1) {
      setSuggestions(getSuggestions(val, "general").slice(0, 4));
    } else {
      setSuggestions([]);
    }
  };

  // ─── Section suggestion logic ─────────────────────────────────────────────────
  function getSuggestedSection(query: string): {
    section: string;
    label: string;
    page: string;
    category?: string;
  } | null {
    const q = query.toLowerCase();
    if (
      /health|medical|symptom|doctor|fitness|nutrition|exercise|diet|sick|pain/.test(
        q,
      )
    )
      return { section: "Health", label: "Health", page: "health" };
    if (/study|exam|homework|learn|school|university|notes|assignment/.test(q))
      return {
        section: "Study",
        label: "Study",
        page: "chat",
        category: "study",
      };
    if (/career|job|resume|work|interview|salary|profession|hire/.test(q))
      return {
        section: "Career",
        label: "Career",
        page: "chat",
        category: "career",
      };
    if (/love|relationship|dating|partner|romance|breakup|marriage/.test(q))
      return { section: "Love", label: "Love", page: "chat", category: "love" };
    if (/fashion|outfit|clothes|style|dress|wear|wardrobe/.test(q))
      return {
        section: "Fashion",
        label: "Fashion",
        page: "chat",
        category: "fashion",
      };
    if (
      /business|startup|finance|investment|entrepreneur|profit|revenue/.test(q)
    )
      return {
        section: "Business",
        label: "Business",
        page: "chat",
        category: "business",
      };
    if (/news|current events|live|headline|breaking|today/.test(q))
      return { section: "Live", label: "Live Updates", page: "live" };
    return null;
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: userAge stable
  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      setSuggestions([]);
      setInputText("");

      const userMsg: Message = {
        id: `u-${Date.now()}`,
        role: "user",
        text: trimmed,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);

      const loadingId = `loading-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: loadingId,
          role: "navv",
          text: "Searching for the best answer…",
          timestamp: new Date(),
          isLoading: true,
        },
      ]);

      // ── App control commands ──
      const navCmd = /^(go to|open|navigate to|take me to)\s+(.+)/i.exec(
        trimmed,
      );
      if (navCmd) {
        const target = navCmd[2].toLowerCase().trim();
        const pageMap: Record<string, [string, string?]> = {
          home: ["home"],
          chat: ["chat", "general"],
          health: ["health"],
          study: ["chat", "study"],
          fashion: ["chat", "fashion"],
          business: ["chat", "business"],
          career: ["chat", "career"],
          love: ["chat", "love"],
          law: ["chat", "law"],
          reminders: ["reminders"],
          live: ["live"],
          account: ["account"],
        };
        const found = Object.entries(pageMap).find(([k]) => target.includes(k));
        if (found && onNavigate) {
          onNavigate(found[1][0], found[1][1]);
          const navvMsg: Message = {
            id: `n-${Date.now()}`,
            role: "navv",
            text: `Taking you to ${found[0]}! 🚀`,
            timestamp: new Date(),
          };
          setMessages((prev) =>
            prev.filter((m) => m.id !== loadingId).concat(navvMsg),
          );
          return;
        }
      }
      if (/^go home$/i.test(trimmed) && onNavigate) {
        onNavigate("home");
        setMessages((prev) =>
          prev
            .filter((m) => m.id !== loadingId)
            .concat({
              id: `n-${Date.now()}`,
              role: "navv",
              text: "Taking you home! 🏠",
              timestamp: new Date(),
            }),
        );
        return;
      }
      if (/dark mode/i.test(trimmed)) {
        document.documentElement.classList.add("dark");
        setMessages((prev) =>
          prev
            .filter((m) => m.id !== loadingId)
            .concat({
              id: `n-${Date.now()}`,
              role: "navv",
              text: "Dark mode enabled! 🌙",
              timestamp: new Date(),
            }),
        );
        return;
      }
      if (/light mode/i.test(trimmed)) {
        document.documentElement.classList.remove("dark");
        setMessages((prev) =>
          prev
            .filter((m) => m.id !== loadingId)
            .concat({
              id: `n-${Date.now()}`,
              role: "navv",
              text: "Light mode enabled! ☀️",
              timestamp: new Date(),
            }),
        );
        return;
      }

      let aiResult: AIResponse;
      try {
        aiResult = await generateAIResponse(
          trimmed,
          "general",
          "adult",
          userAge,
        );
      } catch {
        aiResult = {
          text: getNavvAnswer(trimmed),
          quickLinks: {
            google: `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`,
            chatgpt: `https://chat.openai.com/?q=${encodeURIComponent(trimmed)}`,
          },
        };
      }

      // Check if AI gave a low-confidence/generic response and suggest a section
      const suggestedSection = getSuggestedSection(trimmed);
      let responseText = aiResult.text;
      if (suggestedSection && onNavigate) {
        // Append section suggestion to text
        responseText = `${aiResult.text}\n\n**The ${suggestedSection.label} section can help you with this.**`;
      }

      const navvMsg: Message = {
        id: `n-${Date.now()}`,
        role: "navv",
        text: responseText,
        timestamp: new Date(),
        wikiCard: aiResult.wikiCard,
        images: aiResult.imageResults?.slice(0, 3),
        quickLinks: aiResult.quickLinks,
        sources: aiResult.sources,
        suggestedSection:
          suggestedSection && onNavigate ? suggestedSection : undefined,
      };

      setMessages((prev) =>
        prev.filter((m) => m.id !== loadingId).concat(navvMsg),
      );

      const isFunny =
        /joke|funny|lol|haha|make me laugh|pun|silly|knock knock/i.test(
          trimmed,
        );
      if (isFunny) {
        setTimeout(() => {
          const laugh = new SpeechSynthesisUtterance(
            "Ha ha ha ha! That is so funny!",
          );
          laugh.rate = 1.1;
          laugh.pitch = 1.3;
          window.speechSynthesis.speak(laugh);
        }, 200);
      }

      speak(aiResult.text.slice(0, 240));
    },
    [speak, onNavigate],
  );

  const handleSubmit = () => sendMessage(inputText);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputText);
    }
  };

  const toggleMic = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const SpeechRecognition =
      window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in your browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.addEventListener("start", () => setIsListening(true));
    recognition.addEventListener("end", () => setIsListening(false));
    recognition.addEventListener("error", () => setIsListening(false));
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) sendMessage(transcript);
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
    if (!isMuted) window.speechSynthesis?.cancel();
  };

  const assistantName = getAssistantName();

  return (
    <>
      {/* Floating Orb */}
      <motion.button
        type="button"
        data-ocid="navv.toggle"
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] right-4 md:bottom-8 md:right-6 z-50 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-2xl"
        style={{
          background: `linear-gradient(135deg, ${navyDark}, #112244)`,
          border: `2px solid ${gold}`,
          boxShadow:
            "0 0 24px oklch(0.78 0.15 75 / 0.5), 0 8px 32px rgba(0,0,0,0.5)",
        }}
        animate={isOpen ? { scale: 1 } : { scale: [1, 1.05, 1] }}
        transition={{
          duration: 3,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.96 }}
        aria-label="Open Navv AI assistant"
      >
        {profilePhotoUrl ? (
          <img
            src={profilePhotoUrl}
            alt="Profile"
            className="w-9 h-9 rounded-full object-cover"
            style={{ border: `1.5px solid ${gold}` }}
          />
        ) : (
          <NavvLogo size={36} dark={true} />
        )}
      </motion.button>

      {/* Full-screen overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="navv-fullscreen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] flex flex-col"
            style={{ background: navyDark }}
          >
            {/* Header bar */}
            <div
              className="flex items-center justify-between px-4 py-3 flex-shrink-0"
              style={{
                background: "#071020",
                borderBottom: `1px solid ${gold}30`,
              }}
            >
              <div className="flex items-center gap-3">
                <NavvLogo size={36} dark={true} />
                <div>
                  <p
                    className="font-semibold text-base leading-tight"
                    style={{
                      color: gold,
                      fontFamily: "'Playfair Display', serif",
                    }}
                  >
                    {assistantName}
                  </p>
                  <div className="flex items-center gap-1.5">
                    {isSpeaking ? (
                      <>
                        <SoundWaves />
                        <span
                          className="text-xs"
                          style={{ color: `${gold}90` }}
                        >
                          Speaking…
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span
                          className="text-xs"
                          style={{ color: `${gold}80` }}
                        >
                          NAVVURA AI · Online
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="p-2 rounded-xl transition-colors hover:bg-white/10"
                  style={{ color: `${gold}B0` }}
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <button
                  type="button"
                  data-ocid="navv.close_button"
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl transition-colors hover:bg-white/10"
                  style={{ color: `${gold}B0` }}
                  aria-label="Close assistant"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
              style={{ minHeight: 0 }}
            >
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  msg={msg}
                  onSpeak={speak}
                  onNavigate={onNavigate}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div
                className="px-4 pb-2 flex flex-wrap gap-2 flex-shrink-0"
                style={{ borderTop: `1px solid ${gold}15` }}
              >
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => sendMessage(s)}
                    className="text-xs px-3 py-1.5 rounded-full transition-all hover:opacity-100 opacity-70 truncate max-w-[200px]"
                    style={{
                      border: `1px solid ${gold}30`,
                      color: gold,
                      background: "oklch(0.12 0.02 265)",
                    }}
                    title={s}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input bar */}
            <div
              className="flex items-center gap-2 px-4 py-3 flex-shrink-0"
              style={{
                borderTop: `1px solid ${gold}25`,
                background: "#071020",
                paddingBottom:
                  "calc(0.75rem + env(safe-area-inset-bottom, 0px))",
              }}
            >
              <input
                ref={inputRef}
                data-ocid="navv.input"
                type="text"
                value={inputText}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Ask ${assistantName} anything…`}
                className="flex-1 bg-transparent text-sm outline-none placeholder:opacity-40"
                style={{ color: "oklch(0.93 0.008 80)" }}
              />
              <motion.button
                type="button"
                data-ocid="navv.secondary_button"
                onClick={toggleMic}
                className="p-2.5 rounded-xl transition-all flex-shrink-0"
                style={{
                  background: isListening
                    ? "oklch(0.50 0.22 25 / 0.3)"
                    : "oklch(0.18 0.025 265)",
                  color: isListening ? "oklch(0.70 0.22 25)" : `${gold}C0`,
                }}
                animate={isListening ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                transition={{
                  duration: 0.6,
                  repeat: isListening ? Number.POSITIVE_INFINITY : 0,
                }}
                aria-label={
                  isListening ? "Stop listening" : "Start voice input"
                }
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </motion.button>
              <button
                type="button"
                data-ocid="navv.submit_button"
                onClick={handleSubmit}
                disabled={!inputText.trim()}
                className="p-2.5 rounded-xl transition-all flex-shrink-0 disabled:opacity-30"
                style={{
                  background: inputText.trim()
                    ? `linear-gradient(135deg, ${gold}, oklch(0.60 0.16 70))`
                    : "oklch(0.18 0.025 265)",
                  color: inputText.trim() ? navyDark : `${gold}66`,
                }}
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
