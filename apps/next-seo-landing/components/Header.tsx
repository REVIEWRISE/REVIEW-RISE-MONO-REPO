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
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="container">
        {/* Logo */}
        <div className="logo">
          <Image src="/logo.png" alt={t('common.brandName')} width={32} height={32} className="logo-img" />
          <span className="logo-text">{t('common.brandName')}</span>
        </div>

        {/* Nav */}
        <nav className="nav">
          <a href="#features" className="nav-link">{t('header.features')}</a>
          <a href="#how-it-works" className="nav-link">{t('howItWorks.title')}</a>
          <a href="#faq" className="nav-link">{t('header.faq')}</a>
          <ThemeToggle />
          <a href="https://app.reviewrise.com" className="nav-cta">
            {t('footer.login')}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </nav>
      </div>

      <style jsx>{`
        .header {
          position: sticky;
          top: 0;
          z-index: 100;
          padding: 16px 0;
          transition: all 0.3s ease;
        }
        .header.scrolled {
          background: rgba(5, 7, 13, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          box-shadow: 0 4px 32px rgba(0, 0, 0, 0.4);
        }
        :global([data-theme='light']) .header.scrolled {
          background: rgba(248, 250, 255, 0.85);
          border-bottom: 1px solid rgba(15, 23, 42, 0.06);
          box-shadow: 0 4px 32px rgba(15, 23, 42, 0.08);
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }
        .logo-img {
          width: 32px;
          height: 32px;
          object-fit: contain;
          border-radius: 8px;
        }
        .logo-text {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 16px;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--text-primary);
        }
        .nav {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .nav-link {
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 500;
          padding: 8px 14px;
          border-radius: 8px;
          transition: color 0.2s ease, background 0.2s ease;
        }
        .nav-link:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.05);
        }
        :global([data-theme='light']) .nav-link:hover {
          background: rgba(15, 23, 42, 0.05);
        }
        .nav-cta {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--gradient-primary);
          color: #fff;
          padding: 9px 18px;
          border-radius: 10px;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: -0.01em;
          margin-left: 8px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
        }
        .nav-cta:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(59, 130, 246, 0.45);
          color: #fff;
        }
        @media (max-width: 768px) {
          .nav-link { display: none; }
          .container { padding: 0 20px; }
        }
      `}</style>
    </header>
  );
}
