'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

export default function HowItWorks() {
  const t = useTranslations('landing.howItWorks');

  const steps = [
    { number: '01', title: t('steps.step1.title'), description: t('steps.step1.description') },
    { number: '02', title: t('steps.step2.title'), description: t('steps.step2.description') },
    { number: '03', title: t('steps.step3.title'), description: t('steps.step3.description') },
  ];

  return (
    <section id="how-it-works" className="how-it-works">
      <div className="container">
        <motion.div
          className="header"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="section-badge">{t('badge')}</div>
          <h2 className="title gradient-text">{t('title')}</h2>
          <p className="subtitle">{t('subtitle')}</p>
        </motion.div>

        <div className="steps">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="step"
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Connector line */}
              {index < steps.length - 1 && <div className="connector" />}
              <div className="step-number-wrap">
                <div className="step-number">{step.number}</div>
              </div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-description">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .how-it-works {
          padding: 140px 0;
          background: var(--bg-secondary);
          border-top: 1px solid var(--border-color);
          border-bottom: 1px solid var(--border-color);
          position: relative;
          overflow: hidden;
        }
        .how-it-works::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 60% 50% at 50% 0%, rgba(59, 130, 246, 0.06) 0%, transparent 70%);
          pointer-events: none;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 32px;
          position: relative;
          z-index: 1;
        }
        .header {
          text-align: center;
          margin-bottom: 96px;
        }
        .section-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 100px;
          padding: 6px 16px;
          font-size: 11px;
          font-weight: 700;
          color: #60A5FA;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 20px;
        }
        .title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(36px, 5vw, 52px);
          font-weight: 700;
          letter-spacing: -0.03em;
          margin-bottom: 16px;
        }
        .subtitle {
          font-size: 18px;
          color: var(--text-secondary);
          line-height: 1.7;
        }
        .steps {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0;
          position: relative;
        }
        .step {
          text-align: center;
          padding: 0 32px;
          position: relative;
        }
        .connector {
          position: absolute;
          top: 40px;
          right: -50%;
          width: 100%;
          height: 1px;
          background: linear-gradient(to right, rgba(59, 130, 246, 0.3), rgba(139, 92, 246, 0.3));
          z-index: 0;
        }
        .step-number-wrap {
          display: flex;
          justify-content: center;
          margin-bottom: 28px;
          position: relative;
          z-index: 1;
        }
        .step-number {
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.03em;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          background-color: var(--bg-secondary);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 20px;
          backdrop-filter: blur(12px);
          box-shadow: 0 0 32px rgba(59, 130, 246, 0.12);
        }
        .step-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 20px;
          font-weight: 600;
          letter-spacing: -0.02em;
          margin-bottom: 12px;
          color: var(--text-primary);
        }
        .step-description {
          font-size: 15px;
          color: var(--text-secondary);
          line-height: 1.7;
        }
        @media (max-width: 768px) {
          .how-it-works { padding: 80px 0; }
          .container { padding: 0 20px; }
          .steps { grid-template-columns: 1fr; gap: 48px; }
          .connector { display: none; }
          .header { margin-bottom: 56px; }
        }
      `}</style>
    </section>
  );
}
