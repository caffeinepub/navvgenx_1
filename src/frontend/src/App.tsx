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
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => localStorage.getItem("navvgenx-user") !== null,
  );
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [activeCategory, setActiveCategory] = useState("general");
  const [darkMode, setDarkMode] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const { actor } = useActor();

  // Welcome speech on site open — runs once on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        if (window.speechSynthesis) {
          const speak = () => {
            const utterance = new SpeechSynthesisUtterance(
              "Welcome to Nav Gen X",
            );
            utterance.rate = 0.9;
            utterance.pitch = 1.1;
            utterance.volume = 1;

            // Try to pick a natural-sounding female voice
            const voices = window.speechSynthesis.getVoices();
            const preferred = voices.find(
              (v) =>
                v.name.toLowerCase().includes("google uk english female") ||
                v.name.toLowerCase().includes("female") ||
                v.name.toLowerCase().includes("samantha") ||
                v.name.toLowerCase().includes("karen"),
            );
            if (preferred) utterance.voice = preferred;

            window.speechSynthesis.speak(utterance);
          };

          // Voices may not be loaded yet — wait for them
          if (window.speechSynthesis.getVoices().length > 0) {
            speak();
          } else {
            window.speechSynthesis.addEventListener("voiceschanged", speak, {
              once: true,
            });
          }
        }
      } catch {
        // Speech synthesis not available
      }
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("navvgenx-dark");
    if (saved === "true") setDarkMode(true);
  }, []);

  useEffect(() => {
    if (!actor) return;
    actor
      .getCallerUserProfile()
      .then((p) => {
        if (p) setProfile({ age: p.age, ageGroup: p.ageGroup });
      })
      .catch(() => {});
  }, [actor]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("navvgenx-dark", String(darkMode));
  }, [darkMode]);

  const handleSignOut = () => {
    localStorage.removeItem("navvgenx-user");
    setIsLoggedIn(false);
    toast.success("Signed out successfully");
  };

  if (!isLoggedIn) {
    return (
      <>
        <Toaster richColors position="top-right" />
        <LoginPage onLogin={() => setIsLoggedIn(true)} />
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
    if (id === "home") navigate("home");
    else if (id === "health") navigate("health");
    else if (id === "chat") navigate("chat", "general");
    else navigate("chat", id);
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
            <ChatPage
              profile={profile}
              onProfileSet={setProfile}
              initialCategory={activeCategory}
            />
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
      <NavvAssistant darkMode={darkMode} />
    </div>
  );
}
