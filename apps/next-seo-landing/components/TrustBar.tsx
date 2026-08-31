'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Zap, ShieldCheck, Clock, Gift } from 'lucide-react';

const FACTS = [
  { Icon: Zap, key: 'fact1' },
  { Icon: Clock, key: 'fact2' },
  { Icon: ShieldCheck, key: 'fact3' },
  { Icon: Gift, key: 'fact4' },
];

const TICKER = [...FACTS, ...FACTS];

export default function TrustBar() {
  const t = useTranslations('landing.trustBar');

  return (
    <div className="overflow-hidden border-b border-border py-10 text-center max-[640px]:py-8">
      <div className="mb-6 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">{t('label')}</div>

      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-[2] w-[120px] bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-[2] w-[120px] bg-gradient-to-l from-background to-transparent" />
        <motion.div
          className="flex w-max gap-3"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 24, ease: 'linear', repeat: Infinity }}
        >
          {TICKER.map(({ Icon, key }, i) => (
            <div
              key={i}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-foreground/6 bg-foreground/[0.03] px-5 py-2"
            >
              <Icon size={14} className="text-primary" />
              <span className="font-display text-sm font-semibold tracking-[-0.01em] text-muted-foreground">{t(key)}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
