import { FetchUrl } from '@/app/lib/server/actions/utilityServerActions';

type LinkPreview = {
  domain: string;
  title: string | null;
  description: string | null;
  favicon: string;
  preview: string | null;
};

const getRegex = (property: string) => [
  new RegExp(
    `<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`,
    'i',
  ),
  new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`,
    'i',
  ),
];

const ogImageRegex = getRegex('og:image');
const ogTitleRegex = getRegex('og:title');
const ogDescRegex = getRegex('og:description');

const titleTagRegex = /<title[^>]*>([^<]+)<\/title>/i;
const metaDescRegex = [
  /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i,
  /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i,
];

function matchFirst(html: string, regexes: RegExp[]): string | null {
  for (const regex of regexes) {
    const match = html.match(regex);
    if (match?.[1]) return match[1];
  }
  return null;
}

export default async function getLinkPreview(
  url: string | undefined,
): Promise<LinkPreview | null> {
  if (!url?.length) return null;
  let hostname, origin;
  try {
    const newUrl = new URL(url);
    hostname = newUrl.hostname;
    origin = newUrl.origin;
  } catch (e: any) {
    return null;
  }
  if (!hostname || !origin) return null;

  const favicon = `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;

  let thumbnail: string | null = null;
  let title: string | null = null;
  let description: string | null = null;

  const data = await FetchUrl(url);

  if (data) {
    let raw = matchFirst(data, ogImageRegex);
    if (raw && !raw.startsWith('http')) raw = new URL(raw, origin).href;
    thumbnail = raw;

    title =
      matchFirst(data, ogTitleRegex) ?? data.match(titleTagRegex)?.[1] ?? null;

    description =
      matchFirst(data, ogDescRegex) ?? matchFirst(data, metaDescRegex);
  }

  return { domain: hostname, favicon, preview: thumbnail, title, description };
}
