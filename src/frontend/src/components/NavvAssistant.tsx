import { Mic, MicOff, Send, Volume2, VolumeX, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

interface Message {
  id: string;
  role: "navv" | "user";
  text: string;
  timestamp: Date;
}

interface NavvAssistantProps {
  darkMode?: boolean;
}

// ─── NavvLogo SVG ────────────────────────────────────────────────────────────
function NavvLogo({
  size = 32,
  dark = false,
}: { size?: number; dark?: boolean }) {
  const gold = dark ? "oklch(0.78 0.15 75)" : "oklch(0.65 0.14 75)";
  const navy = dark ? "oklch(0.08 0.022 265)" : "oklch(0.10 0.020 265)";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Navv logo"
    >
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
        y="27"
        textAnchor="middle"
        fontFamily="'Space Grotesk', Arial, sans-serif"
        fontWeight="700"
        fontSize="22"
        fill={gold}
        letterSpacing="-0.5"
      >
        N
      </text>
    </svg>
  );
}

// ─── Knowledge base ────────────────────────────────────────────────────────────
function getNavvAnswer(query: string): string {
  const q = query.toLowerCase().trim();

  if (
    /^(hi|hello|hey|good morning|good afternoon|good evening|howdy)/.test(q)
  ) {
    return "Hello! I'm Navv, your AI assistant. I'm here to help you with anything — fashion, health, tech, travel, science, or just a friendly chat. What's on your mind?";
  }
  if (/how are you|how do you do|what's up|wassup/.test(q)) {
    return "I'm doing great, thank you for asking! I'm always ready to assist you. What can I help you with today?";
  }
  if (
    /what can you do|what do you know|your capabilities|help me with/.test(q)
  ) {
    return "I can help you with a wide range of topics! Ask me about fashion & style, health & fitness, technology, travel destinations, food & recipes, science & space, history, sports, music, business & careers, coding, or any general knowledge question. I also speak my answers aloud — just listen!";
  }
  if (/old money|old-money/.test(q)) {
    return "Old Money aesthetic is about quiet luxury and understated elegance. Key pieces: tailored blazers, cashmere sweaters, Oxford shirts, chino trousers, loafers, and polo shirts. Stick to a neutral palette — cream, navy, camel, burgundy, forest green. Preferred brands include Ralph Lauren, Loro Piana, Brunello Cucinelli, and Brooks Brothers. The rule: quality over logos, always.";
  }
  if (/quiet luxury|stealth wealth/.test(q)) {
    return "Quiet Luxury (Stealth Wealth) is about wearing expensive pieces with no visible branding. Think The Row, Bottega Veneta, Loro Piana. Tonal dressing — one or two neutral colors head-to-toe. Impeccable fit is everything. Materials matter: cashmere, fine wool, supple leather.";
  }
  if (/dark academia/.test(q)) {
    return "Dark Academia aesthetic channels scholarly elegance. Essentials: tweed blazers, turtleneck sweaters, Oxford shoes, plaid trousers, long wool coats. Rich autumn tones — brown, burgundy, dark green, ivory. Pair with a leather satchel and round glasses for the full look.";
  }
  if (/streetwear|street style/.test(q)) {
    return "Streetwear blends comfort and culture. Key brands: Supreme, Off-White, Palace, Stüssy, A Bathing Ape. Essential pieces: graphic tees, hoodies, baggy denim, cargo pants, and sneakers (Nike Air Force 1, Jordan 1, Yeezy). Layer boldly and don't be afraid of statement pieces.";
  }
  if (/y2k|y 2k|2000s fashion/.test(q)) {
    return "Y2K fashion is back! Think low-rise jeans, butterfly tops, mini skirts, platform shoes, and bold metallics. Key accessories: tinted sunglasses, chunky belts, micro bags. Colors: hot pink, lime green, silver, baby blue. Key brands: Juicy Couture, Von Dutch, and Miss Sixty.";
  }
  if (/cottagecore|cottage core/.test(q)) {
    return "Cottagecore celebrates rural romance. Flowy floral dresses, puffed sleeves, linen blouses, prairie skirts, and wicker baskets. Muted earthy tones — sage green, dusty rose, warm cream. Add a straw hat and Mary Jane shoes to complete the enchanting look.";
  }
  if (/fashion trend|style trend|what to wear/.test(q)) {
    return "2025 fashion trends include: quiet luxury with neutral tones, Y2K revival, coquette aesthetic with bows and pastels, utility wear (cargo pockets, functional details), and sheer layering. Sustainable fashion from brands like Everlane and Patagonia is also surging. The key rule this season: wear what makes YOU feel confident.";
  }
  if (/outfit|clothes|wardrobe|dress/.test(q)) {
    return "Building a great wardrobe starts with quality basics: white tee, straight-leg jeans, a versatile blazer, simple sneakers, and a few statement accessories. Invest in 'cost per wear' — buy fewer but better pieces. Capsule wardrobes of 30-40 items that mix and match give infinite outfit combinations.";
  }
  if (/weight loss|lose weight|fat loss/.test(q)) {
    return "Sustainable weight loss is about a calorie deficit + protein intake + movement. Aim for 0.5–1 lb per week. Prioritize: lean proteins (chicken, eggs, legumes), vegetables, whole grains. Walk 8,000+ steps daily, add 3x strength training per week. Sleep 7–9 hours — poor sleep spikes hunger hormones. No fad diets; consistency wins.";
  }
  if (/muscle|build muscle|gym|workout|exercise/.test(q)) {
    return "To build muscle: progressive overload is key — gradually increase weight or reps each session. Focus on compound lifts: squat, bench press, deadlift, rows, overhead press. Eat 0.7–1g of protein per pound of body weight. Rest 48 hours between working the same muscle group. Sleep is when muscles actually grow!";
  }
  if (/mental health|anxiety|stress|depression/.test(q)) {
    return "Mental health matters! Daily habits that help: 10 minutes of mindfulness or meditation, regular exercise (proven mood booster), journaling, limiting social media, and staying connected with loved ones. If you're struggling, please reach out to a mental health professional — therapy is a strength, not a weakness.";
  }
  if (/nutrition|diet|healthy eating|food health/.test(q)) {
    return "A balanced diet includes: colorful vegetables (fill half your plate), lean proteins, whole grains, healthy fats (avocado, olive oil, nuts), and plenty of water. Minimize ultra-processed foods, added sugars, and excess sodium. The Mediterranean diet is consistently ranked among the healthiest worldwide.";
  }
  if (/sleep|insomnia|rest/.test(q)) {
    return "Quality sleep tips: keep a consistent sleep schedule (even weekends), keep your room cool (65–68°F), avoid screens 1 hour before bed, limit caffeine after 2pm, and try a short wind-down routine. Adults need 7–9 hours. Poor sleep impacts mood, metabolism, immunity, and cognitive function.";
  }
  if (/artificial intelligence|machine learning|ai|ml/.test(q)) {
    return "Artificial Intelligence (AI) is transforming every industry. Large Language Models (LLMs) like GPT-4 and Gemini can write, code, and reason. Machine Learning lets systems learn from data without explicit programming. Key subfields: NLP (natural language processing), computer vision, reinforcement learning, and generative AI. We're in the most exciting era of AI in history!";
  }
  if (/coding|programming|learn to code|software/.test(q)) {
    return "Best languages to learn in 2025: Python (AI/data science/backend), JavaScript/TypeScript (web frontend/backend), Rust (systems/performance), Swift (iOS), Kotlin (Android). Start with Python for beginners — it's readable, versatile, and has a massive community. Free resources: freeCodeCamp, The Odin Project, CS50 on edX.";
  }
  if (/blockchain|crypto|bitcoin|web3/.test(q)) {
    return "Blockchain is a decentralized, immutable ledger. Bitcoin is digital gold — a store of value. Ethereum enables smart contracts and DeFi (decentralized finance). NFTs are tokens that prove digital ownership. Web3 envisions a user-owned internet. The space is volatile and evolving — always research before investing.";
  }
  if (/smartphone|iphone|android|phone/.test(q)) {
    return "iPhone vs Android in 2025: iPhone (iOS) offers seamless ecosystem integration, strong privacy, consistent updates, and Face ID. Android offers more customization, diverse price points, better file management, and Google integration. iPhone 16 Pro and Samsung Galaxy S25 Ultra are the current flagships. Choose based on your ecosystem preference.";
  }
  if (/travel|destination|vacation|trip|visit/.test(q)) {
    return "Top travel destinations for 2025: Japan (cherry blossoms, Tokyo street food, ancient temples), Italy (Amalfi Coast, Florence, Venice), Morocco (Marrakech medinas, Sahara desert), Peru (Machu Picchu, Amazon), Iceland (Northern Lights, midnight sun), and Vietnam (Ha Long Bay, Hoi An). Start with your passport, a flexible mindset, and Google Flights for deals!";
  }
  if (/japan|tokyo|kyoto|osaka/.test(q)) {
    return "Japan is a must-visit! Tokyo for futuristic energy, Shibuya crossing, Harajuku fashion, and incredible ramen. Kyoto for temples, geishas, and traditional ryokan stays. Osaka for street food heaven (takoyaki, okonomiyaki) and the Dotonbori entertainment district. Best time to visit: March-May for cherry blossoms or October-November for autumn foliage.";
  }
  if (/europe|paris|london|rome|spain/.test(q)) {
    return "Europe's best: Paris (Eiffel Tower, Louvre, café culture), Rome (Colosseum, Vatican, pasta), Barcelona (Sagrada Família, La Boqueria, Gaudí's architecture), London (British Museum, street markets, Notting Hill), and Santorini (whitewashed cliffs, sunset views). Eurail Pass is great for multi-country travel!";
  }
  if (/recipe|cook|cooking|how to make|how do i make/.test(q)) {
    return "Great cooking starts with mastering basics: knife skills, heat control, seasoning with salt at each stage, and mise en place (prepping ingredients before cooking). Start with simple recipes: pasta aglio e olio (garlic, olive oil, pasta — 15 minutes), scrambled eggs with butter, and a basic vinaigrette. YouTube channels like Joshua Weissman and Binging with Babish are excellent free resources.";
  }
  if (/pizza|pasta|italian food/.test(q)) {
    return "Italian food secrets: use San Marzano tomatoes for sauce, bronze-die extruded pasta (rough texture holds sauce better), always salt your pasta water generously, never rinse cooked pasta, and finish pasta IN the sauce over heat. For pizza: a 72-hour cold-fermented dough, high hydration (65%+), and a very hot oven (500°F+) are the keys.";
  }
  if (/space|nasa|mars|moon|planet|galaxy|universe/.test(q)) {
    return "Space is mind-blowing! The observable universe is 93 billion light-years across with 2 trillion galaxies. Mars missions: NASA's Perseverance rover is searching for ancient microbial life. SpaceX Starship aims to take humans to Mars within this decade. The James Webb Space Telescope is revealing galaxies from just 300 million years after the Big Bang. We are made of stardust!";
  }
  if (/climate change|global warming|environment/.test(q)) {
    return "Climate change is the defining challenge of our era. Global temperature has risen ~1.2°C since pre-industrial times. Key impacts: extreme weather, sea level rise, coral bleaching, biodiversity loss. Solutions: renewable energy (solar + wind now cheaper than fossil fuels), electric vehicles, regenerative agriculture, and reducing consumption. Individual and systemic change both matter.";
  }
  if (/history|ancient|world war|civilization|empire/.test(q)) {
    return "History is the story of humanity's triumphs and failures. Key turning points: the Agricultural Revolution (~10,000 BC), rise of ancient civilizations (Egypt, Greece, Rome), the Renaissance, Industrial Revolution, World Wars I & II, and the Digital Revolution. Understanding history helps us recognize patterns and avoid past mistakes.";
  }
  if (/music|song|artist|album|playlist/.test(q)) {
    return "Music in 2025 is incredibly diverse! Trending genres: Afrobeats (Burna Boy, Wizkid), hyperpop, lo-fi hip hop, neo-soul (SZA, Summer Walker), and bedroom pop. Classic recommendations: for focus — lo-fi playlists or classical music. For workouts — hip hop or electronic. For mood lift — reggae or jazz. Music literally changes your brain chemistry!";
  }
  if (/business|startup|entrepreneur|career|job/.test(q)) {
    return "To succeed in business: solve a real problem, know your customer deeply, and iterate fast. Key skills for 2025 careers: AI literacy, data analysis, communication, adaptability, and emotional intelligence. For job hunting: LinkedIn optimization, building a portfolio, and warm introductions beat cold applications. The best time to start is now!";
  }
  if (/football|soccer|basketball|tennis|sports|athlete/.test(q)) {
    return "Sports are incredible for physical and mental health. In 2025, follow: Premier League football (Arsenal, Manchester City rivalry), NBA (Wembanyama's rise, LeBron's legacy), Wimbledon tennis, and Formula 1 racing (Max Verstappen era). Regular exercise and following a sport you love makes staying active feel effortless!";
  }
  return "That's a fascinating question! I'd love to explore that with you more. Ask me about fashion & style, health & fitness, technology, travel, food, science & space, history, music, business, or coding — I'm here to help with anything! For even deeper research, try the 'Search Google' or 'Ask ChatGPT' buttons in the chat page.";
}

// ─── Sound wave bars ────────────────────────────────────────────────────────────
function SoundWaves() {
  return (
    <div className="flex items-center gap-0.5 h-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={i}
          className="w-0.5 rounded-full"
          style={{ background: "oklch(0.78 0.15 75)" }}
          animate={{ height: [4, 12, 4, 8, 4] }}
          transition={{
            duration: 0.8,
            repeat: Number.POSITIVE_INFINITY,
            delay: i * 0.12,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────
export function NavvAssistant({ darkMode = false }: NavvAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  const speak = useCallback(
    (text: string) => {
      if (isMuted || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.1;
      utterance.volume = 1;

      const setVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        const preferred = voices.find(
          (v) =>
            v.name.toLowerCase().includes("google uk english female") ||
            v.name.toLowerCase().includes("samantha") ||
            v.name.toLowerCase().includes("karen") ||
            v.name.toLowerCase().includes("female") ||
            v.name.toLowerCase().includes("zira"),
        );
        if (preferred) utterance.voice = preferred;
      };

      if (window.speechSynthesis.getVoices().length > 0) {
        setVoice();
      } else {
        window.speechSynthesis.addEventListener("voiceschanged", setVoice, {
          once: true,
        });
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [isMuted],
  );

  useEffect(() => {
    if (isOpen && !hasGreeted) {
      setHasGreeted(true);
      const greetMsg: Message = {
        id: "greeting",
        role: "navv",
        text: "I am Navv — how can I help you today? Ask me anything about fashion, health, tech, travel, science, or any topic!",
        timestamp: new Date(),
      };
      setMessages([greetMsg]);
      setTimeout(() => {
        speak("I am Navv, how can I help you?");
        inputRef.current?.focus();
      }, 400);
    }
  }, [isOpen, hasGreeted, speak]);

  useEffect(() => {
    if (!isOpen) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
    }
  }, [isOpen]);

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const userMsg: Message = {
        id: `u-${Date.now()}`,
        role: "user",
        text: trimmed,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInputText("");

      setTimeout(() => {
        const answer = getNavvAnswer(trimmed);
        const navvMsg: Message = {
          id: `n-${Date.now()}`,
          role: "navv",
          text: answer,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, navvMsg]);
        speak(answer);
      }, 500);
    },
    [speak],
  );

  const handleSubmit = () => sendMessage(inputText);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputText);
    }
  };

  const toggleMic = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in your browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = e.results[0][0].transcript;
      sendMessage(transcript);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const toggleMute = () => {
    setIsMuted((m) => {
      if (!m) window.speechSynthesis?.cancel();
      return !m;
    });
  };

  // Theme colors
  const gold = darkMode ? "oklch(0.78 0.15 75)" : "oklch(0.65 0.14 75)";
  const navy = darkMode ? "oklch(0.08 0.022 265)" : "oklch(0.10 0.020 265)";
  const goldGlow = darkMode
    ? "0 0 20px 4px oklch(0.78 0.15 75 / 0.45), 0 0 40px 10px oklch(0.08 0.022 265 / 0.5)"
    : "0 0 18px 3px oklch(0.65 0.14 75 / 0.4), 0 0 36px 8px oklch(0.10 0.020 265 / 0.35)";
  const goldGlowActive = darkMode
    ? "0 0 32px 10px oklch(0.78 0.15 75 / 0.65), 0 0 60px 18px oklch(0.08 0.022 265 / 0.6)"
    : "0 0 28px 8px oklch(0.65 0.14 75 / 0.55), 0 0 52px 14px oklch(0.10 0.020 265 / 0.45)";

  return (
    <>
      {/* Floating Orb Button */}
      <motion.button
        data-ocid="navv.open_modal_button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full flex items-center justify-center cursor-pointer focus-visible:outline-none"
        style={{
          background: navy,
          border: `2px solid ${gold}`,
        }}
        animate={{
          scale: isSpeaking ? [1, 1.1, 1] : [1, 1.04, 1],
          boxShadow: isSpeaking
            ? [goldGlow, goldGlowActive, goldGlow]
            : [goldGlow, goldGlowActive, goldGlow],
        }}
        transition={{
          duration: isSpeaking ? 0.6 : 2.5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open Navv AI Assistant"
      >
        <NavvLogo size={36} dark={darkMode} />
        {isSpeaking && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ border: `2px solid ${gold}` }}
            animate={{ scale: [1, 1.3, 1.6], opacity: [0.7, 0.3, 0] }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
          />
        )}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="navv-panel"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            className="fixed bottom-28 right-6 z-50 w-[370px] max-w-[calc(100vw-2rem)] rounded-2xl overflow-hidden flex flex-col"
            style={{
              maxHeight: "520px",
              background: darkMode
                ? "oklch(0.11 0.024 265 / 0.96)"
                : "oklch(0.99 0.004 80 / 0.97)",
              backdropFilter: "blur(20px) saturate(180%)",
              WebkitBackdropFilter: "blur(20px) saturate(180%)",
              border: `1px solid ${gold}40`,
              boxShadow: darkMode
                ? `0 24px 64px oklch(0.05 0.02 265 / 0.7), 0 0 0 1px ${gold}18`
                : `0 24px 64px oklch(0.3 0.04 265 / 0.25), 0 0 0 1px ${gold}22`,
            }}
          >
            {/* Header — always navy */}
            <div
              className="flex items-center justify-between px-4 py-3 flex-shrink-0"
              style={{
                background: navy,
                borderBottom: `1px solid ${gold}30`,
              }}
            >
              <div className="flex items-center gap-2.5">
                <NavvLogo size={30} dark={true} />
                <div>
                  <p
                    className="font-semibold text-sm"
                    style={{
                      color: gold,
                      fontFamily: "'Playfair Display', serif",
                    }}
                  >
                    Navv
                  </p>
                  <div className="flex items-center gap-1.5">
                    {isSpeaking ? (
                      <>
                        <SoundWaves />
                        <span
                          className="text-xs"
                          style={{ color: `${gold}B0` }}
                        >
                          Speaking…
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span
                          className="text-xs"
                          style={{ color: `${gold}90` }}
                        >
                          Your AI Assistant
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
                  style={{ color: `${gold}B0` }}
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                </button>
                <button
                  type="button"
                  data-ocid="navv.close_button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
                  style={{ color: `${gold}B0` }}
                  aria-label="Close Navv assistant"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
              style={{ minHeight: 0 }}
            >
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "navv" && (
                    <div className="flex-shrink-0 mr-2 mt-0.5">
                      <NavvLogo size={22} dark={darkMode} />
                    </div>
                  )}
                  <div
                    className="max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed"
                    style={
                      msg.role === "navv"
                        ? {
                            background: darkMode
                              ? "oklch(0.17 0.024 265)"
                              : "oklch(0.13 0.022 265)",
                            color: "oklch(0.93 0.006 80)",
                            borderRadius: "4px 18px 18px 18px",
                            borderLeft: `2px solid ${gold}60`,
                          }
                        : {
                            background: `linear-gradient(135deg, ${navy}, oklch(0.15 0.028 265))`,
                            color: gold,
                            border: `1px solid ${gold}30`,
                            borderRadius: "18px 4px 18px 18px",
                          }
                    }
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Row */}
            <div
              className="flex items-center gap-2 px-3 py-3 flex-shrink-0"
              style={{
                borderTop: `1px solid ${gold}20`,
                background: darkMode
                  ? "oklch(0.13 0.024 265 / 0.9)"
                  : "oklch(0.97 0.003 80 / 0.96)",
              }}
            >
              <input
                ref={inputRef}
                data-ocid="navv.input"
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything…"
                className="flex-1 bg-transparent text-sm outline-none placeholder:opacity-50"
                style={{
                  color: darkMode ? "oklch(0.93 0.006 80)" : navy,
                }}
              />
              <button
                type="button"
                data-ocid="navv.toggle"
                onClick={toggleMic}
                className="p-2 rounded-xl transition-all flex-shrink-0"
                style={{
                  background: isListening
                    ? "oklch(0.55 0.2 25 / 0.2)"
                    : `${gold}1A`,
                  color: isListening ? "oklch(0.65 0.2 25)" : `${gold}B0`,
                }}
                aria-label={
                  isListening ? "Stop listening" : "Start voice input"
                }
              >
                {isListening ? (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{
                      duration: 0.6,
                      repeat: Number.POSITIVE_INFINITY,
                    }}
                  >
                    <MicOff size={16} />
                  </motion.div>
                ) : (
                  <Mic size={16} />
                )}
              </button>
              <button
                type="button"
                data-ocid="navv.submit_button"
                onClick={handleSubmit}
                disabled={!inputText.trim()}
                className="p-2 rounded-xl transition-all flex-shrink-0 disabled:opacity-30"
                style={{
                  background: inputText.trim()
                    ? `linear-gradient(135deg, ${gold}, oklch(0.60 0.16 70))`
                    : `${gold}1A`,
                  color: inputText.trim() ? navy : `${gold}66`,
                }}
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
