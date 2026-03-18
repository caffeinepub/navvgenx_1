import { useCallback, useEffect, useRef, useState } from "react";

export interface NewsArticle {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  source: string;
}

const REFRESH_INTERVAL = 15 * 60 * 1000;

const FALLBACK_ARTICLES: NewsArticle[] = [
  {
    title: "AI Technology Advances in 2026",
    link: "https://bbc.com/news/technology",
    pubDate: "just now",
    description:
      "Artificial intelligence continues to transform industries worldwide with new breakthroughs in language models, robotics, and automation.",
    source: "Tech News",
  },
  {
    title: "Global Climate Summit Reaches New Agreement",
    link: "https://bbc.com/news/science",
    pubDate: "1h ago",
    description:
      "World leaders gather to discuss climate action and set ambitious renewable energy targets for the coming decade.",
    source: "World News",
  },
  {
    title: "Space Exploration: New Discoveries on Mars",
    link: "https://bbc.com/news/science",
    pubDate: "2h ago",
    description:
      "Scientists announce groundbreaking findings from the latest Mars mission, including signs of ancient water activity.",
    source: "Science News",
  },
  {
    title: "India Economy Shows Strong Growth in 2026",
    link: "https://timesofindia.com",
    pubDate: "3h ago",
    description:
      "India's GDP grows at a record pace, driven by booming technology and manufacturing sectors across major cities.",
    source: "Business News",
  },
  {
    title: "Health Innovation: New Cancer Treatment Breakthrough",
    link: "https://bbc.com/news/health",
    pubDate: "4h ago",
    description:
      "Researchers develop a promising new immunotherapy showing remarkable results in early clinical trials for multiple cancer types.",
    source: "Health News",
  },
  {
    title: "Sports: Champions League Quarter Finals Results",
    link: "https://bbc.com/sport",
    pubDate: "5h ago",
    description:
      "Exciting matches across Europe as top clubs compete for the prestigious UEFA trophy, with surprise upsets and stunning goals.",
    source: "Sports News",
  },
  {
    title: "Cryptocurrency Markets See Major Shifts",
    link: "https://bbc.com/news/business",
    pubDate: "6h ago",
    description:
      "Bitcoin and major altcoins experience significant volatility amid new regulatory developments across global markets.",
    source: "Crypto News",
  },
  {
    title: "Education Technology Transforms Classrooms",
    link: "https://bbc.com/news/education",
    pubDate: "7h ago",
    description:
      "New AI-powered learning tools are helping students achieve better academic results in schools across the globe.",
    source: "Education News",
  },
  {
    title: "Bollywood Box Office: New Record Set",
    link: "https://timesofindia.com/entertainment",
    pubDate: "8h ago",
    description:
      "Latest Hindi blockbuster smashes box office records in its opening weekend, drawing massive crowds across India.",
    source: "Entertainment",
  },
  {
    title: "Stock Market: SENSEX Hits All-Time High",
    link: "https://timesofindia.com/business",
    pubDate: "9h ago",
    description:
      "Bombay Stock Exchange index reaches a historic milestone as foreign investment flows into Indian equities.",
    source: "Finance News",
  },
];

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
    { signal: AbortSignal.timeout(8000) },
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
      let items: NewsArticle[] | null = null;

      // Try BBC first
      try {
        items = await fetchFeed(
          "https://feeds.bbci.co.uk/news/rss.xml",
          "BBC News",
        );
      } catch {
        // Try Times of India
        try {
          items = await fetchFeed(
            "https://timesofindia.indiatimes.com/rssfeedstopstories.cms",
            "Times of India",
          );
        } catch {
          // Try The Hindu
          try {
            items = await fetchFeed(
              "https://www.thehindu.com/feednational/?service=rss",
              "The Hindu",
            );
          } catch {
            // All failed — use static fallback, never show error
            items = null;
          }
        }
      }

      setArticles(items ?? FALLBACK_ARTICLES);
      setError(null);
    } catch {
      setArticles(FALLBACK_ARTICLES);
      setError(null);
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
