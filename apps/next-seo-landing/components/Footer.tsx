'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function Footer() {
  const t = useTranslations('landing');

  return (
    <footer className="footer">
      <div className="container">
        <div className="top">
          <div className="brand">
            <div className="brand-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 19.5h20L12 2z" fill="url(#footerGrad)" />
                <defs>
                  <linearGradient id="footerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="brand-name">{t('common.brandName')}</span>
          </div>
          <div className="links">
            <Link href="#features">{t('footer.features')}</Link>
            <Link href="#how-it-works">{t('howItWorks.title')}</Link>
            <Link href="#faq">{t('footer.faq')}</Link>
            <Link href="https://app.reviewrise.com">{t('footer.login')}</Link>
          </div>
        </div>
        <div className="divider" />
        <div className="bottom">
          <p className="copyright">
            {'©'} {new Date().getFullYear()} {t('common.brandName')}{'.'} {t('footer.rights')}
          </p>
          <div className="legal">
            <Link href="/privacy">{t('footer.privacy')}</Link>
            <Link href="/terms">{t('footer.terms')}</Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .footer {
          padding: 72px 0 40px;
          border-top: 1px solid var(--border-color);
          background: var(--bg-primary);
          position: relative;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 32px;
        }
        .top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .brand-icon {
          width: 32px;
          height: 32px;
          background: rgba(59, 130, 246, 0.12);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .brand-name {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--text-primary);
        }
        .links {
          display: flex;
          gap: 32px;
        }
        .links :global(a) {
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 500;
          transition: color 0.2s ease;
        }
        .links :global(a:hover) {
          color: var(--text-primary);
        }
        .divider {
          height: 1px;
          background: linear-gradient(to right, transparent, var(--border-color), transparent);
          margin-bottom: 32px;
        }
        .bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .copyright {
          font-size: 13px;
          color: var(--text-muted);
        }
        .legal {
          display: flex;
          gap: 24px;
        }
        .legal :global(a) {
          font-size: 13px;
          color: var(--text-muted);
          transition: color 0.2s ease;
        }
        .legal :global(a:hover) {
          color: var(--text-secondary);
        }
        @media (max-width: 768px) {
          .container { padding: 0 20px; }
          .top {
            flex-direction: column;
            gap: 28px;
            align-items: flex-start;
          }
          .links { flex-direction: column; gap: 16px; }
          .bottom {
            flex-direction: column;
            gap: 16px;
            align-items: flex-start;
          }
        }
      `}</style>
    </footer>
  );
}
