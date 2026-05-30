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

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  const sitemap = new URL(withBasePath('/sitemap.xml'), base);

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/results', '/results/', '/ar/results', '/ar/results/'],
      },
    ],
    sitemap: sitemap.toString(),
  };
}
