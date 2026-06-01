import type { Metadata } from "next";
import { ThemeProvider } from "@/contexts/ThemeContext";
import "../globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { defaultLocale } from '@platform/i18n';
import { Space_Grotesk, Inter, Plus_Jakarta_Sans } from 'next/font/google';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

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

export async function generateMetadata(
  props: { params: Promise<{ locale: string }> }
): Promise<Metadata> {
  const { locale } = await props.params;

  const canonicalPath = locale === defaultLocale ? '/' : `/${locale}`;
  const title = 'Vyntrise SEO Checker | Free Site Analyze Page In Seconds';
  const description = 'Analyze your site with our free instant SEO checker. Improve page performance, titles, meta descriptions, headings, images, and more in just seconds.';

  return {
    metadataBase: getSiteUrl(),
    title: { default: title, template: `%s | Vyntrise` },
    description,
    keywords: ['analyze', 'site', 'free', 'page', 'seconds', 'seo checker'],
    alternates: {
      canonical: withBasePath(canonicalPath),
      languages: {
        en: withBasePath('/'),
        ar: withBasePath('/ar'),
      },
    },
    openGraph: {
      type: 'website',
      title,
      description,
      url: withBasePath(canonicalPath),
      siteName: 'Vyntrise',
      locale: locale === 'ar' ? 'ar_AR' : 'en_US',
      images: [{ url: '/logo.png', width: 512, height: 512, alt: 'Vyntrise' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/logo.png'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      }
    },
    icons: {
      icon: '/logo.png',
      shortcut: '/logo.png',
      apple: '/logo.png',
    },
  };
}

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${inter.variable} ${plusJakarta.variable}`}
    >
      <head>
        {/* Blocking script: sets data-theme before first paint — eliminates theme flash */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme');document.documentElement.setAttribute('data-theme',t==='dark'?'dark':'light');}catch(e){}})();` }} />
        <link rel="preload" href="/logo.png" as="image" />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-XYZ1234567"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XYZ1234567');
          `
        }} />
      </head>
      <body suppressHydrationWarning>
        {/* Page-load overlay — rendered server-side so it exists before any JS.
            The inline script in <head> already set data-theme, so background
            color matches immediately. This div covers the unstyled first paint
            and fades out once the window load event fires. */}
        <div
          id="page-loader"
          suppressHydrationWarning
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'var(--bg-primary, #f8faff)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '24px',
            transition: 'opacity 0.35s ease',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="logo" width={48} height={48} style={{ borderRadius: '10px', objectFit: 'contain', animation: 'pl-pulse 1.4s ease-in-out infinite' }} />
          <div style={{ width: '120px', height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
            <div id="pl-fill" suppressHydrationWarning style={{ height: '100%', width: '0', background: 'linear-gradient(90deg,#3B82F6,#8B5CF6)', borderRadius: '2px' }} />
          </div>
        </div>

        {/* Dismiss script — runs immediately after the overlay element exists */}
        <script dangerouslySetInnerHTML={{
          __html: `
(function(){
  var bar=document.getElementById('pl-fill');
  var loader=document.getElementById('page-loader');
  if(!loader)return;

  // Animate the progress bar
  var start=null;
  function animBar(ts){
    if(!start)start=ts;
    var p=Math.min((ts-start)/1200,1);
    // ease-out cubic
    var eased=1-Math.pow(1-p,3);
    if(bar)bar.style.width=(eased*100)+'%';
    if(p<1)requestAnimationFrame(animBar);
  }
  requestAnimationFrame(animBar);

  // Dismiss once everything is loaded
  function dismiss(){
    loader.style.opacity='0';
    loader.style.pointerEvents='none';
    setTimeout(function(){loader.style.display='none';},400);
  }
  if(document.readyState==='complete'){
    setTimeout(dismiss,80);
  } else {
    window.addEventListener('load',function(){setTimeout(dismiss,80);},{once:true});
  }
})();
        `.trim()
        }} />

        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
