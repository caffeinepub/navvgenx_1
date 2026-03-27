import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ExternalLink,
  Image as ImageIcon,
  Loader2,
  Mic,
  Video,
  Volume2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Logo } from "../components/Logo";

const gold = "oklch(0.72 0.12 75)";
const navy = "oklch(0.155 0.030 265)";

// ─── Image Generator ─────────────────────────────────────────────────────────
function ImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imgLoading, setImgLoading] = useState(false);
  const [error, setError] = useState("");
  const [fallbackUrls, setFallbackUrls] = useState<string[]>([]);
  const [currentFallbackIndex, setCurrentFallbackIndex] = useState(0);
  const imgTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearImgTimeout = () => {
    if (imgTimeoutRef.current) {
      clearTimeout(imgTimeoutRef.current);
      imgTimeoutRef.current = null;
    }
  };

  const tryNextFallback = () => {
    clearImgTimeout();
    const next = currentFallbackIndex + 1;
    if (next < fallbackUrls.length) {
      setCurrentFallbackIndex(next);
      setImageUrl(fallbackUrls[next]);
      setImgLoading(true);
      // Timeout for this fallback
      imgTimeoutRef.current = setTimeout(() => tryNextFallback(), 15000);
    } else {
      setImgLoading(false);
      setImageUrl(null);
      setError(
        `Could not generate image for "${prompt.trim()}". The AI service may be busy — please try again in a moment.`,
      );
    }
  };

  const generateImage = () => {
    const p = prompt.trim();
    if (!p) {
      toast.error("Enter a description for the image");
      return;
    }
    clearImgTimeout();
    setImageUrl(null);
    setError("");
    setImgLoading(true);
    setCurrentFallbackIndex(0);

    const seed = Math.floor(Math.random() * 999999);
    // Add quality modifiers to improve prompt adherence
    const enhancedPrompt = `${p}, professional photography, high quality, detailed, sharp focus, realistic`;
    const encoded = encodeURIComponent(enhancedPrompt);
    const encodedShort = encodeURIComponent(p);
    const sources = [
      `https://image.pollinations.ai/prompt/${encoded}?width=768&height=512&nologo=true&seed=${seed}&model=flux&enhance=true`,
      `https://image.pollinations.ai/prompt/${encoded}?width=512&height=512&nologo=true&seed=${seed + 1}&model=flux&enhance=true`,
      `https://image.pollinations.ai/prompt/${encodedShort}?width=512&height=512&nologo=true&seed=${seed + 2}&model=turbo`,
      `https://image.pollinations.ai/prompt/${encodedShort}?width=512&height=512&seed=${seed + 3}&nologo=true`,
      `https://picsum.photos/seed/${seed}/512/512`,
    ];
    setFallbackUrls(sources.slice(1));
    setImageUrl(sources[0]);
    // If image doesn't load in 20 seconds, try next fallback
    imgTimeoutRef.current = setTimeout(() => tryNextFallback(), 20000);
  };

  // Clean up timeout on unmount
  // biome-ignore lint/correctness/useExhaustiveDependencies: clearImgTimeout is stable
  useEffect(() => () => clearImgTimeout(), []);

  const handleImgLoad = () => {
    clearImgTimeout();
    setImgLoading(false);
    setError("");
  };

  const handleImgError = () => {
    clearImgTimeout();
    tryNextFallback();
  };

  const examplePrompts = [
    "A boy playing football on a sunny day",
    "A beautiful mountain landscape at sunset",
    "A futuristic city with flying cars",
    "A cute cat sitting in a garden",
  ];

  return (
    <div className="space-y-5">
      <div>
        <div
          className="block text-sm font-semibold mb-2"
          style={{ color: navy, fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Describe your image
        </div>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && generateImage()}
          placeholder="e.g. A boy playing football on a sunny day..."
          rows={3}
          className="w-full px-4 py-3 rounded-2xl text-sm resize-none outline-none transition-all"
          style={{
            border: "1.5px solid oklch(0.91 0.003 265)",
            fontFamily: "'Space Grotesk', sans-serif",
            color: navy,
            background: "white",
          }}
          data-ocid="creative.textarea"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {examplePrompts.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPrompt(p)}
            className="text-xs px-3 py-1.5 rounded-full transition-all"
            style={{
              border: `1px solid ${gold}50`,
              color: "oklch(0.60 0.14 75)",
              background: "oklch(0.97 0.005 80)",
              fontFamily: "'Space Grotesk', sans-serif",
            }}
            data-ocid="creative.button"
          >
            {p.length > 32 ? `${p.slice(0, 32)}…` : p}
          </button>
        ))}
      </div>

      <Button
        onClick={generateImage}
        disabled={imgLoading || !prompt.trim()}
        className="w-full font-semibold rounded-2xl py-3"
        style={{
          background: `linear-gradient(135deg, ${gold}, oklch(0.60 0.16 70))`,
          color: "oklch(0.08 0.022 265)",
          border: "none",
        }}
        data-ocid="creative.primary_button"
      >
        {imgLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating Image…
          </>
        ) : (
          <>
            <ImageIcon className="w-4 h-4 mr-2" />
            Generate Image
          </>
        )}
      </Button>

      {/* Loading state */}
      <AnimatePresence>
        {imgLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-10 rounded-2xl"
            style={{ background: "oklch(0.97 0.004 80)" }}
            data-ocid="creative.loading_state"
          >
            <div
              className="relative w-16 h-16 rounded-2xl mb-4"
              style={{ background: `${gold}20` }}
            >
              <div
                className="absolute inset-2 rounded-xl animate-pulse"
                style={{ background: `${gold}40` }}
              />
            </div>
            <p
              className="text-sm font-medium mb-1"
              style={{ color: navy, fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Creating your image with AI…
            </p>
            <p
              className="text-xs"
              style={{
                color: "oklch(0.55 0.008 265)",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              This may take up to 20 seconds
            </p>
          </motion.div>
        )}

        {error && !imgLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-center py-4 space-y-3"
            data-ocid="creative.error_state"
          >
            <p style={{ color: "oklch(0.55 0.22 25)" }}>{error}</p>
            <button
              type="button"
              onClick={generateImage}
              className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105"
              style={{
                background: gold,
                color: "oklch(0.08 0.022 265)",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
              data-ocid="creative.button"
            >
              Try Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The actual image — always rendered when URL is set, hidden while loading */}
      {imageUrl && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{
            opacity: imgLoading ? 0 : 1,
            scale: imgLoading ? 0.96 : 1,
          }}
          className="rounded-2xl overflow-hidden"
          style={{
            border: `1px solid ${gold}30`,
            display: imgLoading ? "none" : "block",
          }}
          data-ocid="creative.success_state"
        >
          <img
            src={imageUrl}
            alt={prompt}
            onLoad={handleImgLoad}
            onError={handleImgError}
            className="w-full object-cover"
            style={{ maxHeight: 400 }}
            crossOrigin="anonymous"
          />
          <div
            className="p-3 flex items-center justify-between"
            style={{ background: "oklch(0.97 0.004 80)" }}
          >
            <p
              className="text-xs truncate"
              style={{
                color: "oklch(0.50 0.008 265)",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              {prompt}
            </p>
            <a
              href={imageUrl}
              download="navvgenx-ai-image.png"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-medium ml-3 flex-shrink-0"
              style={{ color: gold }}
            >
              <ExternalLink className="w-3 h-3" />
              Open
            </a>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─── Voice Synthesis ──────────────────────────────────────────────────────────
function VoiceSynthesis() {
  const [text, setText] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const hasSupport = "speechSynthesis" in window;

  useEffect(() => {
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      setVoices(v);
      if (v.length > 0 && !selectedVoice) {
        const pref = v.find(
          (voice) =>
            voice.name.toLowerCase().includes("google uk english female") ||
            voice.name.toLowerCase().includes("samantha") ||
            voice.name.toLowerCase().includes("female"),
        );
        setSelectedVoice(pref?.name || v[0]?.name || "");
      }
    };
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () =>
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, [selectedVoice]);

  const speak = () => {
    if (!text.trim()) {
      toast.error("Enter some text to speak");
      return;
    }
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.9;
    utt.pitch = 1.0;
    utt.volume = 1.0;
    if (selectedVoice) {
      const voice = voices.find((v) => v.name === selectedVoice);
      if (voice) utt.voice = voice;
    }
    utt.onstart = () => setSpeaking(true);
    utt.onend = () => setSpeaking(false);
    utt.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utt);
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  if (!hasSupport) {
    return (
      <div className="text-center py-10">
        <Mic
          className="w-10 h-10 mx-auto mb-3"
          style={{ color: "oklch(0.80 0.003 265)" }}
        />
        <p
          className="text-sm"
          style={{
            color: "oklch(0.50 0.008 265)",
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          Voice synthesis is not supported in your browser.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {voices.length > 0 && (
        <div>
          <div
            className="block text-sm font-semibold mb-2"
            style={{ color: navy, fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Select Voice
          </div>
          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{
              border: "1.5px solid oklch(0.91 0.003 265)",
              color: navy,
              fontFamily: "'Space Grotesk', sans-serif",
              background: "white",
            }}
            data-ocid="creative.select"
          >
            {voices.map((v) => (
              <option key={v.name} value={v.name}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
        </div>
      )}
      <div>
        <div
          className="block text-sm font-semibold mb-2"
          style={{ color: navy, fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Text to Speak
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type any text here and press Speak…"
          rows={5}
          className="w-full px-4 py-3 rounded-2xl text-sm resize-none outline-none transition-all"
          style={{
            border: "1.5px solid oklch(0.91 0.003 265)",
            fontFamily: "'Space Grotesk', sans-serif",
            color: navy,
            background: "white",
          }}
          data-ocid="creative.textarea"
        />
      </div>
      <div className="flex gap-3">
        <Button
          onClick={speak}
          disabled={speaking || !text.trim()}
          className="flex-1 font-semibold rounded-2xl"
          style={{
            background: speaking
              ? "oklch(0.94 0.005 265)"
              : `linear-gradient(135deg, ${gold}, oklch(0.60 0.16 70))`,
            color: speaking ? "oklch(0.50 0.008 265)" : "oklch(0.08 0.022 265)",
            border: "none",
          }}
          data-ocid="creative.primary_button"
        >
          {speaking ? (
            <>
              <Volume2 className="w-4 h-4 mr-2 animate-pulse" />
              Speaking…
            </>
          ) : (
            <>
              <Mic className="w-4 h-4 mr-2" />
              Speak
            </>
          )}
        </Button>
        {speaking && (
          <Button
            onClick={stop}
            variant="outline"
            className="rounded-2xl"
            data-ocid="creative.secondary_button"
          >
            Stop
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Video Search ─────────────────────────────────────────────────────────────
function VideoSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ title: string; url: string }[]>([]);

  const searchVideos = () => {
    const q = query.trim();
    if (!q) {
      toast.error("Enter a search term");
      return;
    }
    window.open(
      `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,
      "_blank",
    );
    setResults([
      {
        title: `${q} — Full Tutorial`,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${q} tutorial`)}`,
      },
      {
        title: `Best ${q} Videos`,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`best ${q}`)}`,
      },
      {
        title: `${q} — Latest 2026`,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${q} 2026`)}`,
      },
    ]);
  };

  return (
    <div className="space-y-5">
      <div>
        <div
          className="block text-sm font-semibold mb-2"
          style={{ color: navy, fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Search for Videos
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchVideos()}
            placeholder="e.g. football skills, cooking recipe…"
            className="flex-1 px-4 py-3 rounded-2xl text-sm outline-none transition-all"
            style={{
              border: "1.5px solid oklch(0.91 0.003 265)",
              fontFamily: "'Space Grotesk', sans-serif",
              color: navy,
              background: "white",
            }}
            data-ocid="creative.input"
          />
          <Button
            onClick={searchVideos}
            disabled={!query.trim()}
            className="rounded-2xl font-semibold px-5"
            style={{
              background: `linear-gradient(135deg, ${gold}, oklch(0.60 0.16 70))`,
              color: "oklch(0.08 0.022 265)",
              border: "none",
            }}
            data-ocid="creative.submit_button"
          >
            <Video className="w-4 h-4" />
          </Button>
        </div>
      </div>
      {results.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: gold, fontFamily: "'Space Grotesk', sans-serif" }}
          >
            YouTube Links
          </p>
          {results.map((r) => (
            <a
              key={r.url}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-2xl transition-all hover:opacity-90"
              style={{
                border: "1px solid oklch(0.91 0.003 265)",
                background: "oklch(0.98 0.002 80)",
              }}
              data-ocid="creative.link"
            >
              <div
                className="w-12 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "#FF0000" }}
              >
                <Video className="w-4 h-4 text-white" />
              </div>
              <span
                className="text-sm font-medium flex-1 leading-tight"
                style={{
                  color: navy,
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                {r.title}
              </span>
              <ExternalLink
                className="w-3.5 h-3.5 flex-shrink-0"
                style={{ color: "oklch(0.65 0.008 265)" }}
              />
            </a>
          ))}
        </motion.div>
      )}
    </div>
  );
}

// ─── Main CreativeAI Page ────────────────────────────────────────────────────
export function CreativeAIPage() {
  const currentYear = new Date().getFullYear();
  const hostname = encodeURIComponent(window.location.hostname);

  return (
    <div className="min-h-screen bg-background" data-ocid="creative.page">
      <div
        className="px-5 py-6 text-center"
        style={{
          background: "oklch(0.99 0.001 80)",
          borderBottom: "1px solid oklch(0.91 0.003 265)",
        }}
      >
        <div className="flex justify-center mb-3">
          <Logo size="lg" />
        </div>
        <h1
          className="font-playfair text-2xl font-bold"
          style={{ color: navy, letterSpacing: "-0.02em" }}
        >
          Creative AI
        </h1>
        <p
          className="text-sm mt-1"
          style={{
            color: "oklch(0.50 0.008 265)",
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          Generate images, synthesize voice, and find videos
        </p>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        <Tabs defaultValue="images">
          <TabsList
            className="w-full rounded-2xl mb-6"
            style={{ background: "oklch(0.94 0.005 265)" }}
          >
            <TabsTrigger
              value="images"
              className="flex-1 rounded-xl gap-2"
              data-ocid="creative.tab"
            >
              <ImageIcon className="w-4 h-4" />
              Images
            </TabsTrigger>
            <TabsTrigger
              value="voice"
              className="flex-1 rounded-xl gap-2"
              data-ocid="creative.tab"
            >
              <Volume2 className="w-4 h-4" />
              Voice
            </TabsTrigger>
            <TabsTrigger
              value="videos"
              className="flex-1 rounded-xl gap-2"
              data-ocid="creative.tab"
            >
              <Video className="w-4 h-4" />
              Videos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="images">
            <div
              className="rounded-3xl p-5"
              style={{
                background: "white",
                border: "1px solid oklch(0.91 0.003 265)",
                boxShadow: "0 2px 12px oklch(0.155 0.030 265 / 0.06)",
              }}
            >
              <div className="flex items-center gap-2 mb-5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: `${gold}20` }}
                >
                  <ImageIcon className="w-4 h-4" style={{ color: gold }} />
                </div>
                <div>
                  <h2
                    className="font-semibold text-sm"
                    style={{
                      color: navy,
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                  >
                    Image Generator
                  </h2>
                  <p
                    className="text-xs"
                    style={{ color: "oklch(0.55 0.008 265)" }}
                  >
                    Powered by Pollinations AI — Free, no key needed
                  </p>
                </div>
              </div>
              <ImageGenerator />
            </div>
          </TabsContent>

          <TabsContent value="voice">
            <div
              className="rounded-3xl p-5"
              style={{
                background: "white",
                border: "1px solid oklch(0.91 0.003 265)",
                boxShadow: "0 2px 12px oklch(0.155 0.030 265 / 0.06)",
              }}
            >
              <div className="flex items-center gap-2 mb-5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: `${gold}20` }}
                >
                  <Volume2 className="w-4 h-4" style={{ color: gold }} />
                </div>
                <div>
                  <h2
                    className="font-semibold text-sm"
                    style={{
                      color: navy,
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                  >
                    Voice Synthesis
                  </h2>
                  <p
                    className="text-xs"
                    style={{ color: "oklch(0.55 0.008 265)" }}
                  >
                    Text to speech using your browser
                  </p>
                </div>
              </div>
              <VoiceSynthesis />
            </div>
          </TabsContent>

          <TabsContent value="videos">
            <div
              className="rounded-3xl p-5"
              style={{
                background: "white",
                border: "1px solid oklch(0.91 0.003 265)",
                boxShadow: "0 2px 12px oklch(0.155 0.030 265 / 0.06)",
              }}
            >
              <div className="flex items-center gap-2 mb-5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: `${gold}20` }}
                >
                  <Video className="w-4 h-4" style={{ color: gold }} />
                </div>
                <div>
                  <h2
                    className="font-semibold text-sm"
                    style={{
                      color: navy,
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                  >
                    Video Search
                  </h2>
                  <p
                    className="text-xs"
                    style={{ color: "oklch(0.55 0.008 265)" }}
                  >
                    Search and discover YouTube videos
                  </p>
                </div>
              </div>
              <VideoSearch />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <footer
        className="py-4 text-center text-xs"
        style={{
          color: "oklch(0.65 0.008 265)",
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        © {currentYear}. Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${hostname}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: gold }}
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
