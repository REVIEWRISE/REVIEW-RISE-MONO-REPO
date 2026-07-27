'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function NotFoundPage() {
  const t = useTranslations('landing.notFound');

  return (
    <main className="nf">
      <div className="card">
        <div className="badge">404</div>
        <h1 className="title">{t('title')}</h1>
        <p className="desc">{t('description')}</p>
        <div className="actions">
          <Link href="/" className="primary">{t('goHome')}</Link>
          <Link href="/#faq" className="secondary">{t('goFaq')}</Link>
        </div>
      </div>

      <style jsx>{`
        .nf {
          min-height: 70vh;
          display: grid;
          place-items: center;
          padding: 72px 24px;
        }
        .card {
          width: 100%;
          max-width: 520px;
          text-align: center;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 24px;
          padding: 52px 34px;
          box-shadow: var(--shadow);
        }
        .badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 34px;
          padding: 0 14px;
          border-radius: 999px;
          font-weight: 800;
          letter-spacing: 0.08em;
          font-size: 12px;
          color: #fff;
          background: var(--gradient-primary);
          margin-bottom: 18px;
        }
        .title {
          font-size: 28px;
          font-weight: 800;
          margin-bottom: 10px;
        }
        .desc {
          font-size: 15px;
          color: var(--text-secondary);
          line-height: 1.7;
          margin-bottom: 28px;
        }
        .actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 12px 18px;
          border-radius: 12px;
          background: var(--gradient-primary);
          color: #fff;
          font-weight: 700;
        }
        .secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 12px 18px;
          border-radius: 12px;
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          background: transparent;
          font-weight: 700;
        }
      `}</style>
    </main>
  );
}
