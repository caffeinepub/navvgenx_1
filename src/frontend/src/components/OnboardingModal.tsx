import { Camera, Loader2, Upload, User } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface OnboardingModalProps {
  onDone: () => void;
}

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "hi", label: "हिंदी (Hindi)" },
];

export function OnboardingModal({ onDone }: OnboardingModalProps) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [language, setLanguage] = useState("en");
  const [photoUrl, setPhotoUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      const account = {
        name: name.trim(),
        mobile: mobile.trim(),
        gender,
        age: age.trim(),
        language,
        photoUrl,
      };
      localStorage.setItem("navvgenx-account", JSON.stringify(account));
      localStorage.setItem("navvgenx-onboarded", "1");
      // Apply language preference
      if (language === "hi") {
        localStorage.setItem("navvgenx-lang", "hi");
      } else {
        localStorage.setItem("navvgenx-lang", "en");
      }
      toast.success(`Welcome to NavvGenX AI, ${name.trim()}!`);
      setIsSaving(false);
      onDone();
    }, 400);
  };

  const inputClass =
    "w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-yellow-400/50 placeholder:text-white/40 transition-colors";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "oklch(0.07 0.018 265 / 0.97)" }}
      data-ocid="onboarding.modal"
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="w-full max-w-md rounded-3xl p-8 overflow-y-auto max-h-[90vh]"
        style={{
          background: "oklch(0.10 0.020 265)",
          border: "1px solid oklch(0.78 0.15 75 / 0.25)",
          boxShadow: "0 0 60px oklch(0.78 0.15 75 / 0.15)",
        }}
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.15 0.025 265), oklch(0.20 0.030 265))",
              border: "2px solid oklch(0.78 0.15 75 / 0.60)",
              boxShadow: "0 0 20px oklch(0.78 0.15 75 / 0.30)",
            }}
          >
            <span
              className="font-bold text-2xl"
              style={{
                color: "oklch(0.78 0.15 75)",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              N
            </span>
          </div>
          <h2
            className="text-xl font-bold mb-1"
            style={{
              color: "oklch(0.78 0.15 75)",
              fontFamily: "'Playfair Display', serif",
            }}
          >
            Welcome to NavvGenX AI
          </h2>
          <p className="text-sm" style={{ color: "oklch(0.75 0.006 80)" }}>
            Set up your account to personalize your experience
          </p>
        </div>

        {/* Profile Photo */}
        <div className="flex flex-col items-center gap-3 mb-6">
          <div
            className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center cursor-pointer"
            style={{
              background: "oklch(0.14 0.022 265)",
              border: "2px dashed oklch(0.78 0.15 75 / 0.40)",
            }}
          >
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <User
                className="w-8 h-8"
                style={{ color: "oklch(0.78 0.15 75 / 0.50)" }}
              />
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:opacity-80"
              style={{
                background: "oklch(0.78 0.15 75 / 0.15)",
                color: "oklch(0.78 0.15 75)",
                border: "1px solid oklch(0.78 0.15 75 / 0.30)",
              }}
              data-ocid="onboarding.upload_button"
            >
              <Upload className="w-3 h-3" /> Gallery
            </button>
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:opacity-80"
              style={{
                background: "oklch(0.78 0.15 75 / 0.15)",
                color: "oklch(0.78 0.15 75)",
                border: "1px solid oklch(0.78 0.15 75 / 0.30)",
              }}
              data-ocid="onboarding.upload_button"
            >
              <Camera className="w-3 h-3" /> Camera
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) =>
              e.target.files?.[0] && handlePhotoFile(e.target.files[0])
            }
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="user"
            className="hidden"
            onChange={(e) =>
              e.target.files?.[0] && handlePhotoFile(e.target.files[0])
            }
          />
        </div>

        {/* Form fields */}
        <div className="space-y-3 mb-6">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name *"
            className={inputClass}
            data-ocid="onboarding.input"
          />
          <input
            type="tel"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="Mobile number"
            className={inputClass}
            data-ocid="onboarding.input"
          />
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className={`${inputClass} cursor-pointer`}
            data-ocid="onboarding.select"
          >
            <option value="" className="bg-gray-900">
              Select gender
            </option>
            <option value="male" className="bg-gray-900">
              Male
            </option>
            <option value="female" className="bg-gray-900">
              Female
            </option>
            <option value="other" className="bg-gray-900">
              Other / Prefer not to say
            </option>
          </select>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Your age (e.g. 22)"
            min="1"
            max="120"
            className={inputClass}
            data-ocid="onboarding.input"
          />
          <div>
            <p
              className="text-xs mb-2"
              style={{ color: "oklch(0.75 0.006 80)" }}
            >
              Preferred language
            </p>
            <div className="flex gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.value}
                  type="button"
                  onClick={() => setLanguage(lang.value)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background:
                      language === lang.value
                        ? "oklch(0.78 0.15 75)"
                        : "oklch(0.78 0.15 75 / 0.12)",
                    color:
                      language === lang.value
                        ? "oklch(0.10 0.020 265)"
                        : "oklch(0.78 0.15 75)",
                    border: "1px solid oklch(0.78 0.15 75 / 0.30)",
                  }}
                  data-ocid="onboarding.toggle"
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-98 disabled:opacity-60"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.65 0.18 75), oklch(0.72 0.16 80))",
            color: "oklch(0.10 0.020 265)",
            fontFamily: "'Space Grotesk', sans-serif",
            boxShadow: "0 4px 20px oklch(0.65 0.18 75 / 0.40)",
          }}
          data-ocid="onboarding.submit_button"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Setting up...
            </>
          ) : (
            "Get Started ✨"
          )}
        </button>
      </motion.div>
    </motion.div>
  );
}
