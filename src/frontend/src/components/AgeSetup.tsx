import { useState } from "react";
import { toast } from "sonner";
import { Logo } from "./Logo";

interface Profile {
  age: bigint;
  ageGroup: string;
}

interface AgeSetupProps {
  onComplete: (profile: Profile) => void;
  actor?: {
    createOrUpdateProfile: (
      age: bigint,
      group: string,
      a: string[],
      ts: bigint,
    ) => Promise<unknown>;
  } | null;
}

export function AgeSetup({ onComplete, actor }: AgeSetupProps) {
  const [ageInput, setAgeInput] = useState("");
  const [ageError, setAgeError] = useState("");
  const [ageLoading, setAgeLoading] = useState(false);

  const validateAge = (val: string): string => {
    const trimmed = val.trim();
    if (!trimmed) return "Please enter your age";
    if (!/^\d+$/.test(trimmed)) return "Age must be a whole number";
    const num = Number.parseInt(trimmed, 10);
    if (num < 1 || num > 120) return "Age must be between 1 and 120";
    return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim();
    setAgeInput(val);
    if (ageError) setAgeError(validateAge(val));
  };

  const handleSubmit = async () => {
    const error = validateAge(ageInput);
    if (error) {
      setAgeError(error);
      return;
    }
    const age = Number.parseInt(ageInput.trim(), 10);
    setAgeLoading(true);
    const ageGroup = age < 26 ? "genz" : age < 45 ? "millennial" : "senior";
    const newProfile: Profile = { age: BigInt(age), ageGroup };

    if (actor) {
      try {
        await actor.createOrUpdateProfile(
          BigInt(age),
          ageGroup,
          [],
          BigInt(Date.now()),
        );
      } catch {
        // proceed anyway
      }
    }

    onComplete(newProfile);
    setAgeLoading(false);
    toast.success("Welcome to NAVVURA AI! Personalized just for you.");
  };

  const handleSkip = () => {
    onComplete({ age: BigInt(25), ageGroup: "millennial" });
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          <Logo size="lg" />
        </div>
        <h2 className="font-bricolage font-bold text-2xl text-foreground mb-2">
          Welcome to NAVVURA AI
        </h2>
        <p className="text-muted-foreground text-sm font-space">
          Enter your age once to personalize your experience
        </p>
      </div>
      <div className="space-y-1">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={ageInput}
          onChange={handleChange}
          placeholder="Enter your age (1–120)"
          className={`w-full bg-muted/50 border rounded-xl px-4 py-3 text-foreground text-center text-lg outline-none transition-all font-space ${
            ageError
              ? "border-destructive/70 focus:border-destructive"
              : "border-border focus:border-primary/60"
          }`}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          data-ocid="age.input"
        />
        {ageError && (
          <p
            className="text-destructive text-xs text-center font-space"
            data-ocid="age.error_state"
          >
            {ageError}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={ageLoading}
        className="w-full navvgenx-gradient-btn py-3 rounded-xl font-semibold font-space"
        data-ocid="age.submit_button"
      >
        {ageLoading ? "Setting up..." : "Get Started"}
      </button>
      <button
        type="button"
        onClick={handleSkip}
        className="w-full text-muted-foreground text-sm hover:text-foreground transition-colors py-1 font-space"
      >
        Skip for now
      </button>
    </div>
  );
}
