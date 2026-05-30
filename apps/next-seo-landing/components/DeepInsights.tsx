'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Zap, Check } from 'lucide-react';

export default function DeepInsights() {
  const t = useTranslations('landing.deepInsights');

  return (
    <section className="deep-insights bg-secondary">
      <div className="container">
        <div className="grid">
          {/* Left Column - Copy */}
          <motion.div 
            className="copy-column"
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="title">{t('title')}</h2>
            <p className="description">{t('description')}</p>
            
            <ul className="bullet-list">
              <li>
                <div className="bullet-icon"><Check size={14} color="#3B82F6" /></div>
                <span>{t('bullet1')}</span>
              </li>
              <li>
                <div className="bullet-icon"><Check size={14} color="#3B82F6" /></div>
                <span>{t('bullet2')}</span>
              </li>
              <li>
                <div className="bullet-icon"><Check size={14} color="#3B82F6" /></div>
                <span>{t('bullet3')}</span>
              </li>
            </ul>
          </motion.div>

          {/* Right Column - Card */}
          <motion.div 
            className="card-column"
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          >
            <div className="mock-card">
              <div className="card-topbar">
                <div className="mock-url-row">
                  <div className="mock-dot green" />
                  <span className="mock-url">{'example.com'}</span>
                </div>
                <div className="badge-good">GOOD HEALTH</div>
              </div>

              <div className="card-content">
                <div className="score-area">
                  <div className="score-ring-wrap">
                    <svg width="100" height="100" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                      <circle
                        cx="50" cy="50" r="42" fill="none"
                        stroke="url(#scoreGrad2)" strokeWidth="8" strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 42}`}
                        strokeDashoffset={`${2 * Math.PI * 42 * (1 - 0.85)}`}
                        transform="rotate(-90 50 50)"
                      />
                      <defs>
                        <linearGradient id="scoreGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#3B82F6" />
                          <stop offset="100%" stopColor="#8B5CF6" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="score-inner">
                      <span className="score-num">{t('cardScore')}</span>
                      <span className="score-denom">/100</span>
                    </div>
                  </div>
                </div>

                <div className="results-area">
                  <div className="results-label">{t('cardKeyResults')}</div>
                  <div className="issue-row error">
                    <span className="issue-text">{t('issue1')}</span>
                    <span className="issue-tag">High</span>
                  </div>
                  <div className="issue-row warning">
                    <span className="issue-text">{t('issue2')}</span>
                    <span className="issue-tag">Med</span>
                  </div>
                  <div className="issue-row error">
                    <span className="issue-text">{t('issue3')}</span>
                    <span className="issue-tag">High</span>
                  </div>
                </div>
              </div>

              <div className="card-divider" />

              <div className="passed-section">
                <div className="passed-label">{t('passedDetails')} (24)</div>
                <div className="passed-grid">
                  <div className="passed-item">
                    <CheckCircle2 size={12} color="#10b981" />
                    <span>SSL Certificate valid</span>
                  </div>
                  <div className="passed-item">
                    <CheckCircle2 size={12} color="#10b981" />
                    <span>Robots.txt found</span>
                  </div>
                  <div className="passed-item">
                    <CheckCircle2 size={12} color="#10b981" />
                    <span>XML Sitemap present</span>
                  </div>
                  <div className="passed-item">
                    <CheckCircle2 size={12} color="#10b981" />
                    <span>{t('mobilePassed')}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        .bg-secondary {
          background: var(--bg-secondary);
          border-top: 1px solid var(--border-color);
          border-bottom: 1px solid var(--border-color);
        }
        .deep-insights {
          padding: 140px 0;
          overflow: hidden;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 32px;
        }
        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
        }
        
        .copy-column {
          max-width: 520px;
        }
        .title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(36px, 4vw, 48px);
          font-weight: 700;
          letter-spacing: -0.03em;
          color: var(--text-primary);
          margin-bottom: 24px;
          line-height: 1.1;
        }
        .description {
          font-size: 18px;
          color: var(--text-secondary);
          line-height: 1.7;
          margin-bottom: 40px;
        }
        .bullet-list {
          list-style: none;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .bullet-list li {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 15px;
          color: var(--text-primary);
          font-weight: 500;
        }
        .bullet-icon {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .card-column {
          display: flex;
          justify-content: center;
        }
        
        /* Mock Card */
        .mock-card {
          width: 100%;
          max-width: 540px;
          background: rgba(11, 16, 32, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          overflow: hidden;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 32px 80px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(59, 130, 246, 0.05);
        }
        :global([data-theme='light']) .mock-card {
          background: rgba(255, 255, 255, 0.9);
          border-color: rgba(15, 23, 42, 0.08);
          box-shadow: 0 32px 80px rgba(15, 23, 42, 0.1);
        }

        .card-topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }
        :global([data-theme='light']) .card-topbar { border-bottom-color: rgba(15, 23, 42, 0.06); }
        
        .mock-url-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .mock-dot.green {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 8px rgba(16,185,129,0.5);
        }
        .mock-url {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
        }
        .badge-good {
          font-size: 10px;
          font-weight: 700;
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.25);
          color: #10b981;
          padding: 4px 10px;
          border-radius: 100px;
          letter-spacing: 0.04em;
        }

        .card-content {
          display: grid;
          grid-template-columns: 140px 1fr;
          padding: 32px 24px;
          gap: 24px;
        }

        .score-area {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .score-ring-wrap {
          position: relative;
          width: 100px;
          height: 100px;
        }
        .score-inner {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .score-num {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 36px;
          font-weight: 700;
          line-height: 1;
          letter-spacing: -0.04em;
          background: linear-gradient(135deg, #3B82F6, #8B5CF6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .score-denom {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
        }

        .results-area {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .results-label {
          font-size: 11px;
          font-weight: 700;
          color: #ef4444;
          letter-spacing: 0.06em;
          margin-bottom: 4px;
        }
        .issue-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        :global([data-theme='light']) .issue-row { border-bottom-color: rgba(15,23,42,0.04); }
        .issue-row:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }
        .issue-text {
          color: var(--text-primary);
          font-weight: 500;
        }
        .issue-tag {
          font-size: 10px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 100px;
        }
        .issue-row.error .issue-tag {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }
        .issue-row.warning .issue-tag {
          background: rgba(251, 191, 36, 0.1);
          color: #FBBF24;
        }

        .card-divider {
          height: 1px;
          background: rgba(255,255,255,0.06);
        }
        :global([data-theme='light']) .card-divider { background: rgba(15,23,42,0.06); }

        .passed-section {
          padding: 24px;
        }
        .passed-label {
          font-size: 11px;
          font-weight: 700;
          color: #10b981;
          letter-spacing: 0.06em;
          margin-bottom: 16px;
        }
        .passed-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .passed-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 500;
          color: var(--text-secondary);
        }

        @media (max-width: 900px) {
          .grid {
            grid-template-columns: 1fr;
            gap: 60px;
          }
          .copy-column {
            max-width: 100%;
            text-align: center;
          }
          .bullet-list {
            align-items: center;
          }
          .bullet-list li {
            justify-content: flex-start;
          }
        }
        @media (max-width: 640px) {
          .deep-insights { padding: 80px 0; }
          .container { padding: 0 20px; }
          .title { font-size: 32px; }
          .card-content { grid-template-columns: 1fr; gap: 32px; padding: 24px; }
          .passed-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  );
}
