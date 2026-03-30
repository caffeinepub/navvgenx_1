import { useCallback, useEffect, useRef, useState } from "react";

export interface NewsArticle {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  source: string;
}

const REFRESH_INTERVAL = 15 * 60 * 1000;

const STATIC_NEWS: NewsArticle[] = [
  {
    title: "AI Technology Advances Rapidly in 2025",
    link: "https://www.bbc.com/news/technology",
    pubDate: "just now",
    description:
      "Artificial intelligence continues to transform industries worldwide with new breakthroughs.",
    source: "BBC News",
  },
  {
    title: "Global Climate Summit Reaches New Agreements",
    link: "https://www.bbc.com/news/science-environment",
    pubDate: "1h ago",
    description:
      "World leaders agree on new emission targets at landmark climate conference.",
    source: "BBC News",
  },
  {
    title: "India Launches New Space Mission Successfully",
    link: "https://www.bbc.com/news/world-asia-india",
    pubDate: "2h ago",
    description:
      "ISRO celebrates another milestone with successful satellite deployment.",
    source: "BBC News",
  },
  {
    title: "Tech Giants Unveil Next-Gen AI Models",
    link: "https://www.bbc.com/news/technology",
    pubDate: "3h ago",
    description:
      "Major technology companies reveal powerful new AI systems capable of complex reasoning.",
    source: "BBC News",
  },
  {
    title: "World Economy Shows Signs of Recovery",
    link: "https://www.bbc.com/news/business",
    pubDate: "4h ago",
    description:
      "Global markets respond positively to new economic data showing growth trends.",
    source: "BBC News",
  },
  {
    title: "New Medical Breakthrough in Cancer Treatment",
    link: "https://www.bbc.com/news/health",
    pubDate: "5h ago",
    description:
      "Researchers announce promising results from clinical trials of novel cancer therapy.",
    source: "BBC News",
  },
  {
    title: "Sports: Major Championship Results This Week",
    link: "https://www.bbc.com/sport",
    pubDate: "6h ago",
    description:
      "Exciting results from international competitions across multiple sports.",
    source: "BBC News",
  },
  {
    title: "Education Reforms Announced Across Nations",
    link: "https://www.bbc.com/news/education",
    pubDate: "7h ago",
    description:
      "Governments worldwide unveil new curriculum and assessment reforms.",
    source: "BBC News",
  },
  {
    title: "Renewable Energy Hits Record Production",
    link: "https://www.bbc.com/news/science-environment",
    pubDate: "8h ago",
    description:
      "Solar and wind power generation reaches all-time highs globally.",
    source: "BBC News",
  },
  {
    title: "Social Media Platforms Face New Regulations",
    link: "https://www.bbc.com/news/technology",
    pubDate: "9h ago",
    description:
      "Governments introduce stricter rules for major social media companies.",
    source: "BBC News",
  },
  {
    title: "Scientists Discover New Species in Amazon",
    link: "https://www.bbc.com/news/science-environment",
    pubDate: "10h ago",
    description:
      "Expedition uncovers dozens of previously unknown plant and animal species.",
    source: "BBC News",
  },
  {
    title: "Global Food Security: New Solutions Explored",
    link: "https://www.bbc.com/news/world",
    pubDate: "11h ago",
    description:
      "International organizations collaborate on innovative approaches to food production.",
    source: "BBC News",
  },
  {
    title: "Mental Health Awareness Campaign Goes Viral",
    link: "https://www.bbc.com/news/health",
    pubDate: "12h ago",
    description:
      "Online movement raises millions for mental health resources worldwide.",
    source: "BBC News",
  },
  {
    title: "Electric Vehicle Sales Surge Worldwide",
    link: "https://www.bbc.com/news/business",
    pubDate: "13h ago",
    description:
      "EV adoption accelerates as prices fall and charging infrastructure expands.",
    source: "BBC News",
  },
  {
    title: "International Film Festival Winners Announced",
    link: "https://www.bbc.com/news/entertainment-arts",
    pubDate: "14h ago",
    description:
      "Top prizes awarded at prestigious film festival celebrating global cinema.",
    source: "BBC News",
  },
  {
    title: "Cybersecurity Threats Rise in Digital Age",
    link: "https://www.bbc.com/news/technology",
    pubDate: "15h ago",
    description:
      "Experts warn of increasing sophisticated cyber attacks targeting infrastructure.",
    source: "BBC News",
  },
  {
    title: "New Archaeological Find Rewrites Ancient History",
    link: "https://www.bbc.com/news/world",
    pubDate: "16h ago",
    description:
      "Excavation reveals previously unknown ancient civilization predating known history.",
    source: "BBC News",
  },
  {
    title: "Ocean Cleanup Initiative Shows Major Progress",
    link: "https://www.bbc.com/news/science-environment",
    pubDate: "17h ago",
    description:
      "Nonprofit reports significant reduction in ocean plastic pollution levels.",
    source: "BBC News",
  },
  {
    title: "Startup Ecosystem Thrives in Emerging Markets",
    link: "https://www.bbc.com/news/business",
    pubDate: "18h ago",
    description:
      "Record investment flows into tech startups across Asia, Africa and Latin America.",
    source: "BBC News",
  },
  {
    title: "Satellite Internet Expands Global Coverage",
    link: "https://www.bbc.com/news/technology",
    pubDate: "19h ago",
    description:
      "Low-orbit satellite networks bring high-speed internet to remote regions.",
    source: "BBC News",
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

async function fetchFeedViaRss2json(
  rssUrl: string,
  sourceName: string,
): Promise<NewsArticle[]> {
  const res = await fetch(
    `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}&count=20&api_key=`,
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

async function fetchFeedViaAllOrigins(
  rssUrl: string,
  sourceName: string,
): Promise<NewsArticle[]> {
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(rssUrl)}`;
  const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(10000) });
  const text = await res.text();
  const parser = new DOMParser();
  const xml = parser.parseFromString(text, "text/xml");
  const items = Array.from(xml.querySelectorAll("item"));
  if (items.length === 0) throw new Error("No items");
  return items.slice(0, 20).map((item) => ({
    title: item.querySelector("title")?.textContent?.trim() || "News",
    link: item.querySelector("link")?.textContent?.trim() || rssUrl,
    pubDate: timeAgo(item.querySelector("pubDate")?.textContent?.trim() || ""),
    description: (item.querySelector("description")?.textContent || "")
      .replace(/<[^>]+>/g, "")
      .slice(0, 160),
    source: sourceName,
  }));
}

async function fetchFeed(
  rssUrl: string,
  sourceName: string,
): Promise<NewsArticle[]> {
  // Try rss2json first, then allorigins as fallback
  try {
    return await fetchFeedViaRss2json(rssUrl, sourceName);
  } catch {
    return await fetchFeedViaAllOrigins(rssUrl, sourceName);
  }
}

export function useNews() {
  const [articles, setArticles] = useState<NewsArticle[]>(STATIC_NEWS);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    const feeds = [
      { url: "https://feeds.bbci.co.uk/news/world/rss.xml", name: "BBC World" },
      { url: "https://feeds.bbci.co.uk/news/rss.xml", name: "BBC News" },
      {
        url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
        name: "NY Times",
      },
      {
        url: "https://timesofindia.indiatimes.com/rssfeedstopstories.cms",
        name: "Times of India",
      },
      { url: "https://www.theguardian.com/world/rss", name: "The Guardian" },
      {
        url: "https://feeds.skynews.com/feeds/rss/world.xml",
        name: "Sky News",
      },
    ];

    // Try feeds sequentially, stopping at first success
    for (const feed of feeds) {
      try {
        const items = await fetchFeed(feed.url, feed.name);
        if (items.length > 0) {
          setArticles(items);
          setLoading(false);
          return;
        }
      } catch {
        // try next feed
      }
    }
    // All feeds failed — static fallback stays visible
    setLoading(false);
  }, []);

  const refresh = useCallback(() => fetchNews(), [fetchNews]);

  useEffect(() => {
    // Attempt to load live news after a short delay (don't block initial render)
    const initial = setTimeout(() => fetchNews(), 1000);
    timerRef.current = setInterval(fetchNews, REFRESH_INTERVAL);
    return () => {
      clearTimeout(initial);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetchNews]);

  return { articles, loading, error: null, refresh };
}
