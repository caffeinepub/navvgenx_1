import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, MessageSquare, Search, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

export interface ChatHistoryEntry {
  query: string;
  answer: string;
  timestamp: number;
}

export interface SearchHistoryEntry {
  query: string;
  timestamp: number;
}

function formatTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function HistoryPage() {
  const [chatHistory, setChatHistory] = useState<ChatHistoryEntry[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("navvgenx-chat-history") || "[]");
    } catch {
      return [];
    }
  });

  const [searchHistory, setSearchHistory] = useState<SearchHistoryEntry[]>(
    () => {
      try {
        return JSON.parse(
          localStorage.getItem("navvgenx-search-history") || "[]",
        );
      } catch {
        return [];
      }
    },
  );

  const clearChatHistory = () => {
    localStorage.removeItem("navvgenx-chat-history");
    setChatHistory([]);
    toast.success("Chat history cleared");
  };

  const clearSearchHistory = () => {
    localStorage.removeItem("navvgenx-search-history");
    setSearchHistory([]);
    toast.success("Search history cleared");
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8" data-ocid="history.panel">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <h1
          className="font-bold text-3xl mb-2"
          style={{
            fontFamily: "'Playfair Display', serif",
            color: "oklch(0.78 0.15 75)",
          }}
        >
          History 📋
        </h1>
        <p className="text-muted-foreground text-sm font-jakarta">
          Your past chats and searches
        </p>
      </motion.div>

      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="w-full mb-4">
          <TabsTrigger
            value="chat"
            className="flex-1 gap-1.5"
            data-ocid="history.tab"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Chat History ({chatHistory.length})
          </TabsTrigger>
          <TabsTrigger
            value="search"
            className="flex-1 gap-1.5"
            data-ocid="history.tab"
          >
            <Search className="w-3.5 h-3.5" />
            Search History ({searchHistory.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat">
          <div className="flex justify-end mb-3">
            {chatHistory.length > 0 && (
              <button
                type="button"
                onClick={clearChatHistory}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-jakarta font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                data-ocid="history.delete_button"
              >
                <Trash2 className="w-3 h-3" /> Clear All
              </button>
            )}
          </div>
          {chatHistory.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 glass-card rounded-3xl"
              data-ocid="history.empty_state"
            >
              <MessageSquare className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground font-jakarta text-sm">
                No chat history yet. Start a conversation!
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {[...chatHistory].reverse().map((entry, i) => (
                  <motion.div
                    key={`chat-${entry.timestamp}-${i}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="glass-card rounded-2xl p-4 border border-border"
                    data-ocid={`history.item.${i + 1}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="font-jakarta font-semibold text-sm text-foreground line-clamp-1">
                        {entry.query}
                      </p>
                      <span
                        className="flex items-center gap-1 text-[10px] font-jakarta shrink-0"
                        style={{ color: "oklch(0.60 0.01 265)" }}
                      >
                        <Clock className="w-3 h-3" />
                        {formatTime(entry.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs font-jakarta text-muted-foreground line-clamp-2">
                      {entry.answer}
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>

        <TabsContent value="search">
          <div className="flex justify-end mb-3">
            {searchHistory.length > 0 && (
              <button
                type="button"
                onClick={clearSearchHistory}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-jakarta font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                data-ocid="history.delete_button"
              >
                <Trash2 className="w-3 h-3" /> Clear All
              </button>
            )}
          </div>
          {searchHistory.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 glass-card rounded-3xl"
              data-ocid="history.empty_state"
            >
              <Search className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground font-jakarta text-sm">
                No search history yet. Search something!
              </p>
            </motion.div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {[...searchHistory].reverse().map((entry, i) => (
                  <motion.div
                    key={`search-${entry.timestamp}-${i}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="glass-card rounded-xl p-3 border border-border flex items-center justify-between gap-3"
                    data-ocid={`history.item.${i + 1}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Search
                        className="w-3.5 h-3.5 shrink-0"
                        style={{ color: "oklch(0.78 0.15 75 / 0.7)" }}
                      />
                      <p className="font-jakarta text-sm text-foreground truncate">
                        {entry.query}
                      </p>
                    </div>
                    <span
                      className="flex items-center gap-1 text-[10px] font-jakarta shrink-0"
                      style={{ color: "oklch(0.60 0.01 265)" }}
                    >
                      <Clock className="w-3 h-3" />
                      {formatTime(entry.timestamp)}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
