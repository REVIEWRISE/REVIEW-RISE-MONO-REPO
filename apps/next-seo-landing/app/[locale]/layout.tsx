import type { Metadata } from "next";
import { ThemeProvider } from "@/contexts/ThemeContext";
import "../globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
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

export const metadata: Metadata = {
  title: "AdRise SEO - Discover Your Website's SEO Score in Seconds",
  description: "Comprehensive SEO analysis powered by advanced AI algorithms. Get your SEO health score, technical analysis, and smart recommendations instantly.",
};

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
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme');document.documentElement.setAttribute('data-theme',t==='light'?'light':'dark');}catch(e){}})();` }} />
      </head>
      <body suppressHydrationWarning>
        {/* Page-load overlay — rendered server-side so it exists before any JS.
            The inline script in <head> already set data-theme, so background
            color matches immediately. This div covers the unstyled first paint
            and fades out once the window load event fires. */}
        <div
          id="page-loader"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'var(--bg-primary, #05070D)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '24px',
            transition: 'opacity 0.35s ease',
          }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 19.5h20L12 2z" fill="url(#plg)" />
            <defs>
              <linearGradient id="plg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
          </svg>
          <div style={{ width: '120px', height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
            <div id="pl-fill" style={{ height: '100%', width: '0', background: 'linear-gradient(90deg,#3B82F6,#8B5CF6)', borderRadius: '2px' }} />
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
    setTimeout(function(){loader.remove();},400);
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
