import { Toaster } from "@/components/ui/sonner";
import {
  Activity,
  Bell,
  BookOpen,
  Briefcase,
  Heart,
  Home,
  LogOut,
  MessageSquare,
  Moon,
  Search,
  Share2,
  Sparkles,
  Sun,
  TrendingUp,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AgeSetup } from "./components/AgeSetup";
import { Logo } from "./components/Logo";
import { NavvAssistant } from "./components/NavvAssistant";
import { useActor } from "./hooks/useActor";
import { ChatPage } from "./pages/ChatPage";
import { HealthPage } from "./pages/HealthPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { RemindersPage } from "./pages/RemindersPage";

type Page = "home" | "chat" | "health" | "reminders";

interface Profile {
  age: bigint;
  ageGroup: string;
}

const navItems = [
  { id: "home", Icon: Home, label: "Home" },
  { id: "chat", Icon: MessageSquare, label: "Chat" },
  { id: "health", Icon: Activity, label: "Health" },
  { id: "love", Icon: Heart, label: "Love" },
  { id: "study", Icon: BookOpen, label: "Study" },
  { id: "career", Icon: Briefcase, label: "Career" },
  { id: "fashion", Icon: Sparkles, label: "Fashion" },
  { id: "business", Icon: TrendingUp, label: "Business" },
  { id: "search", Icon: Search, label: "Search" },
] as const;

const SECTION_EXPERTS: Record<string, string> = {
  chat: "AI assistant",
  general: "AI assistant",
  health: "health expert",
  love: "love expert",
  study: "study expert",
  career: "career expert",
  fashion: "fashion expert",
  business: "business expert",
  search: "search expert",
  law: "law expert",
  reminders: "productivity expert",
};

function buildGreeting(section: string): string {
  const expert = SECTION_EXPERTS[section] ?? `${section} expert`;
  return `I am NavvGenX, your ${expert}. How can I help you?`;
}

function speakText(text: string) {
  try {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92;
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
    window.speechSynthesis.speak(utterance);
  } catch {
    // Speech synthesis not available
  }
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
      className="fixed top-20 left-1/2 z-50 -translate-x-1/2 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl"
      style={{
        background: "oklch(0.10 0.020 265 / 0.95)",
        border: "1px solid oklch(0.78 0.15 75 / 0.45)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        boxShadow:
          "0 8px 40px oklch(0.05 0.02 265 / 0.55), 0 0 0 1px oklch(0.78 0.15 75 / 0.15)",
        maxWidth: "min(440px, calc(100vw - 2rem))",
      }}
    >
      {/* Navv orb */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.10 0.020 265), oklch(0.15 0.028 265))",
          border: "1.5px solid oklch(0.78 0.15 75)",
          boxShadow: "0 0 14px oklch(0.78 0.15 75 / 0.35)",
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
            stroke="oklch(0.78 0.15 75)"
            strokeWidth="1.5"
            fill="oklch(0.10 0.020 265)"
          />
          <text
            x="20"
            y="27"
            textAnchor="middle"
            fontFamily="'Space Grotesk', Arial, sans-serif"
            fontWeight="700"
            fontSize="11"
            fill="oklch(0.78 0.15 75)"
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
            color: "oklch(0.78 0.15 75)",
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          NavvGenX
        </p>
        <p
          className="text-sm leading-snug"
          style={{
            color: "oklch(0.93 0.006 80)",
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          {message}
        </p>
      </div>
    </motion.div>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => localStorage.getItem("navvgenx-user") !== null,
  );
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [activeCategory, setActiveCategory] = useState("general");
  const [darkMode, setDarkMode] = useState(false);
  const [sectionGreeting, setSectionGreeting] = useState<string | null>(null);
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

  const handleProfileSet = useCallback((p: Profile) => {
    localStorage.setItem(
      "navvgenx-profile",
      JSON.stringify({ age: p.age.toString(), ageGroup: p.ageGroup }),
    );
    setProfile(p);
  }, []);

  // Welcome speech — plays once per session when user is logged in
  useEffect(() => {
    if (!isLoggedIn) return;
    if (sessionStorage.getItem("navvgenx-welcomed")) return;
    sessionStorage.setItem("navvgenx-welcomed", "1");
    const timer = setTimeout(() => {
      speakText("Welcome to NavvGenX");
    }, 600);
    return () => clearTimeout(timer);
  }, [isLoggedIn]);

  useEffect(() => {
    const saved = localStorage.getItem("navvgenx-dark");
    if (saved === "true") setDarkMode(true);
  }, []);

  useEffect(() => {
    if (!actor) return;
    actor
      .getCallerUserProfile()
      .then((p) => {
        if (p) {
          handleProfileSet({ age: p.age, ageGroup: p.ageGroup });
        }
      })
      .catch(() => {});
  }, [actor, handleProfileSet]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("navvgenx-dark", String(darkMode));
  }, [darkMode]);

  const triggerSectionGreeting = useCallback((section: string) => {
    // Clear any existing greeting
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

  if (!isLoggedIn) {
    return (
      <>
        <Toaster richColors position="top-right" />
        <LoginPage
          onLogin={() => {
            sessionStorage.setItem("navvgenx-welcomed", "1");
            setTimeout(() => speakText("Welcome to NavvGenX"), 600);
            setIsLoggedIn(true);
          }}
        />
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
            className="glass-card rounded-3xl p-8 max-w-sm w-full"
          >
            <AgeSetup onComplete={handleProfileSet} actor={actor} />
          </motion.div>
        </div>
      </>
    );
  }

  const navigate = (page: string, category?: string) => {
    if (page === "home") {
      setCurrentPage("home");
      return;
    }
    if (page === "health") {
      setCurrentPage("health");
      return;
    }
    if (page === "reminders") {
      setCurrentPage("reminders");
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
      setCurrentPage("chat");
      setActiveCategory(category || page);
      return;
    }
    setCurrentPage(page as Page);
    if (category) setActiveCategory(category);
  };

  const handleNavClick = (id: string) => {
    if (id === "home") {
      navigate("home");
      return;
    }
    if (id === "health") {
      navigate("health");
      triggerSectionGreeting("health");
      return;
    }
    if (id === "chat") {
      navigate("chat", "general");
      triggerSectionGreeting("general");
      return;
    }
    // All other sections (love, study, career, fashion, business, search)
    navigate("chat", id);
    triggerSectionGreeting(id);
  };

  const handleShare = () => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        toast.success("Link copied to clipboard");
      })
      .catch(() => {
        toast.info(`NavvGenX: ${window.location.href}`);
      });
  };

  const currentYear = new Date().getFullYear();
  const hostname = encodeURIComponent(window.location.hostname);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 flex flex-col">
      <Toaster richColors position="top-right" />

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

      {/* Header */}
      <header
        className="glass-header sticky top-0 z-40 h-16 flex items-center px-4 md:px-6 gap-4"
        data-ocid="header.panel"
      >
        <button
          type="button"
          onClick={() => navigate("home")}
          className="shrink-0"
        >
          <Logo size="md" />
        </button>

        {/* Center nav - desktop */}
        <nav className="hidden md:flex flex-1 items-center justify-center gap-1 overflow-x-auto">
          {navItems.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-jakarta font-medium transition-all duration-200 whitespace-nowrap ${
                currentPage === item.id ||
                (item.id === "chat" &&
                  currentPage === "chat" &&
                  activeCategory === "general") ||
                (currentPage === "chat" && activeCategory === item.id)
                  ? "bg-[oklch(0.10_0.020_265)] text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
              data-ocid="nav.tab"
            >
              <item.Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            onClick={() => navigate("reminders")}
            className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all relative"
            title="Reminders"
          >
            <Bell className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
            title="Share"
            data-ocid="header.button"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
            title={darkMode ? "Light mode" : "Dark mode"}
            data-ocid="header.toggle"
          >
            {darkMode ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            className="p-2 rounded-full text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all"
            title="Sign out"
            data-ocid="header.button"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mobile nav */}
      <div className="md:hidden flex items-center gap-1 px-3 py-2 overflow-x-auto border-b border-border bg-background/80 backdrop-blur-sm">
        {navItems.map((item) => (
          <button
            type="button"
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-jakarta font-medium transition-all ${
              currentPage === item.id ||
              (currentPage === "chat" && activeCategory === item.id)
                ? "bg-[oklch(0.10_0.020_265)] text-white"
                : "text-muted-foreground bg-muted hover:bg-muted/80"
            }`}
            data-ocid="nav.tab"
          >
            <item.Icon className="w-3 h-3" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Page content */}
      <main className="flex-1">
        <motion.div
          key={currentPage + activeCategory}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="h-full"
        >
          {currentPage === "home" && <HomePage onNavigate={navigate} />}
          {currentPage === "chat" && (
            <ChatPage profile={profile} initialCategory={activeCategory} />
          )}
          {currentPage === "health" && <HealthPage />}
          {currentPage === "reminders" && <RemindersPage />}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-5 px-6 text-center bg-background/80">
        <p className="font-jakarta text-sm text-muted-foreground">
          Powered by{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${hostname}`}
            target="_blank"
            rel="noopener noreferrer"
            className="navvgenx-gradient-text font-semibold hover:opacity-80 transition-opacity"
          >
            NavvGenX AI
          </a>
        </p>
        <p className="text-xs text-muted-foreground/50 mt-1">
          &copy; {currentYear} &middot; Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${hostname}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-muted-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
      <NavvAssistant
        darkMode={darkMode}
        userAge={profile ? Number(profile.age) : 99}
      />
    </div>
  );
}
