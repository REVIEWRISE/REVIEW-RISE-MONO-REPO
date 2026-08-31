'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  const t = useTranslations('landing');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-[100] py-4 transition-all duration-300 ${
        scrolled
          ? 'border-b border-border bg-background/85 shadow-[0_4px_32px_rgba(0,0,0,0.25)] backdrop-blur-xl'
          : ''
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-8 max-[768px]:px-5">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <Image src="/logo.png" alt={t('common.brandName')} width={32} height={32} className="size-8 rounded-lg object-contain" />
          <span className="font-display text-base font-bold tracking-tight text-foreground">{t('common.brandName')}</span>
        </div>

        {/* Nav */}
        <nav className="flex items-center gap-2">
          <a href="#features" className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition hover:bg-foreground/5 hover:text-foreground max-[768px]:hidden">
            {t('header.features')}
          </a>
          <a href="#how-it-works" className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition hover:bg-foreground/5 hover:text-foreground max-[768px]:hidden">
            {t('howItWorks.title')}
          </a>
          <a href="#faq" className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition hover:bg-foreground/5 hover:text-foreground max-[768px]:hidden">
            {t('header.faq')}
          </a>
          <ThemeToggle />
          <a
            href="https://app.vyntrise.com/"
            className="ml-2 inline-flex items-center gap-1.5 rounded-[10px] bg-gradient-to-br from-brand-blue to-brand-violet px-5 py-2.5 font-display text-sm font-semibold tracking-tight text-white shadow-[0_4px_16px_rgba(99, 102, 241,0.3)] transition hover:-translate-y-px hover:shadow-[0_6px_24px_rgba(99, 102, 241,0.45)]"
          >
            {t('footer.login')}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </nav>
      </div>
    </header>
  );
}
