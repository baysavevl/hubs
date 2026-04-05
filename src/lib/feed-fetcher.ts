export interface NewsItem {
  title: string;
  link: string;
  source: string;
  date: string;
  snippet: string;
}

interface RSSCache {
  items: NewsItem[];
  fetchedAt: number;
}

const CACHE_TTL = 15 * 60 * 1000; // 15 minutes
let cache: RSSCache | null = null;

const FEEDS = [
  { url: 'https://blog.google/products/ads-commerce/rss/', source: 'Google Ads Blog' },
  { url: 'https://blog.google/technology/ai/rss/', source: 'Google AI Blog' },
];

function parseXML(text: string): NewsItem[] {
  const items: NewsItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(text)) !== null) {
    const block = match[1];
    const title = block.match(/<title><!\[CDATA\[(.*?)\]\]>/)?.[1] || block.match(/<title>(.*?)<\/title>/)?.[1] || '';
    const link = block.match(/<link>(.*?)<\/link>/)?.[1] || '';
    const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';
    const desc = block.match(/<description><!\[CDATA\[([\s\S]*?)\]\]>/)?.[1] || block.match(/<description>(.*?)<\/description>/)?.[1] || '';

    if (title && link) {
      items.push({
        title: title.replace(/<[^>]*>/g, '').trim(),
        link: link.trim(),
        source: '',
        date: pubDate ? new Date(pubDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '',
        snippet: desc.replace(/<[^>]*>/g, '').trim().slice(0, 200),
      });
    }
  }

  return items;
}

export async function fetchNews(): Promise<NewsItem[]> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL) {
    return cache.items;
  }

  const allItems: NewsItem[] = [];

  for (const feed of FEEDS) {
    try {
      const res = await fetch(feed.url, {
        headers: { 'User-Agent': 'GoogleAdsSolutionsArchitect/1.0' },
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) continue;
      const text = await res.text();
      const items = parseXML(text);
      items.forEach(item => item.source = feed.source);
      allItems.push(...items);
    } catch {
      // Skip unreachable feeds silently
    }
  }

  // Sort by date descending, take top 30
  allItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const result = allItems.slice(0, 30);

  cache = { items: result, fetchedAt: Date.now() };
  return result;
}
