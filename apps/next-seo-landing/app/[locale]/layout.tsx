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
        {/* 
          Page-load overlay — injected before first paint via blocking script.
          Covers the distorted/unstyled frame, fades out once fonts + CSS are ready.
          Uses only CSS animations, zero JS dependency after initial inject.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  // 1. Set theme immediately (no flash)
  try{
    var t=localStorage.getItem('theme');
    document.documentElement.setAttribute('data-theme',t==='light'?'light':'dark');
  }catch(e){}

  // 2. Inject full-page loading overlay
  var overlay=document.createElement('div');
  overlay.id='page-loader';
  overlay.innerHTML=
    '<div class="pl-inner">'+
      '<svg width="36" height="36" viewBox="0 0 24 24" fill="none">'+
        '<path d="M12 2L2 19.5h20L12 2z" fill="url(#plg)"/>'+
        '<defs>'+
          '<linearGradient id="plg" x1="0%" y1="0%" x2="100%" y2="100%">'+
            '<stop offset="0%" stop-color="#3B82F6"/>'+
            '<stop offset="100%" stop-color="#8B5CF6"/>'+
          '</linearGradient>'+
        '</defs>'+
      '</svg>'+
      '<div class="pl-bar"><div class="pl-fill"></div></div>'+
    '</div>';

  var style=document.createElement('style');
  style.textContent=
    '#page-loader{'+
      'position:fixed;inset:0;z-index:99999;'+
      'background:#05070D;'+
      'display:flex;align-items:center;justify-content:center;'+
      'transition:opacity 0.35s ease;'+
    '}'+
    '[data-theme="light"] #page-loader{background:#F8FAFF;}'+
    '#page-loader.pl-done{opacity:0;pointer-events:none;}'+
    '.pl-inner{display:flex;flex-direction:column;align-items:center;gap:24px;}'+
    '.pl-inner svg{animation:pl-pulse 1.4s ease-in-out infinite;}'+
    '@keyframes pl-pulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.6;transform:scale(0.92);}}'+
    '.pl-bar{width:120px;height:3px;background:rgba(255,255,255,0.08);border-radius:2px;overflow:hidden;}'+
    '[data-theme="light"] .pl-bar{background:rgba(15,23,42,0.08);}'+
    '.pl-fill{height:100%;width:0;background:linear-gradient(90deg,#3B82F6,#8B5CF6);border-radius:2px;animation:pl-load 1.2s cubic-bezier(0.4,0,0.2,1) forwards;}'+
    '@keyframes pl-load{0%{width:0;}60%{width:75%;}100%{width:100%;}}';

  document.head.appendChild(style);
  document.body.appendChild(overlay);

  // 3. Remove overlay once page is interactive
  function dismiss(){
    overlay.classList.add('pl-done');
    setTimeout(function(){overlay.remove();style.remove();},400);
  }
  if(document.readyState==='complete'){
    setTimeout(dismiss,100);
  } else {
    window.addEventListener('load',function(){setTimeout(dismiss,100);},{once:true});
  }
})();
            `.trim(),
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
