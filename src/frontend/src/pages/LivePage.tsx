import {
  ArrowDown,
  ArrowUp,
  Cloud,
  Droplets,
  ExternalLink,
  MapPin,
  Newspaper,
  RefreshCw,
  Thermometer,
  TrendingUp,
  Wind,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useNews } from "../hooks/useNews";
import { useWeather } from "../hooks/useWeather";

const BASE_MARKETS = [
  { symbol: "NIFTY 50", base: 22450.65, currency: "" },
  { symbol: "SENSEX", base: 73810.0, currency: "" },
  { symbol: "S&P 500", base: 5240.03, currency: "" },
  { symbol: "NASDAQ", base: 16421.5, currency: "" },
  { symbol: "GOLD", base: 73100.0, currency: "₹" },
  { symbol: "USD/INR", base: 83.42, currency: "" },
];

interface MarketItem {
  symbol: string;
  value: number;
  change: number;
  changePct: number;
  currency: string;
}

function initMarkets(): MarketItem[] {
  return BASE_MARKETS.map((m) => {
    const change = (Math.random() - 0.47) * m.base * 0.015;
    return {
      symbol: m.symbol,
      value: m.base,
      change,
      changePct: (change / m.base) * 100,
      currency: m.currency,
    };
  });
}

function useMarkets() {
  const [markets, setMarkets] = useState<MarketItem[]>(initMarkets);
  useEffect(() => {
    const tick = setInterval(() => {
      setMarkets((prev) =>
        prev.map((m) => {
          const delta = (Math.random() - 0.499) * m.value * 0.003;
          const newVal = m.value + delta;
          const newChange = m.change + delta;
          return {
            ...m,
            value: newVal,
            change: newChange,
            changePct:
              (newChange /
                BASE_MARKETS.find((b) => b.symbol === m.symbol)!.base) *
              100,
          };
        }),
      );
    }, 5000);
    return () => clearInterval(tick);
  }, []);
  return markets;
}

export function LivePage() {
  const {
    weather,
    location,
    loading: wLoading,
    error: wError,
    refresh,
    requestLocation,
    permissionDenied,
  } = useWeather();
  const {
    articles,
    loading: nLoading,
    error: nError,
    refresh: refreshNews,
  } = useNews();
  const markets = useMarkets();
  const gold = "oklch(0.78 0.15 75)";

  return (
    <div
      className="min-h-screen bg-background text-foreground"
      data-ocid="live.page"
    >
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="font-bricolage font-bold text-3xl navvgenx-gradient-text mb-1">
              Live Updates
            </h1>
            <p className="text-muted-foreground text-sm font-jakarta">
              Real-time weather, news & market data
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              refresh();
              refreshNews();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-jakarta font-medium transition-all hover:scale-105"
            style={{
              background: "oklch(0.72 0.14 75 / 0.12)",
              color: gold,
              border: "1px solid oklch(0.72 0.14 75 / 0.3)",
            }}
            data-ocid="live.button"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </motion.div>

        {/* ── LIVE WEATHER SECTION ── */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-6"
          style={{
            background: "oklch(0.12 0.020 265 / 0.85)",
            border: "1px solid oklch(0.72 0.14 75 / 0.18)",
          }}
          data-ocid="live.section"
        >
          <div className="flex items-center gap-2 mb-5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "oklch(0.72 0.14 75 / 0.15)" }}
            >
              <Thermometer className="w-4 h-4" style={{ color: gold }} />
            </div>
            <h2
              className="font-jakarta font-bold text-base"
              style={{ color: gold }}
            >
              Live Weather
            </h2>
          </div>

          {wLoading ? (
            <div className="space-y-3">
              {[60, 40, 80, 50].map((w) => (
                <div
                  key={w}
                  className="h-4 rounded-full animate-pulse"
                  style={{
                    width: `${w}%`,
                    background: "oklch(0.25 0.015 265)",
                  }}
                />
              ))}
            </div>
          ) : wError && permissionDenied ? (
            <div className="flex flex-col gap-3">
              <p
                className="text-sm font-jakarta"
                style={{ color: "oklch(0.70 0.02 265)" }}
              >
                Enable location to see weather.
              </p>
              <button
                type="button"
                onClick={requestLocation}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-jakarta font-semibold w-fit hover:scale-105 transition-all"
                style={{
                  background: "oklch(0.72 0.14 75 / 0.15)",
                  color: gold,
                  border: "1px solid oklch(0.72 0.14 75 / 0.3)",
                }}
              >
                <MapPin className="w-4 h-4" /> Request Location
              </button>
            </div>
          ) : weather && location ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-1 mb-1">
                  <MapPin
                    className="w-3.5 h-3.5"
                    style={{ color: "oklch(0.72 0.14 75 / 0.6)" }}
                  />
                  <span
                    className="text-xs font-jakarta"
                    style={{ color: "oklch(0.75 0.01 265)" }}
                  >
                    {location.display}
                  </span>
                </div>
                <span
                  className="text-6xl font-bricolage font-bold"
                  style={{ color: "oklch(0.95 0.01 265)" }}
                >
                  {weather.temp}°C
                </span>
                <p
                  className="text-sm font-jakarta mt-1"
                  style={{ color: "oklch(0.80 0.02 265)" }}
                >
                  {weather.condition}
                </p>
              </div>
              {[
                {
                  icon: <Thermometer className="w-5 h-5" />,
                  label: "Feels like",
                  value: `${weather.apparentTemp}°C`,
                },
                {
                  icon: <Droplets className="w-5 h-5" />,
                  label: "Humidity",
                  value: `${weather.humidity}%`,
                },
                {
                  icon: <Wind className="w-5 h-5" />,
                  label: "Wind",
                  value: `${weather.windSpeed} km/h`,
                },
                {
                  icon: <Cloud className="w-5 h-5" />,
                  label: "Rain chance",
                  value: `${weather.precipitation}%`,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl p-4"
                  style={{ background: "oklch(0.20 0.020 265 / 0.8)" }}
                >
                  <div style={{ color: gold }}>{item.icon}</div>
                  <p
                    className="text-xs font-jakarta mt-1"
                    style={{ color: "oklch(0.60 0.01 265)" }}
                  >
                    {item.label}
                  </p>
                  <p
                    className="text-xl font-bricolage font-bold"
                    style={{ color: "oklch(0.95 0.01 265)" }}
                  >
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </motion.section>

        {/* ── MARKET UPDATES SECTION ── */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-6"
          style={{
            background: "oklch(0.12 0.020 265 / 0.85)",
            border: "1px solid oklch(0.72 0.14 75 / 0.18)",
          }}
          data-ocid="live.section"
        >
          <div className="flex items-center gap-2 mb-5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "oklch(0.72 0.14 75 / 0.15)" }}
            >
              <TrendingUp className="w-4 h-4" style={{ color: gold }} />
            </div>
            <div>
              <h2
                className="font-jakarta font-bold text-base"
                style={{ color: gold }}
              >
                Market Updates
              </h2>
              <span
                className="text-xs font-jakarta"
                style={{ color: "oklch(0.50 0.01 265)" }}
              >
                Simulated • Updates every 5s
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {markets.map((m) => (
              <motion.div
                key={m.symbol}
                layout
                className="rounded-xl p-3"
                style={{ background: "oklch(0.18 0.018 265 / 0.8)" }}
                data-ocid="live.card"
              >
                <p
                  className="text-xs font-jakarta font-semibold mb-1"
                  style={{ color: "oklch(0.65 0.01 265)" }}
                >
                  {m.symbol}
                </p>
                <AnimatePresence mode="popLayout">
                  <motion.p
                    key={m.value.toFixed(2)}
                    initial={{ opacity: 0.5, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-lg font-bricolage font-bold"
                    style={{ color: "oklch(0.95 0.01 265)" }}
                  >
                    {m.currency}
                    {m.value.toFixed(2)}
                  </motion.p>
                </AnimatePresence>
                <div className="flex items-center gap-1 mt-0.5">
                  {m.change >= 0 ? (
                    <ArrowUp className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <ArrowDown className="w-3 h-3 text-red-400" />
                  )}
                  <span
                    className={`text-xs font-jakarta font-medium ${m.change >= 0 ? "text-emerald-400" : "text-red-400"}`}
                  >
                    {m.change >= 0 ? "+" : ""}
                    {m.change.toFixed(2)} ({m.changePct >= 0 ? "+" : ""}
                    {m.changePct.toFixed(2)}%)
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── LIVE HEADLINES SECTION — clearly separated ── */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl p-6"
          style={{
            background: "oklch(0.12 0.020 265 / 0.85)",
            border: "1px solid oklch(0.72 0.14 75 / 0.18)",
          }}
          data-ocid="live.section"
        >
          <div className="flex items-center gap-2 mb-5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "oklch(0.72 0.14 75 / 0.15)" }}
            >
              <Newspaper className="w-4 h-4" style={{ color: gold }} />
            </div>
            <div>
              <h2
                className="font-jakarta font-bold text-base"
                style={{ color: gold }}
              >
                Live Headlines
              </h2>
              <p
                className="text-xs font-jakarta"
                style={{ color: "oklch(0.55 0.01 265)" }}
              >
                Latest global news updates
              </p>
            </div>
          </div>

          {nLoading ? (
            <div className="space-y-4">
              {["sk1", "sk2", "sk3", "sk4", "sk5", "sk6", "sk7", "sk8"].map(
                (sk) => (
                  <div key={sk} className="space-y-1.5">
                    <div
                      className="h-4 rounded-full animate-pulse"
                      style={{
                        width: "85%",
                        background: "oklch(0.25 0.015 265)",
                      }}
                    />
                    <div
                      className="h-3 rounded-full animate-pulse"
                      style={{
                        width: "35%",
                        background: "oklch(0.22 0.012 265)",
                      }}
                    />
                  </div>
                ),
              )}
            </div>
          ) : nError ? (
            <p
              className="text-sm font-jakarta"
              style={{ color: "oklch(0.60 0.02 265)" }}
            >
              {nError}
            </p>
          ) : (
            <div className="space-y-3">
              {articles.map((article, i) => (
                <motion.a
                  key={article.link}
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  data-ocid={`live.item.${i + 1}`}
                  className="group flex items-start justify-between gap-3 rounded-xl p-3 -mx-1 transition-all hover:scale-[1.01]"
                  style={{ background: "transparent" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      "oklch(0.18 0.018 265 / 0.8)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      "transparent";
                  }}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bricolage font-bold shrink-0 mt-0.5"
                      style={{
                        background: "oklch(0.72 0.14 75 / 0.15)",
                        color: gold,
                      }}
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-jakarta leading-snug"
                        style={{ color: "oklch(0.90 0.01 265)" }}
                      >
                        {article.title}
                      </p>
                      {article.description && (
                        <p
                          className="text-xs font-jakarta mt-1 line-clamp-2"
                          style={{ color: "oklch(0.65 0.01 265)" }}
                        >
                          {article.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5">
                        <span
                          className="text-[10px] font-jakarta px-1.5 py-0.5 rounded"
                          style={{
                            background: "oklch(0.72 0.14 75 / 0.15)",
                            color: gold,
                          }}
                        >
                          {article.source}
                        </span>
                        <span
                          className="text-[10px] font-jakarta"
                          style={{ color: "oklch(0.50 0.01 265)" }}
                        >
                          {article.pubDate}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ExternalLink
                    className="w-4 h-4 flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-60 transition-opacity"
                    style={{ color: gold }}
                  />
                </motion.a>
              ))}
            </div>
          )}
        </motion.section>
      </div>
    </div>
  );
}
