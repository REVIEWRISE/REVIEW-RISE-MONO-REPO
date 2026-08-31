'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './ui/accordion';

const KEYS = ['q1', 'q2', 'q3', 'q4', 'q5'];

export default function FAQ() {
  const t = useTranslations('landing.faq');

  return (
    <section id="faq" className="relative py-[140px] max-[768px]:py-20">
      <div className="mx-auto max-w-[760px] px-8 max-[768px]:px-5">
        <motion.div
          className="mb-[72px] text-center max-[768px]:mb-12"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-brand-violet/20 bg-brand-violet/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-violet-400">
            {t('badge')}
          </div>
          <h2 className="mb-4 font-display text-[clamp(32px,4vw,48px)] font-bold tracking-[-0.025em] text-foreground">{t('title')}</h2>
          <p className="text-[17px] leading-[1.7] text-muted-foreground">{t('subtitle')}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <Accordion type="single" defaultValue="q1">
            {KEYS.map((key) => (
              <AccordionItem key={key} value={key} className="border-border py-1">
                <AccordionTrigger
                  value={key}
                  className="py-6 font-display text-[17px] font-semibold tracking-[-0.025em] text-foreground hover:text-violet-400 [&>svg]:size-5 [&>svg]:text-violet-400"
                >
                  {t(`items.${key}.question`)}
                </AccordionTrigger>
                <AccordionContent value={key} className="pb-6 text-[15px] leading-[1.75] text-muted-foreground">
                  {t(`items.${key}.answer`)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
