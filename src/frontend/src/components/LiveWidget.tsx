import {
  Cloud,
  Droplets,
  ExternalLink,
  MapPin,
  Newspaper,
  RefreshCw,
  Thermometer,
  Wind,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { useNews } from "../hooks/useNews";
import { useWeather } from "../hooks/useWeather";
import { setLiveWeatherContext } from "../utils/aiEngine";

interface LiveWidgetProps {
  onNavigateToLive?: () => void;
}

export function LiveWidget({ onNavigateToLive }: LiveWidgetProps) {
  const {
    weather,
    location,
    loading: wLoading,
    error: wError,
    refresh,
    permissionDenied,
    requestLocation,
  } = useWeather();
  const { articles, loading: nLoading, refresh: refreshNews } = useNews();

  useEffect(() => {
    if (weather && location) {
      setLiveWeatherContext({
        temp: weather.temp,
        condition: weather.condition,
        location: location.display,
        humidity: weather.humidity,
        wind: weather.windSpeed,
      });
    }
  }, [weather, location]);

  const handleRefreshAll = () => {
    refresh();
    refreshNews();
  };

  const handleNewsClick = (e: React.MouseEvent, link: string) => {
    if (onNavigateToLive) {
      e.preventDefault();
      onNavigateToLive();
    } else {
      window.open(link, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div
      data-ocid="live.panel"
      className="relative w-full max-w-4xl mx-auto rounded-2xl overflow-hidden"
      style={{
        background: "oklch(0.12 0.020 265 / 0.85)",
        backdropFilter: "blur(16px)",
        border: "1px solid oklch(0.72 0.14 75 / 0.18)",
        boxShadow: "0 8px 40px oklch(0.08 0.020 265 / 0.6)",
      }}
    >
      {/* LIVE badge */}
      <div
        className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full z-10"
        style={{
          background: "oklch(0.20 0.020 265 / 0.9)",
          border: "1px solid oklch(0.4 0.01 265 / 0.3)",
        }}
      >
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <span
          className="text-xs font-jakarta font-bold tracking-wider"
          style={{ color: "oklch(0.72 0.14 75)" }}
        >
          LIVE
        </span>
      </div>

      {/* Refresh + Live Section button */}
      <div className="absolute top-3 right-24 flex items-center gap-2 z-10">
        {onNavigateToLive && (
          <button
            type="button"
            data-ocid="live.secondary_button"
            onClick={onNavigateToLive}
            className="px-2.5 py-1 rounded-full text-xs font-jakarta font-semibold transition-all hover:scale-105"
            style={{
              background: "oklch(0.72 0.14 75 / 0.15)",
              color: "oklch(0.72 0.14 75)",
              border: "1px solid oklch(0.72 0.14 75 / 0.3)",
            }}
          >
            View All
          </button>
        )}
        <button
          type="button"
          data-ocid="live.button"
          onClick={handleRefreshAll}
          className="p-1.5 rounded-full transition-all hover:scale-110"
          style={{
            background: "oklch(0.20 0.020 265 / 0.9)",
            border: "1px solid oklch(0.4 0.01 265 / 0.3)",
          }}
          title="Refresh live data"
        >
          <RefreshCw
            className="w-3.5 h-3.5"
            style={{ color: "oklch(0.72 0.14 75 / 0.8)" }}
          />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* Weather section */}
        <div
          className="p-5 border-b md:border-b-0 md:border-r"
          style={{ borderColor: "oklch(0.72 0.14 75 / 0.1)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Thermometer
              className="w-4 h-4"
              style={{ color: "oklch(0.72 0.14 75)" }}
            />
            <span
              className="text-xs font-jakarta font-semibold uppercase tracking-widest"
              style={{ color: "oklch(0.72 0.14 75 / 0.7)" }}
            >
              Live Weather
            </span>
          </div>

          {wLoading ? (
            <div className="space-y-3" data-ocid="live.loading_state">
              {[60, 40, 80].map((w) => (
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
            <div className="flex flex-col gap-3" data-ocid="live.error_state">
              <p
                className="text-sm font-jakarta"
                style={{ color: "oklch(0.70 0.02 265)" }}
              >
                Enable location to see weather.
              </p>
              <button
                type="button"
                onClick={requestLocation}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-jakarta font-semibold transition-all hover:scale-105 w-fit"
                style={{
                  background: "oklch(0.72 0.14 75 / 0.15)",
                  color: "oklch(0.72 0.14 75)",
                  border: "1px solid oklch(0.72 0.14 75 / 0.3)",
                }}
              >
                <MapPin className="w-3.5 h-3.5" />
                Request Location
              </button>
            </div>
          ) : wError ? (
            <p
              className="text-sm font-jakarta"
              style={{ color: "oklch(0.60 0.02 265)" }}
              data-ocid="live.error_state"
            >
              {wError}
            </p>
          ) : weather && location ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={weather.temp}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center gap-1.5 mb-1">
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

                <div className="flex items-end gap-2 mb-2">
                  <span
                    className="text-5xl font-bricolage font-bold"
                    style={{ color: "oklch(0.95 0.01 265)" }}
                  >
                    {weather.temp}°
                  </span>
                  <span
                    className="text-sm font-jakarta mb-2"
                    style={{ color: "oklch(0.65 0.01 265)" }}
                  >
                    Feels {weather.apparentTemp}°C
                  </span>
                </div>

                <p
                  className="text-sm font-jakarta mb-3"
                  style={{ color: "oklch(0.80 0.02 265)" }}
                >
                  {weather.condition}
                </p>

                {/* Pills: humidity, wind, rain */}
                <div className="flex gap-2 flex-wrap">
                  <span
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-jakarta"
                    style={{
                      background: "oklch(0.20 0.020 265 / 0.8)",
                      color: "oklch(0.72 0.14 75 / 0.9)",
                    }}
                  >
                    <Droplets className="w-3 h-3" />
                    {weather.humidity}% Humidity
                  </span>
                  <span
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-jakarta"
                    style={{
                      background: "oklch(0.20 0.020 265 / 0.8)",
                      color: "oklch(0.72 0.14 75 / 0.9)",
                    }}
                  >
                    <Wind className="w-3 h-3" />
                    {weather.windSpeed} km/h
                  </span>
                  <span
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-jakarta"
                    style={{
                      background: "oklch(0.20 0.020 265 / 0.8)",
                      color: "oklch(0.55 0.15 240 / 0.9)",
                    }}
                  >
                    <Cloud className="w-3 h-3" />
                    🌧️ {weather.precipitation}% Rain
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          ) : null}
        </div>

        {/* News section */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Newspaper
              className="w-4 h-4"
              style={{ color: "oklch(0.72 0.14 75)" }}
            />
            <span
              className="text-xs font-jakarta font-semibold uppercase tracking-widest"
              style={{ color: "oklch(0.72 0.14 75 / 0.7)" }}
            >
              Live Headlines
            </span>
          </div>

          {nLoading ? (
            <div className="space-y-3" data-ocid="news.loading_state">
              {[1, 2, 3, 4].map((i) => (
                <div key={`news-skel-${i}`} className="space-y-1.5">
                  <div
                    className="h-3.5 rounded-full animate-pulse"
                    style={{
                      width: "90%",
                      background: "oklch(0.25 0.015 265)",
                    }}
                  />
                  <div
                    className="h-2.5 rounded-full animate-pulse"
                    style={{
                      width: "40%",
                      background: "oklch(0.22 0.012 265)",
                    }}
                  />
                </div>
              ))}
            </div>
          ) : articles.length === 0 ? (
            <p
              className="text-sm font-jakarta"
              style={{ color: "oklch(0.60 0.02 265)" }}
              data-ocid="news.empty_state"
            >
              No headlines available.
            </p>
          ) : (
            <div className="space-y-2.5">
              {articles.slice(0, 5).map((article, i) => (
                <motion.div
                  key={article.link}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  data-ocid={`news.item.${i + 1}`}
                  className="group flex items-start justify-between gap-2 rounded-xl p-2 -mx-2 transition-all hover:scale-[1.01] cursor-pointer"
                  style={{ background: "transparent" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      "oklch(0.20 0.020 265 / 0.7)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      "transparent";
                  }}
                  onClick={(e) => handleNewsClick(e, article.link)}
                >
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-xs font-jakarta leading-snug line-clamp-2"
                      style={{ color: "oklch(0.88 0.01 265)" }}
                    >
                      {article.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className="text-[10px] font-jakarta px-1.5 py-0.5 rounded"
                        style={{
                          background: "oklch(0.72 0.14 75 / 0.15)",
                          color: "oklch(0.72 0.14 75)",
                        }}
                      >
                        {article.source}
                      </span>
                      <span
                        className="text-[10px] font-jakarta"
                        style={{ color: "oklch(0.55 0.01 265)" }}
                      >
                        {article.pubDate}
                      </span>
                    </div>
                  </div>
                  <ExternalLink
                    className="w-3 h-3 flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-60 transition-opacity"
                    style={{ color: "oklch(0.72 0.14 75)" }}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
