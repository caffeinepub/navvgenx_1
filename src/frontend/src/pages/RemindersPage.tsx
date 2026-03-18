import { Switch } from "@/components/ui/switch";
import { Bell, Loader2, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";

interface LocalReminder {
  id: string;
  title: string;
  time: string;
  active: boolean;
  notified: string; // YYYY-MM-DD of last notification
}

const LS_KEY = "navvgenx-reminders";

function loadLocalReminders(): LocalReminder[] {
  try {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return [];
}

function saveLocalReminders(reminders: LocalReminder[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(reminders));
}

function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}

function fireNotification(title: string, body: string) {
  if ("Notification" in window && Notification.permission === "granted") {
    try {
      new Notification(title, {
        body,
        icon: "/assets/generated/navvgenx-icon-192.dim_192x192.png",
      });
    } catch {
      // Notification not supported in this context
    }
  }
  // Also show in-app toast
  toast(`🔔 ${title}`, { description: body, duration: 10000 });
}

export function RemindersPage() {
  const { actor } = useActor();
  const [reminders, setReminders] =
    useState<LocalReminder[]>(loadLocalReminders);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [notifBanner, setNotifBanner] = useState(
    "Notification" in window && Notification.permission === "default",
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // On mount: load from localStorage + sync from backend if available
  useEffect(() => {
    const local = loadLocalReminders();
    setReminders(local);

    if (actor) {
      setIsFetching(true);
      actor
        .getReminders()
        .then((backendReminders) => {
          // Merge: backend is source of truth for structure; local tracks notified state
          const merged: LocalReminder[] = backendReminders.map((br) => {
            const existing = local.find(
              (l) => l.title === br.title && l.time === br.time,
            );
            return {
              id: String(br.id),
              title: br.title,
              time: br.time,
              active: br.active,
              notified: existing?.notified ?? "",
            };
          });
          // Add any local-only reminders not in backend
          const backendTitles = new Set(
            backendReminders.map((b) => b.title + b.time),
          );
          const localOnly = local.filter(
            (l) => !backendTitles.has(l.title + l.time),
          );
          const all = [...merged, ...localOnly];
          setReminders(all);
          saveLocalReminders(all);
        })
        .catch(() => {
          // Backend unavailable — use local only
        })
        .finally(() => setIsFetching(false));
    }
  }, [actor]);

  // Check reminders every 30 seconds
  useEffect(() => {
    const check = () => {
      const now = new Date();
      const today = now.toISOString().slice(0, 10);
      const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

      setReminders((prev) => {
        let changed = false;
        const updated = prev.map((r) => {
          if (r.active && r.time === currentTime && r.notified !== today) {
            fireNotification("NavvGenX Reminder", r.title);
            changed = true;
            return { ...r, notified: today };
          }
          return r;
        });
        if (changed) saveLocalReminders(updated);
        return changed ? updated : prev;
      });
    };

    intervalRef.current = setInterval(check, 30000);
    check(); // run immediately
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleEnableNotifications = async () => {
    const perm = await Notification.requestPermission();
    if (perm === "granted") {
      setNotifBanner(false);
      toast.success("Notifications enabled!");
    } else {
      toast.error("Notification permission denied");
      setNotifBanner(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !time) {
      toast.error("Please enter a title and time");
      return;
    }

    // Request notification permission on first add
    requestNotificationPermission();

    setIsLoading(true);
    const newReminder: LocalReminder = {
      id: Date.now().toString(),
      title: title.trim(),
      time,
      active: true,
      notified: "",
    };

    const updated = [...reminders, newReminder];
    setReminders(updated);
    saveLocalReminders(updated);

    // Also save to backend if available
    if (actor) {
      try {
        await actor.addReminder(title.trim(), time, BigInt(Date.now()));
      } catch {
        // Backend save failed — local save is fine
      }
    }

    toast.success("Reminder added! 🔔");
    setTitle("");
    setTime("");
    setIsLoading(false);
  };

  const handleToggle = (id: string) => {
    const updated = reminders.map((r) =>
      r.id === id ? { ...r, active: !r.active } : r,
    );
    setReminders(updated);
    saveLocalReminders(updated);

    // Backend sync
    if (actor) {
      const bigId = BigInt(id);
      actor.toggleReminder(bigId).catch(() => {});
    }
  };

  const handleDelete = (id: string) => {
    const updated = reminders.filter((r) => r.id !== id);
    setReminders(updated);
    saveLocalReminders(updated);
    toast.success("Reminder removed");

    if (actor) {
      const bigId = BigInt(id);
      actor.deleteReminder(bigId).catch(() => {});
    }
  };

  const inputClass =
    "flex-1 bg-muted/30 border border-border rounded-xl px-4 py-2.5 text-foreground text-sm outline-none focus:border-primary/50 font-inter placeholder:text-muted-foreground transition-colors";

  return (
    <div
      className="max-w-2xl mx-auto px-4 py-8 pb-24"
      data-ocid="reminders.panel"
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="font-poppins font-bold text-3xl navvgenx-gradient-text mb-2">
          Reminders 🔔
        </h1>
        <p className="text-muted-foreground font-inter text-sm">
          Set daily reminders and never miss important tasks
        </p>
      </motion.div>

      {/* Notification permission banner */}
      <AnimatePresence>
        {notifBanner && "Notification" in window && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-4 rounded-2xl p-4 flex items-center justify-between gap-3"
            style={{
              background: "oklch(0.72 0.14 75 / 0.12)",
              border: "1px solid oklch(0.72 0.14 75 / 0.3)",
            }}
            data-ocid="reminders.panel"
          >
            <div className="flex items-center gap-2">
              <Bell
                className="w-4 h-4"
                style={{ color: "oklch(0.78 0.15 75)" }}
              />
              <span className="text-sm text-foreground">
                Enable notifications to get alerted when reminders fire
              </span>
            </div>
            <button
              type="button"
              onClick={handleEnableNotifications}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap"
              style={{
                background: "oklch(0.72 0.14 75 / 0.2)",
                color: "oklch(0.78 0.15 75)",
              }}
              data-ocid="reminders.primary_button"
            >
              Enable
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-3xl p-6 mb-6"
      >
        <h2 className="font-poppins font-semibold text-base text-foreground mb-4">
          Add New Reminder
        </h2>
        <form onSubmit={handleAdd} className="space-y-3">
          <div className="flex gap-3 flex-wrap sm:flex-nowrap">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Reminder title..."
              className={inputClass}
              data-ocid="reminders.input"
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="bg-muted/30 border border-border rounded-xl px-3 py-2.5 text-foreground text-sm outline-none focus:border-primary/50 font-inter transition-colors min-w-[120px]"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full navvgenx-gradient-btn py-3 rounded-xl font-semibold font-inter disabled:opacity-60"
            data-ocid="reminders.submit_button"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Adding...
              </span>
            ) : (
              "Add Reminder 🔔"
            )}
          </button>
        </form>
      </motion.div>

      {isFetching ? (
        <div
          className="flex items-center justify-center gap-2 py-12 text-muted-foreground"
          data-ocid="reminders.loading_state"
        >
          <Loader2 className="w-5 h-5 animate-spin" /> Loading reminders...
        </div>
      ) : reminders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 glass-card rounded-3xl"
          data-ocid="reminders.empty_state"
        >
          <Bell className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground font-inter">
            No reminders yet. Add your first one above!
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {reminders.map((reminder, i) => (
              <motion.div
                key={reminder.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: i * 0.05 }}
                className={`glass-card rounded-2xl p-4 flex items-center gap-4 border transition-all ${reminder.active ? "border-primary/30" : "border-border opacity-60"}`}
                data-ocid={`reminders.item.${i + 1}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-inter font-medium text-sm text-foreground truncate">
                    {reminder.title}
                  </p>
                  <p className="font-inter text-xs text-muted-foreground mt-0.5">
                    🕐 {reminder.time}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Switch
                    checked={reminder.active}
                    onCheckedChange={() => handleToggle(reminder.id)}
                    data-ocid={`reminders.toggle.${i + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => handleDelete(reminder.id)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                    data-ocid={`reminders.delete_button.${i + 1}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
