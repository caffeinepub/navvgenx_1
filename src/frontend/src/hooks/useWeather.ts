import { useCallback, useEffect, useRef, useState } from "react";

const WMO_CODES: Record<number, string> = {
  0: "Clear sky ☀️",
  1: "Mostly clear 🌤️",
  2: "Partly cloudy ⛅",
  3: "Overcast ☁️",
  45: "Foggy 🌫️",
  48: "Icy fog 🌫️",
  51: "Light drizzle 🌦️",
  53: "Drizzle 🌦️",
  55: "Heavy drizzle 🌦️",
  61: "Light rain 🌧️",
  63: "Rain 🌧️",
  65: "Heavy rain 🌧️",
  71: "Light snow 🌨️",
  73: "Snow 🌨️",
  75: "Heavy snow ❄️",
  80: "Rain showers 🌦️",
  81: "Rain showers 🌧️",
  82: "Violent showers ⛈️",
  95: "Thunderstorm ⛈️",
};

export interface WeatherData {
  temp: number;
  apparentTemp: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  condition: string;
  precipitation: number; // rain probability %
}

export interface LocationData {
  city: string;
  country: string;
  display: string;
}

const REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchWeatherByCoords = useCallback(
    async (
      lat: number,
      lng: number,
      cityHint?: string,
      countryHint?: string,
    ) => {
      try {
        const [weatherRes, geoRes] = await Promise.all([
          fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation_probability&timezone=auto`,
          ),
          cityHint
            ? Promise.resolve(null)
            : fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
              ),
        ]);

        const weatherJson = await weatherRes.json();
        const geoJson = geoRes ? await geoRes.json() : null;

        const cur = weatherJson.current;
        const code = cur.weather_code as number;

        setWeather({
          temp: Math.round(cur.temperature_2m),
          apparentTemp: Math.round(cur.apparent_temperature),
          humidity: Math.round(cur.relative_humidity_2m),
          windSpeed: Math.round(cur.wind_speed_10m),
          weatherCode: code,
          condition: WMO_CODES[code] ?? "Cloudy ☁️",
          precipitation: Math.round(cur.precipitation_probability ?? 0),
        });

        const city =
          cityHint ||
          geoJson?.city ||
          geoJson?.locality ||
          geoJson?.principalSubdivision ||
          "Unknown";
        const country = countryHint || geoJson?.countryName || "";
        setLocation({
          city,
          country,
          display: country ? `${city}, ${country}` : city,
        });
        setError(null);
      } catch {
        setError("Failed to load weather data.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const fetchByIP = useCallback(async () => {
    try {
      const ipRes = await fetch("https://ipapi.co/json/");
      const ipData = await ipRes.json();
      if (ipData.latitude && ipData.longitude) {
        await fetchWeatherByCoords(
          ipData.latitude,
          ipData.longitude,
          ipData.city,
          ipData.country_name,
        );
      } else {
        setError("Unable to determine location.");
        setLoading(false);
      }
    } catch {
      setError("Unable to determine location.");
      setLoading(false);
    }
  }, [fetchWeatherByCoords]);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      // Fallback to IP
      fetchByIP();
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPermissionDenied(false);
        fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        // Permission denied — fallback to IP
        setPermissionDenied(false);
        fetchByIP();
      },
      { timeout: 8000, maximumAge: 300000 },
    );
  }, [fetchWeatherByCoords, fetchByIP]);

  const refresh = useCallback(() => {
    requestLocation();
  }, [requestLocation]);

  useEffect(() => {
    requestLocation();
    timerRef.current = setInterval(requestLocation, REFRESH_INTERVAL);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [requestLocation]);

  return {
    weather,
    location,
    loading,
    error,
    refresh,
    permissionDenied,
    requestLocation,
  };
}
