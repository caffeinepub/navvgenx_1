import { Switch } from "@/components/ui/switch";
import { Bell, Loader2, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Reminder } from "../backend.d";
import { useActor } from "../hooks/useActor";

export function RemindersPage() {
  const { actor } = useActor();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (!actor) return;
    loadReminders();
    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, [actor]);

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
      for (const reminder of reminders) {
        if (reminder.active && reminder.time === currentTime) {
          toast(`🔔 Reminder: ${reminder.title}`, {
            description: `It's ${reminder.time} - time for your reminder!`,
            duration: 8000,
          });
          if (
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            new Notification(`🔔 Reminder: ${reminder.title}`, {
              body: `It's ${reminder.time} — time for: ${reminder.title}`,
              icon: "/icon-192x192.png",
            });
          }
        }
      }
    };
    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
  }, [reminders]);

  async function loadReminders() {
    if (!actor) return;
    try {
      const data = await actor.getReminders();
      setReminders(data);
    } catch {
      toast.error("Failed to load reminders");
    } finally {
      setIsFetching(false);
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !time) {
      toast.error("Please enter a title and time");
      return;
    }
    if (!actor) {
      toast.error("Not connected");
      return;
    }
    setIsLoading(true);
    try {
      await actor.addReminder(title.trim(), time, BigInt(Date.now()));
      await loadReminders();
      toast.success("Reminder added! 🔔");
      setTitle("");
      setTime("");
    } catch {
      toast.error("Failed to add reminder");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (id: bigint) => {
    if (!actor) return;
    try {
      await actor.toggleReminder(id);
      setReminders((prev) =>
        prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r)),
      );
    } catch {
      toast.error("Failed to update reminder");
    }
  };

  const handleDelete = async (id: bigint) => {
    if (!actor) return;
    try {
      await actor.deleteReminder(id);
      setReminders((prev) => prev.filter((r) => r.id !== id));
      toast.success("Reminder removed");
    } catch {
      toast.error("Failed to delete reminder");
    }
  };

  const inputClass =
    "flex-1 bg-muted/30 border border-border rounded-xl px-4 py-2.5 text-foreground text-sm outline-none focus:border-primary/50 font-inter placeholder:text-muted-foreground transition-colors";

  return (
    <div className="max-w-2xl mx-auto px-4 py-8" data-ocid="reminders.panel">
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
          <div className="flex gap-3">
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
              className="bg-muted/30 border border-border rounded-xl px-3 py-2.5 text-foreground text-sm outline-none focus:border-primary/50 font-inter transition-colors"
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
                key={String(reminder.id)}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: i * 0.05 }}
                className={`glass-card rounded-2xl p-4 flex items-center gap-4 border transition-all ${
                  reminder.active
                    ? "border-primary/30"
                    : "border-border opacity-60"
                }`}
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
