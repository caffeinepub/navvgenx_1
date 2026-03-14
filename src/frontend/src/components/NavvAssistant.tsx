import {
  ExternalLink,
  Mic,
  MicOff,
  Send,
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
}

interface NavvAssistantProps {
  darkMode?: boolean;
  userAge?: number;
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

  // Greetings — warm and casual
  if (
    /^(hi|hello|hey|good morning|good afternoon|good evening|howdy|sup|yo)/.test(
      q,
    )
  ) {
    const replies = [
      "Hey hey! So happy you're here. What's on your mind today?",
      "Hi there! I'm Navv, your AI bestie. Ask me literally anything!",
      "Hey! Great to see you. What can I help you with?",
      "Hello! No question is too big or too small — I'm all yours!",
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  }

  // How are you
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

  // Everyday life advice
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
  if (/lonely|alone|no friends|isolated/.test(q)) {
    return wrapFriendly(
      "Feeling lonely is one of the most human experiences there is — you're definitely not alone in feeling alone. Start small: reach out to one person this week, even someone you haven't talked to in a while. Join a hobby group, class, or online community around something you love. And be patient with yourself — genuine connections take time to build. You matter more than you know.",
      query,
    );
  }
  if (/motivation|not motivated|lazy|procrastinat/.test(q)) {
    return wrapFriendly(
      "Lack of motivation is so normal — your brain isn't broken, it's just tired or overwhelmed. Here's a trick that actually works: commit to just 2 minutes of the task. That's it. Most of the time, starting is the hardest part and you'll keep going. Also, tie your tasks to your 'why' — why does this matter to you? And celebrate small wins. Progress, not perfection.",
      query,
    );
  }
  if (/money|saving money|broke|budget|financial|debt/.test(q)) {
    return wrapFriendly(
      "Money stress is real, but you can absolutely get on top of it. Start with the 50/30/20 rule: 50% of income on needs, 30% on wants, 20% on savings/debt. Track your spending for just one week — you'll spot leaks fast. Build a small emergency fund first (even $500 helps). Automate your savings so you never miss it. The most important step? Start today, even small.",
      query,
    );
  }
  if (
    /relationship|partner|boyfriend|girlfriend|marriage|breakup|heartbreak/.test(
      q,
    )
  ) {
    return wrapFriendly(
      "Relationships are one of the most complex and rewarding parts of life. The foundation is always communication — say what you feel using 'I feel...' statements instead of blame. Make time for each other intentionally. If going through a breakup: feel it fully, lean on friends, avoid going back out of loneliness, and give yourself real time to heal. You will feel better — I promise.",
      query,
    );
  }
  if (/confidence|self confidence|self esteem|insecure|shy/.test(q)) {
    return wrapFriendly(
      "Confidence isn't something you either have or don't — it's a skill you build through small actions. Start by doing one thing each day that slightly scares you. Dress in a way that makes YOU feel good. Speak up once in conversations even when nervous. Replace 'I can't' with 'I'm learning to.' And remember: everyone is more focused on themselves than on judging you. You are more capable than you think.",
      query,
    );
  }
  if (
    /morning routine|start the day|productive morning|wake up early/.test(q)
  ) {
    return wrapFriendly(
      "A solid morning routine can genuinely change your life. Here's a simple one that works: wake up at a consistent time, drink a glass of water immediately, get 10 minutes of sunlight or a short walk, eat something with protein, and do your hardest task first before checking your phone. Avoid the doom-scroll right after waking up — it sets a reactive tone for the whole day.",
      query,
    );
  }
  if (/work life balance|work too much|burnout|overworked/.test(q)) {
    return wrapFriendly(
      "Burnout is your body and mind saying 'enough.' Real boundaries look like: no work emails after a certain hour, protecting at least one full day off per week, and actually using your vacation time. Communicate your limits at work — most managers respect this more than martyrdom. And invest in something outside of work that genuinely fills you up: a hobby, family time, fitness, anything.",
      query,
    );
  }
  if (/parenting|kids|children|toddler|teenager/.test(q)) {
    return wrapFriendly(
      "Parenting is beautiful and hard at the same time — and no parent has it all figured out. The most important things are consistent love, clear but kind boundaries, and genuinely listening to your children. Put your phone down when you're with them. Validate their feelings even when their behavior needs correcting. And take care of yourself too — you can't pour from an empty cup.",
      query,
    );
  }

  return wrapFriendly(
    `I'm NavvGenX AI — your smart companion for any topic! You can ask me about health, fashion, relationships, technology, science, travel, food, business, history, or literally anything. Try asking "what is [topic]" or "how do I [task]". I'm here to help with real answers and friendly advice.`,
    query,
  );
}

// ─── Sound wave bars ────────────────────────────────────────────────────────────
function SoundWaves() {
  return (
    <div className="flex items-center gap-0.5 h-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={i}
          className="w-0.5 rounded-full"
          style={{ background: "oklch(0.78 0.15 75)" }}
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
function LoadingDots({ gold }: { gold: string }) {
  return (
    <div className="flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full"
          style={{ background: gold }}
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{
            duration: 0.8,
            repeat: Number.POSITIVE_INFINITY,
            delay: i * 0.2,
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
  gold,
  navy,
}: {
  card: NonNullable<AIResponse["wikiCard"]>;
  gold: string;
  navy: string;
}) {
  return (
    <div
      className="mt-2 rounded-xl overflow-hidden"
      style={{
        border: `1px solid ${gold}30`,
        background: `${navy}60`,
      }}
    >
      {card.thumbnail && (
        <img
          src={card.thumbnail}
          alt={card.title}
          className="w-full h-28 object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      )}
      <div className="p-2.5">
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-1"
          style={{ color: gold }}
        >
          {card.title}
        </p>
        <p className="text-xs leading-relaxed opacity-80">
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
  gold,
}: {
  images: NonNullable<AIResponse["imageResults"]>;
  gold: string;
}) {
  const shown = images.slice(0, 3);
  return (
    <div className="mt-2 flex gap-1.5">
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
            style={{ height: 60 }}
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
  gold,
  navy,
}: {
  links: NonNullable<AIResponse["quickLinks"]>;
  gold: string;
  navy: string;
}) {
  return (
    <div className="mt-2 flex gap-1.5">
      <a
        href={links.google}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all hover:opacity-100 opacity-75"
        style={{
          border: `1px solid ${gold}40`,
          color: gold,
          background: `${navy}40`,
        }}
      >
        <ExternalLink size={9} />
        Search Google
      </a>
      <a
        href={links.chatgpt}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all hover:opacity-100 opacity-75"
        style={{
          border: `1px solid ${gold}40`,
          color: gold,
          background: `${navy}40`,
        }}
      >
        <ExternalLink size={9} />
        Ask ChatGPT
      </a>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────
export function NavvAssistant({
  darkMode = false,
  userAge = 99,
}: NavvAssistantProps) {
  const gold = darkMode ? "oklch(0.78 0.15 75)" : "oklch(0.65 0.14 75)";
  const navy = darkMode ? "oklch(0.08 0.022 265)" : "oklch(0.10 0.020 265)";

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

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  const speak = useCallback(
    (text: string) => {
      if (isMuted || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.1;
      utterance.volume = 1;

      const setVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        const preferred = voices.find(
          (v) =>
            v.name.toLowerCase().includes("google uk english female") ||
            v.name.toLowerCase().includes("samantha") ||
            v.name.toLowerCase().includes("karen") ||
            v.name.toLowerCase().includes("female") ||
            v.name.toLowerCase().includes("zira"),
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

  useEffect(() => {
    if (isOpen && !hasGreeted) {
      setHasGreeted(true);
      const greetMsg: Message = {
        id: "greeting",
        role: "navv",
        text: "Hey there! I'm Navv — your AI friend. Ask me anything: fashion, health, tech, travel, science, or everyday life advice. What's on your mind?",
        timestamp: new Date(),
      };
      setMessages([greetMsg]);
      setTimeout(() => {
        speak("Hey there! I am Navv, how can I help you today?");
        inputRef.current?.focus();
      }, 400);
    }
  }, [isOpen, hasGreeted, speak]);

  useEffect(() => {
    if (!isOpen) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
    }
  }, [isOpen]);

  // Update suggestions as user types
  const handleInputChange = (val: string) => {
    setInputText(val);
    if (val.trim().length > 1) {
      setSuggestions(getSuggestions(val, "general").slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: userAge is stable prop
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

      // Loading indicator
      const loadingId = `loading-${Date.now()}`;
      const loadingMsg: Message = {
        id: loadingId,
        role: "navv",
        text: "Searching for the best answer…",
        timestamp: new Date(),
        isLoading: true,
      };
      setMessages((prev) => [...prev, loadingMsg]);

      let aiResult: AIResponse;
      try {
        aiResult = await generateAIResponse(
          trimmed,
          "general",
          "adult",
          userAge,
        );
      } catch {
        // Fallback to local answer
        aiResult = {
          text: getNavvAnswer(trimmed),
          quickLinks: {
            google: `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`,
            chatgpt: `https://chat.openai.com/?q=${encodeURIComponent(trimmed)}`,
          },
        };
      }

      const navvMsg: Message = {
        id: `n-${Date.now()}`,
        role: "navv",
        text: aiResult.text,
        timestamp: new Date(),
        wikiCard: aiResult.wikiCard,
        images: aiResult.imageResults?.slice(0, 3),
        quickLinks: aiResult.quickLinks,
      };

      // Replace loading with actual answer
      setMessages((prev) =>
        prev.filter((m) => m.id !== loadingId).concat(navvMsg),
      );

      speak(aiResult.text.slice(0, 200));
    },
    [speak],
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

  return (
    <>
      {/* Floating Orb */}
      <motion.button
        type="button"
        data-ocid="navv.toggle"
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl"
        style={{
          background: `linear-gradient(135deg, ${navy}, oklch(0.15 0.028 265))`,
          border: `2px solid ${gold}`,
          boxShadow: `0 0 24px ${gold}40, 0 8px 32px oklch(0.05 0.02 265 / 0.6)`,
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
        <NavvLogo size={36} dark={true} />
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="navv-panel"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            className="fixed bottom-28 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] rounded-2xl overflow-hidden flex flex-col"
            style={{
              maxHeight: "560px",
              background: darkMode
                ? "oklch(0.11 0.024 265 / 0.96)"
                : "oklch(0.99 0.004 80 / 0.97)",
              backdropFilter: "blur(20px) saturate(180%)",
              WebkitBackdropFilter: "blur(20px) saturate(180%)",
              border: `1px solid ${gold}40`,
              boxShadow: darkMode
                ? `0 24px 64px oklch(0.05 0.02 265 / 0.7), 0 0 0 1px ${gold}18`
                : `0 24px 64px oklch(0.3 0.04 265 / 0.25), 0 0 0 1px ${gold}22`,
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 flex-shrink-0"
              style={{
                background: navy,
                borderBottom: `1px solid ${gold}30`,
              }}
            >
              <div className="flex items-center gap-2.5">
                <NavvLogo size={30} dark={true} />
                <div>
                  <p
                    className="font-semibold text-sm"
                    style={{
                      color: gold,
                      fontFamily: "'Playfair Display', serif",
                    }}
                  >
                    Navv
                  </p>
                  <div className="flex items-center gap-1.5">
                    {isSpeaking ? (
                      <>
                        <SoundWaves />
                        <span
                          className="text-xs"
                          style={{ color: `${gold}B0` }}
                        >
                          Speaking…
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span
                          className="text-xs"
                          style={{ color: `${gold}90` }}
                        >
                          Your AI Friend
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
                  className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
                  style={{ color: `${gold}B0` }}
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                </button>
                <button
                  type="button"
                  data-ocid="navv.close_button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
                  style={{ color: `${gold}B0` }}
                  aria-label="Close Navv assistant"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
              style={{ minHeight: 0 }}
            >
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "navv" && (
                    <div className="flex-shrink-0 mr-2 mt-0.5">
                      <NavvLogo size={22} dark={darkMode} />
                    </div>
                  )}
                  <div
                    className="max-w-[82%] rounded-2xl px-3 py-2 text-sm leading-relaxed"
                    style={
                      msg.role === "navv"
                        ? {
                            background: darkMode
                              ? "oklch(0.17 0.024 265)"
                              : "oklch(0.13 0.022 265)",
                            color: "oklch(0.93 0.006 80)",
                            borderRadius: "4px 18px 18px 18px",
                            borderLeft: `2px solid ${gold}60`,
                          }
                        : {
                            background: `linear-gradient(135deg, ${navy}, oklch(0.15 0.028 265))`,
                            color: gold,
                            border: `1px solid ${gold}30`,
                            borderRadius: "18px 4px 18px 18px",
                          }
                    }
                  >
                    {msg.isLoading ? (
                      <div className="flex flex-col gap-1">
                        <span className="text-xs opacity-60">
                          Searching for the best answer…
                        </span>
                        <LoadingDots gold={gold} />
                      </div>
                    ) : (
                      <>
                        <span>{msg.text}</span>

                        {/* Wiki card */}
                        {msg.wikiCard && (
                          <WikiCard
                            card={msg.wikiCard}
                            gold={gold}
                            navy={navy}
                          />
                        )}

                        {/* Image grid */}
                        {msg.images && msg.images.length > 0 && (
                          <ImageGrid images={msg.images} gold={gold} />
                        )}

                        {/* Quick links */}
                        {msg.quickLinks && (
                          <QuickLinks
                            links={msg.quickLinks}
                            gold={gold}
                            navy={navy}
                          />
                        )}

                        {/* Link Embeds */}
                        {extractUrls(msg.text).map((url) => (
                          <LinkEmbed key={url} url={url} />
                        ))}
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div
                className="px-3 pb-1 flex flex-wrap gap-1.5 flex-shrink-0"
                style={{ borderTop: `1px solid ${gold}10` }}
              >
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => sendMessage(s)}
                    className="text-xs px-2.5 py-1 rounded-full transition-all hover:opacity-100 opacity-70 truncate max-w-[160px]"
                    style={{
                      border: `1px solid ${gold}30`,
                      color: gold,
                      background: `${navy}30`,
                    }}
                    title={s}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input Row */}
            <div
              className="flex items-center gap-2 px-3 py-3 flex-shrink-0"
              style={{
                borderTop: `1px solid ${gold}20`,
                background: darkMode
                  ? "oklch(0.13 0.024 265 / 0.9)"
                  : "oklch(0.97 0.003 80 / 0.96)",
              }}
            >
              <input
                ref={inputRef}
                data-ocid="navv.input"
                type="text"
                value={inputText}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything…"
                className="flex-1 bg-transparent text-sm outline-none placeholder:opacity-50"
                style={{
                  color: darkMode ? "oklch(0.93 0.006 80)" : navy,
                }}
              />
              <button
                type="button"
                data-ocid="navv.secondary_button"
                onClick={toggleMic}
                className="p-2 rounded-xl transition-all flex-shrink-0"
                style={{
                  background: isListening
                    ? "oklch(0.55 0.2 25 / 0.2)"
                    : `${gold}1A`,
                  color: isListening ? "oklch(0.65 0.2 25)" : `${gold}B0`,
                }}
                aria-label={
                  isListening ? "Stop listening" : "Start voice input"
                }
              >
                {isListening ? (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{
                      duration: 0.6,
                      repeat: Number.POSITIVE_INFINITY,
                    }}
                  >
                    <MicOff size={16} />
                  </motion.div>
                ) : (
                  <Mic size={16} />
                )}
              </button>
              <button
                type="button"
                data-ocid="navv.submit_button"
                onClick={handleSubmit}
                disabled={!inputText.trim()}
                className="p-2 rounded-xl transition-all flex-shrink-0 disabled:opacity-30"
                style={{
                  background: inputText.trim()
                    ? `linear-gradient(135deg, ${gold}, oklch(0.60 0.16 70))`
                    : `${gold}1A`,
                  color: inputText.trim() ? navy : `${gold}66`,
                }}
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
