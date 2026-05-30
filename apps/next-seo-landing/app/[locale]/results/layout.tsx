import type { Metadata } from 'next';
import { defaultLocale } from '@platform/i18n';

const withBasePath = (path: string) => {
  const basePath = process.env.BASEPATH;
  if (!basePath) return path;
  if (path === '/') return basePath;
  return `${basePath}${path}`;
};

export async function generateMetadata(
  props: { params: Promise<{ locale: string }> }
): Promise<Metadata> {
  const { locale } = await props.params;
  const canonicalPath = locale === defaultLocale ? '/' : `/${locale}`;

  return {
    title: 'SEO Results',
    alternates: { canonical: withBasePath(canonicalPath) },
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
  };
}

export default function ResultsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
