'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

// SVG wordmarks as inline components — no external images needed
const BRANDS = [
    { name: 'Shopify', width: 72 },
    { name: 'Stripe', width: 52 },
    { name: 'Notion', width: 64 },
    { name: 'Linear', width: 60 },
    { name: 'Vercel', width: 64 },
    { name: 'Figma', width: 48 },
    { name: 'Webflow', width: 76 },
    { name: 'Framer', width: 68 },
];

// Duplicate for seamless loop
const TICKER = [...BRANDS, ...BRANDS];

export default function TrustBar() {
    const t = useTranslations('landing.trustBar');

    return (
        <div className="trust-bar">
            <div className="label">{t('label')}</div>

            <div className="ticker-wrap">
                <div className="ticker-fade ticker-fade-left" />
                <div className="ticker-fade ticker-fade-right" />
                <motion.div
                    className="ticker"
                    animate={{ x: ['0%', '-50%'] }}
                    transition={{ duration: 28, ease: 'linear', repeat: Infinity }}
                >
                    {TICKER.map((brand, i) => (
                        <div key={i} className="brand-pill">
                            <span className="brand-dot" />
                            <span className="brand-name">{brand.name}</span>
                        </div>
                    ))}
                </motion.div>
            </div>

            <style jsx>{`
        .trust-bar {
          padding: 48px 0 56px;
          text-align: center;
          border-bottom: 1px solid var(--border-color);
          overflow: hidden;
        }
        .label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 28px;
        }
        .ticker-wrap {
          position: relative;
          overflow: hidden;
        }
        .ticker-fade {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 120px;
          z-index: 2;
          pointer-events: none;
        }
        .ticker-fade-left {
          left: 0;
          background: linear-gradient(to right, var(--bg-primary), transparent);
        }
        .ticker-fade-right {
          right: 0;
          background: linear-gradient(to left, var(--bg-primary), transparent);
        }
        .ticker {
          display: flex;
          gap: 12px;
          width: max-content;
        }
        .brand-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 100px;
          padding: 8px 20px;
          white-space: nowrap;
          transition: border-color 0.2s ease;
        }
        :global([data-theme='light']) .brand-pill {
          background: rgba(15, 23, 42, 0.03);
          border-color: rgba(15, 23, 42, 0.08);
        }
        .brand-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3B82F6, #8B5CF6);
          flex-shrink: 0;
        }
        .brand-name {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-muted);
          letter-spacing: -0.01em;
        }
      `}</style>
        </div>
    );
}
