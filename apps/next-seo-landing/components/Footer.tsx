'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Linkedin, Instagram, Facebook } from 'lucide-react';

export default function Footer() {
  const t = useTranslations('landing');

  return (
    <footer className="footer">
      <div className="container">
        <div className="top">
          <div className="brand">
            <Image src="/logo.png" alt={t('common.brandName')} width={28} height={28} style={{ borderRadius: '6px', objectFit: 'contain' }} />
            <span className="brand-name">{t('common.brandName')}</span>
          </div>
          <div className="links">
            <Link href="https://app.vyntrise.com/">{t('footer.login')}</Link>
          </div>
        </div>
        <div className="divider" />
        <div className="bottom">
          <p className="copyright">
            {'©'} {new Date().getFullYear()} {t('common.brandName')}{'.'} {t('footer.rights')}
          </p>
          <div className="socials">
            <Link href="https://www.linkedin.com/company/vyntrise-technologies" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <Linkedin size={20} />
            </Link>
            <Link href="https://www.instagram.com/vyntrisellc" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <Instagram size={20} />
            </Link>
            <Link href="https://www.facebook.com/share/1cBw5oDbhj/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <Facebook size={20} />
            </Link>
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
        .socials {
          display: flex;
          gap: 20px;
          align-items: center;
        }
        .socials :global(a) {
          color: var(--text-muted);
          transition: color 0.2s ease, transform 0.2s ease;
          display: flex;
        }
        .socials :global(a:hover) {
          color: var(--text-primary);
          transform: translateY(-2px);
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
            flex-direction: column-reverse;
            gap: 24px;
            align-items: center;
          }
        }
      `}</style>
    </footer>
  );
}
