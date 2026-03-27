import {
  ClipboardList,
  Dumbbell,
  Pause,
  Play,
  RotateCcw,
  Trophy,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const gold = "oklch(0.72 0.12 75)";
const navy = "oklch(0.155 0.030 265)";

const EXERCISES = [
  {
    name: "Running",
    icon: "🏃",
    advice: [
      "Warm up with a 5-minute brisk walk before starting your run.",
      "Aim for 60-70% of your max heart rate for optimal fat burn.",
      "Land mid-foot, not heel, to reduce joint impact.",
      "Cool down and stretch calves & hamstrings after every run.",
    ],
  },
  {
    name: "Weight Training",
    icon: "🏋️",
    advice: [
      "Rest 60-90 seconds between sets for hypertrophy goals.",
      "Focus on form over heavy weight — technique prevents injury.",
      "3-4 sets of 8-12 reps is the sweet spot for muscle growth.",
      "Eat protein within 30 minutes post-workout for recovery.",
    ],
  },
  {
    name: "Yoga",
    icon: "🧘",
    advice: [
      "Breathe deeply and slowly through every pose.",
      "Hold each pose 30-60 seconds — don't rush transitions.",
      "Never force a stretch; work to the edge, not beyond.",
      "End with 5 minutes of savasana for full relaxation.",
    ],
  },
  {
    name: "HIIT",
    icon: "⚡",
    advice: [
      "Work:rest ratio of 1:2 is ideal for beginners (e.g., 20s on, 40s off).",
      "Give 90% effort during work intervals for maximum results.",
      "Limit HIIT to 3 sessions per week — recovery is essential.",
      "Stay hydrated and have a carb snack 30 mins before.",
    ],
  },
  {
    name: "Football",
    icon: "⚽",
    advice: [
      "Dynamic warm-up (leg swings, high knees) before play.",
      "Sprint drills improve your in-game pace and acceleration.",
      "Train both feet — balance makes you unpredictable.",
      "Cool down to prevent muscle soreness post-match.",
    ],
  },
  {
    name: "Swimming",
    icon: "🏊",
    advice: [
      "Bilateral breathing (both sides) improves stroke balance.",
      "Kick from your hips, not knees, for efficient propulsion.",
      "Pull with a full arm extension for maximum stroke length.",
      "Build endurance with slow, steady continuous laps.",
    ],
  },
  {
    name: "Cycling",
    icon: "🚴",
    advice: [
      "Set saddle height so knee has a slight bend at full pedal extension.",
      "Maintain 80-100 RPM cadence for efficient pedaling.",
      "Fuel with carbohydrates for rides longer than 60 minutes.",
      "Wear a helmet and use lights if cycling outdoors.",
    ],
  },
  {
    name: "Boxing",
    icon: "🥊",
    advice: [
      "Keep your hands up to protect your face at all times.",
      "Power comes from hip rotation, not just arm strength.",
      "Footwork is as important as your punches — stay light.",
      "Work the bag in 3-minute rounds to simulate real bouts.",
    ],
  },
  {
    name: "Walking",
    icon: "🚶",
    advice: [
      "Aim for 10,000 steps daily for general health benefits.",
      "Walk briskly — slight breathlessness is the right intensity.",
      "Swing your arms naturally to improve balance and pace.",
      "Add inclines or stairs to increase calorie burn.",
    ],
  },
  {
    name: "Stretching",
    icon: "🤸",
    advice: [
      "Never stretch cold muscles — warm up first with light movement.",
      "Hold each stretch 20-30 seconds without bouncing.",
      "Exhale as you deepen into the stretch for better release.",
      "Focus on tight areas: hips, hamstrings, and shoulders.",
    ],
  },
];

function formatTime(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

interface TrainingSession {
  id: number;
  exercise: string;
  duration: number;
  target: number;
  date: string;
}

export function TrainingPage() {
  const [selectedExercise, setSelectedExercise] = useState(EXERCISES[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [targetMins, setTargetMins] = useState(30);
  const [completed, setCompleted] = useState(false);
  const [sessions, setSessions] = useState<TrainingSession[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("navvgenx-training") || "[]");
    } catch {
      return [];
    }
  });
  const [showHistory, setShowHistory] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const targetSecs = targetMins * 60;
  const progress = Math.min(elapsed / targetSecs, 1);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = circumference * (1 - progress);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsed((e) => {
          if (e + 1 >= targetSecs) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            setCompleted(true);
            if ("speechSynthesis" in window) {
              const u = new SpeechSynthesisUtterance(
                `Great job! You completed your ${selectedExercise.name} session!`,
              );
              u.rate = 0.92;
              window.speechSynthesis.speak(u);
            }
            // Auto-save session
            const session: TrainingSession = {
              id: Date.now(),
              exercise: selectedExercise.name,
              duration: targetSecs,
              target: targetMins,
              date: new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }),
            };
            setSessions((prev) => {
              const updated = [session, ...prev].slice(0, 20);
              localStorage.setItem(
                "navvgenx-training",
                JSON.stringify(updated),
              );
              return updated;
            });
            return targetSecs;
          }
          return e + 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, targetSecs, targetMins, selectedExercise.name]);

  const handleReset = () => {
    setIsRunning(false);
    setElapsed(0);
    setCompleted(false);
  };

  return (
    <div className="min-h-screen pb-32 bg-background" data-ocid="training.page">
      {/* Header */}
      <div
        className="px-5 py-5 text-center"
        style={{
          background: "oklch(0.99 0.001 80)",
          borderBottom: "1px solid oklch(0.91 0.003 265)",
        }}
      >
        <div className="flex justify-center mb-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{
              background: navy,
              border: `2px solid ${gold}`,
              boxShadow: `0 4px 16px ${gold}40`,
            }}
          >
            <Dumbbell size={24} color={gold} strokeWidth={2} />
          </div>
        </div>
        <h1
          className="font-playfair text-2xl font-bold"
          style={{ color: navy, letterSpacing: "-0.02em" }}
        >
          Training Timer
        </h1>
        <p
          className="text-sm mt-1"
          style={{
            color: "oklch(0.50 0.008 265)",
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          Set your exercise, target time, and track your workout
        </p>
      </div>

      <div className="max-w-md mx-auto px-4 pt-5 space-y-5">
        {/* Exercise grid */}
        <div>
          <p
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{
              color: gold,
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            Select Exercise
          </p>
          <div className="grid grid-cols-5 gap-2">
            {EXERCISES.map((ex) => (
              <button
                key={ex.name}
                type="button"
                onClick={() => {
                  setSelectedExercise(ex);
                  setElapsed(0);
                  setIsRunning(false);
                  setCompleted(false);
                }}
                style={{
                  padding: "8px 4px",
                  borderRadius: 10,
                  border: `2px solid ${
                    selectedExercise.name === ex.name ? gold : "transparent"
                  }`,
                  background:
                    selectedExercise.name === ex.name
                      ? navy
                      : "oklch(0.96 0.003 265)",
                  display: "flex",
                  flexDirection: "column" as const,
                  alignItems: "center",
                  gap: 2,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                data-ocid="training.toggle"
              >
                <span style={{ fontSize: "1.1rem" }}>{ex.icon}</span>
                <span
                  style={{
                    fontSize: "0.58rem",
                    fontWeight: 600,
                    color:
                      selectedExercise.name === ex.name
                        ? gold
                        : "oklch(0.35 0.012 265)",
                    whiteSpace: "nowrap" as const,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    width: "100%",
                    textAlign: "center" as const,
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  {ex.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Target duration */}
        <div>
          <p
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{
              color: gold,
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            Target Duration
          </p>
          <div className="flex gap-2 flex-wrap">
            {[10, 15, 20, 30, 45, 60, 90].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setTargetMins(m);
                  setElapsed(0);
                  setIsRunning(false);
                  setCompleted(false);
                }}
                style={{
                  padding: "6px 14px",
                  borderRadius: 20,
                  border: `1.5px solid ${
                    targetMins === m ? gold : "oklch(0.88 0.003 265)"
                  }`,
                  background: targetMins === m ? navy : "oklch(0.97 0.002 265)",
                  color: targetMins === m ? gold : "oklch(0.40 0.010 265)",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
                data-ocid="training.toggle"
              >
                {m}m
              </button>
            ))}
          </div>
        </div>

        {/* Circular timer */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "20px 0",
            borderRadius: 20,
            background: navy,
            border: `1.5px solid ${gold}30`,
          }}
        >
          {/* SVG circular timer */}
          <div style={{ position: "relative", width: 148, height: 148 }}>
            <svg
              width="148"
              height="148"
              style={{ transform: "rotate(-90deg)" }}
              aria-hidden="true"
            >
              <title>Training progress</title>
              <circle
                cx="74"
                cy="74"
                r={radius}
                fill="none"
                stroke="oklch(0.22 0.030 265)"
                strokeWidth="9"
              />
              <circle
                cx="74"
                cy="74"
                r={radius}
                fill="none"
                stroke={gold}
                strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDash}
                style={{ transition: "stroke-dashoffset 1s linear" }}
              />
            </svg>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontSize: "1.9rem",
                  fontWeight: 700,
                  fontFamily: "monospace",
                  color: gold,
                  textShadow: `0 0 20px ${gold}60`,
                  letterSpacing: "0.04em",
                }}
              >
                {formatTime(elapsed)}
              </span>
              <span
                style={{
                  fontSize: "0.7rem",
                  color: "oklch(0.50 0.010 265)",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                / {formatTime(targetSecs)}
              </span>
            </div>
          </div>

          {/* Status */}
          <p
            className="mt-2 text-sm"
            style={{
              color: isRunning
                ? "oklch(0.78 0.14 145)"
                : completed
                  ? gold
                  : "oklch(0.55 0.010 265)",
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
            }}
          >
            {completed
              ? `${selectedExercise.name} Complete!`
              : isRunning
                ? `${selectedExercise.name} in progress…`
                : elapsed > 0
                  ? "Paused — tap Resume"
                  : "Ready to train"}
          </p>

          {/* Controls */}
          <div className="flex gap-4 mt-5">
            <button
              type="button"
              onClick={handleReset}
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                border: "1.5px solid oklch(0.35 0.020 265)",
                background: "oklch(0.22 0.030 265)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
              data-ocid="training.secondary_button"
            >
              <RotateCcw
                size={18}
                color="oklch(0.60 0.010 265)"
                strokeWidth={2}
              />
            </button>
            <button
              type="button"
              onClick={() => {
                if (completed) {
                  handleReset();
                } else {
                  setIsRunning((r) => !r);
                }
              }}
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: navy,
                border: `3px solid ${gold}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: `0 0 24px ${gold}50`,
                transition: "all 0.2s",
              }}
              data-ocid="training.primary_button"
            >
              {isRunning ? (
                <Pause size={28} color={gold} />
              ) : completed ? (
                <RotateCcw size={24} color={gold} />
              ) : (
                <Play size={28} color={gold} style={{ marginLeft: 3 }} />
              )}
            </button>
          </div>
        </div>

        {/* Advice cards */}
        <div>
          <p
            className="text-sm font-bold mb-3"
            style={{
              color: navy,
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            {selectedExercise.icon} {selectedExercise.name} — Expert Tips
          </p>
          <div className="flex flex-col gap-2.5">
            {selectedExercise.advice.map((tip, i) => (
              <div
                key={tip.slice(0, 20)}
                style={{
                  padding: "12px 16px",
                  borderRadius: 12,
                  background: "oklch(0.97 0.002 265)",
                  borderLeft: `3px solid ${gold}`,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                }}
              >
                <span
                  style={{
                    color: gold,
                    fontWeight: 700,
                    minWidth: 20,
                    fontSize: "0.85rem",
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  {i + 1}.
                </span>
                <span
                  style={{
                    fontSize: "0.88rem",
                    lineHeight: 1.55,
                    color: "oklch(0.18 0.018 265)",
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  {tip}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Session history */}
        {sessions.length > 0 && (
          <div>
            <button
              type="button"
              onClick={() => setShowHistory((v) => !v)}
              className="flex items-center gap-2 text-sm font-semibold mb-3"
              style={{
                color: gold,
                fontFamily: "'Space Grotesk', sans-serif",
              }}
              data-ocid="training.toggle"
            >
              <ClipboardList size={16} />
              {showHistory ? "Hide" : "Show"} Session History ({sessions.length}
              )
            </button>
            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  {sessions.map((s, idx) => (
                    <div
                      key={s.id}
                      className="rounded-xl p-3"
                      style={{
                        background: "oklch(0.99 0.001 80)",
                        border: "1px solid oklch(0.91 0.003 265)",
                      }}
                      data-ocid={`training.item.${idx + 1}`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="font-semibold text-sm"
                          style={{
                            color: navy,
                            fontFamily: "'Space Grotesk', sans-serif",
                          }}
                        >
                          {s.exercise}
                        </span>
                        <span
                          className="flex items-center gap-1 text-xs font-semibold"
                          style={{ color: gold }}
                        >
                          <Trophy size={12} />
                          {formatTime(s.duration)}
                        </span>
                      </div>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "oklch(0.55 0.008 265)" }}
                      >
                        {s.date}
                      </p>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

export default TrainingPage;
