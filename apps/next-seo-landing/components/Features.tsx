'use client';

import { useTranslations } from 'next-intl';
import { FileText, Code2, Activity, Smartphone, Key, Wrench } from 'lucide-react';
import { motion } from 'framer-motion';

const ICONS = [FileText, Code2, Activity, Smartphone, Key, Wrench];
const ICON_COLORS = [
  { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.2)', color: '#60A5FA' },
  { bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.2)', color: '#A78BFA' },
  { bg: 'rgba(6,182,212,0.12)', border: 'rgba(6,182,212,0.2)', color: '#22D3EE' },
  { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.2)', color: '#60A5FA' },
  { bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.2)', color: '#A78BFA' },
  { bg: 'rgba(6,182,212,0.12)', border: 'rgba(6,182,212,0.2)', color: '#22D3EE' },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function Features() {
  const t = useTranslations('landing.features');

  const features = [
    { key: 'instant', Icon: ICONS[0], style: ICON_COLORS[0] },
    { key: 'actionable', Icon: ICONS[1], style: ICON_COLORS[1] },
    { key: 'ai', Icon: ICONS[2], style: ICON_COLORS[2] },
    { key: 'detailed', Icon: ICONS[3], style: ICON_COLORS[3] },
    { key: 'secure', Icon: ICONS[4], style: ICON_COLORS[4] },
    { key: 'free', Icon: ICONS[5], style: ICON_COLORS[5] },
  ];

  return (
    <section id="features" className="features">
      <div className="container">
        {/* Header */}
        <motion.div
          className="header"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="section-title gradient-text-blue-violet">{t('title')}</h2>
          <p className="section-subtitle">{t('subtitle')}</p>
        </motion.div>

        {/* Grid */}
        <motion.div
          className="grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {features.map(({ key, Icon, style }, i) => (
            <motion.div key={i} className="card" variants={cardVariants}>
              <div className="card-glow" />
              <div
                className="icon-wrap"
                style={{ background: style.bg, border: `1px solid ${style.border}` }}
              >
                <Icon size={20} color={style.color} />
              </div>
              <h3 className="card-title">{t(`items.${key}.title`)}</h3>
              <p className="card-desc">{t(`items.${key}.description`)}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <style jsx>{`
        .features {
          padding: 140px 0;
          position: relative;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 32px;
        }
        .header {
          text-align: center;
          margin-bottom: 80px;
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
        .section-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(36px, 5vw, 52px);
          font-weight: 700;
          letter-spacing: -0.03em;
          margin-bottom: 16px;
        }
        .section-subtitle {
          font-size: 18px;
          color: var(--text-secondary);
          line-height: 1.7;
          max-width: 520px;
          margin: 0 auto;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .card {
          position: relative;
          padding: 36px 32px;
          background: rgba(11, 16, 32, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 20px;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          overflow: hidden;
          transition: border-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
        }
        .card:hover {
          border-color: rgba(59, 130, 246, 0.25);
          transform: translateY(-6px);
          box-shadow: 0 16px 48px rgba(59, 130, 246, 0.12);
        }
        .card-glow {
          position: absolute;
          top: -40px;
          right: -40px;
          width: 120px;
          height: 120px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 70%);
          pointer-events: none;
          transition: opacity 0.3s ease;
          opacity: 0;
        }
        .card:hover .card-glow {
          opacity: 1;
        }
        :global([data-theme='light']) .card {
          background: rgba(255, 255, 255, 0.8);
          border-color: rgba(15, 23, 42, 0.08);
        }
        :global([data-theme='light']) .card:hover {
          border-color: rgba(59, 130, 246, 0.3);
          box-shadow: 0 16px 48px rgba(59, 130, 246, 0.08);
        }
        .icon-wrap {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }
        .card-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 17px;
          font-weight: 600;
          letter-spacing: -0.02em;
          color: var(--text-primary);
          margin-bottom: 10px;
        }
        .card-desc {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.7;
        }
        @media (max-width: 1024px) {
          .grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .features { padding: 80px 0; }
          .container { padding: 0 20px; }
          .grid { grid-template-columns: 1fr; gap: 14px; }
          .card { padding: 28px 24px; }
          .header { margin-bottom: 48px; }
        }
      `}</style>
    </section>
  );
}
