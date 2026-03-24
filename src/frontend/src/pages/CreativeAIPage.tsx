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

const gold = "oklch(0.72 0.12 75)";
const navy = "oklch(0.155 0.030 265)";

// ─── Image Generator ─────────────────────────────────────────────────────────
function ImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateImage = () => {
    const p = prompt.trim();
    if (!p) {
      toast.error("Enter a description for the image");
      return;
    }
    setLoading(true);
    setError("");
    setImageUrl("");
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(p)}?width=512&height=512&nologo=true&seed=${Date.now()}`;
    const img = new window.Image();
    img.onload = () => {
      setImageUrl(url);
      setLoading(false);
    };
    img.onerror = () => {
      setError("Image generation failed. Please try again.");
      setLoading(false);
    };
    img.src = url;
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
          }}
          data-ocid="creative.textarea"
        />
      </div>

      {/* Example prompts */}
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
        disabled={loading || !prompt.trim()}
        className="w-full font-semibold rounded-2xl py-3"
        style={{
          background: `linear-gradient(135deg, ${gold}, oklch(0.60 0.16 70))`,
          color: "oklch(0.08 0.022 265)",
          border: "none",
        }}
        data-ocid="creative.primary_button"
      >
        {loading ? (
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

      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-10 rounded-2xl"
            style={{ background: "oklch(0.97 0.004 80)" }}
            data-ocid="creative.loading_state"
          >
            <div
              className="w-14 h-14 rounded-2xl mb-4 animate-pulse"
              style={{ background: `${gold}30` }}
            />
            <p
              className="text-sm font-medium"
              style={{
                color: "oklch(0.50 0.008 265)",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              Creating your image with AI…
            </p>
          </motion.div>
        )}
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-center py-4"
            style={{ color: "oklch(0.55 0.22 25)" }}
            data-ocid="creative.error_state"
          >
            {error}
          </motion.p>
        )}
        {imageUrl && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl overflow-hidden"
            style={{ border: `1px solid ${gold}30` }}
            data-ocid="creative.success_state"
          >
            <img
              src={imageUrl}
              alt={prompt}
              className="w-full object-cover"
              style={{ maxHeight: 400 }}
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
      </AnimatePresence>
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
  const [results, setResults] = useState<
    { title: string; url: string; thumb: string }[]
  >([]);

  const searchVideos = () => {
    const q = query.trim();
    if (!q) {
      toast.error("Enter a search term");
      return;
    }
    // Open YouTube search
    window.open(
      `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,
      "_blank",
    );

    // Show example links
    const topics = [
      {
        title: `${q} — Full Tutorial`,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${q} tutorial`)}`,
        thumb: "https://img.youtube.com/vi/default/mqdefault.jpg",
      },
      {
        title: `Best ${q} Videos`,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`best ${q}`)}`,
        thumb: "https://img.youtube.com/vi/default/mqdefault.jpg",
      },
      {
        title: `${q} — Latest`,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${q} 2024`)}`,
        thumb: "https://img.youtube.com/vi/default/mqdefault.jpg",
      },
    ];
    setResults(topics);
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
      {/* Header */}
      <div
        className="px-5 py-6 text-center"
        style={{
          background: "oklch(0.99 0.001 80)",
          borderBottom: "1px solid oklch(0.91 0.003 265)",
        }}
      >
        <div
          className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3"
          style={{
            background: `linear-gradient(135deg, ${gold}, oklch(0.60 0.16 70))`,
          }}
        >
          <img
            src="/assets/generated/ngx-logo-transparent.dim_512x512.png"
            alt="NGX"
            className="w-9 h-9 object-contain"
          />
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

      {/* Tabs */}
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

      {/* Footer */}
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
