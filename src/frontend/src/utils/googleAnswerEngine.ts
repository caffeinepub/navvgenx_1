// Google-style Answer Engine for NavvGenX
export interface GoogleStyleAnswer {
  title: string;
  answer: string;
  source: string;
  sourceUrl: string;
  type:
    | "definition"
    | "fact"
    | "calculation"
    | "news"
    | "country"
    | "person"
    | "general";
  extra?: Record<string, string>;
}

function detectAnswerType(query: string): GoogleStyleAnswer["type"] {
  const lower = query.toLowerCase();
  if (/^who (is|was|are|were)/i.test(lower)) return "person";
  if (/\b(capital|population|country|flag|currency|language)\b/i.test(lower))
    return "country";
  if (/\b(define|definition|meaning|what does .* mean)\b/i.test(lower))
    return "definition";
  if (/\b(\d+[\s+\-*/]\d+|\bmath\b|\bcalculate\b|\bsolve\b)\b/i.test(lower))
    return "calculation";
  return "general";
}

export async function fetchWikipediaFullSearch(
  query: string,
): Promise<GoogleStyleAnswer | null> {
  try {
    const cleanQuery = query
      .replace(
        /^(what is|what are|who is|who was|how does|how do|explain|tell me about|define|describe|why is|why does|when did|where is|what does|give me info on|information about|facts about|history of|science of)\s+/i,
        "",
      )
      .replace(/\?+$/, "")
      .trim();

    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cleanQuery)}&srlimit=3&format=json&origin=*`;
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) return null;
    const searchData = await searchRes.json();
    const results = searchData?.query?.search;
    if (!results || results.length === 0) return null;

    for (const result of results.slice(0, 2)) {
      const title = result.title;
      const summaryRes = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
      );
      if (!summaryRes.ok) continue;
      const summary = await summaryRes.json();
      const extract = summary.extract || "";
      if (extract.length > 100) {
        return {
          title: summary.title || title,
          answer: extract,
          source: "Wikipedia",
          sourceUrl:
            summary.content_urls?.desktop?.page ||
            `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
          type: detectAnswerType(query),
        };
      }
    }
    return null;
  } catch {
    return null;
  }
}

export async function fetchCountryInfo(
  query: string,
): Promise<GoogleStyleAnswer | null> {
  try {
    const countryMatch = query.match(
      /\b(?:capital of|country|about|info about|information about|tell me about)\s+([a-z\s]+)/i,
    );
    const directMatch = query.match(
      /^([a-z\s]+)(?:\s+capital|\s+country|\s+info|\s+facts?|\s+information)?$/i,
    );
    const countryName = (countryMatch?.[1] || directMatch?.[1] || query).trim();

    const res = await fetch(
      `https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fields=name,capital,population,region,subregion,languages,currencies,flags,area`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || !Array.isArray(data) || data.length === 0) return null;

    const country = data[0];
    const capital = country.capital?.[0] || "N/A";
    const population = country.population
      ? country.population.toLocaleString()
      : "N/A";
    const region = country.region || "N/A";
    const subregion = country.subregion || "";
    const languages =
      Object.values(country.languages || {}).join(", ") || "N/A";
    const currencies =
      Object.values(country.currencies || {})
        .map((c: unknown) => {
          const cur = c as { name?: string; symbol?: string };
          return `${cur.name || ""} (${cur.symbol || ""})`;
        })
        .join(", ") || "N/A";
    const area = country.area ? `${country.area.toLocaleString()} km²` : "N/A";

    const answer =
      `**${country.name.common}** is a country in ${subregion ? `${subregion}, ` : ""}${region}.\n\n` +
      `\u2022 **Capital:** ${capital}\n` +
      `\u2022 **Population:** ${population}\n` +
      `\u2022 **Area:** ${area}\n` +
      `\u2022 **Languages:** ${languages}\n` +
      `\u2022 **Currency:** ${currencies}`;

    return {
      title: country.name.common,
      answer,
      source: "REST Countries",
      sourceUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(country.name.common)}`,
      type: "country",
      extra: { capital, population, region },
    };
  } catch {
    return null;
  }
}

export async function fetchBookInfo(
  query: string,
): Promise<GoogleStyleAnswer | null> {
  try {
    const bookMatch = query.match(
      /\b(?:book|novel|author|written by|who wrote|what is|about)\s+(.+)/i,
    );
    if (!bookMatch) return null;
    const bookQuery = bookMatch[1].trim();

    const res = await fetch(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(bookQuery)}&limit=1&fields=title,author_name,first_publish_year,subject,number_of_pages_median`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    const book = data?.docs?.[0];
    if (!book) return null;

    const author = book.author_name?.[0] || "Unknown";
    const year = book.first_publish_year || "N/A";
    const pages = book.number_of_pages_median || "N/A";
    const subjects = book.subject?.slice(0, 4).join(", ") || "";

    const pagesLine = pages !== "N/A" ? `\u2022 **Pages:** ~${pages}\n` : "";
    const subjectsLine = subjects ? `\u2022 **Subjects:** ${subjects}` : "";
    const answer = `**${book.title}** by ${author} (first published ${year}).\n\n${pagesLine}${subjectsLine}`;

    return {
      title: book.title,
      answer,
      source: "Open Library",
      sourceUrl: `https://openlibrary.org/search?q=${encodeURIComponent(bookQuery)}`,
      type: "general",
    };
  } catch {
    return null;
  }
}

export async function fetchWikidataFact(
  query: string,
): Promise<GoogleStyleAnswer | null> {
  try {
    const searchUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(query)}&language=en&limit=1&format=json&origin=*`;
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) return null;
    const searchData = await searchRes.json();
    const entity = searchData?.search?.[0];
    if (!entity || !entity.description) return null;

    return {
      title: entity.label || query,
      answer: entity.description || "",
      source: "Wikidata",
      sourceUrl:
        entity.concepturi || `https://www.wikidata.org/wiki/${entity.id}`,
      type: "fact",
    };
  } catch {
    return null;
  }
}

export function isCountryQuestion(query: string): boolean {
  const lower = query.toLowerCase();
  return (
    /\b(capital of|capital city of|population of|language of|currency of|flag of|country called)\b/i.test(
      lower,
    ) ||
    /\b(nigeria|france|germany|japan|china|india|brazil|usa|america|united states|canada|australia|uk|england|spain|italy|russia|mexico|south africa|egypt|kenya|ghana|pakistan|indonesia|turkey|argentina|colombia|ukraine|poland|netherlands|sweden|norway|denmark|finland|switzerland|austria|portugal|greece|israel|jordan|iran|iraq|saudi arabia|uae|qatar|ethiopia|tanzania|uganda|zimbabwe|zambia|morocco|algeria|tunisia|south korea|north korea|singapore|malaysia|thailand|vietnam|philippines)\b/i.test(
      lower,
    )
  );
}

export function isBookQuestion(query: string): boolean {
  return /\b(book|novel|author|written by|who wrote|literary|fiction|nonfiction)\b/i.test(
    query.toLowerCase(),
  );
}

export async function fetchGoogleStyleAnswer(
  query: string,
): Promise<GoogleStyleAnswer | null> {
  const lower = query.toLowerCase();
  const tasks: Promise<GoogleStyleAnswer | null>[] = [];

  if (isCountryQuestion(lower)) tasks.push(fetchCountryInfo(query));
  if (isBookQuestion(lower)) tasks.push(fetchBookInfo(query));
  tasks.push(fetchWikipediaFullSearch(query));

  const results = await Promise.allSettled(tasks);
  for (const result of results) {
    if (
      result.status === "fulfilled" &&
      result.value &&
      result.value.answer.length > 40
    ) {
      return result.value;
    }
  }

  const wikidata = await fetchWikidataFact(query);
  if (wikidata && wikidata.answer.length > 20) return wikidata;

  return null;
}
