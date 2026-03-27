import { Toaster } from "@/components/ui/sonner";
import {
  Activity,
  Bell,
  BookOpen,
  Briefcase,
  Camera,
  Clock,
  Download,
  Dumbbell,
  GraduationCap,
  Heart,
  Home,
  ImagePlus,
  LayoutDashboard,
  Lightbulb,
  LogOut,
  Moon,
  MoreHorizontal,
  Radio,
  Search,
  Share2,
  Shirt,
  ShoppingBag,
  Sparkles,
  Sun,
  TrendingUp,
  UserCircle,
  Wand2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AgeSetup } from "./components/AgeSetup";
import { Logo } from "./components/Logo";
import { NavvAssistant } from "./components/NavvAssistant";
import { ProfessionalMic } from "./components/ProfessionalMic";
import { useActor } from "./hooks/useActor";
import { useNews } from "./hooks/useNews";
import { usePWAInstall } from "./hooks/usePWAInstall";
import { useServiceWorkerUpdate } from "./hooks/useServiceWorkerUpdate";
import { useWeather } from "./hooks/useWeather";
import { AccountPage } from "./pages/AccountPage";
import { ChatPage } from "./pages/ChatPage";
import { CreativeAIPage } from "./pages/CreativeAIPage";
import { HealthPage } from "./pages/HealthPage";
import { HistoryPage } from "./pages/HistoryPage";
import { LivePage } from "./pages/LivePage";
import { LoginPage } from "./pages/LoginPage";
import { RemindersPage } from "./pages/RemindersPage";
import { TrainingPage } from "./pages/TrainingPage";
import {
  generateAIResponse,
  getPollinationsImage,
  getShoppingLinks,
  getSocialLinks,
  getSuggestions,
  getWebSearchLinks,
  getYouTubeLinks,
} from "./utils/aiEngine";

type Section =
  | "home"
  | "chat"
  | "health"
  | "reminders"
  | "account"
  | "live"
  | "history"
  | "love"
  | "study"
  | "career"
  | "fashion"
  | "business"
  | "search"
  | "creative-ai"
  | "training";

interface Profile {
  age: bigint;
  ageGroup: string;
}

const navItems = [
  { id: "home", Icon: Home, label: "Home" },
  { id: "chat", Icon: Search, label: "Chat" },
  { id: "health", Icon: Activity, label: "Health" },
  { id: "love", Icon: Heart, label: "Love" },
  { id: "study", Icon: BookOpen, label: "Study" },
  { id: "career", Icon: Briefcase, label: "Career" },
  { id: "fashion", Icon: Shirt, label: "Fashion" },
  { id: "business", Icon: TrendingUp, label: "Business" },
  { id: "search", Icon: Search, label: "Search" },
  { id: "live", Icon: Radio, label: "Live" },
  { id: "account", Icon: UserCircle, label: "Account" },
  { id: "history", Icon: Clock, label: "History" },
  { id: "creative-ai", Icon: Wand2, label: "Creative AI" },
  { id: "training", Icon: Dumbbell, label: "Training" },
] as const;

const bottomNavPrimary = ["home", "chat", "health"] as const;
const bottomNavMore = [
  "love",
  "study",
  "career",
  "fashion",
  "business",
  "search",
  "live",
  "account",
  "history",
  "creative-ai",
  "training",
] as const;

const SECTION_EXPERTS: Record<string, string> = {
  chat: "AI assistant",
  general: "AI assistant",
  health: "health expert",
  love: "love & relationships expert",
  study: "study & learning expert",
  career: "career coach",
  fashion: "fashion stylist",
  business: "business advisor",
  search: "search expert",
  law: "law expert",
  reminders: "productivity expert",
  account: "account manager",
  live: "live updates expert",
  "creative-ai": "creative AI specialist",
  training: "fitness & training expert",
};

function buildGreeting(section: string): string {
  const expert = SECTION_EXPERTS[section] ?? `${section} expert`;
  return `I am NavvGenX AI, your ${expert}. How can I help you?`;
}

function speakText(text: string, lang = "en-IN") {
  try {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.88;
    utterance.pitch = 1.0;
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
    if (window.speechSynthesis.getVoices().length > 0) setVoice();
    else
      window.speechSynthesis.addEventListener("voiceschanged", setVoice, {
        once: true,
      });
    window.speechSynthesis.speak(utterance);
  } catch {
    // Speech synthesis not available
  }
}

// ─── AI Response (home panel) ────────────────────────────────────────────────
function getHomePanelResponse(query: string): string {
  const q = query.toLowerCase();
  let text = "";

  if (q.includes("joke") || q.includes("funny") || q.includes("laugh")) {
    text = `😂 Haha! Here's one:\n\n**Why don't scientists trust atoms?** Because they make up everything! 😄\n\nWant another joke?`;
  } else if (
    q.includes("homework") ||
    q.includes("assignment") ||
    q.includes("math") ||
    q.includes("solve")
  ) {
    text = `📚 **Homework Solution**\n\n**Step-by-Step:**\n1. Understand the problem\n2. Apply relevant formulas\n3. Show all work\n4. Verify the answer\n\nShare your specific question and I'll solve it! 🚀`;
  } else if (
    q.includes("presentation") ||
    q.includes("slides") ||
    q.includes("ppt")
  ) {
    const topic =
      query
        .replace(/make|create|presentation|ppt|slides|about|on|a|an|the/gi, "")
        .trim() || "Your Topic";
    text = `📊 **Presentation: ${topic}**\n\n• Slide 1: Title & Intro\n• Slide 2: Key Concepts\n• Slide 3: Data & Analysis\n• Slide 4: Examples\n• Slide 5: Conclusion\n\n✨ Keep text minimal, add visuals!`;
  } else if (
    q.includes("fashion") ||
    q.includes("outfit") ||
    q.includes("dress") ||
    q.includes("wear")
  ) {
    text =
      "👗 **Fashion Advice**\n\n• Casual: Slim jeans + plain tee + white sneakers\n• Smart casual: Chinos + button-down + loafers\n• Formal: Tailored suit or saree/kurta\n\nTell me the occasion for specific picks! 💫";
  } else if (q.includes("study") || q.includes("exam") || q.includes("learn")) {
    text =
      "🎓 **Smart Study Tips**\n\n1. Pomodoro: 25 min focus, 5 min break\n2. Active Recall: write what you remember\n3. Spaced Repetition: review after 1/3/7 days\n4. Teach it back to someone\n5. Sleep 7-8 hrs for memory consolidation 🧠";
  } else if (
    q.includes("song") ||
    q.includes("music") ||
    q.includes("playlist")
  ) {
    text =
      "🎵 **Music Picks**\n\n**Punjabi:** Softly – Karan Aujla, Lover – Diljit, 295 – Sidhu\n**Bollywood:** Kesariya – Arijit, Raataan Lambiyan – Jubin\n**International:** Blinding Lights – The Weeknd, As It Was – Harry Styles\n\n🎧 Tell me your mood for a playlist!";
  } else if (q.includes("movie") || q.includes("film") || q.includes("watch")) {
    text =
      "🎬 **Must Watch**\n\n**Bollywood:** 3 Idiots ⭐8.4, Dangal ⭐8.3, Zindagi Na Milegi Dobara ⭐8.2\n**Hollywood:** Interstellar ⭐8.7, Inception ⭐8.8, The Dark Knight ⭐9.0\n**Web Series:** Breaking Bad, Mirzapur, Sacred Games\n\n🍿 Tell me your genre!";
  } else if (
    q.includes("buy") ||
    q.includes("shopping") ||
    q.includes("price") ||
    q.includes("deal")
  ) {
    text = `🛍️ **Best Shopping Platforms**\n\n• Amazon India – Electronics, books\n• Flipkart – Great Indian brands\n• Myntra – Fashion & clothing\n• Meesho – Budget fashion\n\nTell me what you want to buy and I'll find the best deal! 🎯`;
  } else if (
    q.includes("advice") ||
    q.includes("career") ||
    q.includes("tips") ||
    q.includes("motivation")
  ) {
    text =
      "💡 **Smart Life Tips**\n\n• Learn one new skill every 3 months\n• Save 20% of your income\n• Exercise 30 min daily\n• Network on LinkedIn\n• Read 30 min daily\n\nWhat area do you need advice on?";
  } else if (
    q.includes("image") ||
    q.includes("picture") ||
    q.includes("draw") ||
    q.includes("generate image")
  ) {
    text = `🖼️ **Generating Image...**\n\nCreating an image for: "${query}"\n\nPowered by Pollinations AI ✨`;
  } else {
    text = `🤖 **NavvGenX AI is here!**\n\nYou asked: "${query}"\n\nI can help with:\n• 📚 Homework & studies\n• 📊 Presentations\n• 🎵 Music & movies\n• 🛍️ Shopping\n• 💡 Life & career tips\n• ✨ Creative writing\n\nAsk me anything! 😊`;
  }

  const links: string[] = [];
  if (
    q.includes("image") ||
    q.includes("picture") ||
    q.includes("draw") ||
    q.includes("generate")
  ) {
    links.push(getPollinationsImage(query));
  }
  if (
    q.includes("buy") ||
    q.includes("shop") ||
    q.includes("price") ||
    q.includes("deal")
  ) {
    links.push(getShoppingLinks(query));
  }
  if (
    q.includes("song") ||
    q.includes("music") ||
    q.includes("movie") ||
    q.includes("video")
  ) {
    links.push(getYouTubeLinks(query));
    links.push(getSocialLinks(query));
  }
  // Always add search engine links for every query
  const encoded = encodeURIComponent(query);
  const searchLinks = `<div style="margin-top:14px;padding-top:10px;border-top:1px solid rgba(128,128,128,0.15);display:flex;flex-wrap:wrap;gap:8px;align-items:center"><span style="font-size:0.75rem;opacity:0.5;margin-right:2px;font-weight:600;letter-spacing:0.04em">SEARCH:</span><a href="https://www.google.com/search?q=${encoded}" target="_blank" rel="noreferrer" style="font-size:0.78rem;color:#4285f4;text-decoration:none;padding:2px 8px;border:1px solid #4285f420;border-radius:20px;background:#4285f408">Google</a><a href="https://duckduckgo.com/?q=${encoded}" target="_blank" rel="noreferrer" style="font-size:0.78rem;color:#de5833;text-decoration:none;padding:2px 8px;border:1px solid #de583320;border-radius:20px;background:#de583308">DuckDuckGo</a><a href="https://www.bing.com/search?q=${encoded}" target="_blank" rel="noreferrer" style="font-size:0.78rem;color:#008373;text-decoration:none;padding:2px 8px;border:1px solid #00837320;border-radius:20px;background:#00837308">Bing</a><a href="https://en.wikipedia.org/wiki/Special:Search?search=${encoded}" target="_blank" rel="noreferrer" style="font-size:0.78rem;color:#636466;text-decoration:none;padding:2px 8px;border:1px solid #63646620;border-radius:20px;background:#63646608">Wikipedia</a></div>`;
  if (
    q.includes("buy") ||
    q.includes("shop") ||
    q.includes("price") ||
    q.includes("deal")
  ) {
    links.push(getShoppingLinks(query));
  }
  if (
    q.includes("song") ||
    q.includes("music") ||
    q.includes("movie") ||
    q.includes("video")
  ) {
    links.push(getYouTubeLinks(query));
    links.push(getSocialLinks(query));
  }
  return text + (links.join("") ? `\n\n${links.join("")}` : "") + searchLinks;
}

function formatResponse(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(
      /\[(.*?)\]\((.*?)\)/g,
      '<a href="$2" target="_blank" rel="noreferrer" style="color:#C9A84C;text-decoration:underline;">$1</a>',
    )
    .replace(/\n/g, "<br />");
}

// ─── Section Greeting Banner ────────────────────────────────────────────────
function SectionGreetingBanner({
  message,
  onDone,
}: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 4000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 340, damping: 28 }}
      className="fixed top-20 left-1/2 z-50 -translate-x-1/2 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl"
      style={{
        background: "oklch(0.99 0.001 80)",
        border: "1px solid oklch(0.72 0.12 75 / 0.4)",
        boxShadow: "0 8px 32px oklch(0.155 0.030 265 / 0.12)",
        maxWidth: "min(440px, calc(100vw - 2rem))",
        width: "90vw",
      }}
    >
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          background: "oklch(0.155 0.030 265)",
          border: "1.5px solid oklch(0.72 0.12 75)",
        }}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 40 40"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="20"
            cy="20"
            r="19"
            stroke="oklch(0.72 0.12 75)"
            strokeWidth="1.5"
            fill="oklch(0.155 0.030 265)"
          />
          <text
            x="20"
            y="27"
            textAnchor="middle"
            fontFamily="'Space Grotesk', Arial, sans-serif"
            fontWeight="700"
            fontSize="11"
            fill="oklch(0.72 0.12 75)"
            letterSpacing="-0.5"
          >
            Navv
          </text>
        </svg>
      </div>
      <div>
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-0.5"
          style={{
            color: "oklch(0.72 0.12 75)",
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          NavvGenX AI
        </p>
        <p
          className="text-sm leading-snug"
          style={{
            color: "oklch(0.08 0.012 265)",
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          {message}
        </p>
      </div>
    </motion.div>
  );
}

// ─── PWA Install Banner ──────────────────────────────────────────────────────
function InstallBanner({
  onInstall,
  onDismiss,
}: { onInstall: () => void; onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="w-full flex items-center justify-between gap-3 px-4 py-2.5"
      style={{
        background: "oklch(0.975 0.003 80)",
        borderBottom: "1px solid oklch(0.91 0.003 265)",
      }}
      data-ocid="install.panel"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background: "oklch(0.155 0.030 265)",
            border: "1.5px solid oklch(0.72 0.12 75 / 0.6)",
          }}
        >
          <Download
            className="w-4 h-4"
            style={{ color: "oklch(0.72 0.12 75)" }}
          />
        </div>
        <div className="min-w-0">
          <p
            className="text-xs font-semibold truncate"
            style={{
              color: "oklch(0.155 0.030 265)",
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            Install NavvGenX AI
          </p>
          <p
            className="text-[11px] leading-tight truncate"
            style={{
              color: "oklch(0.50 0.008 265)",
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            Add to your home screen
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          type="button"
          onClick={onInstall}
          className="px-3 py-1 rounded-full text-xs font-semibold transition-all hover:opacity-90"
          style={{
            background: "oklch(0.155 0.030 265)",
            color: "oklch(0.985 0.002 80)",
            fontFamily: "'Space Grotesk', sans-serif",
          }}
          data-ocid="install.primary_button"
        >
          Install
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="p-1 rounded-full transition-all hover:opacity-70"
          style={{ color: "oklch(0.50 0.008 265)" }}
          aria-label="Dismiss"
          data-ocid="install.close_button"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Assistant Name Tag ───────────────────────────────────────────────────────
function AssistantNameTag() {
  const [assistantName, setAssistantName] = useState<string>(() => {
    try {
      const acc = localStorage.getItem("navvgenx-account");
      return acc ? JSON.parse(acc).assistantName || "" : "";
    } catch {
      return "";
    }
  });

  useEffect(() => {
    const onStorage = () => {
      try {
        const acc = localStorage.getItem("navvgenx-account");
        setAssistantName(acc ? JSON.parse(acc).assistantName || "" : "");
      } catch {
        // ignore
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  if (!assistantName) return null;
  return (
    <p
      style={{
        color: "rgba(255,255,255,0.95)",
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: "0.85rem",
        fontWeight: 600,
        marginTop: 6,
        textShadow: "0 1px 4px rgba(0,0,0,0.2)",
      }}
    >
      Your AI: <span style={{ color: "#fff8c6" }}>{assistantName}</span>
    </p>
  );
}

// ─── Home Section ─────────────────────────────────────────────────────────────
function HomeSection({
  onSectionChange,
}: {
  onSectionChange: (section: string, category?: string) => void;
}) {
  const { weather, location } = useWeather();
  const { articles } = useNews();
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () =>
      setIsDark(
        document.documentElement.classList.contains("dark") || mq.matches,
      );
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const handleSearch = (q?: string) => {
    const query = (q ?? searchQuery).trim();
    setShowSuggestions(false);
    if (query) sessionStorage.setItem("navvgenx-initial-query", query);
    if (attachedImage) {
      sessionStorage.setItem(
        "navvgenx-image-query",
        JSON.stringify({ image: attachedImage, query }),
      );
      setAttachedImage(null);
    }
    onSectionChange("chat", "general");
  };

  const handleAISubmit = (q?: string) => {
    const query = (q ?? aiInput).trim();
    if (!query || aiLoading) return;
    setAiLoading(true);
    setAiResponse("");
    setTimeout(
      () => {
        const response = getHomePanelResponse(query);
        setAiResponse(response);
        setAiLoading(false);
        try {
          const history = JSON.parse(
            localStorage.getItem("navvgenx-chat-history") || "[]",
          );
          history.unshift({ query, answer: response, timestamp: Date.now() });
          localStorage.setItem(
            "navvgenx-chat-history",
            JSON.stringify(history.slice(0, 50)),
          );
        } catch {
          // ignore
        }
      },
      700 + Math.random() * 700,
    );
  };

  const handleVoice = async (forPanel = false) => {
    const win = window as Window & typeof globalThis;
    const SpeechRec =
      (win as unknown as { SpeechRecognition?: typeof SpeechRecognition })
        .SpeechRecognition ||
      (win as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition })
        .webkitSpeechRecognition;
    if (!SpeechRec) {
      toast.error("Voice not supported");
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
      toast.error("Mic access denied");
      return;
    }
    const rec = new SpeechRec();
    recognitionRef.current = rec;
    rec.lang = "en-US";
    rec.onresult = (e: SpeechRecognitionEvent) => {
      const t = e.results[0][0].transcript;
      setIsRecording(false);
      if (forPanel) {
        setAiInput(t);
        setAiPanelOpen(true);
        setTimeout(() => handleAISubmit(t), 100);
      } else {
        setSearchQuery(t);
        setTimeout(() => handleSearch(t), 100);
      }
    };
    rec.onerror = () => {
      setIsRecording(false);
      toast.error("Voice failed");
    };
    rec.onend = () => setIsRecording(false);
    rec.start();
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
    for (const t of streamRef.current?.getTracks() ?? []) t.stop();
    streamRef.current = null;
    setCameraOpen(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setAttachedImage(base64);
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be selected again
    e.target.value = "";
  };

  const captureForSearch = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
    closeCamera();
    sessionStorage.setItem("navvgenx-camera-search", "1");
    onSectionChange("chat", "general");
  };

  return (
    <>
      <div className="w-full mx-auto flex flex-col" style={{ maxWidth: 560 }}>
        {/* ===== HERO SECTION — v43 style ===== */}
        <div className="px-5 pt-10 pb-8 text-center bg-background">
          {/* App name — shimmer hero, no logo here */}
          <div className="relative flex justify-center mb-2">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="hero-backdrop"
                style={{
                  width: "90%",
                  height: "140%",
                  filter: "blur(24px)",
                }}
              />
            </div>
            <h1
              className="navvgenx-title-shimmer relative z-10"
              style={{ fontSize: "clamp(3.2rem, 11vw, 5.5rem)" }}
            >
              NavvGenX AI
            </h1>
          </div>

          {/* Assistant name tag */}
          <div className="flex items-center justify-center gap-3 mb-5">
            <AssistantNameTag />
          </div>

          {/* Main Search Bar */}
          <div className="relative">
            <div
              className="flex items-center gap-2 rounded-full px-4 py-3 bg-white"
              style={{
                border: "1.5px solid oklch(0.91 0.003 265)",
                boxShadow: "0 2px 12px oklch(0.155 0.030 265 / 0.08)",
              }}
            >
              <Search
                size={16}
                style={{ color: "oklch(0.50 0.008 265)" }}
                className="shrink-0"
              />
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
                placeholder="Ask NavvGenX AI anything..."
                className="flex-1 bg-transparent outline-none text-sm"
                style={{
                  color: "oklch(0.08 0.012 265)",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
                data-ocid="home.search_input"
              />
              {attachedImage && (
                <img
                  src={attachedImage}
                  alt="Attached"
                  className="w-8 h-8 rounded-lg object-cover border border-border shrink-0"
                  title="Image attached"
                />
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded-full transition-colors"
                style={{ color: "oklch(0.50 0.008 265)" }}
                title="Upload image"
                data-ocid="home.upload_button"
              >
                <ImagePlus size={16} />
              </button>
              <button
                type="button"
                onClick={() => openCamera()}
                className="p-1.5 rounded-full transition-colors"
                style={{ color: "oklch(0.50 0.008 265)" }}
                title="Camera search"
                data-ocid="home.toggle"
              >
                <Camera size={16} />
              </button>
              <button
                type="button"
                onClick={() => handleVoice(false)}
                className="p-1.5 rounded-full transition-colors"
                style={{
                  color: isRecording
                    ? "oklch(0.55 0.22 25)"
                    : "oklch(0.50 0.008 265)",
                }}
                title="Voice search"
                data-ocid="home.toggle"
              >
                <ProfessionalMic
                  size={16}
                  className={isRecording ? "animate-pulse" : ""}
                />
              </button>
              <button
                type="button"
                onClick={() => handleSearch()}
                className="navvgenx-gradient-btn px-3 py-1.5 rounded-full text-xs font-semibold"
                data-ocid="home.primary_button"
              >
                Search
              </button>
            </div>

            {/* Suggestions */}
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="absolute left-0 right-0 top-full z-20 rounded-2xl shadow-xl bg-white mt-1 overflow-hidden"
                  style={{ border: "1px solid oklch(0.91 0.003 265)" }}
                >
                  {suggestions.slice(0, 5).map((s) => (
                    <button
                      key={s}
                      type="button"
                      className="w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2"
                      style={{
                        color: "oklch(0.08 0.012 265)",
                        fontFamily: "'Space Grotesk', sans-serif",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "oklch(0.94 0.018 80)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                      }}
                      onClick={() => {
                        setSearchQuery(s);
                        setShowSuggestions(false);
                        handleSearch(s);
                      }}
                      data-ocid="home.button"
                    >
                      <Search
                        size={13}
                        style={{ color: "oklch(0.72 0.12 75)" }}
                        className="shrink-0"
                      />
                      {s}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ===== AI PANEL (slides from right) ===== */}
        <AnimatePresence>
          {aiPanelOpen && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ type: "spring", stiffness: 340, damping: 28 }}
              className="mx-4 mb-4 rounded-2xl overflow-hidden bg-white"
              style={{
                border: "1px solid oklch(0.91 0.003 265)",
                boxShadow: "0 4px 24px oklch(0.155 0.030 265 / 0.10)",
              }}
              data-ocid="home.panel"
            >
              {/* AI Panel Header */}
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{
                  background: "oklch(0.155 0.030 265)",
                  borderBottom: "1px solid oklch(0.72 0.12 75 / 0.3)",
                }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{
                      background: "oklch(0.22 0.035 265)",
                      border: "1.5px solid oklch(0.72 0.12 75)",
                    }}
                  >
                    <span
                      style={{
                        color: "oklch(0.72 0.12 75)",
                        fontWeight: 800,
                        fontSize: 12,
                      }}
                    >
                      N
                    </span>
                  </div>
                  <span
                    className="font-semibold text-sm"
                    style={{
                      color: "oklch(0.985 0.002 80)",
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                  >
                    NavvGenX AI
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setAiPanelOpen(false)}
                  style={{ color: "oklch(0.65 0.012 265)" }}
                  className="hover:text-white transition-colors"
                  data-ocid="home.close_button"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Input row */}
              <div
                className="flex items-center gap-2 px-3 py-2.5"
                style={{ borderBottom: "1px solid oklch(0.91 0.003 265)" }}
              >
                <input
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAISubmit()}
                  placeholder="Ask anything... 📚💡👗"
                  className="flex-1 bg-transparent outline-none text-sm"
                  style={{
                    color: "oklch(0.08 0.012 265)",
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                  data-ocid="home.input"
                />
                <button
                  type="button"
                  onClick={() => handleAISubmit()}
                  disabled={aiLoading}
                  className="navvgenx-gradient-btn px-3 py-1 rounded-full text-xs font-semibold disabled:opacity-50"
                  data-ocid="home.submit_button"
                >
                  Send
                </button>
                <button
                  type="button"
                  onClick={() => handleVoice(true)}
                  className="p-1.5 rounded-full text-sm transition-colors"
                  style={{
                    background: isRecording
                      ? "oklch(0.90 0.10 25)"
                      : "oklch(0.94 0.005 265)",
                    color: isRecording
                      ? "oklch(0.55 0.22 25)"
                      : "oklch(0.50 0.008 265)",
                  }}
                  data-ocid="home.toggle"
                >
                  🎤
                </button>
                <button
                  type="button"
                  onClick={() => openCamera()}
                  className="p-1.5 rounded-full text-sm transition-colors"
                  style={{
                    background: "oklch(0.94 0.005 265)",
                    color: "oklch(0.50 0.008 265)",
                  }}
                  data-ocid="home.toggle"
                >
                  📷
                </button>
              </div>

              {/* Response area */}
              <div className="px-4 py-3 max-h-72 overflow-y-auto">
                {aiLoading && (
                  <div
                    className="flex items-center gap-2 text-sm"
                    style={{ color: "oklch(0.50 0.008 265)" }}
                    data-ocid="home.loading_state"
                  >
                    <div
                      className="w-4 h-4 border-2 rounded-full animate-spin"
                      style={{
                        borderColor: "oklch(0.91 0.003 265)",
                        borderTopColor: "oklch(0.72 0.12 75)",
                      }}
                    />
                    NavvGenX AI is thinking...
                  </div>
                )}
                {aiResponse && !aiLoading && (
                  <div
                    className="text-sm leading-relaxed"
                    style={{
                      borderLeft: "3px solid oklch(0.72 0.12 75)",
                      paddingLeft: 12,
                      color: "oklch(0.08 0.012 265)",
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                    // biome-ignore lint/security/noDangerouslySetInnerHtml: formatted AI response
                    dangerouslySetInnerHTML={{
                      __html: formatResponse(aiResponse),
                    }}
                    data-ocid="home.success_state"
                  />
                )}
                {!aiLoading && !aiResponse && (
                  <p
                    className="text-sm italic"
                    style={{ color: "oklch(0.65 0.008 265)" }}
                  >
                    Type a question above and press Send! 🚀
                  </p>
                )}
              </div>

              {/* Quick action buttons */}
              <div className="flex gap-2 px-3 pb-3 flex-wrap">
                {[
                  { label: "🖼️ Image", prompt: "Generate an image of " },
                  { label: "🎥 Video", prompt: "Find videos about " },
                  { label: "🔊 Voice", prompt: "Speak about " },
                  { label: "⚙️ App Builder", prompt: "Build an app that " },
                ].map((t) => (
                  <button
                    key={t.label}
                    type="button"
                    onClick={() => {
                      setAiInput(t.prompt);
                      inputRef.current?.focus();
                    }}
                    className="px-2.5 py-1 rounded-full text-xs border transition-all"
                    style={{
                      borderColor: "oklch(0.91 0.003 265)",
                      color: "oklch(0.155 0.030 265)",
                      background: "white",
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "oklch(0.72 0.12 75)";
                      e.currentTarget.style.color = "oklch(0.60 0.14 75)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor =
                        "oklch(0.91 0.003 265)";
                      e.currentTarget.style.color = "oklch(0.155 0.030 265)";
                    }}
                    data-ocid="home.button"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== LIVE WEATHER & NEWS ===== */}
        <div className="px-4 pb-4">
          {/* Section label */}
          <div className="flex items-center justify-between mb-3">
            <span
              className="text-xs font-bold uppercase tracking-widest"
              style={{
                color: "oklch(0.72 0.12 75)",
                fontFamily: "'Space Grotesk', sans-serif",
                letterSpacing: "0.12em",
              }}
            >
              Live News &amp; Weather
            </span>
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
              style={{
                background: "oklch(0.72 0.12 75 / 0.12)",
                color: "oklch(0.72 0.12 75)",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              LIVE
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {/* Weather Column */}
            <div
              className="rounded-2xl p-3.5"
              style={{
                background: isDark ? "oklch(0.13 0.025 265)" : "white",
                border: isDark
                  ? "1.5px solid oklch(0.72 0.12 75 / 0.40)"
                  : "1.5px solid oklch(0.72 0.12 75 / 0.25)",
                boxShadow: isDark
                  ? "0 2px 16px oklch(0.72 0.12 75 / 0.10)"
                  : "0 1px 8px oklch(0.155 0.030 265 / 0.06)",
              }}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="oklch(0.72 0.12 75)"
                  strokeWidth="2.5"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                </svg>
                <span
                  className="text-[10px] font-bold uppercase tracking-wide"
                  style={{
                    color: "oklch(0.72 0.12 75)",
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  Weather
                </span>
              </div>
              {weather ? (
                <>
                  <div
                    className="font-bold"
                    style={{
                      fontSize: "1.8rem",
                      lineHeight: 1,
                      color: isDark
                        ? "oklch(0.90 0.10 75)"
                        : "oklch(0.155 0.030 265)",
                      fontFamily: "'Playfair Display', serif",
                    }}
                  >
                    {weather.temp}°C
                  </div>
                  <div
                    className="text-xs mt-1 leading-snug"
                    style={{
                      color: isDark
                        ? "oklch(0.75 0.010 265)"
                        : "oklch(0.40 0.008 265)",
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                  >
                    {weather.condition.replace(/[^\w\s]/g, "").trim()}
                  </div>
                  <div
                    className="text-[10px] mt-1.5 space-y-0.5"
                    style={{
                      color: isDark
                        ? "oklch(0.65 0.010 265)"
                        : "oklch(0.55 0.008 265)",
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                  >
                    <div>Humidity: {weather.humidity}%</div>
                    <div>Wind: {weather.windSpeed} km/h</div>
                  </div>
                  {location && (
                    <div
                      className="text-[10px] mt-1.5 font-semibold truncate"
                      style={{ color: "oklch(0.72 0.12 75)" }}
                    >
                      {location.city}
                    </div>
                  )}
                </>
              ) : (
                <div
                  className="text-xs"
                  style={{
                    color: isDark
                      ? "oklch(0.65 0.010 265)"
                      : "oklch(0.55 0.008 265)",
                  }}
                >
                  Loading...
                </div>
              )}
            </div>

            {/* News Column */}
            <div
              className="rounded-2xl p-3.5"
              style={{
                background: isDark ? "oklch(0.13 0.025 265)" : "white",
                border: isDark
                  ? "1.5px solid oklch(0.72 0.12 75 / 0.40)"
                  : "1.5px solid oklch(0.72 0.12 75 / 0.25)",
                boxShadow: isDark
                  ? "0 2px 16px oklch(0.72 0.12 75 / 0.10)"
                  : "0 1px 8px oklch(0.155 0.030 265 / 0.06)",
                overflow: "hidden",
              }}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="oklch(0.72 0.12 75)"
                  strokeWidth="2.5"
                  aria-hidden="true"
                >
                  <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
                  <path d="M18 14h-8" />
                  <path d="M15 18h-5" />
                  <path d="M10 6h8v4h-8V6z" />
                </svg>
                <span
                  className="text-[10px] font-bold uppercase tracking-wide"
                  style={{
                    color: "oklch(0.72 0.12 75)",
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  Live News
                </span>
              </div>
              <div className="space-y-1.5">
                {articles.slice(0, 4).map((article, i) => (
                  <a
                    key={article.link || i}
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-1.5 leading-tight no-underline group"
                    style={{ textDecoration: "none" }}
                  >
                    <span
                      style={{
                        color: "oklch(0.72 0.12 75)",
                        fontSize: "8px",
                        marginTop: 4,
                        flexShrink: 0,
                      }}
                    >
                      ●
                    </span>
                    <span
                      className="text-[10px] leading-tight line-clamp-2 group-hover:underline"
                      style={{
                        color: isDark
                          ? "oklch(0.80 0.008 265)"
                          : "oklch(0.20 0.020 265)",
                        fontFamily: "'Space Grotesk', sans-serif",
                      }}
                    >
                      {article.title}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ===== QUICK ACTIONS GRID ===== */}
        <div className="px-4 pb-8">
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                id: "chat",
                label: "Ask Anything",
                desc: "AI chat & questions",
                icon: (
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="oklch(0.72 0.12 75)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                ),
              },
              {
                id: "live",
                label: "News & Live",
                desc: "Headlines & updates",
                icon: (
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="oklch(0.72 0.12 75)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
                    <path d="M18 14h-8" />
                    <path d="M15 18h-5" />
                    <path d="M10 6h8v4h-8V6z" />
                  </svg>
                ),
              },
              {
                id: "creative-ai",
                label: "Creative AI",
                desc: "Generate images & more",
                icon: (
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="oklch(0.72 0.12 75)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                    <path d="M5 3v4" />
                    <path d="M19 17v4" />
                    <path d="M3 5h4" />
                    <path d="M17 19h4" />
                  </svg>
                ),
              },
              {
                id: "health",
                label: "Health & Wellness",
                desc: "Tips & reminders",
                icon: (
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="oklch(0.72 0.12 75)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                ),
              },
            ].map((card) => (
              <button
                key={card.id}
                type="button"
                onClick={() => onSectionChange(card.id)}
                className="flex flex-col gap-3 p-4 rounded-2xl text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: "oklch(0.99 0.001 80)",
                  border: "1.5px solid oklch(0.91 0.003 265)",
                  boxShadow: "0 1px 8px oklch(0.155 0.030 265 / 0.04)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "oklch(0.72 0.12 75)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 16px oklch(0.72 0.12 75 / 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "oklch(0.91 0.003 265)";
                  e.currentTarget.style.boxShadow =
                    "0 1px 8px oklch(0.155 0.030 265 / 0.04)";
                }}
                data-ocid="home.button"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "oklch(0.155 0.030 265)" }}
                >
                  {card.icon}
                </div>
                <div>
                  <p
                    className="font-semibold text-sm leading-tight"
                    style={{
                      color: "oklch(0.12 0.020 265)",
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                  >
                    {card.label}
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{
                      color: "oklch(0.55 0.008 265)",
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                  >
                    {card.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ===== FOOTER SPACER ===== */}
        <div className="pb-4" />
      </div>
      {/* Camera Modal */}
      <AnimatePresence>
        {cameraOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          >
            <div className="relative rounded-2xl overflow-hidden w-[90vw] max-w-sm">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-2xl"
                style={{ background: "#000" }}
              >
                <track kind="captions" />
              </video>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
                <button
                  type="button"
                  onClick={captureForSearch}
                  className="navvgenx-gradient-btn px-4 py-2 rounded-full text-sm font-semibold"
                  data-ocid="home.primary_button"
                >
                  📸 Analyze
                </button>
                <button
                  type="button"
                  onClick={closeCamera}
                  className="px-4 py-2 rounded-full text-sm font-semibold bg-white/20 text-white"
                  data-ocid="home.close_button"
                >
                  ✕
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Splash Screen ───────────────────────────────────────────────────────────
function SplashScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("hold"), 400);
    const t2 = setTimeout(() => setPhase("out"), 3000);
    const t3 = setTimeout(() => onDone(), 3600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: phase === "out" ? 0 : 1 }}
      transition={{ duration: phase === "out" ? 0.6 : 0.5 }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{ background: "oklch(0.10 0.025 265)" }}
    >
      {/* Logo ring */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative mb-8"
      >
        <div
          className="splash-ring w-28 h-28 rounded-full flex items-center justify-center"
          style={{
            background: "oklch(0.155 0.030 265)",
            border: "2px solid oklch(0.72 0.12 75 / 0.6)",
          }}
        >
          <Logo size="lg" />
        </div>
      </motion.div>

      {/* App name */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="navvgenx-title-shimmer mb-3"
        style={{ fontSize: "clamp(2.8rem, 10vw, 4.5rem)" }}
      >
        NavvGenX AI
      </motion.h1>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 0.7, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        style={{
          color: "oklch(0.75 0.010 265)",
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: "0.95rem",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        Your Intelligent AI Companion
      </motion.p>

      {/* Bottom loader dots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-16 flex gap-2"
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: "oklch(0.72 0.12 75)",
              animation: `splashDot 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}

// ─── Category Chat Wrapper ────────────────────────────────────────────────────
function CategorySection({
  category,
  label,
  profile,
}: { category: string; label: string; profile: Profile | null }) {
  return (
    <div className="min-h-screen" data-ocid="chat.panel">
      <div
        className="px-4 py-3 flex items-center gap-2"
        style={{
          background: "oklch(0.99 0.001 80)",
          borderBottom: "1px solid oklch(0.91 0.003 265)",
        }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{
            background: "oklch(0.155 0.030 265)",
            border: "1.5px solid oklch(0.72 0.12 75)",
          }}
        >
          <span
            style={{
              color: "oklch(0.72 0.12 75)",
              fontWeight: 800,
              fontSize: 12,
            }}
          >
            N
          </span>
        </div>
        <div>
          <p
            className="font-semibold text-sm"
            style={{
              color: "oklch(0.155 0.030 265)",
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            NavvGenX AI — {label}
          </p>
          <p className="text-xs" style={{ color: "oklch(0.50 0.008 265)" }}>
            Your {SECTION_EXPERTS[category] ?? `${category} expert`}
          </p>
        </div>
      </div>
      <ChatPage profile={profile} initialCategory={category} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => localStorage.getItem("navvgenx-user") !== null,
  );
  const [activeSection, setActiveSection] = useState<Section>("home");
  const [activeCategory, setActiveCategory] = useState("general");
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("navvgenx-dark") === "1",
  );
  const [showSplash, setShowSplash] = useState(
    () => !sessionStorage.getItem("navvgenx-splash-shown"),
  );
  const [sectionGreeting, setSectionGreeting] = useState<string | null>(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const greetingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [profile, setProfile] = useState<Profile | null>(() => {
    const saved = localStorage.getItem("navvgenx-profile");
    if (saved) {
      try {
        const p = JSON.parse(saved);
        return { age: BigInt(p.age), ageGroup: p.ageGroup };
      } catch {
        return null;
      }
    }
    return null;
  });
  const { actor } = useActor();
  const [profilePhotoUrl] = useState<string>(() => {
    try {
      const acc = localStorage.getItem("navvgenx-account");
      return acc ? JSON.parse(acc).photoUrl || "" : "";
    } catch {
      return "";
    }
  });

  const {
    canInstall,
    promptInstall,
    dismiss: dismissInstall,
  } = usePWAInstall();
  useServiceWorkerUpdate();

  const handleProfileSet = useCallback((p: Profile) => {
    localStorage.setItem(
      "navvgenx-profile",
      JSON.stringify({ age: p.age.toString(), ageGroup: p.ageGroup }),
    );
    setProfile(p);
  }, []);

  // Welcome speech
  useEffect(() => {
    if (!isLoggedIn) return;
    if (sessionStorage.getItem("navvgenx-welcomed")) return;
    sessionStorage.setItem("navvgenx-welcomed", "1");
    const timer = setTimeout(() => {
      try {
        const acc = localStorage.getItem("navvgenx-account");
        const accData = acc ? JSON.parse(acc) : null;
        const name = accData?.name || "";
        // Use only the first word of the name for natural greeting
        const firstName = name.trim().split(/\s+/)[0] || name;
        // Two-part speech for clearer pronunciation
        try {
          if (!window.speechSynthesis) throw new Error("no tts");
          window.speechSynthesis.cancel();
          const u1 = new SpeechSynthesisUtterance(
            firstName ? `Hello ${firstName}` : "Hello",
          );
          u1.rate = 0.85;
          u1.pitch = 1.0;
          u1.volume = 1.0;
          u1.lang = "en-IN";
          const u2 = new SpeechSynthesisUtterance("welcome to Nav Gen X A I");
          u2.rate = 0.8;
          u2.pitch = 1.0;
          u2.volume = 1.0;
          u2.lang = "en-IN";
          const setVoice = (utt: SpeechSynthesisUtterance) => {
            const voices = window.speechSynthesis.getVoices();
            const preferred = voices.find(
              (v) =>
                v.name.toLowerCase().includes("google uk english female") ||
                v.name.toLowerCase().includes("samantha") ||
                v.name.toLowerCase().includes("female"),
            );
            if (preferred) utt.voice = preferred;
          };
          setVoice(u1);
          setVoice(u2);
          u1.onend = () => {
            setTimeout(() => window.speechSynthesis.speak(u2), 400);
          };
          window.speechSynthesis.speak(u1);
        } catch {
          speakText(
            firstName
              ? `Hello ${firstName}, welcome to NavvGenX AI`
              : "Welcome to NavvGenX AI",
          );
        }
        return; // skip old speakText call
      } catch {
        speakText("Welcome to NavvGenX AI");
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [isLoggedIn]);

  useEffect(() => {
    if (!actor) return;
    actor
      .getCallerUserProfile()
      .then((p) => {
        if (p) handleProfileSet({ age: p.age, ageGroup: p.ageGroup });
      })
      .catch(() => {});
  }, [actor, handleProfileSet]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("navvgenx-dark", darkMode ? "1" : "0");
  }, [darkMode]);

  const triggerSectionGreeting = useCallback((section: string) => {
    if (greetingTimeoutRef.current) clearTimeout(greetingTimeoutRef.current);
    const msg = buildGreeting(section);
    setSectionGreeting(msg);
    speakText(msg);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("navvgenx-user");
    setIsLoggedIn(false);
    toast.success("Signed out successfully");
  };

  const navigate = useCallback((page: string, category?: string) => {
    if (page === "home") {
      setActiveSection("home");
      return;
    }
    if (["health", "live", "account", "history", "reminders"].includes(page)) {
      setActiveSection(page as Section);
      return;
    }
    if (
      page === "chat" ||
      [
        "love",
        "study",
        "career",
        "fashion",
        "business",
        "search",
        "general",
      ].includes(page)
    ) {
      setActiveSection("chat");
      setActiveCategory(category || page);
      return;
    }
    if (page === "creative-ai") {
      setActiveSection("creative-ai");
      return;
    }
    setActiveSection(page as Section);
    if (category) setActiveCategory(category);
  }, []);

  const handleNavClick = useCallback(
    (id: string) => {
      setShowMoreMenu(false);
      if (id === "home") {
        navigate("home");
        return;
      }
      if (id === "health") {
        navigate("health");
        triggerSectionGreeting("health");
        return;
      }
      if (id === "account") {
        navigate("account");
        return;
      }
      if (id === "live") {
        navigate("live");
        triggerSectionGreeting("live");
        return;
      }
      if (id === "history") {
        navigate("history");
        return;
      }
      if (id === "creative-ai") {
        navigate("creative-ai");
        triggerSectionGreeting("creative-ai");
        return;
      }
      if (id === "chat") {
        sessionStorage.removeItem("navvgenx-initial-query");
        navigate("chat", "general");
        triggerSectionGreeting("general");
        return;
      }
      sessionStorage.removeItem("navvgenx-initial-query");
      navigate("chat", id);
      triggerSectionGreeting(id);
    },
    [navigate, triggerSectionGreeting],
  );

  const handleShare = () => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => toast.success("Link copied to clipboard"))
      .catch(() => toast.info(`NavvGenX AI: ${window.location.href}`));
  };

  const isNavActive = (id: string) =>
    activeSection === id ||
    (id === "chat" &&
      activeSection === "chat" &&
      activeCategory === "general") ||
    (activeSection === "chat" && activeCategory === id);

  const handleSplashDone = useCallback(() => {
    sessionStorage.setItem("navvgenx-splash-shown", "1");
    setShowSplash(false);
  }, []);

  // ── Login guard ──────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <>
        <Toaster richColors position="top-right" />
        <LoginPage onLogin={() => setIsLoggedIn(true)} />
      </>
    );
  }

  if (isLoggedIn && !profile) {
    return (
      <>
        <Toaster richColors position="top-right" />
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="rounded-3xl p-8 max-w-sm w-full bg-white"
            style={{
              border: "1px solid oklch(0.91 0.003 265)",
              boxShadow: "0 8px 40px oklch(0.155 0.030 265 / 0.12)",
            }}
          >
            <AgeSetup onComplete={handleProfileSet} actor={actor} />
          </motion.div>
        </div>
      </>
    );
  }

  const currentYear = new Date().getFullYear();
  const hostname = encodeURIComponent(window.location.hostname);

  // More section categories
  const moreCategories = [
    {
      id: "study",
      label: "Study",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      ),
    },
    {
      id: "fashion",
      label: "Fashion",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z" />
        </svg>
      ),
    },
    {
      id: "law",
      label: "Law",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 22v-7" />
          <path d="M18 22H6" />
          <path d="m17 11-5-5-5 5" />
          <path d="M3 11h18" />
          <path d="m8 11 4-8 4 8" />
        </svg>
      ),
    },
    {
      id: "career",
      label: "Career",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      ),
    },
    {
      id: "business",
      label: "Business",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="18" x2="18" y1="20" y2="10" />
          <line x1="12" x2="12" y1="20" y2="4" />
          <line x1="6" x2="6" y1="20" y2="14" />
        </svg>
      ),
    },
    {
      id: "love",
      label: "Love",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      ),
    },
    {
      id: "recipes",
      label: "Recipes",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M15 11h.01" />
          <path d="M11 15h.01" />
          <path d="M16 16h.01" />
          <path d="m2 16 20 6-6-20A20 20 0 0 0 2 16" />
          <path d="M5.71 17.11a17.04 17.04 0 0 1 11.4-11.4" />
        </svg>
      ),
    },
    {
      id: "music",
      label: "Music",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      ),
    },
    {
      id: "movies",
      label: "Movies",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect width="20" height="20" x="2" y="2" rx="2.18" ry="2.18" />
          <line x1="7" x2="7" y1="2" y2="22" />
          <line x1="17" x2="17" y1="2" y2="22" />
          <line x1="2" x2="22" y1="12" y2="12" />
          <line x1="2" x2="7" y1="7" y2="7" />
          <line x1="2" x2="7" y1="17" y2="17" />
          <line x1="17" x2="22" y1="17" y2="17" />
          <line x1="17" x2="22" y1="7" y2="7" />
        </svg>
      ),
    },
    {
      id: "training",
      label: "Training",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 4v16" />
          <path d="M18 4v16" />
          <path d="M2 8h4" />
          <path d="M2 16h4" />
          <path d="M18 8h4" />
          <path d="M18 16h4" />
          <path d="M6 12h12" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 flex flex-col">
      <Toaster richColors position="top-right" />
      {/* Splash Screen */}
      <AnimatePresence>
        {showSplash && <SplashScreen onDone={handleSplashDone} />}
      </AnimatePresence>
      {/* Section Greeting Banner */}
      <AnimatePresence>
        {sectionGreeting && (
          <SectionGreetingBanner
            key={sectionGreeting}
            message={sectionGreeting}
            onDone={() => setSectionGreeting(null)}
          />
        )}
      </AnimatePresence>

      {/* ===== PREMIUM WHITE HEADER ===== */}
      <header
        data-ocid="header.panel"
        className="glass-header sticky top-0 z-40 bg-white"
        style={{
          borderBottom: "1px solid oklch(0.91 0.003 265)",
          boxShadow: "0 1px 8px oklch(0.155 0.030 265 / 0.06)",
        }}
      >
        {/* PWA Install Banner */}
        <AnimatePresence>
          {canInstall && (
            <InstallBanner
              key="install-banner"
              onInstall={promptInstall}
              onDismiss={dismissInstall}
            />
          )}
        </AnimatePresence>

        {/* Header bar */}
        <div className="flex items-center px-4 py-3 gap-3">
          {/* Logo */}
          <button
            type="button"
            onClick={() => navigate("home")}
            className="flex items-center gap-2.5 shrink-0"
          >
            <Logo size="sm" />
            <span
              className="font-playfair font-black text-sm hidden sm:block"
              style={{
                color: "oklch(0.155 0.030 265)",
                letterSpacing: "-0.01em",
              }}
            >
              NavvGenX <span style={{ color: "oklch(0.72 0.12 75)" }}>AI</span>
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex flex-1 items-center justify-center gap-0.5 overflow-x-auto">
            {navItems.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap"
                style={{
                  background: isNavActive(item.id)
                    ? "oklch(0.155 0.030 265)"
                    : "transparent",
                  color: isNavActive(item.id)
                    ? "oklch(0.985 0.002 80)"
                    : "oklch(0.50 0.008 265)",
                  borderLeft: isNavActive(item.id)
                    ? "2px solid oklch(0.72 0.12 75)"
                    : "2px solid transparent",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: isNavActive(item.id) ? 700 : 500,
                }}
                data-ocid="nav.tab"
              >
                <item.Icon className="w-3 h-3" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1 ml-auto">
            <button
              type="button"
              onClick={() => navigate("reminders")}
              className="p-1.5 rounded-full transition-all"
              style={{ color: "oklch(0.50 0.008 265)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "oklch(0.94 0.005 265)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
              title="Reminders"
            >
              <Bell className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="p-1.5 rounded-full transition-all"
              style={{ color: "oklch(0.50 0.008 265)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "oklch(0.94 0.005 265)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
              title="Share"
              data-ocid="header.button"
            >
              <Share2 className="w-4 h-4" />
            </button>
            {canInstall && (
              <button
                type="button"
                onClick={promptInstall}
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{
                  border: "1px solid oklch(0.72 0.12 75)",
                  color: "oklch(0.60 0.14 75)",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "oklch(0.94 0.018 80)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
                data-ocid="header.button"
              >
                <Download className="w-3 h-3" />
                Install
              </button>
            )}
            <button
              type="button"
              onClick={() => setDarkMode((d) => !d)}
              className="p-1.5 rounded-full transition-all"
              style={{ color: "oklch(0.50 0.008 265)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "oklch(0.94 0.005 265)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
              title={darkMode ? "Light mode" : "Dark mode"}
              data-ocid="header.toggle"
            >
              {darkMode ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            {/* Profile/Logout */}
            {profilePhotoUrl ? (
              <button
                type="button"
                onClick={() => navigate("account")}
                className="w-8 h-8 rounded-full overflow-hidden border-2 transition-all"
                style={{ borderColor: "oklch(0.72 0.12 75)" }}
                data-ocid="header.button"
              >
                <img
                  src={profilePhotoUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate("account")}
                className="p-1.5 rounded-full transition-all"
                style={{ color: "oklch(0.50 0.008 265)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "oklch(0.94 0.005 265)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
                title="Account"
                data-ocid="header.button"
              >
                <UserCircle className="w-5 h-5" />
              </button>
            )}
            <button
              type="button"
              onClick={handleSignOut}
              className="p-1.5 rounded-full transition-all"
              style={{ color: "oklch(0.50 0.008 265)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "oklch(0.92 0.10 25)";
                e.currentTarget.style.color = "oklch(0.55 0.22 25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "oklch(0.50 0.008 265)";
              }}
              title="Sign out"
              data-ocid="header.button"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside
          className="hidden md:flex w-52 shrink-0 flex-col"
          style={{
            background: "oklch(0.985 0.002 80)",
            borderRight: "1px solid oklch(0.91 0.003 265)",
          }}
        >
          <div className="flex-1 py-4 overflow-y-auto">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all"
                style={{
                  background: isNavActive(item.id)
                    ? "oklch(0.155 0.030 265)"
                    : "transparent",
                  color: isNavActive(item.id)
                    ? "oklch(0.985 0.002 80)"
                    : "oklch(0.50 0.008 265)",
                  borderLeft: isNavActive(item.id)
                    ? "3px solid oklch(0.72 0.12 75)"
                    : "3px solid transparent",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: isNavActive(item.id) ? 600 : 400,
                }}
                data-ocid="nav.link"
              >
                <item.Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
          {/* Footer branding */}
          <div
            className="px-4 py-3"
            style={{
              borderTop: "1px solid oklch(0.91 0.003 265)",
              color: "oklch(0.65 0.008 265)",
              fontSize: 11,
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            © {currentYear}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${hostname}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "oklch(0.72 0.12 75)" }}
            >
              caffeine.ai
            </a>
          </div>
        </aside>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto mobile-main-pb">
          {/* ── Home ── */}
          {activeSection === "home" && (
            <HomeSection onSectionChange={(s, c) => handleNavClick(c || s)} />
          )}

          {/* ── Chat (general) ── */}
          {activeSection === "chat" && activeCategory === "general" && (
            <CategorySection
              category="general"
              label="General Chat"
              profile={profile}
            />
          )}

          {/* ── Other chat categories ── */}
          {activeSection === "chat" && activeCategory !== "general" && (
            <CategorySection
              category={activeCategory}
              label={
                navItems.find((n) => n.id === activeCategory)?.label ??
                activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)
              }
              profile={profile}
            />
          )}

          {/* ── Health ── */}
          {activeSection === "health" && <HealthPage />}

          {/* ── Reminders ── */}
          {activeSection === "reminders" && <RemindersPage />}

          {/* ── Live ── */}
          {activeSection === "live" && <LivePage />}

          {/* ── Account ── */}
          {activeSection === "account" && (
            <AccountPage onSaved={() => toast.success("Profile saved")} />
          )}

          {/* ── History ── */}
          {activeSection === "history" && <HistoryPage />}

          {/* ── Creative AI ── */}
          {activeSection === "creative-ai" && <CreativeAIPage />}

          {/* ── Training ── */}
          {activeSection === "training" && <TrainingPage />}

          {/* ── Search (redirects to chat with search category) ── */}
          {activeSection === "search" && (
            <CategorySection
              category="search"
              label="Search"
              profile={profile}
            />
          )}

          {/* ── More section category panels ── */}
          {activeSection === "love" && (
            <CategorySection
              category="love"
              label="Love & Relationships"
              profile={profile}
            />
          )}
          {activeSection === "study" && (
            <CategorySection category="study" label="Study" profile={profile} />
          )}
          {activeSection === "career" && (
            <CategorySection
              category="career"
              label="Career"
              profile={profile}
            />
          )}
          {activeSection === "fashion" && (
            <CategorySection
              category="fashion"
              label="Fashion"
              profile={profile}
            />
          )}
          {activeSection === "business" && (
            <CategorySection
              category="business"
              label="Business"
              profile={profile}
            />
          )}
        </div>
      </main>

      {/* ===== MOBILE BOTTOM NAV (Floating Pill) ===== */}
      <nav
        className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1 px-4 py-2 rounded-full"
        style={{
          background: "oklch(0.99 0.001 80)",
          border: "1px solid oklch(0.91 0.003 265)",
          boxShadow:
            "0 4px 24px oklch(0.155 0.030 265 / 0.12), 0 1px 3px oklch(0.155 0.030 265 / 0.08)",
        }}
      >
        {/* Primary nav items */}
        {bottomNavPrimary.map((id) => {
          const item = navItems.find((n) => n.id === id)!;
          const active = isNavActive(id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => handleNavClick(id)}
              className="flex flex-col items-center px-3 py-1.5 rounded-full transition-all"
              style={{
                background: active ? "oklch(0.155 0.030 265)" : "transparent",
                minWidth: 52,
              }}
              data-ocid="nav.tab"
            >
              <item.Icon
                className="w-4 h-4 mb-0.5"
                style={{
                  color: active
                    ? "oklch(0.72 0.12 75)"
                    : "oklch(0.50 0.008 265)",
                }}
              />
              <span
                className="text-[10px] font-medium"
                style={{
                  color: active
                    ? "oklch(0.72 0.12 75)"
                    : "oklch(0.50 0.008 265)",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}

        {/* Divider */}
        <div
          className="w-px h-6 mx-1"
          style={{ background: "oklch(0.91 0.003 265)" }}
        />

        {/* More button */}
        <button
          type="button"
          onClick={() => setShowMoreMenu((v) => !v)}
          className="flex flex-col items-center px-3 py-1.5 rounded-full transition-all"
          style={{
            background: showMoreMenu ? "oklch(0.155 0.030 265)" : "transparent",
          }}
          data-ocid="nav.toggle"
        >
          <MoreHorizontal
            className="w-4 h-4 mb-0.5"
            style={{
              color: showMoreMenu
                ? "oklch(0.72 0.12 75)"
                : "oklch(0.50 0.008 265)",
            }}
          />
          <span
            className="text-[10px] font-medium"
            style={{
              color: showMoreMenu
                ? "oklch(0.72 0.12 75)"
                : "oklch(0.50 0.008 265)",
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            More
          </span>
        </button>
      </nav>

      {/* More Menu (mobile) */}
      <AnimatePresence>
        {showMoreMenu && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="md:hidden fixed bottom-20 left-4 right-4 z-40 rounded-2xl p-4 grid grid-cols-3 gap-2"
            style={{
              background: darkMode
                ? "oklch(0.10 0.020 265)"
                : "oklch(0.99 0.001 80)",
              border: darkMode
                ? "1px solid oklch(0.72 0.12 75 / 0.25)"
                : "1px solid oklch(0.91 0.003 265)",
              boxShadow: "0 8px 32px oklch(0.155 0.030 265 / 0.12)",
            }}
          >
            {moreCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setShowMoreMenu(false);
                  handleNavClick(cat.id);
                }}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all hover:scale-[1.04] active:scale-[0.96]"
                style={{
                  background: darkMode
                    ? "linear-gradient(135deg, oklch(0.72 0.12 75 / 0.18) 0%, oklch(0.08 0.015 265) 100%)"
                    : "linear-gradient(135deg, oklch(0.72 0.12 75 / 0.08) 0%, oklch(0.97 0.006 265) 100%)",
                  border: darkMode
                    ? "1.5px solid oklch(0.72 0.12 75 / 0.55)"
                    : "1.5px solid oklch(0.72 0.12 75 / 0.30)",
                  boxShadow: darkMode
                    ? "0 2px 12px oklch(0.72 0.12 75 / 0.20), inset 0 1px 0 oklch(0.72 0.12 75 / 0.12)"
                    : "none",
                }}
                data-ocid="more.button"
              >
                <span
                  style={{
                    color: darkMode
                      ? "oklch(0.82 0.14 75)"
                      : "oklch(0.22 0.035 265)",
                  }}
                >
                  {cat.icon}
                </span>
                <span
                  className="text-xs font-semibold"
                  style={{
                    color: darkMode
                      ? "oklch(0.85 0.14 75)"
                      : "oklch(0.12 0.020 265)",
                    fontFamily: "'Playfair Display', serif",
                    textShadow: darkMode
                      ? "0 0 16px oklch(0.72 0.12 75 / 0.50)"
                      : "none",
                  }}
                >
                  {cat.label}
                </span>
              </button>
            ))}
            {bottomNavMore.map((id) => {
              const item = navItems.find((n) => n.id === id);
              if (!item || moreCategories.find((c) => c.id === id)) return null;
              const active = isNavActive(id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setShowMoreMenu(false);
                    handleNavClick(id);
                  }}
                  className="flex flex-col items-center py-2.5 px-2 rounded-xl text-center transition-all"
                  style={{
                    background: active
                      ? "oklch(0.155 0.030 265)"
                      : "oklch(0.985 0.002 80)",
                    border: "1px solid oklch(0.91 0.003 265)",
                  }}
                  data-ocid="nav.button"
                >
                  <item.Icon
                    className="w-5 h-5 mb-1"
                    style={{
                      color: active
                        ? "oklch(0.72 0.12 75)"
                        : "oklch(0.50 0.008 265)",
                    }}
                  />
                  <span
                    className="text-[11px] font-medium"
                    style={{
                      color: active
                        ? "oklch(0.72 0.12 75)"
                        : "oklch(0.155 0.030 265)",
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Navv Assistant */}
      <NavvAssistant onNavigate={navigate} />

      {/* Footer (desktop) */}
      <footer
        className="hidden md:block py-3 text-center text-xs"
        style={{
          borderTop: "1px solid oklch(0.91 0.003 265)",
          color: "oklch(0.65 0.008 265)",
          fontFamily: "'Space Grotesk', sans-serif",
          background: "oklch(0.985 0.002 80)",
        }}
      >
        © {currentYear}. Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${hostname}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "oklch(0.72 0.12 75)" }}
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
