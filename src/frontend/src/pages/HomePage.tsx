import {
  Activity,
  BookOpen,
  Briefcase,
  Heart,
  Lightbulb,
  Mic,
  Search,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { getSuggestions } from "../utils/aiEngine";

interface HomePageProps {
  onNavigate: (page: string, category?: string) => void;
}

const cyclingTexts = [
  "Ask me anything — science, history, technology, culture",
  "Search any topic like Google, get answers like ChatGPT",
  "Get personalized career and life advice",
  "Explore the latest fashion trends",
  "Discover tips for meaningful relationships",
  "Ace your studies with smart guidance",
  "Grow your business with AI insights",
  "Ask: How does quantum physics work?",
  "Ask: Who was Napoleon Bonaparte?",
  "Ask: What is machine learning?",
];

const quickCategories = [
  {
    Icon: Activity,
    label: "Health",
    category: "health",
    iconColor: "text-amber-300",
  },
  {
    Icon: Heart,
    label: "Love",
    category: "love",
    iconColor: "text-amber-300",
  },
  {
    Icon: BookOpen,
    label: "Study",
    category: "study",
    iconColor: "text-amber-300",
  },
  {
    Icon: Briefcase,
    label: "Career",
    category: "career",
    iconColor: "text-amber-300",
  },
  {
    Icon: Sparkles,
    label: "Fashion",
    category: "fashion",
    iconColor: "text-amber-300",
  },
  {
    Icon: TrendingUp,
    label: "Business",
    category: "business",
    iconColor: "text-amber-300",
  },
];

const particles = Array.from({ length: 6 }, (_, i) => ({
  id: i,
  left: `${(i * 17.3) % 100}%`,
  top: `${(i * 19.1) % 100}%`,
  size: 6 + (i % 3) * 4,
  delay: `${i * 0.7}s`,
  duration: `${6 + (i % 4)}s`,
  color:
    i % 2 === 0 ? "oklch(0.72 0.14 75 / 0.10)" : "oklch(0.50 0.010 255 / 0.08)",
}));

export function HomePage({ onNavigate }: HomePageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [cycleIdx, setCycleIdx] = useState(0);
  const [textVisible, setTextVisible] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const meshRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setTextVisible(false);
      setTimeout(() => {
        setCycleIdx((prev) => (prev + 1) % cyclingTexts.length);
        setTextVisible(true);
      }, 300);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  // Update suggestions on query change
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
      onNavigate("chat", "search");
    } else {
      onNavigate("chat", "general");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
    if (e.key === "Escape") setShowSuggestions(false);
  };

  const handleVoiceMic = async () => {
    const win = window as Window & typeof globalThis;
    const SpeechRec =
      (win as unknown as { SpeechRecognition?: typeof SpeechRecognition })
        .SpeechRecognition ||
      (win as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition })
        .webkitSpeechRecognition;

    if (!SpeechRec) {
      toast.error("Voice input not supported in this browser");
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    if (navigator.mediaDevices?.getUserMedia) {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch {
        toast.error(
          "Microphone access denied. Please allow microphone in your browser settings.",
        );
        return;
      }
    }

    const recognition = new SpeechRec();
    recognitionRef.current = recognition;
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      setIsRecording(false);
      setTimeout(() => handleSearch(transcript), 100);
    };

    recognition.onerror = () => {
      setIsRecording(false);
      toast.error("Voice input failed. Please try again.");
    };

    recognition.onend = () => setIsRecording(false);
    recognition.start();
    setIsRecording(true);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.99_0.002_60)] via-white to-[oklch(0.97_0.003_60)] dark:from-[oklch(0.10_0.018_255)] dark:via-[oklch(0.11_0.016_255)] dark:to-[oklch(0.10_0.018_255)]" />
      <div className="absolute inset-0 navvgenx-hex-bg" aria-hidden="true" />
      <div className="navvgenx-hero-decoration" aria-hidden="true" />
      <div
        ref={meshRef}
        className="absolute inset-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full"
          style={{
            opacity: 0.06,
            background:
              "radial-gradient(circle, oklch(0.72 0.14 75) 0%, transparent 70%)",
            animation: "mesh-drift 14s ease-in-out infinite",
          }}
        />
      </div>

      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            background: p.color,
            animation: `float-particle ${p.duration} ease-in-out infinite`,
            animationDelay: p.delay,
          }}
        />
      ))}

      {/* Hero content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 pt-8 pb-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 text-xs font-jakarta font-semibold tracking-wide uppercase"
            style={{
              background: "oklch(0.72 0.14 75 / 0.08)",
              border: "1px solid oklch(0.72 0.14 75 / 0.25)",
              color: "oklch(0.52 0.12 75)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "oklch(0.72 0.14 75)" }}
            />
            AI-Powered Intelligence
          </motion.div>

          <h1 className="font-bricolage font-extrabold text-5xl md:text-7xl mb-3 leading-tight">
            <span className="navvgenx-rainbow-gradient-text">
              Hello, I&apos;m NavvGenX
            </span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl font-jakarta max-w-xl mx-auto leading-relaxed">
            Your AI companion — ask anything, get ideas, images, and voice
            answers
          </p>
        </motion.div>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-2xl mb-4 relative"
          data-ocid="home.section"
        >
          <div className="glass-card rounded-full flex items-center gap-2 px-5 py-3 shadow-sm">
            <Search className="text-primary w-5 h-5 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() =>
                searchQuery.trim().length >= 2 && setShowSuggestions(true)
              }
              placeholder="Ask NavvGenX anything — history, science, advice..."
              className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-base font-jakarta"
              data-ocid="home.search_input"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSuggestions([]);
                  setShowSuggestions(false);
                }}
                className="p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={handleVoiceMic}
              className={`p-2 rounded-full transition-all duration-200 ${
                isRecording
                  ? "text-red-500 bg-red-100 dark:bg-red-900/40 animate-pulse scale-110"
                  : "text-muted-foreground hover:text-primary hover:bg-primary/10"
              }`}
              title={isRecording ? "Stop recording" : "Voice input"}
              data-ocid="home.toggle"
            >
              <Mic className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleSearch()}
              className="navvgenx-gradient-btn text-white px-5 py-2 rounded-full text-sm font-semibold shrink-0 transition-all shadow-sm"
              data-ocid="home.submit_button"
            >
              Ask AI
            </button>
          </div>

          {/* Suggestions dropdown */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute top-full left-0 right-0 mt-2 glass-card rounded-2xl border border-border shadow-xl z-30 overflow-hidden"
              >
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/50">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-xs font-jakarta font-medium text-muted-foreground">
                    Suggested ideas
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowSuggestions(false)}
                    className="ml-auto text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
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
                    className="w-full text-left px-4 py-3 text-sm font-jakarta text-foreground/80 hover:bg-muted/50 hover:text-foreground transition-colors border-b border-border/20 last:border-0 flex items-center gap-2"
                  >
                    <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    {s}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {isRecording && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-red-500 text-xs font-jakarta mt-2 flex items-center justify-center gap-1"
            >
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block" />
              Listening... speak now
            </motion.p>
          )}
        </motion.div>

        {/* Cycling text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="h-8 mb-12"
        >
          <p
            className="text-center text-muted-foreground font-jakarta text-base transition-opacity duration-300"
            style={{ opacity: textVisible ? 1 : 0 }}
          >
            {cyclingTexts[cycleIdx]}
          </p>
        </motion.div>

        {/* Quick category cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="w-full max-w-3xl"
        >
          <h2 className="text-center font-bricolage font-semibold text-foreground/30 text-xs uppercase tracking-widest mb-5">
            Explore Topics
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {quickCategories.map((cat, i) => (
              <motion.button
                key={cat.category}
                type="button"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + i * 0.07 }}
                onClick={() => onNavigate("chat", cat.category)}
                className="navvgenx-teal-gradient rounded-2xl p-4 flex flex-col items-center gap-2 cursor-pointer hover:shadow-md hover:scale-105 transition-all duration-200 group"
                data-ocid="nav.tab"
              >
                <cat.Icon
                  className={`w-6 h-6 ${cat.iconColor} group-hover:scale-110 transition-transform duration-200`}
                />
                <span className="font-jakarta font-semibold text-xs text-white/90">
                  {cat.label}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Topic pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-10 flex flex-wrap gap-2 justify-center max-w-2xl"
        >
          {[
            "What is AI?",
            "Climate change",
            "History of Rome",
            "Quantum physics",
            "How to invest",
            "Space exploration",
            "Human psychology",
            "World geography",
          ].map((pill) => (
            <button
              key={pill}
              type="button"
              onClick={() => {
                sessionStorage.setItem("navvgenx-initial-query", pill);
                onNavigate("chat", "general");
              }}
              className="px-4 py-1.5 rounded-full text-xs font-jakarta font-medium glass-card hover:shadow-md hover:-translate-y-0.5 transition-all text-foreground/60 hover:text-foreground border border-foreground/08"
            >
              {pill}
            </button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
