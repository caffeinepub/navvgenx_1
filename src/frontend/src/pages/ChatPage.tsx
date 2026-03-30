import { useCamera } from "@/camera/useCamera";
import {
  Camera,
  ExternalLink,
  Image,
  ImagePlus,
  Images,
  Lightbulb,
  Menu,
  Pencil,
  Send,
  SwitchCamera,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import LinkEmbed from "../components/LinkEmbed";
import { ProfessionalMic } from "../components/ProfessionalMic";
import { useActor } from "../hooks/useActor";
import {
  type ImageResult,
  type SearchResult,
  type WikiCard,
  generateAIResponse,
  getSuggestions,
  speakText,
  stopSpeaking,
} from "../utils/aiEngine";
import { extractUrls } from "../utils/linkUtils";

function HtmlContent({ html }: { html: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (ref.current) ref.current.innerHTML = html;
  }, [html]);
  return <div ref={ref} className="prose-content overflow-x-auto" />;
}

function NavvLogoN({ size = 32 }: { size?: number }) {
  const gold = "oklch(0.78 0.15 75)";
  const navy = "oklch(0.08 0.022 265)";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="NavvGenX AI N logo"
    >
      <title>NavvGenX AI N</title>
      <circle
        cx="20"
        cy="20"
        r="19"
        stroke={gold}
        strokeWidth="1.5"
        fill={navy}
      />
      <circle
        cx="20"
        cy="20"
        r="14"
        stroke={gold}
        strokeWidth="0.5"
        strokeOpacity="0.35"
        fill="none"
      />
      <text
        x="20"
        y="26"
        textAnchor="middle"
        fontFamily="'Space Grotesk', Arial, sans-serif"
        fontWeight="700"
        fontSize="17"
        fill={gold}
        letterSpacing="-0.5"
      >
        N
      </text>
    </svg>
  );
}

interface Profile {
  age: bigint;
  ageGroup: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  isHtml?: boolean;
  category: string;
  timestamp: number;
  searchResults?: SearchResult[];
  imageResults?: ImageResult[];
  isSearch?: boolean;
  suggestions?: string[];
  wikiCard?: WikiCard;
  quickLinks?: { google: string; chatgpt: string };
  sources?: string[];
}

interface ChatPageProps {
  profile: Profile | null;
  initialCategory?: string;
}

const categories = [
  { key: "general", label: "General" },
  { key: "health", label: "Health" },
  { key: "love", label: "Love" },
  { key: "study", label: "Study" },
  { key: "career", label: "Career" },
  { key: "fashion", label: "Fashion" },
  { key: "business", label: "Business" },
  { key: "search", label: "Search" },
];

function getCategoryGreetings(): Record<string, string> {
  const assistantName =
    localStorage.getItem("navvgenx-assistant-name") || "NavvGenX AI";
  return {
    health: `Hi! I'm ${assistantName}, your health and wellness expert. How can I help you today?`,
    love: `Hi! I'm ${assistantName}, your relationship coach. How can I help you today?`,
    study: `Hi! I'm ${assistantName}, your study and learning expert. How can I help you today?`,
    career: `Hi! I'm ${assistantName}, your career development expert. How can I help you today?`,
    fashion: `Hi! I'm ${assistantName}, your style and fashion expert. How can I help you today?`,
    business: `Hi! I'm ${assistantName}, your business and entrepreneurship expert. How can I help you today?`,
    search: `Hi! I'm ${assistantName}, your search expert. What would you like to find today?`,
    general: `Hi! I'm ${assistantName}, your personal AI companion. How can I help you today?`,
  };
}

// Smart Wikipedia-backed answer function
async function getSmartAnswer(query: string): Promise<string | null> {
  const q = query.trim();
  const encoded = encodeURIComponent(q);

  const searchLinksHtml = `<div style="margin-top:12px;padding-top:10px;border-top:1px solid rgba(128,128,128,0.15);display:flex;flex-wrap:wrap;gap:8px;align-items:center"><span style="font-size:0.75rem;opacity:0.5;font-weight:600;letter-spacing:0.04em;margin-right:4px">SEARCH:</span><a href="https://www.google.com/search?q=${encoded}" target="_blank" rel="noreferrer" style="font-size:0.78rem;color:#4285f4;text-decoration:none;padding:2px 10px;border:1px solid #4285f420;border-radius:20px;background:#4285f408">Google</a><a href="https://duckduckgo.com/?q=${encoded}" target="_blank" rel="noreferrer" style="font-size:0.78rem;color:#de5833;text-decoration:none;padding:2px 10px;border:1px solid #de583320;border-radius:20px;background:#de583308">DuckDuckGo</a><a href="https://www.bing.com/search?q=${encoded}" target="_blank" rel="noreferrer" style="font-size:0.78rem;color:#008373;text-decoration:none;padding:2px 10px;border:1px solid #00837320;border-radius:20px;background:#00837308">Bing</a><a href="https://en.wikipedia.org/wiki/Special:Search?search=${encoded}" target="_blank" rel="noreferrer" style="font-size:0.78rem;color:#636466;text-decoration:none;padding:2px 10px;border:1px solid #63646620;border-radius:20px;background:#63646608">Wikipedia</a></div>`;

  // Try DuckDuckGo Instant Answer API for all queries
  try {
    const ddgRes = await fetch(
      `https://api.duckduckgo.com/?q=${encoded}&format=json&no_html=1&skip_disambig=1`,
      { signal: AbortSignal.timeout(4000) },
    );
    if (ddgRes.ok) {
      const ddgData = await ddgRes.json();
      // AbstractText is the best instant answer
      if (ddgData.AbstractText && ddgData.AbstractText.length > 40) {
        const src = ddgData.AbstractSource || "DuckDuckGo";
        const url =
          ddgData.AbstractURL || `https://duckduckgo.com/?q=${encoded}`;
        return `<p style="line-height:1.65">${ddgData.AbstractText}</p><p style="margin-top:6px;font-size:0.8rem;opacity:0.6">Source: <a href="${url}" target="_blank" rel="noreferrer" style="color:#de5833">${src}</a></p>${searchLinksHtml}`;
      }
      // Answer (short facts like "2 + 2 = 4")
      if (ddgData.Answer && ddgData.Answer.length > 2) {
        return `<p style="line-height:1.65;font-weight:600">${ddgData.Answer}</p>${searchLinksHtml}`;
      }
      // Definition
      if (ddgData.Definition && ddgData.Definition.length > 40) {
        return `<p style="line-height:1.65">${ddgData.Definition}</p><p style="margin-top:6px;font-size:0.8rem;opacity:0.6">Source: ${ddgData.DefinitionSource || "Dictionary"}</p>${searchLinksHtml}`;
      }
    }
  } catch {
    // fall through to Wikipedia
  }

  // Try Wikipedia for factual/topic questions
  const factualPattern =
    /^(what is|who is|where is|when did|how does|what are|tell me about|explain|define|what was|who was|where are|when is|when was|history of|capital of|meaning of|founder of|president of|prime minister of)/i;

  const isFactual = factualPattern.test(q) || q.split(" ").length <= 5;

  if (isFactual) {
    try {
      const subject = q
        .replace(
          /^(what is|who is|where is|when did|how does|what are|tell me about|explain|define|what was|who was|where are|when is|when was|history of|capital of|meaning of|founder of|president of|prime minister of)\s+/i,
          "",
        )
        .replace(/[?!.]$/, "")
        .trim();
      const wikiRes = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(subject)}`,
        { signal: AbortSignal.timeout(5000) },
      );
      if (wikiRes.ok) {
        const wikiData = await wikiRes.json();
        if (wikiData.extract && wikiData.extract.length > 60) {
          const sentences = wikiData.extract.split(/\.\s+/);
          const answer = sentences.slice(0, 3).join(". ").trim();
          const finalAnswer = answer.endsWith(".") ? answer : `${answer}.`;
          return `<p style="line-height:1.65">${finalAnswer}</p><p style="margin-top:6px;font-size:0.8rem;opacity:0.6">Source: <a href="${wikiData.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(subject)}`}" target="_blank" rel="noreferrer" style="color:#636466">Wikipedia</a></p>${searchLinksHtml}`;
        }
      }
    } catch {
      // fall through
    }
  }

  return null;
}

export function ChatPage({
  profile,
  initialCategory = "general",
}: ChatPageProps) {
  const { actor } = useActor();
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const _n = localStorage.getItem("navvgenx-assistant-name") || "NavvGenX AI";
    return [
      {
        id: "0",
        role: "ai" as const,
        content: `Hello! I'm ${_n}, your personal AI companion. Ask me anything, search any topic, or use the mic to speak.`,
        category: "general",
        timestamp: Date.now(),
      },
    ];
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const imageAttachRef = React.useRef<HTMLInputElement>(null);
  const [hasSpeechSupport] = useState(
    () =>
      !!(
        (window as Window).SpeechRecognition ||
        (window as Window).webkitSpeechRecognition
      ),
  );

  const isMobile = /Mobi|Android/i.test(navigator.userAgent);

  const {
    isActive: cameraActive,
    isSupported: cameraSupported,
    error: cameraError,
    isLoading: cameraLoading,
    startCamera,
    stopCamera,
    capturePhoto,
    switchCamera,
    videoRef,
    canvasRef,
    currentFacingMode,
  } = useCamera({ facingMode: "user" });

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const prevCategoryRef = useRef<string | null>(null);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    setActiveCategory(initialCategory);
  }, [initialCategory]);

  // Auto-submit initial query from home page search — runs once on mount
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally run once
  useEffect(() => {
    const imageData = sessionStorage.getItem("navvgenx-image-query");
    if (imageData) {
      try {
        const parsed = JSON.parse(imageData);
        sessionStorage.removeItem("navvgenx-image-query");
        if (parsed.image) {
          setAttachedImage(parsed.image);
          if (parsed.query) {
            // Pre-fill input with the query; user can see it and send
            setInput(parsed.query);
          }
        } else if (parsed.query) {
          setTimeout(
            () => sendMessage(parsed.query, initialCategory || "general"),
            800,
          );
        }
      } catch {
        sessionStorage.removeItem("navvgenx-image-query");
      }
      return;
    }

    const q = sessionStorage.getItem("navvgenx-initial-query");
    if (q) {
      sessionStorage.removeItem("navvgenx-initial-query");
      // Pre-fill and auto-send so user sees their query appear in chat
      setInput(q);
      setTimeout(() => {
        sendMessage(q, initialCategory || "general");
      }, 500);
    }

    const cameraSearch = sessionStorage.getItem("navvgenx-camera-search");
    if (cameraSearch) {
      sessionStorage.removeItem("navvgenx-camera-search");
      setTimeout(() => setShowCamera(true), 500);
    }
  }, []);

  // Show expert greeting when category changes
  useEffect(() => {
    const isFirstVisit = prevCategoryRef.current === null;
    const hasChanged = prevCategoryRef.current !== activeCategory;
    prevCategoryRef.current = activeCategory;

    if (isFirstVisit) {
      if (activeCategory !== "general") {
        const greeting =
          getCategoryGreetings()[activeCategory] ??
          getCategoryGreetings().general;
        setMessages((prev) => [
          ...prev,
          {
            id: `greeting-${activeCategory}-${Date.now()}`,
            role: "ai",
            content: greeting,
            category: activeCategory,
            timestamp: Date.now(),
          },
        ]);
      }
    } else if (hasChanged) {
      const greeting =
        getCategoryGreetings()[activeCategory] ??
        getCategoryGreetings().general;
      setMessages((prev) => [
        ...prev,
        {
          id: `greeting-${activeCategory}-${Date.now()}`,
          role: "ai",
          content: greeting,
          category: activeCategory,
          timestamp: Date.now(),
        },
      ]);
    }
  }, [activeCategory]);

  // Scroll within messages container only - page should not scroll
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll ref doesn't need to be in deps
  useEffect(() => {
    setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop =
          messagesContainerRef.current.scrollHeight;
      }
    }, 80);
  }, [messages, isLoading]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: startCamera is stable
  useEffect(() => {
    if (showCamera) {
      startCamera().catch(() => {
        toast.error("Camera access denied. Please allow camera permissions.");
        setShowCamera(false);
      });
    }
  }, [showCamera]);

  useEffect(() => {
    if (input.trim().length >= 2) {
      const s = getSuggestions(input, activeCategory);
      setSuggestions(s);
      setShowSuggestions(s.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [input, activeCategory]);

  useEffect(() => {
    return () => stopSpeaking();
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: profile used inside but triggers re-render loop if added
  const sendMessage = useCallback(
    async (text: string, cat?: string) => {
      const msgText = text.trim();
      if (!msgText || isLoadingRef.current) return;

      isLoadingRef.current = true;
      setShowSuggestions(false);
      const category = cat || activeCategory;
      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: msgText,
        category,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setAttachedImage(null);
      setIsLoading(true);

      actor
        ?.addMessage({
          role: "user",
          content: msgText,
          category,
          timestamp: BigInt(Date.now()),
        })
        .catch(() => {});

      await new Promise((r) => setTimeout(r, 600 + Math.random() * 600));

      const ageGroup = profile?.ageGroup || "millennial";
      const userAge = profile?.age ? Number(profile.age) : 99;

      // Try smart Wikipedia answer first for factual questions
      const smartHtml = await getSmartAnswer(msgText);

      let response = await generateAIResponse(
        msgText,
        category,
        ageGroup,
        userAge,
      );

      // If Wikipedia gave a precise answer, override response text with it
      if (smartHtml) {
        response = { ...response, text: smartHtml, isHtml: true };
      } else {
        // Add search links to every response
        const enc = encodeURIComponent(msgText);
        const searchLinks = `<div style="margin-top:12px;padding-top:10px;border-top:1px solid rgba(128,128,128,0.15);display:flex;flex-wrap:wrap;gap:8px;align-items:center"><span style="font-size:0.75rem;opacity:0.5;font-weight:600;letter-spacing:0.04em;margin-right:4px">SEARCH:</span><a href="https://www.google.com/search?q=${enc}" target="_blank" rel="noreferrer" style="font-size:0.78rem;color:#4285f4;text-decoration:none;padding:2px 10px;border:1px solid #4285f420;border-radius:20px;background:#4285f408">Google</a><a href="https://duckduckgo.com/?q=${enc}" target="_blank" rel="noreferrer" style="font-size:0.78rem;color:#de5833;text-decoration:none;padding:2px 10px;border:1px solid #de583320;border-radius:20px;background:#de583308">DuckDuckGo</a><a href="https://www.bing.com/search?q=${enc}" target="_blank" rel="noreferrer" style="font-size:0.78rem;color:#008373;text-decoration:none;padding:2px 10px;border:1px solid #00837320;border-radius:20px;background:#00837308">Bing</a><a href="https://en.wikipedia.org/wiki/Special:Search?search=${enc}" target="_blank" rel="noreferrer" style="font-size:0.78rem;color:#636466;text-decoration:none;padding:2px 10px;border:1px solid #63646620;border-radius:20px;background:#63646608">Wikipedia</a></div>`;
        if (response.isHtml) {
          response = { ...response, text: response.text + searchLinks };
        } else {
          response = {
            ...response,
            text: response.text + searchLinks,
            isHtml: true,
          };
        }
      }

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: response.text,
        isHtml: response.isHtml,
        category,
        timestamp: Date.now(),
        searchResults: response.searchResults,
        imageResults: response.imageResults,
        isSearch: response.isSearch,
        suggestions: response.suggestions,
        wikiCard: response.wikiCard,
        quickLinks: response.quickLinks,
        sources: response.sources,
      };
      try {
        const hist = JSON.parse(
          localStorage.getItem("navvgenx-chat-history") || "[]",
        );
        hist.push({
          query: msgText,
          answer: response.text.replace(/<[^>]+>/g, "").slice(0, 200),
          timestamp: Date.now(),
        });
        if (hist.length > 50) hist.splice(0, hist.length - 50);
        localStorage.setItem("navvgenx-chat-history", JSON.stringify(hist));
      } catch {}

      // Add message first with empty content, then stream it in
      const streamId = aiMsg.id;
      setMessages((prev) => [...prev, { ...aiMsg, content: "" }]);
      setIsLoading(false);
      setStreamingId(streamId);

      // Stream the plain-text portion character by character
      const fullText = aiMsg.isHtml ? aiMsg.content : aiMsg.content;
      let displayed = "";
      const chars = fullText.split("");
      // For HTML content, stream word by word to avoid broken tags
      if (aiMsg.isHtml) {
        // Stream words for HTML (split on spaces to avoid mid-tag display)
        const words = fullText.split(" ");
        let wordIdx = 0;
        const streamWords = () => {
          if (wordIdx >= words.length) {
            setMessages((prev) =>
              prev.map((m) => (m.id === streamId ? { ...aiMsg } : m)),
            );
            setStreamingId(null);
            isLoadingRef.current = false;
            return;
          }
          const chunkSize = wordIdx < 20 ? 1 : wordIdx < 60 ? 3 : 6;
          const chunk = `${words.slice(wordIdx, wordIdx + chunkSize).join(" ")} `;
          displayed += chunk;
          wordIdx += chunkSize;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === streamId ? { ...aiMsg, content: displayed } : m,
            ),
          );
          setTimeout(streamWords, wordIdx < 20 ? 35 : wordIdx < 60 ? 25 : 12);
        };
        streamWords();
      } else {
        let charIdx = 0;
        const streamChars = () => {
          if (charIdx >= chars.length) {
            setMessages((prev) =>
              prev.map((m) => (m.id === streamId ? { ...aiMsg } : m)),
            );
            setStreamingId(null);
            isLoadingRef.current = false;
            return;
          }
          const chunkSize = charIdx < 80 ? 1 : charIdx < 200 ? 2 : 4;
          displayed += chars.slice(charIdx, charIdx + chunkSize).join("");
          charIdx += chunkSize;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === streamId ? { ...m, content: displayed } : m,
            ),
          );
          setTimeout(streamChars, charIdx < 80 ? 18 : charIdx < 200 ? 12 : 6);
        };
        streamChars();
        return; // Don't set isLoadingRef false here; streamChars handles it
      }

      actor
        ?.addMessage({
          role: "ai",
          content: response.text,
          category,
          timestamp: BigInt(Date.now()),
        })
        .catch(() => {});
    },
    [activeCategory, actor],
  );

  const handleVoiceInput = async () => {
    if (!hasSpeechSupport) return;
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }
    if (navigator.mediaDevices?.getUserMedia) {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch {
        toast.error(
          "Microphone access denied. Please allow microphone in your browser settings.",
        );
        return;
      }
    }
    const win = window as Window;
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;
    const recognition = new SpeechRec();
    recognitionRef.current = recognition;
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsRecording(false);
      setTimeout(() => sendMessage(transcript), 300);
    };
    recognition.onerror = () => {
      setIsRecording(false);
      toast.error("Voice input failed");
    };
    recognition.onend = () => setIsRecording(false);
    recognition.start();
    setIsRecording(true);
    toast.info("Listening... speak now", { duration: 2000 });
  };

  const handleSpeakMessage = (msg: ChatMessage) => {
    if (isSpeaking && speakingMsgId === msg.id) {
      stopSpeaking();
      setIsSpeaking(false);
      setSpeakingMsgId(null);
      return;
    }
    stopSpeaking();
    setIsSpeaking(true);
    setSpeakingMsgId(msg.id);
    speakText(msg.content, () => {
      setIsSpeaking(false);
      setSpeakingMsgId(null);
    });
  };

  const handleCameraOpen = () => {
    if (!cameraSupported) {
      toast.error("Camera not supported on this device");
      return;
    }
    setShowCamera(true);
  };

  const handleCameraClose = () => {
    stopCamera();
    setShowCamera(false);
  };

  // ── Camera capture: set image preview, wait for user to describe it
  const handleCameraCapture = async () => {
    const file = await capturePhoto();
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        setAttachedImage(dataUrl);
        toast.success(
          "Image captured. Describe what you want to know about it.",
        );
      };
      reader.readAsDataURL(file);
      stopCamera();
      setShowCamera(false);
    }
  };

  // ── Gallery select: set image preview, wait for user to describe it
  const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        setAttachedImage(dataUrl);
        toast.success("Image added. Type your question about it below.");
      };
      reader.readAsDataURL(file);
      stopCamera();
      setShowCamera(false);
    }
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  const handleEditMessage = (msg: ChatMessage) => {
    setEditingMsgId(msg.id);
    setInput(msg.content);
  };

  const handleImageAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setAttachedImage(dataUrl);
      toast.success("Image attached. Type your question about it.");
    };
    reader.readAsDataURL(file);
    if (imageAttachRef.current) imageAttachRef.current.value = "";
  };

  const handleSendWithImage = async () => {
    if (!input.trim() && !attachedImage) return;
    if (attachedImage) {
      const question =
        input.trim() ||
        "Please describe what you see in this image and provide insights.";
      const fullMsg = `[Image attached] ${question} — Based on the image, please provide a detailed and helpful answer.`;
      setAttachedImage(null);
      await sendMessage(fullMsg);
    } else if (editingMsgId) {
      setEditingMsgId(null);
      await sendMessage(input.trim());
    } else {
      await sendMessage(input.trim());
    }
  };

  return (
    <div className="flex h-[calc(100dvh-8rem)] md:h-[calc(100vh-4rem)] relative">
      {/* Camera modal */}
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
                <h3 className="font-bricolage font-bold text-lg text-foreground flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Camera
                </h3>
                <button
                  type="button"
                  onClick={handleCameraClose}
                  className="text-muted-foreground hover:text-foreground"
                  data-ocid="chat.camera.close_button"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {cameraError && (
                <p className="text-red-500 text-sm text-center mb-3">
                  {cameraError.message}
                </p>
              )}

              <video
                ref={videoRef}
                className="w-full rounded-2xl bg-black aspect-video object-cover"
                style={{ minHeight: "200px" }}
                autoPlay
                muted
                playsInline
              />
              <canvas ref={canvasRef} className="hidden" />

              <input
                type="file"
                accept="image/*"
                ref={galleryInputRef}
                onChange={handleGallerySelect}
                className="hidden"
                data-ocid="chat.upload_button"
              />

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={handleCameraClose}
                  className="flex-1 border border-border rounded-xl py-2.5 text-muted-foreground hover:bg-muted/50 font-space text-sm"
                  data-ocid="chat.camera.cancel_button"
                >
                  Cancel
                </button>
                {isMobile && (
                  <button
                    type="button"
                    onClick={() => switchCamera()}
                    className="p-2.5 border border-border rounded-xl text-muted-foreground hover:bg-muted/50 transition-colors"
                    title={`Switch to ${currentFacingMode === "user" ? "back" : "front"} camera`}
                  >
                    <SwitchCamera className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-2.5 border border-border rounded-xl text-muted-foreground hover:text-primary hover:bg-muted/50 font-space text-sm transition-colors"
                  title="Choose from gallery"
                  data-ocid="chat.camera.secondary_button"
                >
                  <Image className="w-4 h-4" />
                  Gallery
                </button>
                <button
                  type="button"
                  onClick={handleCameraCapture}
                  disabled={!cameraActive || cameraLoading}
                  className="flex-1 navvgenx-gradient-btn py-2.5 rounded-xl font-space text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                  data-ocid="chat.camera.submit_button"
                >
                  <Camera className="w-4 h-4" />
                  {cameraLoading ? "Starting..." : "Capture"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static z-30 inset-y-0 left-0 top-16 md:top-0
          w-64 glass-card rounded-none border-r border-border
          transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          flex flex-col p-4 gap-2
        `}
      >
        <div className="flex items-center justify-between mb-2 md:hidden">
          <span className="font-bricolage font-semibold text-foreground">
            Categories
          </span>
          <button type="button" onClick={() => setSidebarOpen(false)}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="hidden md:block text-xs font-space text-muted-foreground uppercase tracking-widest mb-1 px-2">
          Categories
        </p>
        {categories.map((cat) => (
          <button
            type="button"
            key={cat.key}
            onClick={() => {
              setActiveCategory(cat.key);
              setSidebarOpen(false);
            }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-space font-medium transition-all duration-200 ${
              activeCategory === cat.key
                ? "navvgenx-gradient-btn shadow-md"
                : "text-foreground/70 hover:bg-muted/60"
            }`}
            data-ocid="chat.category.tab"
          >
            {cat.label}
          </button>
        ))}
      </aside>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile category bar */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border md:hidden overflow-x-auto">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="shrink-0 p-1.5"
          >
            <Menu className="w-5 h-5 text-muted-foreground" />
          </button>
          {categories.map((cat) => (
            <button
              type="button"
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-space font-medium transition-all ${
                activeCategory === cat.key
                  ? "navvgenx-gradient-btn"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
          data-ocid="chat.list"
        >
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-3 ${
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
                data-ocid={`chat.item.${i + 1}`}
              >
                <div className="shrink-0">
                  {msg.role === "ai" ? (
                    <NavvLogoN size={32} />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-xs font-bricolage font-bold text-muted-foreground">
                        U
                      </span>
                    </div>
                  )}
                </div>

                <div
                  className={`max-w-[80%] space-y-2 ${
                    msg.role === "user" ? "items-end" : "items-start"
                  } flex flex-col`}
                >
                  <div
                    className={`px-4 py-3 text-sm font-space leading-relaxed relative group ${
                      msg.role === "user"
                        ? "chat-bubble-user"
                        : "chat-bubble-ai glass-card border border-border"
                    }`}
                  >
                    {msg.isHtml ? (
                      <>
                        <HtmlContent html={msg.content} />
                        {streamingId === msg.id && (
                          <span className="inline-block w-0.5 h-4 bg-primary/70 animate-pulse ml-0.5 align-middle" />
                        )}
                      </>
                    ) : (
                      <>
                        {msg.content}
                        {streamingId === msg.id && (
                          <span className="inline-block w-0.5 h-4 bg-primary/70 animate-pulse ml-0.5 align-middle" />
                        )}
                      </>
                    )}
                    {msg.role === "user" && (
                      <button
                        type="button"
                        onClick={() => handleEditMessage(msg)}
                        className="absolute -top-2 -left-2 p-1.5 rounded-full transition-all opacity-0 group-hover:opacity-100 bg-muted text-muted-foreground hover:text-primary"
                        title="Edit message"
                        data-ocid="chat.edit_button"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    )}
                    {msg.role === "ai" && (
                      <button
                        type="button"
                        onClick={() => handleSpeakMessage(msg)}
                        className={`absolute -top-2 -right-2 p-1.5 rounded-full transition-all opacity-0 group-hover:opacity-100 ${
                          isSpeaking && speakingMsgId === msg.id
                            ? "bg-primary text-white opacity-100"
                            : "bg-muted text-muted-foreground hover:text-primary"
                        }`}
                        title={
                          isSpeaking && speakingMsgId === msg.id
                            ? "Stop speaking"
                            : "Read aloud"
                        }
                        data-ocid="chat.toggle"
                      >
                        {isSpeaking && speakingMsgId === msg.id ? (
                          <VolumeX className="w-3 h-3" />
                        ) : (
                          <Volume2 className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Wikipedia Knowledge Card */}
                  {msg.wikiCard && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="w-full glass-card border-l-4 border-primary rounded-2xl p-4 space-y-2"
                      data-ocid="chat.panel"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-xs font-space font-semibold text-primary uppercase tracking-wider">
                              Wikipedia
                            </span>
                          </div>
                          <h4 className="font-bricolage font-bold text-sm text-foreground leading-snug mb-1.5 line-clamp-2">
                            {msg.wikiCard.title}
                          </h4>
                          <p className="text-xs font-space text-muted-foreground leading-relaxed line-clamp-3">
                            {msg.wikiCard.extract}
                          </p>
                        </div>
                        {msg.wikiCard.thumbnail && (
                          <img
                            src={msg.wikiCard.thumbnail}
                            alt={msg.wikiCard.title}
                            className="w-16 h-16 rounded-xl object-cover shrink-0 border border-border"
                            loading="lazy"
                          />
                        )}
                      </div>
                      <a
                        href={msg.wikiCard.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-space text-primary hover:text-primary/80 transition-colors font-medium"
                      >
                        Read more on Wikipedia
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </motion.div>
                  )}

                  {/* Quick Links */}
                  {msg.quickLinks && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <a
                        href={msg.quickLinks.google}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-space font-medium border border-border hover:border-primary/40 hover:bg-primary/5 text-foreground/70 hover:text-foreground transition-all"
                        data-ocid="chat.link"
                      >
                        <span className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 via-red-500 to-yellow-500 flex items-center justify-center text-white font-bold text-[9px]">
                          G
                        </span>
                        Search Google
                      </a>
                      <a
                        href={msg.quickLinks.chatgpt}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-space font-medium border border-border hover:border-primary/40 hover:bg-primary/5 text-foreground/70 hover:text-foreground transition-all"
                        data-ocid="chat.link"
                      >
                        <span className="w-4 h-4 rounded-full bg-[#10a37f] flex items-center justify-center text-white font-bold text-[9px]">
                          C
                        </span>
                        Ask ChatGPT
                      </a>
                    </div>
                  )}

                  {/* Source badges */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <span className="text-xs text-muted-foreground font-space">
                        Sources:
                      </span>
                      {msg.sources.map((src) => (
                        <span
                          key={src}
                          className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-space font-medium"
                        >
                          {src}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Image results grid */}
                  {msg.imageResults && msg.imageResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="w-full"
                    >
                      <div className="flex items-center gap-1.5 mb-2">
                        <Images className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs text-muted-foreground font-space font-medium">
                          Related Images
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {msg.imageResults.map((img, idx) => (
                          <a
                            key={`${img.url}-${idx}`}
                            href={img.searchUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block rounded-xl overflow-hidden border border-border hover:border-primary/40 transition-all hover:scale-[1.02]"
                          >
                            <img
                              src={img.url}
                              alt={img.alt}
                              className="w-full h-28 object-cover"
                              loading="lazy"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display =
                                  "none";
                              }}
                            />
                          </a>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Search results */}
                  {msg.isSearch && msg.searchResults && (
                    <div className="w-full space-y-2">
                      {msg.searchResults.map((result) => (
                        <a
                          key={result.url}
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block glass-card search-result-card rounded-2xl p-4 border border-border hover:border-primary/40"
                        >
                          <div className="flex items-start gap-2 justify-between">
                            <h4 className="font-bricolage font-semibold text-sm navvgenx-gradient-text">
                              {result.title}
                            </h4>
                            <ExternalLink className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 font-space leading-relaxed">
                            {result.snippet}
                          </p>
                          <p className="text-xs text-primary/60 mt-1.5 truncate">
                            {result.url}
                          </p>
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Link Embeds */}
                  {extractUrls(msg.content).map((url) => (
                    <LinkEmbed key={url} url={url} />
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading indicator — stays at bottom of visible area, doesn't auto-scroll */}
          {isLoading && (
            <div className="flex gap-3 items-start">
              <div className="shrink-0">
                <NavvLogoN size={32} />
              </div>
              <div
                className="glass-card border border-border rounded-2xl rounded-tl-sm px-4 py-3"
                data-ocid="chat.loading_state"
              >
                <div className="flex gap-1.5 items-center">
                  {[0, 1, 2].map((d) => (
                    <div
                      key={d}
                      className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
                      style={{ animationDelay: `${d * 0.15}s` }}
                    />
                  ))}
                  <span className="ml-2 text-xs text-muted-foreground font-space">
                    NavvGenX AI is thinking…
                  </span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="p-3 pb-3 border-t border-border relative">
          {/* Suggestions dropdown */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                ref={suggestionsRef}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="absolute bottom-full left-3 right-3 mb-2 glass-card rounded-2xl border border-border shadow-lg z-20 overflow-hidden"
              >
                <div className="flex items-center gap-2 px-3 py-2 border-b border-border/50">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-xs text-muted-foreground font-space font-medium">
                    Suggested
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowSuggestions(false)}
                    className="ml-auto text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setInput(s);
                      setShowSuggestions(false);
                      sendMessage(s);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm font-space text-foreground/80 hover:bg-muted/50 hover:text-foreground transition-colors border-b border-border/30 last:border-0"
                  >
                    {s}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Attached image preview */}
          {attachedImage && (
            <div className="flex items-center gap-2 mb-2 p-2 rounded-xl bg-muted/30 border border-border">
              <img
                src={attachedImage}
                alt="Attached"
                className="h-14 w-14 rounded-xl object-cover border border-border shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground font-space">
                  Image ready
                </p>
                <p className="text-xs text-muted-foreground font-space">
                  Describe what you want to know about this image...
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAttachedImage(null)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Edit mode indicator */}
          {editingMsgId && (
            <div className="flex items-center gap-2 mb-2 px-1">
              <Pencil className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs text-primary font-space">
                Editing message
              </span>
              <button
                type="button"
                onClick={() => {
                  setEditingMsgId(null);
                  setInput("");
                }}
                className="ml-auto text-xs text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          )}

          <input
            ref={imageAttachRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageAttach}
            data-ocid="chat.upload_button"
          />

          <div className="glass-card rounded-2xl flex items-center gap-2 px-3 py-2">
            <button
              type="button"
              onClick={() => imageAttachRef.current?.click()}
              className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
              title="Attach image"
              data-ocid="chat.upload_button"
            >
              <ImagePlus className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !e.shiftKey && handleSendWithImage()
              }
              onFocus={() =>
                input.trim().length >= 2 && setShowSuggestions(true)
              }
              placeholder={
                attachedImage
                  ? "Describe what you want to know about this image..."
                  : editingMsgId
                    ? "Edit your message..."
                    : "Ask NavvGenX AI anything..."
              }
              className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm font-space"
              data-ocid="chat.input"
            />
            {hasSpeechSupport && (
              <button
                type="button"
                onClick={handleVoiceInput}
                title={isRecording ? "Stop recording" : "Voice input"}
                className={`p-2 rounded-full transition-all ${
                  isRecording
                    ? "text-red-500 bg-red-50 dark:bg-red-900/30 animate-pulse scale-110"
                    : "text-muted-foreground hover:text-primary hover:bg-muted/50"
                }`}
                data-ocid="chat.toggle"
              >
                <ProfessionalMic size={16} />
              </button>
            )}
            <button
              type="button"
              onClick={handleCameraOpen}
              title="Camera"
              className="p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-muted/50 transition-all"
            >
              <Camera className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleSendWithImage}
              disabled={(!input.trim() && !attachedImage) || isLoading}
              className="navvgenx-gradient-btn p-2 rounded-xl disabled:opacity-40 disabled:hover:transform-none"
              data-ocid="chat.submit_button"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          {isRecording && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-red-500 text-xs font-space mt-1.5 flex items-center justify-center gap-1"
            >
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block" />
              Listening... speak now
            </motion.p>
          )}
        </div>
      </div>
    </div>
  );
}
