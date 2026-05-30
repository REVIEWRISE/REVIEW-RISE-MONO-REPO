import type { MetadataRoute } from 'next';

const getSiteUrl = () => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    try {
      return new URL(siteUrl);
    } catch { }
  }
  return new URL('https://seo-analyzer.vyntrise.com');
};

const withBasePath = (path: string) => {
  const basePath = process.env.BASEPATH;
  if (!basePath) return path;
  if (path === '/') return basePath;
  return `${basePath}${path}`;
};

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const lastModified = new Date();

  return [
    {
      url: new URL(withBasePath('/'), base).toString(),
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: new URL(withBasePath('/ar'), base).toString(),
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];
}
