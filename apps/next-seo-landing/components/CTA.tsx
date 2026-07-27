'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function CTA() {
  const t = useTranslations('landing.cta');

  return (
    <section className="cta">
      {/* Ambient orbs */}
      <div className="orb orb-blue" />
      <div className="orb orb-violet" />

      <div className="container">
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="card-glow" />
          <div className="badge">
            <Sparkles size={12} />
            {t('hint')}
          </div>
          <h2 className="title gradient-text">{t('title')}</h2>
          <p className="subtitle">{t('subtitle')}</p>
          <a href="#" className="cta-button">
            {t('button')}
            <ArrowRight size={16} />
          </a>
          <p className="cta-hint">{t('hint')}</p>
        </motion.div>
      </div>

      <style jsx>{`
        .cta {
          padding: 140px 0;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          z-index: 0;
        }
        .orb-blue {
          width: 500px;
          height: 300px;
          background: rgba(59, 130, 246, 0.1);
          bottom: -100px;
          left: -100px;
        }
        .orb-violet {
          width: 400px;
          height: 300px;
          background: rgba(139, 92, 246, 0.08);
          bottom: -80px;
          right: -80px;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 0 32px;
          position: relative;
          z-index: 1;
        }
        .card {
          position: relative;
          background: rgba(11, 16, 32, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 28px;
          padding: 80px 64px;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          overflow: hidden;
        }
        :global([data-theme='light']) .card {
          background: rgba(255, 255, 255, 0.8);
          border-color: rgba(15, 23, 42, 0.08);
        }
        .card-glow {
          position: absolute;
          top: -60px;
          left: 50%;
          transform: translateX(-50%);
          width: 400px;
          height: 200px;
          background: radial-gradient(ellipse, rgba(59, 130, 246, 0.15) 0%, transparent 70%);
          pointer-events: none;
        }
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.25);
          border-radius: 100px;
          padding: 7px 16px;
          font-size: 12px;
          font-weight: 600;
          color: #60A5FA;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin-bottom: 28px;
        }
        .title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(36px, 5vw, 52px);
          font-weight: 700;
          letter-spacing: -0.03em;
          margin-bottom: 20px;
        }
        .subtitle {
          font-size: 18px;
          color: var(--text-secondary);
          margin-bottom: 48px;
          line-height: 1.7;
        }
        .cta-button {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: var(--gradient-primary);
          color: white;
          padding: 16px 36px;
          border-radius: 14px;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 16px;
          letter-spacing: -0.01em;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          box-shadow: 0 4px 24px rgba(59, 130, 246, 0.35);
          position: relative;
          overflow: hidden;
        }
        .cta-button::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 40px rgba(59, 130, 246, 0.5);
          color: white;
        }
        .cta-button:hover::before {
          opacity: 1;
        }
        .cta-hint {
          margin-top: 16px;
          font-size: 13px;
          color: var(--text-muted);
        }
        @media (max-width: 768px) {
          .cta { padding: 80px 0; }
          .container { padding: 0 20px; }
          .card { padding: 48px 28px; }
        }
      `}</style>
    </section>
  );
}
