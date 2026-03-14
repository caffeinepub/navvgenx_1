import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Logo } from "../components/Logo";

interface LoginPageProps {
  onLogin: () => void;
}

const particles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: `${(i * 5.26) % 100}%`,
  top: `${(i * 8.7) % 100}%`,
  size: 5 + (i % 5) * 5,
  delay: `${(i * 0.35) % 3}s`,
  duration: `${4 + (i % 4)}s`,
  color:
    i % 5 === 0
      ? "rgba(99,102,241,0.30)"
      : i % 5 === 1
        ? "rgba(139,92,246,0.25)"
        : i % 5 === 2
          ? "rgba(13,148,136,0.22)"
          : i % 5 === 3
            ? "rgba(245,158,11,0.22)"
            : "rgba(236,72,153,0.20)",
}));

export function LoginPage({ onLogin }: LoginPageProps) {
  const [tab, setTab] = useState<"login" | "signup">("login");

  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [loginErrors, setLoginErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  // Signup form
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");
  const [showSignupPw, setShowSignupPw] = useState(false);
  const [signupErrors, setSignupErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirm?: string;
  }>({});

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animated mesh background on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animFrame: number;
    let t = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      t += 0.004;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Base gradient
      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, `oklch(0.28 0.14 ${260 + Math.sin(t) * 15})`);
      bg.addColorStop(0.35, `oklch(0.22 0.12 ${290 + Math.cos(t * 0.8) * 20})`);
      bg.addColorStop(0.7, `oklch(0.20 0.10 ${185 + Math.sin(t * 0.6) * 10})`);
      bg.addColorStop(1, `oklch(0.18 0.08 ${330 + Math.cos(t * 0.5) * 15})`);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Orbs
      const orbs = [
        { x: 0.2, y: 0.3, r: 0.3, color: "rgba(99,102,241,0.18)", phase: 0 },
        { x: 0.8, y: 0.2, r: 0.25, color: "rgba(139,92,246,0.15)", phase: 1.2 },
        { x: 0.5, y: 0.7, r: 0.28, color: "rgba(13,148,136,0.14)", phase: 2.4 },
        {
          x: 0.85,
          y: 0.75,
          r: 0.22,
          color: "rgba(245,158,11,0.12)",
          phase: 0.8,
        },
        { x: 0.15, y: 0.8, r: 0.2, color: "rgba(236,72,153,0.13)", phase: 1.8 },
      ];

      for (const orb of orbs) {
        const cx = (orb.x + Math.sin(t + orb.phase) * 0.06) * w;
        const cy = (orb.y + Math.cos(t * 0.7 + orb.phase) * 0.05) * h;
        const r = orb.r * Math.min(w, h);
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        grad.addColorStop(0, orb.color);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      }

      animFrame = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const validateLogin = () => {
    const errs: { email?: string; password?: string } = {};
    if (!loginEmail) errs.email = "Email is required";
    else if (!/^[^@]+@[^@]+\.[^@]+$/.test(loginEmail))
      errs.email = "Enter a valid email";
    if (!loginPassword) errs.password = "Password is required";
    else if (loginPassword.length < 6)
      errs.password = "Password must be at least 6 characters";
    return errs;
  };

  const validateSignup = () => {
    const errs: {
      name?: string;
      email?: string;
      password?: string;
      confirm?: string;
    } = {};
    if (!signupName.trim()) errs.name = "Name is required";
    if (!signupEmail) errs.email = "Email is required";
    else if (!/^[^@]+@[^@]+\.[^@]+$/.test(signupEmail))
      errs.email = "Enter a valid email";
    if (!signupPassword) errs.password = "Password is required";
    else if (signupPassword.length < 6)
      errs.password = "Password must be at least 6 characters";
    if (!signupConfirm) errs.confirm = "Please confirm your password";
    else if (signupConfirm !== signupPassword)
      errs.confirm = "Passwords do not match";
    return errs;
  };

  const handleLogin = () => {
    const errs = validateLogin();
    setLoginErrors(errs);
    if (Object.keys(errs).length > 0) return;
    localStorage.setItem(
      "navvgenx-user",
      JSON.stringify({ email: loginEmail, rememberMe, loggedInAt: Date.now() }),
    );
    onLogin();
  };

  const handleSignup = () => {
    const errs = validateSignup();
    setSignupErrors(errs);
    if (Object.keys(errs).length > 0) return;
    localStorage.setItem(
      "navvgenx-user",
      JSON.stringify({
        name: signupName,
        email: signupEmail,
        loggedInAt: Date.now(),
      }),
    );
    onLogin();
  };

  return (
    <div className="min-h-screen flex" data-ocid="login.panel">
      {/* Left hero panel — desktop only */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        {/* Particles */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              background: p.color,
              animation: `float-particle ${p.duration} ease-in-out infinite`,
              animationDelay: p.delay,
            }}
          />
        ))}

        <div className="relative z-10">
          <Logo size="lg" />
        </div>

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative z-10"
        >
          <h2 className="font-bricolage font-extrabold text-4xl text-white leading-tight mb-4">
            Your AI companion for everything
          </h2>
          <p className="text-white/70 text-lg font-jakarta leading-relaxed mb-8">
            Ask any question, search any topic, get expert advice — all in one
            place.
          </p>
          <div className="flex flex-col gap-3">
            {[
              { color: "bg-indigo-400", text: "Answers like ChatGPT" },
              { color: "bg-teal-400", text: "Search like Google" },
              { color: "bg-amber-400", text: "Advice for life's challenges" },
              { color: "bg-pink-400", text: "Premium AI experience" },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${f.color}`} />
                <span className="text-white/80 font-jakarta text-sm">
                  {f.text}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="relative z-10">
          <p className="text-white/40 text-xs font-jakarta">
            &copy; {new Date().getFullYear()} NavvGenX AI
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-br from-slate-50 via-indigo-50/40 to-violet-50/30 dark:from-gray-950 dark:via-indigo-950/40 dark:to-violet-950/20">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8">
          <Logo size="lg" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="glass-card rounded-3xl p-8 shadow-2xl">
            <div className="mb-6">
              <h1 className="font-bricolage font-extrabold text-2xl text-foreground mb-1">
                {tab === "login" ? "Welcome back" : "Create account"}
              </h1>
              <p className="text-muted-foreground font-jakarta text-sm">
                {tab === "login"
                  ? "Sign in to your NavvGenX account"
                  : "Join NavvGenX — it's free"}
              </p>
            </div>

            <Tabs
              value={tab}
              onValueChange={(v) => setTab(v as "login" | "signup")}
            >
              <TabsList
                className="w-full mb-6 rounded-2xl"
                data-ocid="login.tab"
              >
                <TabsTrigger
                  value="login"
                  className="flex-1 rounded-xl"
                  data-ocid="login.tab"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="flex-1 rounded-xl"
                  data-ocid="login.tab"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>

              {/* ─── Login ─── */}
              <TabsContent value="login" className="space-y-4 mt-0">
                <div className="space-y-1">
                  <Label
                    htmlFor="login-email"
                    className="font-jakarta text-sm font-medium"
                  >
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="pl-10 rounded-xl"
                      data-ocid="login.input"
                    />
                  </div>
                  {loginErrors.email && (
                    <p
                      className="text-xs text-destructive font-jakarta"
                      data-ocid="login.error_state"
                    >
                      {loginErrors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label
                    htmlFor="login-password"
                    className="font-jakarta text-sm font-medium"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type={showLoginPw ? "text" : "password"}
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                      className="pl-10 pr-10 rounded-xl"
                      data-ocid="login.input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPw(!showLoginPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showLoginPw ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {loginErrors.password && (
                    <p
                      className="text-xs text-destructive font-jakarta"
                      data-ocid="login.error_state"
                    >
                      {loginErrors.password}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember-me"
                    checked={rememberMe}
                    onCheckedChange={(v) => setRememberMe(!!v)}
                    data-ocid="login.checkbox"
                  />
                  <Label
                    htmlFor="remember-me"
                    className="font-jakarta text-sm text-muted-foreground cursor-pointer"
                  >
                    Remember me
                  </Label>
                </div>

                <Button
                  onClick={handleLogin}
                  className="w-full navvgenx-rainbow-gradient text-white rounded-xl h-11 font-jakarta font-semibold text-sm"
                  data-ocid="login.submit_button"
                >
                  Sign In
                </Button>
              </TabsContent>

              {/* ─── Signup ─── */}
              <TabsContent value="signup" className="space-y-4 mt-0">
                <div className="space-y-1">
                  <Label
                    htmlFor="signup-name"
                    className="font-jakarta text-sm font-medium"
                  >
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Your full name"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      className="pl-10 rounded-xl"
                      data-ocid="login.input"
                    />
                  </div>
                  {signupErrors.name && (
                    <p
                      className="text-xs text-destructive font-jakarta"
                      data-ocid="login.error_state"
                    >
                      {signupErrors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label
                    htmlFor="signup-email"
                    className="font-jakarta text-sm font-medium"
                  >
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      className="pl-10 rounded-xl"
                      data-ocid="login.input"
                    />
                  </div>
                  {signupErrors.email && (
                    <p
                      className="text-xs text-destructive font-jakarta"
                      data-ocid="login.error_state"
                    >
                      {signupErrors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label
                    htmlFor="signup-password"
                    className="font-jakarta text-sm font-medium"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type={showSignupPw ? "text" : "password"}
                      placeholder="Min. 6 characters"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className="pl-10 pr-10 rounded-xl"
                      data-ocid="login.input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPw(!showSignupPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showSignupPw ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {signupErrors.password && (
                    <p
                      className="text-xs text-destructive font-jakarta"
                      data-ocid="login.error_state"
                    >
                      {signupErrors.password}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label
                    htmlFor="signup-confirm"
                    className="font-jakarta text-sm font-medium"
                  >
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signup-confirm"
                      type="password"
                      placeholder="Repeat password"
                      value={signupConfirm}
                      onChange={(e) => setSignupConfirm(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSignup()}
                      className="pl-10 rounded-xl"
                      data-ocid="login.input"
                    />
                  </div>
                  {signupErrors.confirm && (
                    <p
                      className="text-xs text-destructive font-jakarta"
                      data-ocid="login.error_state"
                    >
                      {signupErrors.confirm}
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleSignup}
                  className="w-full navvgenx-rainbow-gradient text-white rounded-xl h-11 font-jakarta font-semibold text-sm"
                  data-ocid="login.submit_button"
                >
                  Create Account
                </Button>
              </TabsContent>
            </Tabs>

            <p className="text-center text-xs text-muted-foreground font-jakarta mt-4">
              By continuing you agree to NavvGenX&apos;s Terms of Service.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
