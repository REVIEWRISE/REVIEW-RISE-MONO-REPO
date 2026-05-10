'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Zap, FileText, Layout, ArrowRight } from 'lucide-react';

const CATEGORY_DATA = [
  { key: 'technical', icon: Zap, score: 62, color: '#FBBF24', colorBg: 'rgba(251,191,36,0.1)' },
  { key: 'content', icon: FileText, score: 78, color: '#10b981', colorBg: 'rgba(16,185,129,0.1)' },
  { key: 'onPage', icon: Layout, score: 45, color: '#ef4444', colorBg: 'rgba(239,68,68,0.1)' },
];

const ISSUES = ['i1', 'i2', 'i3'] as const;
const ISSUE_SEVERITY = ['error', 'warning', 'error'] as const;

export default function PreviewSection() {
  const t = useTranslations('landing.preview');

  return (
    <section className="preview-section">
      <div className="container">
        <motion.div
          className="header"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="section-badge">{t('badge')}</div>
          <h2 className="section-title">{t('title')}</h2>
          <p className="section-subtitle">{t('subtitle')}</p>
        </motion.div>

        <motion.div
          className="mock-card"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Card glow */}
          <div className="mock-glow" />

          {/* Top bar */}
          <div className="mock-topbar">
            <div className="mock-url-row">
              <div className="mock-dot green" />
              <span className="mock-url">{'example-store.com'}</span>
            </div>
            <div className="mock-scanned">{'Just now'}</div>
          </div>

          <div className="mock-body">
            {/* Score */}
            <div className="mock-score-col">
              <div className="score-ring-wrap">
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                  <circle
                    cx="60" cy="60" r="50"
                    fill="none"
                    stroke="url(#scoreGrad)"
                    strokeWidth="10"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - 0.68)}`}
                    strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                  />
                  <defs>
                    <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#8B5CF6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="score-inner">
                  <span className="score-num">{'68'}</span>
                  <span className="score-denom">{'/100'}</span>
                </div>
              </div>
              <div className="score-label">{t('scoreLabel')}</div>

              <div className="mini-stats">
                <div className="mini-stat">
                  <span className="mini-val">{'14'}</span>
                  <span className="mini-lbl">{t('issuesLabel')}</span>
                </div>
                <div className="mini-stat critical">
                  <span className="mini-val">{'3'}</span>
                  <span className="mini-lbl">{t('criticalLabel')}</span>
                </div>
                <div className="mini-stat">
                  <span className="mini-val">{'1.8s'}</span>
                  <span className="mini-lbl">{t('loadLabel')}</span>
                </div>
              </div>
            </div>

            {/* Right panel */}
            <div className="mock-right">
              {/* Category bars */}
              <div className="categories">
                {CATEGORY_DATA.map(({ key, icon: Icon, score, color, colorBg }) => (
                  <div key={key} className="cat-row">
                    <div className="cat-icon" style={{ background: colorBg, color }}>
                      <Icon size={14} />
                    </div>
                    <div className="cat-info">
                      <div className="cat-header">
                        <span className="cat-name">{t(`categories.${key}`)}</span>
                        <span className="cat-score" style={{ color }}>{score}{'%'}</span>
                      </div>
                      <div className="cat-track">
                        <motion.div
                          className="cat-fill"
                          style={{ background: color }}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${score}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Issues */}
              <div className="issues-preview">
                {ISSUES.map((key, i) => (
                  <div key={key} className={`issue-row issue-${ISSUE_SEVERITY[i]}`}>
                    <div className="issue-icon">
                      {ISSUE_SEVERITY[i] === 'error'
                        ? <AlertTriangle size={13} />
                        : <CheckCircle2 size={13} />}
                    </div>
                    <span>{t(`sampleIssues.${key}`)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Blur overlay — teases more content */}
          <div className="mock-blur-overlay">
            <div className="overlay-cta">
              <span>{'Your full report looks like this'}</span>
              <a href="#" className="overlay-btn">
                {'Analyze your site'}
                <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .preview-section {
          padding: 140px 0;
          position: relative;
        }
        .container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 32px;
        }
        .header {
          text-align: center;
          margin-bottom: 72px;
        }
        .section-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: rgba(6, 182, 212, 0.1);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 100px;
          padding: 6px 16px;
          font-size: 11px;
          font-weight: 700;
          color: #22D3EE;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 20px;
        }
        .section-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(32px, 4vw, 48px);
          font-weight: 700;
          letter-spacing: -0.03em;
          color: var(--text-primary);
          margin-bottom: 16px;
        }
        .section-subtitle {
          font-size: 17px;
          color: var(--text-secondary);
          line-height: 1.7;
          max-width: 520px;
          margin: 0 auto;
        }

        /* Mock card */
        .mock-card {
          position: relative;
          background: rgba(11, 16, 32, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          overflow: hidden;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 32px 80px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(59, 130, 246, 0.08);
        }
        :global([data-theme='light']) .mock-card {
          background: rgba(255, 255, 255, 0.9);
          border-color: rgba(15, 23, 42, 0.08);
          box-shadow: 0 32px 80px rgba(15, 23, 42, 0.1);
        }
        .mock-glow {
          position: absolute;
          top: -80px;
          left: 50%;
          transform: translateX(-50%);
          width: 600px;
          height: 300px;
          background: radial-gradient(ellipse, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }
        .mock-topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 28px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          position: relative;
          z-index: 1;
        }
        :global([data-theme='light']) .mock-topbar {
          border-bottom-color: rgba(15, 23, 42, 0.06);
        }
        .mock-url-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .mock-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .mock-dot.green { background: #10b981; box-shadow: 0 0 8px rgba(16,185,129,0.5); }
        .mock-url {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          letter-spacing: -0.01em;
        }
        .mock-scanned {
          font-size: 12px;
          color: var(--text-muted);
        }
        .mock-body {
          display: grid;
          grid-template-columns: 220px 1fr;
          gap: 0;
          position: relative;
          z-index: 1;
        }

        /* Score column */
        .mock-score-col {
          padding: 36px 28px;
          border-right: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }
        :global([data-theme='light']) .mock-score-col {
          border-right-color: rgba(15, 23, 42, 0.06);
        }
        .score-ring-wrap {
          position: relative;
          width: 120px;
          height: 120px;
        }
        .score-inner {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2px;
        }
        .score-num {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 32px;
          font-weight: 700;
          letter-spacing: -0.04em;
          background: linear-gradient(135deg, #3B82F6, #8B5CF6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .score-denom {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-muted);
          align-self: flex-end;
          padding-bottom: 4px;
        }
        .score-label {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          text-align: center;
        }
        .mini-stats {
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;
        }
        .mini-stat {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 14px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        :global([data-theme='light']) .mini-stat {
          background: rgba(15, 23, 42, 0.03);
          border-color: rgba(15, 23, 42, 0.06);
        }
        .mini-stat.critical {
          border-color: rgba(239, 68, 68, 0.2);
          background: rgba(239, 68, 68, 0.04);
        }
        .mini-val {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 18px;
          font-weight: 700;
          letter-spacing: -0.03em;
          color: var(--text-primary);
        }
        .mini-stat.critical .mini-val { color: #ef4444; }
        .mini-lbl {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        /* Right panel */
        .mock-right {
          padding: 28px 32px;
          display: flex;
          flex-direction: column;
          gap: 28px;
        }
        .categories {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .cat-row {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .cat-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .cat-info { flex: 1; }
        .cat-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
        }
        .cat-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
        }
        .cat-score {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 13px;
          font-weight: 700;
        }
        .cat-track {
          height: 4px;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 2px;
          overflow: hidden;
        }
        :global([data-theme='light']) .cat-track {
          background: rgba(15, 23, 42, 0.08);
        }
        .cat-fill {
          height: 100%;
          border-radius: 2px;
        }
        .issues-preview {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .issue-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
          border-left: 3px solid transparent;
        }
        .issue-row.issue-error {
          background: rgba(239, 68, 68, 0.06);
          border-left-color: #ef4444;
          color: var(--text-secondary);
        }
        .issue-row.issue-warning {
          background: rgba(251, 191, 36, 0.06);
          border-left-color: #FBBF24;
          color: var(--text-secondary);
        }
        .issue-icon {
          flex-shrink: 0;
          display: flex;
        }
        .issue-row.issue-error .issue-icon { color: #ef4444; }
        .issue-row.issue-warning .issue-icon { color: #FBBF24; }

        /* Blur overlay */
        .mock-blur-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 160px;
          background: linear-gradient(to top, rgba(5, 7, 13, 0.96) 0%, rgba(5, 7, 13, 0.7) 50%, transparent 100%);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding-bottom: 32px;
          z-index: 2;
        }
        :global([data-theme='light']) .mock-blur-overlay {
          background: linear-gradient(to top, rgba(248, 250, 255, 0.96) 0%, rgba(248, 250, 255, 0.7) 50%, transparent 100%);
        }
        .overlay-cta {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .overlay-cta span {
          font-size: 14px;
          color: var(--text-secondary);
          font-weight: 500;
        }
        .overlay-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #3B82F6, #8B5CF6);
          color: white;
          padding: 10px 22px;
          border-radius: 10px;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: -0.01em;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          box-shadow: 0 4px 20px rgba(59, 130, 246, 0.35);
        }
        .overlay-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 28px rgba(59, 130, 246, 0.5);
          color: white;
        }

        @media (max-width: 768px) {
          .preview-section { padding: 80px 0; }
          .container { padding: 0 20px; }
          .mock-body { grid-template-columns: 1fr; }
          .mock-score-col { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.06); }
          .overlay-cta { flex-direction: column; gap: 12px; text-align: center; }
        }
      `}</style>
    </section>
  );
}
