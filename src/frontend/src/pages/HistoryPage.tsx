import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, MessageSquare, Search, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

interface ChatHistoryEntry {
  query: string;
  answer: string;
  timestamp: number;
  section: string;
}

interface SearchHistoryEntry {
  query: string;
  timestamp: number;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function getSectionColor(section: string): string {
  const map: Record<string, string> = {
    love: "bg-pink-500/20 text-pink-400 border-pink-500/30",
    study: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    career: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    fashion: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    business: "bg-teal-500/20 text-teal-400 border-teal-500/30",
    search: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
    live: "bg-red-500/20 text-red-400 border-red-500/30",
    health: "bg-green-500/20 text-green-400 border-green-500/30",
    general: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    chat: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  };
  return map[section] ?? "bg-muted text-muted-foreground border-border";
}

export function HistoryPage() {
  const [chatHistory, setChatHistory] = useState<ChatHistoryEntry[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("navvgenx-chat-history") ?? "[]");
    } catch {
      return [];
    }
  });

  const [searchHistory, setSearchHistory] = useState<SearchHistoryEntry[]>(
    () => {
      try {
        return JSON.parse(
          localStorage.getItem("navvgenx-search-history") ?? "[]",
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
        className="text-center mb-8"
      >
        <h1 className="font-poppins font-bold text-3xl navvgenx-gradient-text mb-2">
          History
        </h1>
        <p className="text-muted-foreground font-inter text-sm">
          Your recent chats and searches
        </p>
      </motion.div>

      <Tabs defaultValue="chat" data-ocid="history.tab">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="chat" className="flex-1 gap-2">
            <MessageSquare className="w-4 h-4" />
            Chat History ({chatHistory.length})
          </TabsTrigger>
          <TabsTrigger value="search" className="flex-1 gap-2">
            <Search className="w-4 h-4" />
            Search History ({searchHistory.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat">
          <div className="flex justify-between items-center mb-4">
            <p className="text-xs text-muted-foreground">
              Last {chatHistory.length} conversations
            </p>
            {chatHistory.length > 0 && (
              <button
                type="button"
                onClick={clearChatHistory}
                className="flex items-center gap-1 text-xs text-red-400 hover:text-red-500 transition-colors"
                data-ocid="history.delete_button"
              >
                <Trash2 className="w-3 h-3" />
                Clear All
              </button>
            )}
          </div>

          {chatHistory.length === 0 ? (
            <div
              className="text-center py-16 glass-card rounded-3xl"
              data-ocid="history.empty_state"
            >
              <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground font-inter text-sm">
                No chat history yet. Start a conversation!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {[...chatHistory].reverse().map((entry, i) => (
                <motion.div
                  key={`${entry.timestamp}-${i}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="glass-card rounded-2xl p-4 border border-border"
                  data-ocid={`history.item.${i + 1}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="font-inter font-semibold text-sm text-foreground flex-1 min-w-0">
                      {entry.query}
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-1.5 py-0 border ${getSectionColor(entry.section)}`}
                      >
                        {entry.section}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <Clock className="w-3 h-3" />
                        {timeAgo(entry.timestamp)}
                      </span>
                    </div>
                  </div>
                  <p className="font-inter text-xs text-muted-foreground line-clamp-2">
                    {entry.answer.replace(/<[^>]+>/g, "").slice(0, 150)}
                    {entry.answer.length > 150 ? "..." : ""}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="search">
          <div className="flex justify-between items-center mb-4">
            <p className="text-xs text-muted-foreground">
              Last {searchHistory.length} searches
            </p>
            {searchHistory.length > 0 && (
              <button
                type="button"
                onClick={clearSearchHistory}
                className="flex items-center gap-1 text-xs text-red-400 hover:text-red-500 transition-colors"
                data-ocid="history.delete_button"
              >
                <Trash2 className="w-3 h-3" />
                Clear All
              </button>
            )}
          </div>

          {searchHistory.length === 0 ? (
            <div
              className="text-center py-16 glass-card rounded-3xl"
              data-ocid="history.empty_state"
            >
              <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground font-inter text-sm">
                No search history yet. Try searching something!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {[...searchHistory].reverse().map((entry, i) => (
                <motion.div
                  key={`${entry.timestamp}-${i}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="glass-card rounded-xl px-4 py-3 border border-border flex items-center justify-between"
                  data-ocid={`history.item.${i + 1}`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <p className="font-inter text-sm text-foreground truncate">
                      {entry.query}
                    </p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                    {timeAgo(entry.timestamp)}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
