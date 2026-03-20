import { Toaster } from "@/components/ui/sonner";
import {
  Activity,
  Bell,
  BookOpen,
  Briefcase,
  Clock,
  Download,
  Heart,
  Home,
  LogOut,
  MessageSquare,
  Moon,
  MoreHorizontal,
  Radio,
  Search,
  Share2,
  Sparkles,
  Sun,
  TrendingUp,
  UserCircle,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AgeSetup } from "./components/AgeSetup";
import { Logo } from "./components/Logo";
import { NavvAssistant } from "./components/NavvAssistant";
import { useActor } from "./hooks/useActor";
import { usePWAInstall } from "./hooks/usePWAInstall";
import { useServiceWorkerUpdate } from "./hooks/useServiceWorkerUpdate";
import { AccountPage } from "./pages/AccountPage";
import { ChatPage } from "./pages/ChatPage";
import { HealthPage } from "./pages/HealthPage";
import { HistoryPage } from "./pages/HistoryPage";
import { HomePage } from "./pages/HomePage";
import { LivePage } from "./pages/LivePage";
import { LoginPage } from "./pages/LoginPage";
import { RemindersPage } from "./pages/RemindersPage";

type Page =
  | "home"
  | "chat"
  | "health"
  | "reminders"
  | "account"
  | "live"
  | "history";

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
  { id: "live", Icon: Radio, label: "Live" },
  { id: "account", Icon: UserCircle, label: "Account" },
  { id: "history", Icon: Clock, label: "History" },
] as const;

// Primary nav items shown in mobile bottom bar
const bottomNavPrimary = ["home", "chat", "health"] as const;
// Secondary items shown in the "More" drawer
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
  account: "account manager",
  live: "live updates expert",
};

function buildGreeting(section: string): string {
  const expert = SECTION_EXPERTS[section] ?? `${section} expert`;
  return `I am NavvGenX, your ${expert}. How can I help you?`;
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
        width: "90vw",
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

// ─── PWA Install Banner ──────────────────────────────────────────────────────
function InstallBanner({
  onInstall,
  onDismiss,
}: {
  onInstall: () => void;
  onDismiss: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      className="w-full flex items-center justify-between gap-3 px-4 py-2.5"
      style={{
        background: "oklch(0.10 0.020 265 / 0.97)",
        borderBottom: "1px solid oklch(0.78 0.15 75 / 0.35)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
      data-ocid="install.panel"
    >
      {/* Icon + text */}
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.15 0.025 265), oklch(0.20 0.030 265))",
            border: "1.5px solid oklch(0.78 0.15 75 / 0.60)",
            boxShadow: "0 0 10px oklch(0.78 0.15 75 / 0.25)",
          }}
        >
          <Download
            className="w-4 h-4"
            style={{ color: "oklch(0.78 0.15 75)" }}
          />
        </div>
        <div className="min-w-0">
          <p
            className="text-xs font-semibold truncate"
            style={{
              color: "oklch(0.78 0.15 75)",
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            Install NavvGenX AI
          </p>
          <p
            className="text-[11px] leading-tight truncate"
            style={{
              color: "oklch(0.75 0.006 80)",
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            Add to your home screen for the best experience
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          type="button"
          onClick={onInstall}
          className="px-3 py-1 rounded-full text-xs font-semibold transition-all hover:opacity-90 active:scale-95"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.65 0.18 75), oklch(0.72 0.16 80))",
            color: "oklch(0.10 0.020 265)",
            fontFamily: "'Space Grotesk', sans-serif",
            boxShadow: "0 2px 12px oklch(0.65 0.18 75 / 0.40)",
          }}
          data-ocid="install.primary_button"
        >
          Install
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="p-1 rounded-full transition-all hover:opacity-70"
          style={{ color: "oklch(0.60 0.006 80)" }}
          aria-label="Dismiss install banner"
          data-ocid="install.close_button"
        >
          <X className="w-3.5 h-3.5" />
        </button>
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
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string>(() => {
    try {
      const acc = localStorage.getItem("navvgenx-account");
      return acc ? JSON.parse(acc).photoUrl || "" : "";
    } catch {
      return "";
    }
  });

  // PWA install
  const {
    canInstall,
    promptInstall,
    dismiss: dismissInstall,
  } = usePWAInstall();

  // Service worker live updates
  useServiceWorkerUpdate();

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
      try {
        const acc = localStorage.getItem("navvgenx-account");
        const accData = acc ? JSON.parse(acc) : null;
        const name = accData?.name || "";
        const lang = accData?.language || "en";
        if (lang === "hi") {
          speakText(
            name
              ? `नमस्ते ${name}, Nav Gen X में आपका स्वागत है`
              : "Nav Gen X में आपका स्वागत है",
            "hi-IN",
          );
        } else {
          speakText(
            name
              ? `Hello ${name}, welcome to Nav Gen X`
              : "Welcome to Nav Gen X",
          );
        }
      } catch {
        speakText("Welcome to Nav Gen X");
      }
    }, 1500);
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
    if (page === "account") {
      setCurrentPage("account");
      return;
    }
    if (page === "live") {
      setCurrentPage("live");
      return;
    }
    if (page === "history") {
      setCurrentPage("history");
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
    if (id === "chat") {
      navigate("chat", "general");
      triggerSectionGreeting("general");
      return;
    }
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

  const isNavActive = (id: string) =>
    currentPage === id ||
    (id === "chat" && currentPage === "chat" && activeCategory === "general") ||
    (currentPage === "chat" && activeCategory === id);

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

        {/* Center nav - desktop only */}
        <nav className="hidden md:flex flex-1 items-center justify-center gap-1 overflow-x-auto">
          {navItems.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-jakarta font-medium transition-all duration-200 whitespace-nowrap ${
                isNavActive(item.id)
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
        <div className="flex items-center gap-1 sm:gap-2 ml-auto">
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
          {/* PWA Install button — only shown when installable */}
          {canInstall && (
            <button
              type="button"
              onClick={promptInstall}
              className="p-2 rounded-full transition-all hover:opacity-80 active:scale-95"
              title="Install NavvGenX AI"
              style={{
                color: "oklch(0.78 0.15 75)",
                background: "oklch(0.78 0.15 75 / 0.10)",
              }}
              data-ocid="header.button"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
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

      {/* PWA Install Banner — below header, above main content */}
      <AnimatePresence>
        {canInstall && (
          <InstallBanner
            key="install-banner"
            onInstall={promptInstall}
            onDismiss={dismissInstall}
          />
        )}
      </AnimatePresence>

      {/* Page content */}
      <main className="flex-1 mobile-main-pb">
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
          {currentPage === "account" && (
            <AccountPage
              onSaved={() => {
                try {
                  const acc = localStorage.getItem("navvgenx-account");
                  if (acc) setProfilePhotoUrl(JSON.parse(acc).photoUrl || "");
                } catch {}
                navigate("home");
              }}
            />
          )}
          {currentPage === "live" && <LivePage />}
          {currentPage === "history" && <HistoryPage />}
        </motion.div>
      </main>

      {/* Footer - hidden on mobile (bottom nav takes priority) */}
      <footer className="hidden md:block border-t border-border py-5 px-6 text-center bg-background/80">
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

      {/* ── Mobile Bottom Navigation (visible only on < md) ── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-stretch border-t border-border"
        style={{
          background: "var(--background, #fff)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
        aria-label="Mobile navigation"
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
              className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[3.5rem] transition-colors"
              style={{
                color: active
                  ? "oklch(0.78 0.15 75)"
                  : "var(--muted-foreground)",
              }}
              data-ocid="nav.tab"
            >
              <item.Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium font-jakarta">
                {item.label}
              </span>
              {active && (
                <span
                  className="absolute bottom-[calc(env(safe-area-inset-bottom,0px)+2px)] w-4 h-0.5 rounded-full"
                  style={{ background: "oklch(0.78 0.15 75)" }}
                />
              )}
            </button>
          );
        })}

        {/* More button */}
        <button
          type="button"
          onClick={() => setShowMoreMenu((v) => !v)}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[3.5rem] transition-colors"
          style={{
            color: showMoreMenu
              ? "oklch(0.78 0.15 75)"
              : "var(--muted-foreground)",
          }}
          data-ocid="nav.toggle"
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-[10px] font-medium font-jakarta">More</span>
        </button>
      </nav>

      {/* ── More Menu Drawer (mobile) ── */}
      <AnimatePresence>
        {showMoreMenu && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 z-30 bg-black/40"
              onClick={() => setShowMoreMenu(false)}
            />
            {/* Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              className="md:hidden fixed bottom-0 left-0 right-0 z-40 rounded-t-3xl border-t border-border"
              style={{
                background: "var(--background)",
                paddingBottom:
                  "calc(4.5rem + env(safe-area-inset-bottom, 0px))",
              }}
            >
              <div className="flex items-center justify-between px-5 pt-5 pb-4">
                <p
                  className="font-semibold text-sm"
                  style={{
                    color: "oklch(0.78 0.15 75)",
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  More Sections
                </p>
                <button
                  type="button"
                  onClick={() => setShowMoreMenu(false)}
                  className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  data-ocid="nav.close_button"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3 px-5 pb-4">
                {bottomNavMore.map((id) => {
                  const item = navItems.find((n) => n.id === id)!;
                  const _active = isNavActive(id);
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleNavClick(id)}
                      className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl transition-all min-h-[5rem]"
                      style={(() => {
                        const colors: Record<string, string> = {
                          study: "#2563eb",
                          love: "#ec4899",
                          fashion: "#9333ea",
                          health: "#16a34a",
                          career: "#ea580c",
                          business: "#0d9488",
                          law: "#dc2626",
                          live: "#4f46e5",
                          history: "#854d0e",
                          search: "#0369a1",
                          account: "#6b7280",
                          reminders: "#b45309",
                        };
                        const bg = colors[id] || "#374151";
                        return { background: bg, color: "#ffffff" };
                      })()}
                      data-ocid="nav.tab"
                    >
                      <item.Icon className="w-5 h-5" />
                      <span className="text-xs font-medium font-jakarta">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <NavvAssistant
        darkMode={darkMode}
        userAge={profile ? Number(profile.age) : 99}
        onNavigate={navigate}
        profilePhotoUrl={profilePhotoUrl}
      />
    </div>
  );
}
