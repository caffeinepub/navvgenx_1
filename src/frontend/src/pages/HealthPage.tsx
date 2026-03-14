import { Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { HealthEntry } from "../backend.d";
import { useActor } from "../hooks/useActor";

function CircularGauge({
  score,
  size = 200,
}: { score: number; size?: number }) {
  const radius = (size - 24) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        aria-label={`Health score: ${score} out of 100`}
      >
        <title>Health Score Gauge</title>
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="14"
          className="text-muted/50"
        />
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-poppins font-bold text-4xl navvgenx-gradient-text">
          {score}
        </span>
        <span className="text-muted-foreground text-xs font-inter">
          out of 100
        </span>
      </div>
    </div>
  );
}

export function HealthPage() {
  const { actor } = useActor();
  const [bp, setBp] = useState("");
  const [steps, setSteps] = useState("");
  const [sleep, setSleep] = useState("");
  const [water, setWater] = useState("");
  const [weight, setWeight] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [entries, setEntries] = useState<HealthEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(true);

  useEffect(() => {
    if (!actor) return;
    async function loadData() {
      try {
        const [fetchedEntries, fetchedScore] = await Promise.all([
          actor!.getHealthEntries(),
          actor!.computeHealthScore(),
        ]);
        setEntries(fetchedEntries.slice(0, 5));
        setScore(Number(fetchedScore));
      } catch {
        // no-op
      } finally {
        setLoadingEntries(false);
      }
    }
    loadData();
  }, [actor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bp && !steps && !sleep && !water && !weight) {
      toast.error("Please fill in at least one field");
      return;
    }
    if (!actor) {
      toast.error("Not connected");
      return;
    }
    setIsLoading(true);
    try {
      await actor.addHealthEntry({
        bp: bp || "120/80",
        steps: BigInt(steps || 0),
        sleepHours: Number.parseFloat(sleep) || 0,
        waterIntake: Number.parseFloat(water) || 0,
        weight: Number.parseFloat(weight) || 0,
        timestamp: BigInt(Date.now()),
      });
      const newScore = await actor.computeHealthScore();
      setScore(Number(newScore));
      const updatedEntries = await actor.getHealthEntries();
      setEntries(updatedEntries.slice(0, 5));
      toast.success(`Health data logged! Score: ${Number(newScore)}/100 🏆`);
      setBp("");
      setSteps("");
      setSleep("");
      setWater("");
      setWeight("");
    } catch {
      toast.error("Failed to log health data");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (ts: bigint) => {
    return new Date(Number(ts)).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const inputClass =
    "w-full bg-muted/30 border border-border rounded-xl px-4 py-2.5 text-foreground text-sm outline-none focus:border-primary/50 font-inter placeholder:text-muted-foreground transition-colors";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8" data-ocid="health.panel">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="font-poppins font-bold text-3xl navvgenx-gradient-text mb-2">
          Health Tracker 🏃
        </h1>
        <p className="text-muted-foreground font-inter text-sm">
          Log your daily health metrics and get your NavvGenX Health Score
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-3xl p-6"
        >
          <h2 className="font-poppins font-semibold text-lg text-foreground mb-4">
            Log Health Data
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label
                htmlFor="health-bp"
                className="text-xs font-inter text-muted-foreground mb-1 block"
              >
                Blood Pressure
              </label>
              <input
                id="health-bp"
                type="text"
                value={bp}
                onChange={(e) => setBp(e.target.value)}
                placeholder="120/80"
                className={inputClass}
                data-ocid="health.input"
              />
            </div>
            <div>
              <label
                htmlFor="health-steps"
                className="text-xs font-inter text-muted-foreground mb-1 block"
              >
                Steps Today
              </label>
              <input
                id="health-steps"
                type="number"
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
                placeholder="8000"
                min="0"
                className={inputClass}
              />
            </div>
            <div>
              <label
                htmlFor="health-sleep"
                className="text-xs font-inter text-muted-foreground mb-1 block"
              >
                Sleep Hours
              </label>
              <input
                id="health-sleep"
                type="number"
                value={sleep}
                onChange={(e) => setSleep(e.target.value)}
                placeholder="7.5"
                min="0"
                max="24"
                step="0.5"
                className={inputClass}
              />
            </div>
            <div>
              <label
                htmlFor="health-water"
                className="text-xs font-inter text-muted-foreground mb-1 block"
              >
                Water Intake (liters)
              </label>
              <input
                id="health-water"
                type="number"
                value={water}
                onChange={(e) => setWater(e.target.value)}
                placeholder="2.5"
                min="0"
                step="0.1"
                className={inputClass}
              />
            </div>
            <div>
              <label
                htmlFor="health-weight"
                className="text-xs font-inter text-muted-foreground mb-1 block"
              >
                Weight (kg)
              </label>
              <input
                id="health-weight"
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="70"
                min="0"
                step="0.1"
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full navvgenx-gradient-btn py-3 rounded-xl font-semibold font-inter mt-2 disabled:opacity-60"
              data-ocid="health.submit_button"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Logging...
                </span>
              ) : (
                "Log Health Data 💪"
              )}
            </button>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col gap-6"
        >
          <div className="glass-card rounded-3xl p-6 flex flex-col items-center">
            <CircularGauge score={score ?? 0} size={200} />
            <h3 className="font-poppins font-semibold text-base text-foreground mt-3">
              Your NavvGenX Health Score
            </h3>
            {score !== null && (
              <p className="text-muted-foreground text-sm font-inter mt-1">
                {score >= 80
                  ? "🌟 Excellent!"
                  : score >= 60
                    ? "💪 Good job!"
                    : score >= 40
                      ? "📈 Keep improving!"
                      : "💡 Start your journey!"}
              </p>
            )}
            {loadingEntries && (
              <div
                className="flex items-center gap-2 text-muted-foreground text-xs mt-2"
                data-ocid="health.loading_state"
              >
                <Loader2 className="w-3 h-3 animate-spin" /> Loading data...
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {entries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6"
        >
          <h2 className="font-poppins font-semibold text-lg text-foreground mb-3">
            Recent Entries
          </h2>
          <div className="space-y-3">
            {entries.map((entry) => (
              <div
                key={Number(entry.timestamp)}
                className="glass-card rounded-2xl p-4 flex flex-wrap gap-4 items-center"
              >
                <span className="text-xs text-muted-foreground font-inter">
                  {formatDate(entry.timestamp)}
                </span>
                <div className="flex flex-wrap gap-3">
                  {entry.bp && (
                    <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-inter">
                      ❤️ {entry.bp}
                    </span>
                  )}
                  {entry.steps > 0 && (
                    <span className="text-xs bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full font-inter">
                      🚶 {Number(entry.steps).toLocaleString()} steps
                    </span>
                  )}
                  {entry.sleepHours > 0 && (
                    <span className="text-xs bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 px-2 py-0.5 rounded-full font-inter">
                      😴 {entry.sleepHours}h sleep
                    </span>
                  )}
                  {entry.waterIntake > 0 && (
                    <span className="text-xs bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 px-2 py-0.5 rounded-full font-inter">
                      💧 {entry.waterIntake}L
                    </span>
                  )}
                  {entry.weight > 0 && (
                    <span className="text-xs bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full font-inter">
                      ⚖️ {entry.weight}kg
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {entries.length === 0 && !loadingEntries && (
        <div
          className="mt-8 text-center py-12 glass-card rounded-3xl"
          data-ocid="health.empty_state"
        >
          <div className="text-4xl mb-3">📊</div>
          <p className="text-muted-foreground font-inter">
            No health entries yet. Start logging your daily metrics!
          </p>
        </div>
      )}
    </div>
  );
}
