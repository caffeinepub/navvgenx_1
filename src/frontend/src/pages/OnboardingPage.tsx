import { useCamera } from "@/camera/useCamera";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Check, ChevronRight, User } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { AccountData } from "./AccountPage";

interface OnboardingPageProps {
  onComplete: () => void;
}

const gold = "oklch(0.78 0.15 75)";
const navy = "oklch(0.10 0.020 265)";

export function OnboardingPage({ onComplete }: OnboardingPageProps) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<AccountData>({
    name: "",
    mobile: "",
    gender: "",
    language: "en",
    age: "",
    photoUrl: "",
  });
  const [showCamera, setShowCamera] = useState(false);
  const galleryRef = useRef<HTMLInputElement>(null);

  const {
    isActive: _cameraActive,
    startCamera,
    stopCamera,
    capturePhoto,
    videoRef,
    canvasRef,
  } = useCamera({ facingMode: "user" });

  useEffect(() => {
    if (showCamera) {
      startCamera().catch(() => {
        toast.error("Camera access denied.");
        setShowCamera(false);
      });
    }
  }, [showCamera, startCamera]);

  const handleCapture = async () => {
    const file = await capturePhoto();
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        setForm((prev) => ({ ...prev, photoUrl: url }));
        stopCamera();
        setShowCamera(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGallery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      setForm((prev) => ({ ...prev, photoUrl: url }));
    };
    reader.readAsDataURL(file);
    if (galleryRef.current) galleryRef.current.value = "";
  };

  const handleFinish = () => {
    // Save account data
    localStorage.setItem("navvgenx-account", JSON.stringify(form));
    // Mark onboarding done
    localStorage.setItem("navvgenx_onboarding_done", "1");
    toast.success("Welcome to NavvGenX AI! 🎉");
    onComplete();
  };

  const steps = [
    { label: "Name & Photo" },
    { label: "Contact & Age" },
    { label: "Preferences" },
  ];

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
      style={{ background: "oklch(0.08 0.022 265)" }}
    >
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <svg
          width="56"
          height="56"
          viewBox="0 0 40 40"
          fill="none"
          aria-label="NavvGenX"
        >
          <title>NavvGenX</title>
          <circle
            cx="20"
            cy="20"
            r="19"
            stroke={gold}
            strokeWidth="1.5"
            fill={navy}
          />
          <text
            x="20"
            y="27"
            textAnchor="middle"
            fontFamily="'Space Grotesk', Arial, sans-serif"
            fontWeight="700"
            fontSize="10"
            fill={gold}
          >
            Navv
          </text>
        </svg>
        <h1
          className="mt-3 text-2xl font-bold tracking-tight"
          style={{ color: gold, fontFamily: "'Playfair Display', serif" }}
        >
          Welcome to NavvGenX AI
        </h1>
        <p className="mt-1 text-sm" style={{ color: "oklch(0.65 0.02 265)" }}>
          Let's set up your profile — takes just 30 seconds
        </p>
      </motion.div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s.label} className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
              style={{
                background: i <= step ? gold : "oklch(0.18 0.02 265)",
                color: i <= step ? navy : "oklch(0.45 0.02 265)",
              }}
            >
              {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
            </div>
            {i < steps.length - 1 && (
              <div
                className="w-8 h-0.5 transition-all"
                style={{ background: i < step ? gold : "oklch(0.18 0.02 265)" }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Card */}
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="w-full max-w-sm rounded-3xl p-6 space-y-5"
        style={{
          background: "oklch(0.11 0.020 265)",
          border: `1px solid ${gold}33`,
          boxShadow: "0 24px 64px oklch(0.05 0.02 265 / 0.8)",
        }}
      >
        {step === 0 && (
          <>
            {/* Profile photo */}
            <div className="flex flex-col items-center gap-3">
              <div
                className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center"
                style={{
                  background: "oklch(0.15 0.02 265)",
                  border: `2px solid ${gold}55`,
                }}
              >
                {form.photoUrl ? (
                  <img
                    src={form.photoUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10" style={{ color: gold }} />
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCamera(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                  style={{ background: `${gold}20`, color: gold }}
                  data-ocid="onboarding.upload_button"
                >
                  <Camera className="w-3.5 h-3.5" /> Take Photo
                </button>
                <button
                  type="button"
                  onClick={() => galleryRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                  style={{
                    background: "oklch(0.18 0.02 265)",
                    color: "oklch(0.7 0.02 265)",
                  }}
                  data-ocid="onboarding.upload_button"
                >
                  Gallery
                </button>
              </div>
              <input
                ref={galleryRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleGallery}
              />
            </div>

            {/* Camera preview */}
            <AnimatePresence>
              {showCamera && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative rounded-2xl overflow-hidden"
                >
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full aspect-square object-cover rounded-2xl"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleCapture}
                      className="px-4 py-2 rounded-xl font-semibold text-sm"
                      style={{ background: gold, color: navy }}
                      data-ocid="onboarding.primary_button"
                    >
                      Capture
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        stopCamera();
                        setShowCamera(false);
                      }}
                      className="px-4 py-2 rounded-xl text-sm"
                      style={{
                        background: "oklch(0.18 0.02 265)",
                        color: "oklch(0.7 0.02 265)",
                      }}
                      data-ocid="onboarding.cancel_button"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-3">
              <div>
                <Label
                  className="text-xs font-semibold"
                  style={{ color: gold }}
                >
                  Your Name
                </Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="Enter your full name"
                  className="mt-1 bg-muted/30 border-border"
                  data-ocid="onboarding.input"
                />
              </div>
            </div>
          </>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <div>
              <Label className="text-xs font-semibold" style={{ color: gold }}>
                Mobile Number
              </Label>
              <Input
                value={form.mobile}
                onChange={(e) =>
                  setForm((p) => ({ ...p, mobile: e.target.value }))
                }
                placeholder="+91 XXXXX XXXXX"
                type="tel"
                className="mt-1 bg-muted/30 border-border"
                data-ocid="onboarding.input"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold" style={{ color: gold }}>
                Age
              </Label>
              <Input
                value={form.age}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    age: e.target.value.replace(/\D/g, ""),
                  }))
                }
                placeholder="Enter your age"
                type="number"
                min="1"
                max="120"
                className="mt-1 bg-muted/30 border-border"
                data-ocid="onboarding.input"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold" style={{ color: gold }}>
                Gender
              </Label>
              <div className="mt-1 grid grid-cols-2 gap-2">
                {["Male", "Female", "Other", "Prefer not to say"].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() =>
                      setForm((p) => ({ ...p, gender: g.toLowerCase() }))
                    }
                    className="py-2 px-3 rounded-xl text-xs font-medium transition-all"
                    style={{
                      background:
                        form.gender === g.toLowerCase()
                          ? `${gold}25`
                          : "oklch(0.15 0.02 265)",
                      color:
                        form.gender === g.toLowerCase()
                          ? gold
                          : "oklch(0.6 0.02 265)",
                      border: `1px solid ${form.gender === g.toLowerCase() ? `${gold}66` : "transparent"}`,
                    }}
                    data-ocid="onboarding.radio"
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-semibold" style={{ color: gold }}>
                Preferred Language
              </Label>
              <div className="mt-2 grid grid-cols-2 gap-3">
                {[
                  { value: "en", label: "English", sub: "English interface" },
                  { value: "hi", label: "हिंदी", sub: "Hindi interface" },
                ].map((lang) => (
                  <button
                    key={lang.value}
                    type="button"
                    onClick={() =>
                      setForm((p) => ({ ...p, language: lang.value }))
                    }
                    className="py-3 px-4 rounded-2xl text-left transition-all"
                    style={{
                      background:
                        form.language === lang.value
                          ? `${gold}20`
                          : "oklch(0.15 0.02 265)",
                      border: `1.5px solid ${form.language === lang.value ? gold : "oklch(0.20 0.02 265)"}`,
                    }}
                    data-ocid="onboarding.radio"
                  >
                    <p
                      className="font-bold text-sm"
                      style={{
                        color:
                          form.language === lang.value
                            ? gold
                            : "oklch(0.75 0.02 265)",
                      }}
                    >
                      {lang.label}
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "oklch(0.5 0.02 265)" }}
                    >
                      {lang.sub}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div
              className="rounded-2xl p-4 text-center"
              style={{ background: `${gold}12`, border: `1px solid ${gold}33` }}
            >
              <p className="text-sm font-medium" style={{ color: gold }}>
                You're all set!
              </p>
              <p
                className="text-xs mt-1"
                style={{ color: "oklch(0.55 0.02 265)" }}
              >
                You can update these settings anytime in Account
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Navigation buttons */}
      <div className="mt-6 flex gap-3 w-full max-w-sm">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="flex-1 py-3 rounded-2xl text-sm font-semibold"
            style={{
              background: "oklch(0.15 0.02 265)",
              color: "oklch(0.65 0.02 265)",
            }}
            data-ocid="onboarding.secondary_button"
          >
            Back
          </button>
        )}
        {step === 0 && (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            className="flex-1 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2"
            style={{ background: gold, color: navy }}
            data-ocid="onboarding.primary_button"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        )}
        {step === 1 && (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            className="flex-1 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2"
            style={{ background: gold, color: navy }}
            data-ocid="onboarding.primary_button"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        )}
        {step === 2 && (
          <Button
            onClick={handleFinish}
            className="flex-1 py-3 rounded-2xl text-sm font-bold"
            style={{ background: gold, color: navy }}
            data-ocid="onboarding.submit_button"
          >
            <Check className="w-4 h-4 mr-2" /> Get Started
          </Button>
        )}
      </div>

      {/* Skip */}
      <button
        type="button"
        onClick={() => {
          localStorage.setItem("navvgenx_onboarding_done", "1");
          onComplete();
        }}
        className="mt-4 text-xs"
        style={{ color: "oklch(0.4 0.02 265)" }}
        data-ocid="onboarding.secondary_button"
      >
        Skip for now
      </button>
    </div>
  );
}
