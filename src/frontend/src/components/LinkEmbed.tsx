import { ExternalLink, Globe } from "lucide-react";
import { getDomain, getYouTubeId } from "../utils/linkUtils";

interface LinkEmbedProps {
  url: string;
}

export default function LinkEmbed({ url }: LinkEmbedProps) {
  const ytId = getYouTubeId(url);

  if (ytId) {
    return (
      <div
        className="w-full mt-2 rounded-2xl overflow-hidden shadow-lg"
        style={{ aspectRatio: "16/9" }}
        data-ocid="link_embed.card"
      >
        <iframe
          src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`}
          title="YouTube video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
          loading="lazy"
        />
      </div>
    );
  }

  const domain = getDomain(url);

  return (
    <div
      className="mt-2 inline-flex flex-col gap-1.5 max-w-xs rounded-xl border overflow-hidden"
      style={{
        background: "oklch(0.14 0.024 265 / 0.9)",
        borderColor: "oklch(0.7 0.12 80 / 0.3)",
        backdropFilter: "blur(8px)",
      }}
      data-ocid="link_embed.card"
    >
      <div className="flex items-center gap-2 px-3 pt-2.5">
        <Globe
          className="w-4 h-4 shrink-0"
          style={{ color: "oklch(0.7 0.12 80)" }}
        />
        <span
          className="text-sm font-semibold truncate"
          style={{ color: "oklch(0.7 0.12 80)" }}
        >
          {domain}
        </span>
      </div>
      <p
        className="px-3 text-xs truncate opacity-60"
        style={{ color: "oklch(0.9 0.01 80)" }}
      >
        {url}
      </p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-all hover:opacity-80"
        style={{
          color: "oklch(0.7 0.12 80)",
          borderTop: "1px solid oklch(0.7 0.12 80 / 0.15)",
        }}
        data-ocid="link_embed.open_button"
      >
        <ExternalLink className="w-3 h-3" />
        Open link
      </a>
    </div>
  );
}
