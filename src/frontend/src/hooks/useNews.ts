import { useCallback, useEffect, useRef, useState } from "react";

export interface NewsArticle {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  source: string;
}

const REFRESH_INTERVAL = 15 * 60 * 1000;

function timeAgo(dateStr: string): string {
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  } catch {
    return "";
  }
}

type RSSItem = {
  title: string;
  link: string;
  pubDate: string;
  description: string;
};

async function fetchFeed(
  rssUrl: string,
  sourceName: string,
): Promise<NewsArticle[]> {
  const res = await fetch(
    `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}&count=20`,
  );
  const data = await res.json();
  if (!data.items || !Array.isArray(data.items)) throw new Error("No articles");
  return data.items.map((item: RSSItem) => ({
    title: item.title,
    link: item.link,
    pubDate: timeAgo(item.pubDate),
    description: item.description?.replace(/<[^>]+>/g, "").slice(0, 160) ?? "",
    source: sourceName,
  }));
}

export function useNews() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      let items: NewsArticle[];
      try {
        items = await fetchFeed(
          "https://feeds.bbci.co.uk/news/rss.xml",
          "BBC News",
        );
      } catch {
        items = await fetchFeed(
          "https://timesofindia.indiatimes.com/rssfeedstopstories.cms",
          "Times of India",
        );
      }
      setArticles(items);
      setError(null);
    } catch {
      setError("Could not load news. Check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => fetchNews(), [fetchNews]);

  useEffect(() => {
    fetchNews();
    timerRef.current = setInterval(fetchNews, REFRESH_INTERVAL);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetchNews]);

  return { articles, loading, error, refresh };
}
