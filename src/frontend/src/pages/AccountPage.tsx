import { useCamera } from "@/camera/useCamera";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bot,
  Camera,
  Check,
  Edit3,
  Image,
  Loader2,
  Save,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { t } from "../utils/i18n";

export interface AccountData {
  name: string;
  mobile: string;
  gender: string;
  age: string;
  photoUrl: string;
}

function loadAccount(): AccountData {
  try {
    const saved = localStorage.getItem("navvura-account");
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return {
    name: "",
    mobile: "",
    gender: "",
    age: "",
    photoUrl: "",
  };
}

function saveAccount(data: AccountData): void {
  localStorage.setItem("navvura-account", JSON.stringify(data));
}

interface AccountPageProps {
  onSaved?: () => void;
}

export function AccountPage({ onSaved }: AccountPageProps) {
  const [form, setForm] = useState<AccountData>(loadAccount);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [assistantName, setAssistantName] = useState(
    () => localStorage.getItem("navvura-assistant-name") || "NAVVURA",
  );
  const [assistantNameSaved, setAssistantNameSaved] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const galleryRef = useRef<HTMLInputElement>(null);

  const {
    isActive: cameraActive,
    isSupported: cameraSupported,
    error: cameraError,
    isLoading: cameraLoading,
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

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    setIsSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      saveAccount(form);
      setSaved(true);
      toast.success("Profile saved! 🎉");
      setTimeout(() => setSaved(false), 3000);
      onSaved?.();
    } finally {
      setIsSaving(false);
    }
  };

  const gold = "oklch(0.78 0.15 75)";
  const navy = "oklch(0.10 0.020 265)";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="font-bricolage font-bold text-3xl navvgenx-gradient-text mb-2">
            {t("myAccount")}
          </h1>
          <p className="text-muted-foreground text-sm font-jakarta">
            Manage your NAVVURA AI profile
          </p>
        </motion.div>

        {/* Profile Photo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="relative group">
            <Avatar className="w-28 h-28 ring-4 ring-offset-4 ring-offset-background">
              <AvatarImage src={form.photoUrl} alt={form.name || "Profile"} />
              <AvatarFallback
                className="text-3xl font-bricolage font-bold"
                style={{ background: navy, color: gold }}
              >
                {form.name ? (
                  form.name[0].toUpperCase()
                ) : (
                  <User className="w-10 h-10" />
                )}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => setShowCamera(true)}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-lg"
              style={{ background: gold, color: navy }}
              data-ocid="account.upload_button"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (!cameraSupported) {
                  toast.error("Camera not supported");
                  return;
                }
                setShowCamera(true);
              }}
              className="gap-1.5"
              data-ocid="account.secondary_button"
            >
              <Camera className="w-3.5 h-3.5" /> {t("takePhoto")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => galleryRef.current?.click()}
              className="gap-1.5"
              data-ocid="account.button"
            >
              <Image className="w-3.5 h-3.5" /> {t("chooseGallery")}
            </Button>
          </div>
          <input
            ref={galleryRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleGallery}
          />
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-card border-border">
            <CardHeader>
              <CardTitle className="font-bricolage text-lg">
                {t("profileSetup")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Name */}
              <div className="space-y-1.5">
                <Label htmlFor="acc-name" className="font-jakarta text-sm">
                  {t("name")}
                </Label>
                <Input
                  id="acc-name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="Your full name"
                  data-ocid="account.input"
                />
              </div>

              {/* Mobile */}
              <div className="space-y-1.5">
                <Label htmlFor="acc-mobile" className="font-jakarta text-sm">
                  {t("mobile")}
                </Label>
                <Input
                  id="acc-mobile"
                  type="tel"
                  value={form.mobile}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, mobile: e.target.value }))
                  }
                  placeholder="+91 XXXXX XXXXX"
                  data-ocid="account.input"
                />
              </div>

              {/* Gender + Language row */}
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <Label className="font-jakarta text-sm">{t("gender")}</Label>
                  <Select
                    value={form.gender}
                    onValueChange={(v) => setForm((p) => ({ ...p, gender: v }))}
                  >
                    <SelectTrigger data-ocid="account.select">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">{t("male")}</SelectItem>
                      <SelectItem value="female">{t("female")}</SelectItem>
                      <SelectItem value="other">{t("other")}</SelectItem>
                      <SelectItem value="prefer_not">
                        {t("preferNotToSay")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Age */}
              <div className="space-y-1.5">
                <Label htmlFor="acc-age" className="font-jakarta text-sm">
                  {t("age")}
                  <Badge variant="secondary" className="ml-2 text-[10px]">
                    Saved permanently
                  </Badge>
                </Label>
                <Input
                  id="acc-age"
                  type="number"
                  min={1}
                  max={120}
                  value={form.age}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, age: e.target.value }))
                  }
                  placeholder="Your age"
                  data-ocid="account.input"
                />
              </div>

              {/* AI Assistant Name */}
              <div
                className="rounded-2xl p-4 space-y-3"
                style={{
                  background: "oklch(0.12 0.02 265 / 0.6)",
                  border: "1px solid oklch(0.78 0.15 75 / 0.25)",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Bot
                    className="w-4 h-4"
                    style={{ color: "oklch(0.78 0.15 75)" }}
                  />
                  <span
                    className="font-semibold text-sm"
                    style={{
                      color: "oklch(0.78 0.15 75)",
                      fontFamily: "Playfair Display, serif",
                    }}
                  >
                    AI Assistant
                  </span>
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="assistant-name"
                    className="font-jakarta text-sm"
                  >
                    Assistant Name
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="assistant-name"
                      value={assistantName}
                      onChange={(e) => setAssistantName(e.target.value)}
                      placeholder="Navv"
                      data-ocid="account.input"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        localStorage.setItem(
                          "navvura-assistant-name",
                          assistantName.trim() || "NAVVURA",
                        );
                        setAssistantNameSaved(true);
                        setTimeout(() => setAssistantNameSaved(false), 2000);
                        toast.success("Assistant name saved!");
                      }}
                      style={{
                        background: "oklch(0.78 0.15 75)",
                        color: "#0a1628",
                        minWidth: "70px",
                      }}
                      data-ocid="account.save_button"
                    >
                      {assistantNameSaved ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        "Save"
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This is the name your AI assistant will respond to
                  </p>
                </div>
              </div>

              {/* Save button */}
              <Button
                className="w-full navvgenx-gradient-btn font-semibold mt-2"
                onClick={handleSave}
                disabled={isSaving}
                data-ocid="account.save_button"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...
                  </>
                ) : saved ? (
                  <>
                    <Check className="w-4 h-4 mr-2" /> Saved!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" /> {t("saveProfile")}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Camera Modal */}
      <AnimatePresence>
        {showCamera && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="glass-card rounded-3xl p-6 max-w-md mx-4 w-full"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bricolage font-bold text-lg">
                  {t("takePhoto")}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setShowCamera(false);
                  }}
                  className="text-muted-foreground hover:text-foreground"
                  data-ocid="account.camera.close_button"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {cameraError && (
                <p className="text-red-500 text-sm mb-3">
                  {cameraError.message}
                </p>
              )}
              <video
                ref={videoRef}
                className="w-full rounded-2xl bg-black aspect-video object-cover"
                autoPlay
                muted
                playsInline
              />
              <canvas ref={canvasRef} className="hidden" />
              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setShowCamera(false);
                  }}
                  className="flex-1 border border-border rounded-xl py-2.5 text-muted-foreground text-sm hover:bg-muted/50"
                  data-ocid="account.camera.cancel_button"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCapture}
                  disabled={!cameraActive || cameraLoading}
                  className="flex-1 navvgenx-gradient-btn py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
                  data-ocid="account.camera.submit_button"
                >
                  <Camera className="w-4 h-4 inline mr-1" />
                  {cameraLoading ? "Starting..." : "Capture"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
