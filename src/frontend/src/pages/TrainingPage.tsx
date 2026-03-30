import {
  Activity,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Dumbbell,
  Flame,
  Pause,
  Play,
  RotateCcw,
  Star,
  Timer,
  Trophy,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const gold = "oklch(0.72 0.12 75)";
const navy = "oklch(0.155 0.030 265)";

// ─── Body Part Plans ─────────────────────────────────────────────────────────
const BODY_PARTS = [
  { key: "chest", label: "Chest", icon: "💪" },
  { key: "back", label: "Back", icon: "🏋️" },
  { key: "legs", label: "Legs", icon: "🦵" },
  { key: "arms", label: "Arms", icon: "💪" },
  { key: "shoulders", label: "Shoulders", icon: "🤸" },
  { key: "core", label: "Core", icon: "🔥" },
  { key: "cardio", label: "Cardio", icon: "🏃" },
  { key: "fullbody", label: "Full Body", icon: "⚡" },
];

type FitnessLevel = "beginner" | "intermediate" | "advanced";

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  restSecs: number;
  durationMins: number;
  tips: string[];
}

interface BodyPlanData {
  exercises: Exercise[];
  totalMins: number;
  warmup: string;
  cooldown: string;
  advice: string;
}

const BODY_PLANS: Record<string, Record<FitnessLevel, BodyPlanData>> = {
  chest: {
    beginner: {
      exercises: [
        {
          name: "Push-ups",
          sets: 3,
          reps: "8-10",
          restSecs: 90,
          durationMins: 8,
          tips: ["Keep body straight", "Lower chest to floor"],
        },
        {
          name: "Incline Push-ups",
          sets: 3,
          reps: "10-12",
          restSecs: 60,
          durationMins: 6,
          tips: ["Hands on raised surface", "Control the descent"],
        },
      ],
      totalMins: 20,
      warmup: "5 min arm circles & shoulder rolls",
      cooldown: "Chest stretch 30s each side",
      advice:
        "Focus on form over quantity. Your chest muscles need 48 hours to recover, so train chest 2x per week maximum.",
    },
    intermediate: {
      exercises: [
        {
          name: "Bench Press",
          sets: 4,
          reps: "8-12",
          restSecs: 90,
          durationMins: 12,
          tips: ["Retract scapula", "Bar to lower chest"],
        },
        {
          name: "Incline Dumbbell Press",
          sets: 3,
          reps: "10-12",
          restSecs: 75,
          durationMins: 10,
          tips: ["30-45° incline", "Full range of motion"],
        },
        {
          name: "Cable Flyes",
          sets: 3,
          reps: "12-15",
          restSecs: 60,
          durationMins: 8,
          tips: ["Slight elbow bend", "Squeeze at center"],
        },
      ],
      totalMins: 40,
      warmup: "5 min light cardio + arm swings",
      cooldown: "Cross-body chest stretch 30s each",
      advice:
        "Progressive overload is key. Add 2.5 kg every 2 weeks once you can complete all reps cleanly.",
    },
    advanced: {
      exercises: [
        {
          name: "Barbell Bench Press",
          sets: 5,
          reps: "4-6",
          restSecs: 120,
          durationMins: 15,
          tips: ["Arch back slightly", "Drive through heels"],
        },
        {
          name: "Weighted Dips",
          sets: 4,
          reps: "6-8",
          restSecs: 90,
          durationMins: 12,
          tips: ["Lean forward for chest", "Full depth"],
        },
        {
          name: "Incline DB Flyes",
          sets: 3,
          reps: "10-12",
          restSecs: 60,
          durationMins: 8,
          tips: ["Deep stretch at bottom", "Contract at top"],
        },
        {
          name: "Cable Crossover",
          sets: 3,
          reps: "12-15",
          restSecs: 60,
          durationMins: 8,
          tips: ["Squeeze hard at center", "Control entire movement"],
        },
      ],
      totalMins: 55,
      warmup: "10 min mobility work + band pull-aparts",
      cooldown: "Doorframe chest stretch 45s x2",
      advice:
        "At advanced level, periodization matters. Run 4-6 week strength blocks (3-5 reps) alternating with hypertrophy blocks (8-12 reps).",
    },
  },
  back: {
    beginner: {
      exercises: [
        {
          name: "Lat Pulldowns",
          sets: 3,
          reps: "10-12",
          restSecs: 90,
          durationMins: 8,
          tips: ["Pull to upper chest", "Don't swing"],
        },
        {
          name: "Seated Cable Rows",
          sets: 3,
          reps: "10-12",
          restSecs: 75,
          durationMins: 8,
          tips: ["Squeeze at end", "Keep chest up"],
        },
      ],
      totalMins: 25,
      warmup: "Cat-cow stretches x10, shoulder rolls",
      cooldown: "Child's pose 60s, thread the needle",
      advice:
        "Focus on feeling the muscles in your back contract — many beginners use their arms too much. Think 'elbows to pockets'.",
    },
    intermediate: {
      exercises: [
        {
          name: "Pull-ups",
          sets: 4,
          reps: "6-10",
          restSecs: 90,
          durationMins: 10,
          tips: ["Full hang start", "Chin over bar"],
        },
        {
          name: "Barbell Row",
          sets: 4,
          reps: "8-10",
          restSecs: 90,
          durationMins: 12,
          tips: ["Hinge at hip", "Row to belly button"],
        },
        {
          name: "One-Arm DB Row",
          sets: 3,
          reps: "10-12",
          restSecs: 60,
          durationMins: 8,
          tips: ["Support on bench", "Full stretch at bottom"],
        },
      ],
      totalMins: 40,
      warmup: "Band pull-aparts x20, dead hang 30s",
      cooldown: "Child's pose, lat stretch on rack",
      advice:
        "Your back has many muscles — vary grip width and angles across sessions to hit all areas effectively.",
    },
    advanced: {
      exercises: [
        {
          name: "Weighted Pull-ups",
          sets: 5,
          reps: "5-8",
          restSecs: 120,
          durationMins: 14,
          tips: ["Chest to bar", "Control descent 3s"],
        },
        {
          name: "Deadlift",
          sets: 4,
          reps: "4-6",
          restSecs: 180,
          durationMins: 18,
          tips: ["Neutral spine always", "Drive floor away"],
        },
        {
          name: "T-Bar Row",
          sets: 3,
          reps: "8-10",
          restSecs: 90,
          durationMins: 10,
          tips: ["Chest on pad", "Elbows wide for rhomboids"],
        },
        {
          name: "Meadows Row",
          sets: 3,
          reps: "10-12",
          restSecs: 75,
          durationMins: 10,
          tips: ["Elbow high pull", "Rotate for lat stretch"],
        },
      ],
      totalMins: 65,
      warmup: "15 min mobility: thoracic rotation, hip hinge drills",
      cooldown: "PNF lat stretch, foam roll thoracic spine",
      advice:
        "Deadlifts are king for back development. Prioritize them early in session when fresh. Film from side to check your spine position.",
    },
  },
  legs: {
    beginner: {
      exercises: [
        {
          name: "Bodyweight Squats",
          sets: 3,
          reps: "12-15",
          restSecs: 75,
          durationMins: 7,
          tips: ["Knees track over toes", "Hip crease below parallel"],
        },
        {
          name: "Lunges",
          sets: 3,
          reps: "10 each leg",
          restSecs: 75,
          durationMins: 8,
          tips: ["Long step forward", "Back knee near floor"],
        },
        {
          name: "Calf Raises",
          sets: 3,
          reps: "15-20",
          restSecs: 45,
          durationMins: 5,
          tips: ["Full range of motion", "Pause at top"],
        },
      ],
      totalMins: 25,
      warmup: "5 min walk + hip circles x10",
      cooldown: "Quad stretch, hamstring stretch 30s each",
      advice:
        "Legs are your biggest muscle group — they need adequate fuel. Eat carbs 1-2 hours before leg day for best energy.",
    },
    intermediate: {
      exercises: [
        {
          name: "Barbell Squat",
          sets: 4,
          reps: "8-10",
          restSecs: 120,
          durationMins: 14,
          tips: ["Bar on traps", "Brace core hard"],
        },
        {
          name: "Romanian Deadlift",
          sets: 3,
          reps: "10-12",
          restSecs: 90,
          durationMins: 10,
          tips: ["Feel hamstring stretch", "Soft knee bend"],
        },
        {
          name: "Leg Press",
          sets: 3,
          reps: "12-15",
          restSecs: 75,
          durationMins: 9,
          tips: ["Don't lock knees", "Full depth"],
        },
        {
          name: "Leg Curl",
          sets: 3,
          reps: "12-15",
          restSecs: 60,
          durationMins: 7,
          tips: ["Slow on return", "Hold top 1s"],
        },
      ],
      totalMins: 50,
      warmup: "5 min bike + leg swings, hip circles",
      cooldown: "Pigeon pose 60s, hamstring stretch",
      advice:
        "Split quads and hamstrings across sessions if possible. Always squat first when fresh — it's the most technique-dependent move.",
    },
    advanced: {
      exercises: [
        {
          name: "Back Squat",
          sets: 5,
          reps: "4-6",
          restSecs: 180,
          durationMins: 20,
          tips: ["Tripod foot position", "Valsalva breath hold"],
        },
        {
          name: "Front Squat",
          sets: 3,
          reps: "6-8",
          restSecs: 120,
          durationMins: 12,
          tips: ["Elbows up", "More upright torso"],
        },
        {
          name: "Bulgarian Split Squat",
          sets: 3,
          reps: "8-10 each",
          restSecs: 90,
          durationMins: 12,
          tips: ["Rear foot elevated", "Drop straight down"],
        },
        {
          name: "Glute Ham Raise",
          sets: 3,
          reps: "8-10",
          restSecs: 90,
          durationMins: 10,
          tips: ["Control descent", "Hamstrings only"],
        },
        {
          name: "Calf Raises",
          sets: 4,
          reps: "15-20",
          restSecs: 60,
          durationMins: 7,
          tips: ["Slow 3s up, 3s down", "Full stretch at bottom"],
        },
      ],
      totalMins: 75,
      warmup: "15 min mobility: ankle, hip flexor, piriformis",
      cooldown: "Deep squat hold 60s, foam roll IT band and quads",
      advice:
        "At advanced level, periodize between high volume (5x10) and high intensity (5x3-5) blocks. Legs respond well to high frequency — train 2-3x per week.",
    },
  },
  arms: {
    beginner: {
      exercises: [
        {
          name: "Dumbbell Bicep Curl",
          sets: 3,
          reps: "10-12",
          restSecs: 60,
          durationMins: 7,
          tips: ["Don't swing elbow", "Full curl to shoulder"],
        },
        {
          name: "Tricep Dips (bench)",
          sets: 3,
          reps: "10-12",
          restSecs: 60,
          durationMins: 7,
          tips: ["Elbows track back", "Lower slowly"],
        },
      ],
      totalMins: 20,
      warmup: "Arm circles 30s each direction, wrist rolls",
      cooldown: "Overhead tricep stretch, cross-body bicep stretch",
      advice:
        "Arms are smaller muscles that recover fast. You can train them 3x per week. Consistency over 8-12 weeks produces visible results.",
    },
    intermediate: {
      exercises: [
        {
          name: "Barbell Curl",
          sets: 4,
          reps: "8-10",
          restSecs: 75,
          durationMins: 10,
          tips: ["Elbows pinned to sides", "Slow negative"],
        },
        {
          name: "Hammer Curl",
          sets: 3,
          reps: "10-12",
          restSecs: 60,
          durationMins: 8,
          tips: ["Neutral grip", "Works brachialis"],
        },
        {
          name: "Skull Crushers",
          sets: 4,
          reps: "10-12",
          restSecs: 75,
          durationMins: 10,
          tips: ["Bar to forehead", "Elbows stay fixed"],
        },
        {
          name: "Tricep Pushdown",
          sets: 3,
          reps: "12-15",
          restSecs: 60,
          durationMins: 7,
          tips: ["Elbows at sides", "Squeeze at lockout"],
        },
      ],
      totalMins: 40,
      warmup: "Light band bicep curls x20, tricep extensions x20",
      cooldown: "Wrist flexor and extensor stretches",
      advice:
        "Triceps make up 2/3 of your arm. Don't neglect them! Balance bicep and tricep volume for best overall arm development.",
    },
    advanced: {
      exercises: [
        {
          name: "Incline DB Curl",
          sets: 4,
          reps: "8-10",
          restSecs: 75,
          durationMins: 10,
          tips: ["Maximum stretch at bottom", "Peak contraction top"],
        },
        {
          name: "Concentration Curl",
          sets: 3,
          reps: "10-12",
          restSecs: 60,
          durationMins: 8,
          tips: ["Elbow on thigh", "Full supination"],
        },
        {
          name: "Close-Grip Bench",
          sets: 4,
          reps: "6-8",
          restSecs: 90,
          durationMins: 12,
          tips: ["Hands shoulder-width", "Elbows tucked"],
        },
        {
          name: "Overhead Tricep Extension",
          sets: 3,
          reps: "10-12",
          restSecs: 75,
          durationMins: 9,
          tips: ["Long head stretch", "Elbows forward"],
        },
        {
          name: "21s Bicep Curl",
          sets: 3,
          reps: "21 (7+7+7)",
          restSecs: 90,
          durationMins: 9,
          tips: ["Lower half, upper half, full", "No rest between parts"],
        },
      ],
      totalMins: 55,
      warmup: "Blood flow restriction band warm-up sets",
      cooldown: "Doorframe bicep stretch, overhead tricep stretch",
      advice:
        "Add blood flow restriction (BFR) training with light weights for extra pump and growth without joint stress.",
    },
  },
  shoulders: {
    beginner: {
      exercises: [
        {
          name: "Dumbbell Shoulder Press",
          sets: 3,
          reps: "10-12",
          restSecs: 75,
          durationMins: 8,
          tips: ["Don't flare elbows", "Press to lockout"],
        },
        {
          name: "Lateral Raises",
          sets: 3,
          reps: "12-15",
          restSecs: 60,
          durationMins: 7,
          tips: ["Lead with elbows", "Slight forward lean"],
        },
      ],
      totalMins: 20,
      warmup: "Band pull-aparts x15, wall slides x10",
      cooldown: "Cross-body shoulder stretch, doorframe stretch",
      advice:
        "Shoulders are involved in nearly every upper body movement. Strong rotator cuff muscles prevent injury — include face pulls regularly.",
    },
    intermediate: {
      exercises: [
        {
          name: "Overhead Press",
          sets: 4,
          reps: "8-10",
          restSecs: 90,
          durationMins: 12,
          tips: ["Bar from front rack", "Full lockout overhead"],
        },
        {
          name: "Arnold Press",
          sets: 3,
          reps: "10-12",
          restSecs: 75,
          durationMins: 9,
          tips: ["Rotate through range", "Hits all 3 heads"],
        },
        {
          name: "Face Pulls",
          sets: 3,
          reps: "15-20",
          restSecs: 60,
          durationMins: 7,
          tips: ["Pull to ear level", "Externally rotate"],
        },
        {
          name: "Upright Row",
          sets: 3,
          reps: "12-15",
          restSecs: 60,
          durationMins: 7,
          tips: ["Elbows above hands", "Stop at chin"],
        },
      ],
      totalMins: 42,
      warmup: "External rotation band work x20, shoulder circles",
      cooldown: "Thread the needle stretch, pec minor stretch",
      advice:
        "For wider shoulders, prioritize lateral raises. For thicker shoulders, prioritize overhead pressing. Do both every session.",
    },
    advanced: {
      exercises: [
        {
          name: "Seated DB Press",
          sets: 5,
          reps: "6-8",
          restSecs: 120,
          durationMins: 15,
          tips: ["Back support", "Controlled all the way"],
        },
        {
          name: "Heavy Lateral Raises",
          sets: 4,
          reps: "8-10",
          restSecs: 75,
          durationMins: 11,
          tips: ["Slight body English ok", "Drop sets on last set"],
        },
        {
          name: "Rear Delt Fly",
          sets: 4,
          reps: "12-15",
          restSecs: 60,
          durationMins: 10,
          tips: ["Chest on pad", "Lead with elbows"],
        },
        {
          name: "Cable Lateral Raise",
          sets: 3,
          reps: "12-15",
          restSecs: 60,
          durationMins: 8,
          tips: ["Constant tension", "Cross-body angle"],
        },
        {
          name: "Face Pulls",
          sets: 3,
          reps: "20-25",
          restSecs: 45,
          durationMins: 6,
          tips: ["Injury prevention", "External rotate hard"],
        },
      ],
      totalMins: 60,
      warmup: "15 min rotator cuff activation protocol",
      cooldown: "Full shoulder mobility routine 10 min",
      advice:
        "Shoulders can be trained with higher frequency (3x/week) but need adequate rotator cuff work. Never skip face pulls and external rotation.",
    },
  },
  core: {
    beginner: {
      exercises: [
        {
          name: "Plank",
          sets: 3,
          reps: "20-30s",
          restSecs: 60,
          durationMins: 6,
          tips: ["Neutral spine", "Don't hold breath"],
        },
        {
          name: "Crunches",
          sets: 3,
          reps: "15-20",
          restSecs: 45,
          durationMins: 5,
          tips: ["Don't pull neck", "Exhale on crunch"],
        },
        {
          name: "Dead Bug",
          sets: 3,
          reps: "8 each side",
          restSecs: 45,
          durationMins: 6,
          tips: ["Lower back flat", "Move slowly"],
        },
      ],
      totalMins: 20,
      warmup: "Cat-cow x10, pelvic tilts x10",
      cooldown: "Child's pose 60s, lying spinal twist",
      advice:
        "Core training is about stability, not just crunches. Planks, dead bugs and bird dogs build a stronger, injury-resistant midsection.",
    },
    intermediate: {
      exercises: [
        {
          name: "Hanging Leg Raise",
          sets: 4,
          reps: "10-12",
          restSecs: 75,
          durationMins: 9,
          tips: ["No momentum", "Control the descent"],
        },
        {
          name: "Cable Crunch",
          sets: 3,
          reps: "15-20",
          restSecs: 60,
          durationMins: 8,
          tips: ["Crunch, don't pull arms", "Round lumbar spine"],
        },
        {
          name: "Pallof Press",
          sets: 3,
          reps: "12 each side",
          restSecs: 60,
          durationMins: 8,
          tips: ["Resist rotation", "Stand tall"],
        },
        {
          name: "Ab Wheel Rollout",
          sets: 3,
          reps: "8-10",
          restSecs: 75,
          durationMins: 8,
          tips: ["Keep hips level", "Don't sag lower back"],
        },
      ],
      totalMins: 38,
      warmup: "McGill big 3: curl-up, bird dog, side plank",
      cooldown: "Cobra pose, seated spinal twist",
      advice:
        "Train core from all angles: flexion (crunches), anti-rotation (Pallof), lateral flexion (side plank), and extension (superman).",
    },
    advanced: {
      exercises: [
        {
          name: "Dragon Flag",
          sets: 4,
          reps: "5-8",
          restSecs: 90,
          durationMins: 12,
          tips: ["Slow negative", "Body straight as board"],
        },
        {
          name: "L-Sit Hold",
          sets: 4,
          reps: "10-20s",
          restSecs: 60,
          durationMins: 9,
          tips: ["Legs parallel to floor", "Depress shoulders"],
        },
        {
          name: "Toes to Bar",
          sets: 4,
          reps: "10-12",
          restSecs: 75,
          durationMins: 10,
          tips: ["Control swing", "Exhale on pull up"],
        },
        {
          name: "Weighted Plank",
          sets: 3,
          reps: "45-60s",
          restSecs: 60,
          durationMins: 8,
          tips: ["Plate on back", "Hollow body position"],
        },
      ],
      totalMins: 50,
      warmup: "Thoracic spine mobility, hip flexor activation",
      cooldown: "Supported back extension, pigeon pose",
      advice:
        "Advanced core training integrates core with whole-body movements. Add loaded carries (farmer's walk, suitcase carry) for functional core strength.",
    },
  },
  cardio: {
    beginner: {
      exercises: [
        {
          name: "Brisk Walking",
          sets: 1,
          reps: "20-30 min",
          restSecs: 0,
          durationMins: 25,
          tips: ["Target 5,000 steps", "Moderate breathlessness"],
        },
        {
          name: "Stationary Bike",
          sets: 1,
          reps: "15-20 min",
          restSecs: 0,
          durationMins: 18,
          tips: ["Moderate resistance", "80-90 RPM"],
        },
      ],
      totalMins: 30,
      warmup: "5 min slow walk, leg swings",
      cooldown: "5 min slow walk, calf stretches",
      advice:
        "Aim for 150 minutes of moderate cardio per week. Any movement counts — start small and build up weekly.",
    },
    intermediate: {
      exercises: [
        {
          name: "Interval Running",
          sets: 6,
          reps: "1 min fast / 1 min slow",
          restSecs: 0,
          durationMins: 20,
          tips: ["80-85% max HR during effort", "Active recovery"],
        },
        {
          name: "Jump Rope",
          sets: 4,
          reps: "3 min rounds",
          restSecs: 60,
          durationMins: 16,
          tips: ["Stay on balls of feet", "Wrists not arms"],
        },
        {
          name: "Rowing Machine",
          sets: 1,
          reps: "15 min",
          restSecs: 0,
          durationMins: 15,
          tips: ["Legs, hips, arms sequence", "Damper 4-5"],
        },
      ],
      totalMins: 45,
      warmup: "5 min dynamic warm-up, high knees, butt kicks",
      cooldown: "5 min light walk, full body stretch",
      advice:
        "Vary your cardio modalities to prevent adaptation. Include 1-2 HIIT sessions and 2-3 steady-state sessions per week.",
    },
    advanced: {
      exercises: [
        {
          name: "HIIT Sprints",
          sets: 8,
          reps: "30s max / 30s rest",
          restSecs: 0,
          durationMins: 15,
          tips: ["90-95% max effort", "True max sprint"],
        },
        {
          name: "Tempo Run",
          sets: 1,
          reps: "30 min at 75% HR",
          restSecs: 0,
          durationMins: 30,
          tips: ["Comfortably hard pace", "Can speak in short sentences"],
        },
        {
          name: "Assault Bike Tabata",
          sets: 8,
          reps: "20s on / 10s off",
          restSecs: 0,
          durationMins: 10,
          tips: ["Arms and legs", "Max output every round"],
        },
      ],
      totalMins: 60,
      warmup: "10 min progressive warm-up run + dynamic drills",
      cooldown: "10 min easy jog + full flexibility routine",
      advice:
        "Periodize your cardio like your strength training. Peak VO2max takes 8-12 weeks of consistent progressive overload to meaningfully improve.",
    },
  },
  fullbody: {
    beginner: {
      exercises: [
        {
          name: "Goblet Squat",
          sets: 3,
          reps: "12-15",
          restSecs: 75,
          durationMins: 8,
          tips: ["Chest up", "Elbows inside knees"],
        },
        {
          name: "Push-ups",
          sets: 3,
          reps: "8-12",
          restSecs: 75,
          durationMins: 7,
          tips: ["Straight body", "Full range"],
        },
        {
          name: "Dumbbell Row",
          sets: 3,
          reps: "10-12 each",
          restSecs: 75,
          durationMins: 8,
          tips: ["Support on bench", "Elbow to hip"],
        },
        {
          name: "Glute Bridge",
          sets: 3,
          reps: "15-20",
          restSecs: 60,
          durationMins: 6,
          tips: ["Squeeze at top", "Drive through heels"],
        },
      ],
      totalMins: 35,
      warmup: "5 min light cardio + full body joint circles",
      cooldown: "Hip flexor, chest, hamstring stretch",
      advice:
        "Full body training 3x per week is ideal for beginners. You'll hit every muscle frequently, accelerating learning and growth.",
    },
    intermediate: {
      exercises: [
        {
          name: "Barbell Squat",
          sets: 4,
          reps: "8-10",
          restSecs: 90,
          durationMins: 13,
          tips: ["Brace and breathe", "Knees track toes"],
        },
        {
          name: "Bench Press",
          sets: 4,
          reps: "8-10",
          restSecs: 90,
          durationMins: 12,
          tips: ["Chest down", "Leg drive"],
        },
        {
          name: "Deadlift",
          sets: 3,
          reps: "6-8",
          restSecs: 120,
          durationMins: 13,
          tips: ["Bar over mid-foot", "Hips and shoulders rise together"],
        },
        {
          name: "Overhead Press",
          sets: 3,
          reps: "8-10",
          restSecs: 75,
          durationMins: 10,
          tips: ["Glutes tight", "Full lockout"],
        },
        {
          name: "Pull-ups",
          sets: 3,
          reps: "max reps",
          restSecs: 90,
          durationMins: 9,
          tips: ["Dead hang start", "Chest to bar"],
        },
      ],
      totalMins: 65,
      warmup: "10 min mobility + light activation sets",
      cooldown: "Full body stretch sequence 10 min",
      advice:
        "This is a classic strength program. Focus on adding weight progressively. Rest 2 days between sessions for full recovery.",
    },
    advanced: {
      exercises: [
        {
          name: "Power Clean",
          sets: 5,
          reps: "3-5",
          restSecs: 180,
          durationMins: 20,
          tips: ["Triple extension", "Fast elbows"],
        },
        {
          name: "Back Squat",
          sets: 5,
          reps: "4-6",
          restSecs: 150,
          durationMins: 18,
          tips: ["High tension throughout", "Compensatory acceleration"],
        },
        {
          name: "Weighted Pull-ups",
          sets: 4,
          reps: "4-6",
          restSecs: 120,
          durationMins: 13,
          tips: ["Add weight belt", "Chest to bar"],
        },
        {
          name: "Barbell Push Press",
          sets: 4,
          reps: "4-6",
          restSecs: 120,
          durationMins: 13,
          tips: ["Hip drive first", "Catch overhead"],
        },
        {
          name: "Romanian Deadlift",
          sets: 3,
          reps: "8-10",
          restSecs: 90,
          durationMins: 10,
          tips: ["Maximal hamstring stretch", "Controlled"],
        },
      ],
      totalMins: 85,
      warmup: "15 min Olympic lifting warm-up progression",
      cooldown: "Full mobility routine, contrast shower recommended",
      advice:
        "At advanced level, periodization and recovery are paramount. Consider deload weeks every 4-6 weeks and track HRV for readiness.",
    },
  },
};

// ─── Review Generator ─────────────────────────────────────────────────────────
function generateReview(
  bodyPart: string,
  level: FitnessLevel,
  elapsed: number,
  target: number,
  completedExercises: number[],
  plan: BodyPlanData,
): string {
  const pct = Math.round((elapsed / target) * 100);
  const totalExercises = plan.exercises.length;
  const doneCount = completedExercises.length;
  const fullCompletion = pct >= 95;

  const ratings: Record<string, string> = {
    excellent: "Excellent",
    good: "Good",
    fair: "Fair",
    incomplete: "Incomplete",
  };

  let rating: keyof typeof ratings;
  if (fullCompletion && doneCount === totalExercises) rating = "excellent";
  else if (pct >= 75 || doneCount >= totalExercises - 1) rating = "good";
  else if (pct >= 40) rating = "fair";
  else rating = "incomplete";

  const levelMap: Record<FitnessLevel, string> = {
    beginner: "beginner",
    intermediate: "intermediate",
    advanced: "advanced",
  };

  const nextSteps: Record<string, string[]> = {
    excellent: [
      `Outstanding work! You completed your full ${bodyPart} session at ${levelMap[level]} level.`,
      `You hit ${doneCount}/${totalExercises} exercises and stayed on time — that's elite consistency.`,
      "Recovery tip: Get 7-9 hours of sleep tonight. Muscles grow during rest, not during the workout.",
      "Next session: Consider increasing weight by 2.5-5% or adding one extra set to your main exercise.",
    ],
    good: [
      `Great effort on your ${bodyPart} workout! You completed ${pct}% of the session.`,
      `${doneCount} out of ${totalExercises} exercises done — solid work overall.`,
      "If time ran short, prioritize compound movements first in your next session.",
      "Nutrition now: Have a protein-rich meal or shake within 45 minutes for optimal recovery.",
    ],
    fair: [
      `You put in effort today on your ${bodyPart} training — ${pct}% completed is still progress.`,
      `Completed ${doneCount}/${totalExercises} exercises. Don't be discouraged — starting is the hardest part.`,
      "Tip: Reduce rest time between sets if time is the issue, or shorten the workout to what you can commit to.",
      "Consistency over perfection. Showing up 3x per week at 60% beats showing up once at 100%.",
    ],
    incomplete: [
      `You started your ${bodyPart} session and that matters. Any movement is better than none.`,
      "Tomorrow is another opportunity. Try the beginner plan which is shorter and more manageable.",
      "Hydrate well and get proper sleep — you'll feel stronger for your next attempt.",
    ],
  };

  return nextSteps[rating].join(" | ");
}

function formatTime(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function TrainingPage() {
  const [step, setStep] = useState<"setup" | "workout" | "review">("setup");
  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel>("beginner");
  const [selectedBodyPart, setSelectedBodyPart] = useState(BODY_PARTS[0]);
  const [plan, setPlan] = useState<BodyPlanData | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [targetSecs, setTargetSecs] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<number[]>([]);
  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
  const [expandedTip, setExpandedTip] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState("");
  const [sessions, setSessions] = useState<
    Array<{
      id: number;
      bodyPart: string;
      level: string;
      elapsed: number;
      target: number;
      date: string;
    }>
  >(() => {
    try {
      return JSON.parse(localStorage.getItem("navvgenx-training") || "[]");
    } catch {
      return [];
    }
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const progress = targetSecs > 0 ? Math.min(elapsed / targetSecs, 1) : 0;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = circumference * (1 - progress);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsed((e) => {
          if (e + 1 >= targetSecs) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            handleSessionComplete(targetSecs);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, targetSecs]);

  const handleSessionComplete = (finalElapsed: number) => {
    if (!plan) return;
    if ("speechSynthesis" in window) {
      const u = new SpeechSynthesisUtterance(
        `Great job! You completed your ${selectedBodyPart.label} training session!`,
      );
      u.rate = 0.92;
      window.speechSynthesis.speak(u);
    }
    const review = generateReview(
      selectedBodyPart.label,
      fitnessLevel,
      finalElapsed,
      targetSecs,
      completedExercises,
      plan,
    );
    setReviewText(review);
    const session = {
      id: Date.now(),
      bodyPart: selectedBodyPart.label,
      level: fitnessLevel,
      elapsed: finalElapsed,
      target: targetSecs,
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setSessions((prev) => {
      const updated = [session, ...prev].slice(0, 20);
      localStorage.setItem("navvgenx-training", JSON.stringify(updated));
      return updated;
    });
    setStep("review");
  };

  const startWorkout = () => {
    const p = BODY_PLANS[selectedBodyPart.key]?.[fitnessLevel];
    if (!p) return;
    setPlan(p);
    setTargetSecs(p.totalMins * 60);
    setElapsed(0);
    setCompletedExercises([]);
    setCurrentExerciseIdx(0);
    setStep("workout");
    setIsRunning(true);
  };

  const handleFinishEarly = () => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (plan) {
      const review = generateReview(
        selectedBodyPart.label,
        fitnessLevel,
        elapsed,
        targetSecs,
        completedExercises,
        plan,
      );
      setReviewText(review);
      const session = {
        id: Date.now(),
        bodyPart: selectedBodyPart.label,
        level: fitnessLevel,
        elapsed,
        target: targetSecs,
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setSessions((prev) => {
        const updated = [session, ...prev].slice(0, 20);
        localStorage.setItem("navvgenx-training", JSON.stringify(updated));
        return updated;
      });
    }
    setStep("review");
  };

  const resetAll = () => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setStep("setup");
    setElapsed(0);
    setPlan(null);
    setCompletedExercises([]);
    setReviewText("");
  };

  const toggleExerciseDone = (idx: number) => {
    setCompletedExercises((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
    );
    if (idx === currentExerciseIdx && plan && idx < plan.exercises.length - 1) {
      setCurrentExerciseIdx(idx + 1);
    }
  };

  const isDark = document.documentElement.classList.contains("dark");
  const bgCard = isDark ? "oklch(0.15 0.025 265)" : "oklch(0.98 0.002 265)";
  const bgPage = isDark ? "oklch(0.10 0.020 265)" : "oklch(0.99 0.001 80)";
  const textMain = isDark ? "oklch(0.95 0.005 80)" : navy;
  const textSub = isDark ? "oklch(0.65 0.010 265)" : "oklch(0.45 0.010 265)";
  const borderCol = isDark ? "oklch(0.25 0.025 265)" : "oklch(0.91 0.003 265)";

  return (
    <div
      className="min-h-screen pb-32"
      style={{ background: bgPage }}
      data-ocid="training.page"
    >
      {/* Header */}
      <div
        className="px-5 py-5 text-center"
        style={{
          background: isDark ? navy : "oklch(0.99 0.001 80)",
          borderBottom: `1px solid ${borderCol}`,
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
          style={{ color: isDark ? gold : navy, letterSpacing: "-0.02em" }}
        >
          Training Advisor
        </h1>
        <p
          className="text-sm mt-1"
          style={{ color: textSub, fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {step === "setup"
            ? "Select body part, fitness level, and get your personalized plan"
            : step === "workout"
              ? `${selectedBodyPart.label} — ${fitnessLevel} — ${plan?.totalMins} min session`
              : "Session complete — your review is ready"}
        </p>
      </div>

      <div className="max-w-md mx-auto px-4 pt-5 space-y-5">
        <AnimatePresence mode="wait">
          {/* ── STEP 1: SETUP ── */}
          {step === "setup" && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-5"
            >
              {/* Fitness Level */}
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-widest mb-3"
                  style={{
                    color: gold,
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  Your Fitness Level
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    ["beginner", "intermediate", "advanced"] as FitnessLevel[]
                  ).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setFitnessLevel(lvl)}
                      style={{
                        padding: "12px 8px",
                        borderRadius: 12,
                        border: `2px solid ${fitnessLevel === lvl ? gold : borderCol}`,
                        background: fitnessLevel === lvl ? navy : bgCard,
                        cursor: "pointer",
                        transition: "all 0.2s",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 4,
                      }}
                      data-ocid="training.toggle"
                    >
                      {lvl === "beginner" ? (
                        <Activity
                          size={18}
                          color={fitnessLevel === lvl ? gold : textSub}
                        />
                      ) : lvl === "intermediate" ? (
                        <Flame
                          size={18}
                          color={fitnessLevel === lvl ? gold : textSub}
                        />
                      ) : (
                        <Zap
                          size={18}
                          color={fitnessLevel === lvl ? gold : textSub}
                        />
                      )}
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          color: fitnessLevel === lvl ? gold : textMain,
                          fontFamily: "'Space Grotesk', sans-serif",
                          textTransform: "capitalize",
                        }}
                      >
                        {lvl}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Body Part */}
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-widest mb-3"
                  style={{
                    color: gold,
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  Target Body Part
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {BODY_PARTS.map((bp) => (
                    <button
                      key={bp.key}
                      type="button"
                      onClick={() => setSelectedBodyPart(bp)}
                      style={{
                        padding: "10px 6px",
                        borderRadius: 12,
                        border: `2px solid ${selectedBodyPart.key === bp.key ? gold : borderCol}`,
                        background:
                          selectedBodyPart.key === bp.key ? navy : bgCard,
                        cursor: "pointer",
                        transition: "all 0.2s",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 4,
                      }}
                      data-ocid="training.toggle"
                    >
                      <span style={{ fontSize: "1.2rem" }}>{bp.icon}</span>
                      <span
                        style={{
                          fontSize: "0.68rem",
                          fontWeight: 600,
                          color:
                            selectedBodyPart.key === bp.key ? gold : textMain,
                          fontFamily: "'Space Grotesk', sans-serif",
                        }}
                      >
                        {bp.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Plan Preview */}
              {BODY_PLANS[selectedBodyPart.key]?.[fitnessLevel] &&
                (() => {
                  const preview =
                    BODY_PLANS[selectedBodyPart.key][fitnessLevel];
                  return (
                    <div
                      style={{
                        padding: 16,
                        borderRadius: 14,
                        background: navy,
                        border: `1px solid ${gold}30`,
                      }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span
                          style={{
                            color: gold,
                            fontWeight: 700,
                            fontSize: "0.9rem",
                            fontFamily: "'Space Grotesk', sans-serif",
                          }}
                        >
                          {selectedBodyPart.icon} {selectedBodyPart.label} Plan
                          Preview
                        </span>
                        <span
                          style={{
                            color: gold,
                            fontSize: "0.8rem",
                            fontFamily: "'Space Grotesk', sans-serif",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <Timer size={14} />
                          {preview.totalMins} min
                        </span>
                      </div>
                      <div className="space-y-2">
                        {preview.exercises.map((ex) => (
                          <div
                            key={ex.name}
                            className="flex items-center justify-between"
                            style={{
                              padding: "6px 10px",
                              borderRadius: 8,
                              background: "oklch(0.22 0.030 265)",
                            }}
                          >
                            <span
                              style={{
                                color: "oklch(0.85 0.006 80)",
                                fontSize: "0.82rem",
                                fontFamily: "'Space Grotesk', sans-serif",
                              }}
                            >
                              {ex.name}
                            </span>
                            <span
                              style={{
                                color: gold,
                                fontSize: "0.78rem",
                                fontWeight: 600,
                                fontFamily: "'Space Grotesk', sans-serif",
                              }}
                            >
                              {ex.sets}×{ex.reps}
                            </span>
                          </div>
                        ))}
                      </div>
                      <p
                        style={{
                          color: "oklch(0.60 0.010 265)",
                          fontSize: "0.78rem",
                          marginTop: 10,
                          fontFamily: "'Space Grotesk', sans-serif",
                          borderTop: "1px solid oklch(0.25 0.025 265)",
                          paddingTop: 8,
                        }}
                      >
                        💡 {preview.advice}
                      </p>
                    </div>
                  );
                })()}

              {/* Start button */}
              <button
                type="button"
                onClick={startWorkout}
                style={{
                  width: "100%",
                  padding: "16px",
                  borderRadius: 14,
                  background: `linear-gradient(135deg, ${navy}, oklch(0.22 0.040 265))`,
                  border: `2px solid ${gold}`,
                  color: gold,
                  fontSize: "1rem",
                  fontWeight: 700,
                  fontFamily: "'Space Grotesk', sans-serif",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  boxShadow: `0 4px 20px ${gold}30`,
                  transition: "all 0.2s",
                }}
                data-ocid="training.primary_button"
              >
                <Play size={18} /> Start{" "}
                {BODY_PLANS[selectedBodyPart.key]?.[fitnessLevel]?.totalMins}
                -Minute {selectedBodyPart.label} Session
              </button>

              {/* History */}
              {sessions.length > 0 && (
                <div>
                  <p
                    className="text-xs font-bold uppercase tracking-widest mb-2"
                    style={{
                      color: gold,
                      fontFamily: "'Space Grotesk', sans-serif",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <ClipboardList size={14} /> Recent Sessions
                  </p>
                  <div className="space-y-2">
                    {sessions.slice(0, 5).map((s, idx) => (
                      <div
                        key={s.id}
                        style={{
                          padding: "10px 14px",
                          borderRadius: 10,
                          background: bgCard,
                          border: `1px solid ${borderCol}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                        data-ocid={`training.item.${idx + 1}`}
                      >
                        <div>
                          <span
                            style={{
                              color: textMain,
                              fontWeight: 600,
                              fontSize: "0.85rem",
                              fontFamily: "'Space Grotesk', sans-serif",
                            }}
                          >
                            {s.bodyPart}
                          </span>
                          <span
                            style={{
                              color: textSub,
                              fontSize: "0.75rem",
                              marginLeft: 6,
                              fontFamily: "'Space Grotesk', sans-serif",
                              textTransform: "capitalize",
                            }}
                          >
                            · {s.level}
                          </span>
                          <p
                            style={{
                              color: textSub,
                              fontSize: "0.72rem",
                              marginTop: 1,
                              fontFamily: "'Space Grotesk', sans-serif",
                            }}
                          >
                            {s.date}
                          </p>
                        </div>
                        <span
                          style={{
                            color: gold,
                            fontWeight: 700,
                            fontSize: "0.82rem",
                            fontFamily: "'Space Grotesk', sans-serif",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <Trophy size={12} />
                          {formatTime(s.elapsed)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── STEP 2: WORKOUT ── */}
          {step === "workout" && plan && (
            <motion.div
              key="workout"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Circular Timer */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "20px 16px",
                  borderRadius: 20,
                  background: navy,
                  border: `1.5px solid ${gold}30`,
                }}
              >
                <div style={{ position: "relative", width: 160, height: 160 }}>
                  <svg
                    width="160"
                    height="160"
                    style={{ transform: "rotate(-90deg)" }}
                    aria-hidden="true"
                  >
                    <title>Training progress</title>
                    <circle
                      cx="80"
                      cy="80"
                      r={radius}
                      fill="none"
                      stroke="oklch(0.22 0.030 265)"
                      strokeWidth="10"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r={radius}
                      fill="none"
                      stroke={gold}
                      strokeWidth="10"
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
                        fontSize: "2.1rem",
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
                        fontSize: "0.72rem",
                        color: "oklch(0.50 0.010 265)",
                        fontFamily: "'Space Grotesk', sans-serif",
                      }}
                    >
                      / {formatTime(targetSecs)}
                    </span>
                    <span
                      style={{
                        fontSize: "0.68rem",
                        color: isRunning
                          ? "oklch(0.78 0.14 145)"
                          : "oklch(0.60 0.010 265)",
                        fontFamily: "'Space Grotesk', sans-serif",
                        marginTop: 2,
                        fontWeight: 600,
                      }}
                    >
                      {isRunning ? "Active" : "Paused"}
                    </span>
                  </div>
                </div>
                {/* Controls */}
                <div className="flex gap-4 mt-4 items-center">
                  <button
                    type="button"
                    onClick={() => setIsRunning((r) => !r)}
                    style={{
                      width: 68,
                      height: 68,
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
                      <Pause size={26} color={gold} />
                    ) : (
                      <Play size={26} color={gold} style={{ marginLeft: 3 }} />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleFinishEarly}
                    style={{
                      padding: "10px 18px",
                      borderRadius: 10,
                      border: "1.5px solid oklch(0.35 0.020 265)",
                      background: "oklch(0.22 0.030 265)",
                      color: "oklch(0.60 0.010 265)",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                    data-ocid="training.secondary_button"
                  >
                    Finish & Review
                  </button>
                </div>
              </div>

              {/* Warmup reminder */}
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: isDark
                    ? "oklch(0.18 0.030 265)"
                    : "oklch(0.97 0.002 265)",
                  borderLeft: `3px solid ${gold}`,
                }}
              >
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: textSub,
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  <span style={{ color: gold, fontWeight: 700 }}>
                    Warm-up:{" "}
                  </span>
                  {plan.warmup}
                </p>
              </div>

              {/* Exercise checklist */}
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-widest mb-3"
                  style={{
                    color: gold,
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  Exercises — tap to mark done
                </p>
                <div className="space-y-2">
                  {plan.exercises.map((ex, idx) => {
                    const done = completedExercises.includes(idx);
                    const isCurrent = idx === currentExerciseIdx && !done;
                    const expanded = expandedTip === idx;
                    return (
                      <div
                        key={ex.name}
                        style={{
                          borderRadius: 12,
                          overflow: "hidden",
                          border: `2px solid ${done ? gold : isCurrent ? `${gold}60` : borderCol}`,
                          background: done
                            ? `${navy}`
                            : isCurrent
                              ? isDark
                                ? "oklch(0.18 0.030 265)"
                                : "oklch(0.98 0.003 80)"
                              : bgCard,
                          transition: "all 0.2s",
                        }}
                      >
                        <button
                          type="button"
                          className="flex items-center w-full text-left"
                          style={{
                            padding: "12px 14px",
                            cursor: "pointer",
                            background: "transparent",
                            border: "none",
                          }}
                          onClick={() => toggleExerciseDone(idx)}
                          data-ocid="training.toggle"
                        >
                          <div
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: "50%",
                              border: `2px solid ${done ? gold : borderCol}`,
                              background: done ? gold : "transparent",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              marginRight: 12,
                              flexShrink: 0,
                              transition: "all 0.2s",
                            }}
                          >
                            {done && (
                              <CheckCircle size={14} color={navy} fill={navy} />
                            )}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div className="flex items-center justify-between">
                              <span
                                style={{
                                  fontWeight: 700,
                                  fontSize: "0.88rem",
                                  color: done ? gold : textMain,
                                  fontFamily: "'Space Grotesk', sans-serif",
                                  textDecoration: done
                                    ? "line-through"
                                    : "none",
                                }}
                              >
                                {ex.name}
                              </span>
                              <span
                                style={{
                                  color: gold,
                                  fontSize: "0.78rem",
                                  fontWeight: 600,
                                  fontFamily: "'Space Grotesk', sans-serif",
                                }}
                              >
                                {ex.sets}×{ex.reps}
                              </span>
                            </div>
                            <p
                              style={{
                                color: textSub,
                                fontSize: "0.72rem",
                                fontFamily: "'Space Grotesk', sans-serif",
                                marginTop: 2,
                              }}
                            >
                              Rest {ex.restSecs}s · ~{ex.durationMins} min
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedTip(expanded ? null : idx);
                            }}
                            style={{
                              marginLeft: 8,
                              color: textSub,
                              background: "transparent",
                              border: "none",
                              cursor: "pointer",
                              padding: 4,
                            }}
                            data-ocid="training.toggle"
                          >
                            {expanded ? (
                              <ChevronUp size={16} />
                            ) : (
                              <ChevronDown size={16} />
                            )}
                          </button>
                        </button>
                        {expanded && (
                          <div
                            style={{
                              padding: "0 14px 12px 50px",
                              borderTop: `1px solid ${borderCol}`,
                            }}
                          >
                            {ex.tips.map((tip) => (
                              <p
                                key={tip}
                                style={{
                                  fontSize: "0.78rem",
                                  color: textSub,
                                  fontFamily: "'Space Grotesk', sans-serif",
                                  marginTop: 4,
                                  display: "flex",
                                  alignItems: "flex-start",
                                  gap: 6,
                                }}
                              >
                                <span style={{ color: gold, fontWeight: 700 }}>
                                  •
                                </span>
                                {tip}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* General advice */}
              <div
                style={{
                  padding: "14px",
                  borderRadius: 12,
                  background: navy,
                  border: `1px solid ${gold}25`,
                }}
              >
                <p
                  style={{
                    color: gold,
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    fontFamily: "'Space Grotesk', sans-serif",
                    marginBottom: 6,
                  }}
                >
                  Coach Advice
                </p>
                <p
                  style={{
                    color: "oklch(0.75 0.006 80)",
                    fontSize: "0.82rem",
                    lineHeight: 1.55,
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  {plan.advice}
                </p>
              </div>

              {/* Cooldown */}
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: isDark
                    ? "oklch(0.18 0.030 265)"
                    : "oklch(0.97 0.002 265)",
                  borderLeft: "3px solid oklch(0.60 0.14 145)",
                }}
              >
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: textSub,
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  <span
                    style={{ color: "oklch(0.60 0.14 145)", fontWeight: 700 }}
                  >
                    Cool-down:{" "}
                  </span>
                  {plan.cooldown}
                </p>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: REVIEW ── */}
          {step === "review" && (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Trophy card */}
              <div
                style={{
                  padding: "28px 20px",
                  borderRadius: 20,
                  background: navy,
                  border: `2px solid ${gold}`,
                  textAlign: "center",
                  boxShadow: `0 8px 32px ${gold}20`,
                }}
              >
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    background: `${gold}20`,
                    border: `2px solid ${gold}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 12px",
                  }}
                >
                  <Trophy size={28} color={gold} />
                </div>
                <h2
                  style={{
                    color: gold,
                    fontSize: "1.3rem",
                    fontWeight: 700,
                    fontFamily: "'Playfair Display', serif",
                    marginBottom: 4,
                  }}
                >
                  Session Complete!
                </h2>
                <p
                  style={{
                    color: "oklch(0.70 0.010 265)",
                    fontSize: "0.85rem",
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  {selectedBodyPart.label} · {fitnessLevel} ·{" "}
                  {formatTime(elapsed)} of {formatTime(targetSecs)}
                </p>
              </div>

              {/* Progress bar */}
              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: 12,
                  background: bgCard,
                  border: `1px solid ${borderCol}`,
                }}
              >
                <div className="flex justify-between mb-2">
                  <span
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      color: textSub,
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                  >
                    Time Completed
                  </span>
                  <span
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      color: gold,
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                  >
                    {Math.round((elapsed / targetSecs) * 100)}%
                  </span>
                </div>
                <div
                  style={{
                    height: 8,
                    borderRadius: 4,
                    background: isDark
                      ? "oklch(0.22 0.030 265)"
                      : "oklch(0.92 0.003 265)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${Math.round((elapsed / targetSecs) * 100)}%`,
                      background: `linear-gradient(90deg, ${gold}, oklch(0.80 0.14 75))`,
                      borderRadius: 4,
                      transition: "width 1s ease",
                    }}
                  />
                </div>
                {plan && (
                  <p
                    style={{
                      color: textSub,
                      fontSize: "0.78rem",
                      marginTop: 8,
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                  >
                    {completedExercises.length}/{plan.exercises.length}{" "}
                    exercises marked complete
                  </p>
                )}
              </div>

              {/* Review text */}
              <div
                style={{
                  borderRadius: 14,
                  background: isDark
                    ? "oklch(0.15 0.025 265)"
                    : "oklch(0.98 0.002 265)",
                  border: `1px solid ${borderCol}`,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "12px 16px",
                    background: navy,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Star size={16} color={gold} fill={gold} />
                  <span
                    style={{
                      color: gold,
                      fontWeight: 700,
                      fontSize: "0.88rem",
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                  >
                    Your Session Review
                  </span>
                </div>
                <div style={{ padding: "16px" }}>
                  {reviewText.split(" | ").map((line, idx, arr) => (
                    <div
                      key={line.slice(0, 30)}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                        marginBottom: idx < arr.length - 1 ? 12 : 0,
                      }}
                    >
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: gold,
                          marginTop: 6,
                          flexShrink: 0,
                        }}
                      />
                      <p
                        style={{
                          fontSize: "0.87rem",
                          color: textMain,
                          lineHeight: 1.6,
                          fontFamily: "'Space Grotesk', sans-serif",
                        }}
                      >
                        {line}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next session tips */}
              {plan && (
                <div
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    background: navy,
                    border: `1px solid ${gold}25`,
                  }}
                >
                  <p
                    style={{
                      color: gold,
                      fontWeight: 700,
                      fontSize: "0.82rem",
                      fontFamily: "'Space Grotesk', sans-serif",
                      marginBottom: 8,
                    }}
                  >
                    Next Session Tips
                  </p>
                  <p
                    style={{
                      color: "oklch(0.60 0.010 265)",
                      fontSize: "0.78rem",
                      fontFamily: "'Space Grotesk', sans-serif",
                      lineHeight: 1.5,
                    }}
                  >
                    Cool-down now:{" "}
                    <span style={{ color: "oklch(0.70 0.008 80)" }}>
                      {plan.cooldown}
                    </span>
                  </p>
                  <p
                    style={{
                      color: "oklch(0.60 0.010 265)",
                      fontSize: "0.78rem",
                      fontFamily: "'Space Grotesk', sans-serif",
                      lineHeight: 1.5,
                      marginTop: 6,
                    }}
                  >
                    Recovery: Allow 48 hours before training{" "}
                    {selectedBodyPart.label.toLowerCase()} again. Hydrate and
                    eat protein within 45 minutes.
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={resetAll}
                  style={{
                    flex: 1,
                    padding: "14px",
                    borderRadius: 12,
                    background: bgCard,
                    border: `2px solid ${borderCol}`,
                    color: textMain,
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                  data-ocid="training.secondary_button"
                >
                  New Session
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPlan(BODY_PLANS[selectedBodyPart.key][fitnessLevel]);
                    setElapsed(0);
                    setCompletedExercises([]);
                    setTargetSecs(
                      BODY_PLANS[selectedBodyPart.key][fitnessLevel].totalMins *
                        60,
                    );
                    setStep("workout");
                    setIsRunning(true);
                  }}
                  style={{
                    flex: 1,
                    padding: "14px",
                    borderRadius: 12,
                    background: navy,
                    border: `2px solid ${gold}`,
                    color: gold,
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                  data-ocid="training.primary_button"
                >
                  Repeat Session
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default TrainingPage;
