'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const KEYS = ['q1', 'q2', 'q3', 'q4', 'q5'] as const;

export default function FAQ() {
    const t = useTranslations('landing.faq');
    const [open, setOpen] = useState<string | null>('q1');

    const toggle = (key: string) => setOpen(prev => prev === key ? null : key);

    return (
        <section id="faq" className="faq">
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
                    className="list"
                    initial={{ opacity: 0, y: 32 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                    {KEYS.map((key, i) => {
                        const isOpen = open === key;
                        return (
                            <div key={key} className={`item ${isOpen ? 'open' : ''}`}>
                                <button
                                    className="question"
                                    onClick={() => toggle(key)}
                                    aria-expanded={isOpen}
                                >
                                    <span>{t(`items.${key}.question`)}</span>
                                    <div className="icon-wrap">
                                        {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                                    </div>
                                </button>
                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div
                                            className="answer"
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                        >
                                            <p>{t(`items.${key}.answer`)}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </motion.div>
            </div>

            <style jsx>{`
        .faq {
          padding: 140px 0;
          position: relative;
        }
        .container {
          max-width: 760px;
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
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: 100px;
          padding: 6px 16px;
          font-size: 11px;
          font-weight: 700;
          color: #A78BFA;
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
        }
        .list {
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .item {
          border-bottom: 1px solid var(--border-color);
          transition: border-color 0.2s ease;
        }
        .item:first-child {
          border-top: 1px solid var(--border-color);
        }
        .item.open {
          border-bottom-color: rgba(139, 92, 246, 0.2);
        }
        .question {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          padding: 24px 0;
          background: transparent;
          border: none;
          cursor: pointer;
          text-align: left;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 17px;
          font-weight: 600;
          letter-spacing: -0.02em;
          color: var(--text-primary);
          transition: color 0.2s ease;
        }
        .question:hover {
          color: #A78BFA;
        }
        .icon-wrap {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #A78BFA;
          flex-shrink: 0;
          transition: background 0.2s ease, transform 0.2s ease;
        }
        .item.open .icon-wrap {
          background: rgba(139, 92, 246, 0.15);
        }
        .answer {
          overflow: hidden;
        }
        .answer p {
          padding-bottom: 24px;
          font-size: 15px;
          color: var(--text-secondary);
          line-height: 1.75;
        }
        @media (max-width: 768px) {
          .faq { padding: 80px 0; }
          .container { padding: 0 20px; }
          .question { font-size: 15px; }
        }
      `}</style>
        </section>
    );
}
