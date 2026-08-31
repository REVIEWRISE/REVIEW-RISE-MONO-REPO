'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

export default function HowItWorks() {
  const t = useTranslations('landing.howItWorks');

  const steps = [
    { number: '1', title: t('steps.step1.title'), description: t('steps.step1.description') },
    { number: '2', title: t('steps.step2.title'), description: t('steps.step2.description') },
    { number: '3', title: t('steps.step3.title'), description: t('steps.step3.description') },
  ];

  return (
    <section id="how-it-works" className="relative overflow-hidden py-[140px] max-[768px]:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(99, 102, 241,0.06)_0%,transparent_70%)]" />
      <div className="relative z-[1] mx-auto max-w-6xl px-8 max-[768px]:px-5">
        <motion.div
          className="mb-24 text-center max-[768px]:mb-14"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="gradient-text mb-4 font-display text-[clamp(36px,5vw,52px)] font-bold tracking-[-0.025em]">{t('title')}</h2>
          <p className="text-lg leading-[1.7] text-muted-foreground">{t('subtitle')}</p>
        </motion.div>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="relative px-8 text-center max-[768px]:px-0"
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              {index < steps.length - 1 && (
                <div className="absolute right-[-50%] top-10 z-0 h-px w-full bg-gradient-to-r from-brand-blue/30 to-brand-violet/30 max-[768px]:hidden" />
              )}
              <div className="relative z-[1] mb-7 flex justify-center">
                <div
                  className={
                    index === 2
                      ? 'flex size-20 items-center justify-center rounded-[20px] bg-gradient-to-br from-brand-blue to-brand-violet font-display text-[28px] font-bold tracking-[-0.025em] text-white shadow-[0_8px_32px_rgba(99, 102, 241,0.35)]'
                      : 'gradient-text-bv flex size-20 items-center justify-center rounded-[20px] border border-primary/20 bg-card/40 font-display text-[28px] font-bold tracking-[-0.025em] shadow-[0_0_32px_rgba(99, 102, 241,0.12)] backdrop-blur-md'
                  }
                >
                  {step.number}
                </div>
              </div>
              <h3 className="mb-3 font-display text-xl font-semibold tracking-[-0.025em] text-foreground">{step.title}</h3>
              <p className="text-[15px] leading-[1.7] text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
