'use client';

import { useTranslations } from 'next-intl';
import { FileText, Code2, Activity, Smartphone, Key, Wrench } from 'lucide-react';
import { motion } from 'framer-motion';

const ICONS = [FileText, Code2, Activity, Smartphone, Key, Wrench];
const ICON_STYLE = [
  { bg: 'bg-brand-blue/12', border: 'border-brand-blue/20', text: 'text-blue-400' },
  { bg: 'bg-brand-violet/12', border: 'border-brand-violet/20', text: 'text-violet-400' },
  { bg: 'bg-brand-cyan/12', border: 'border-brand-cyan/20', text: 'text-cyan-400' },
  { bg: 'bg-brand-blue/12', border: 'border-brand-blue/20', text: 'text-blue-400' },
  { bg: 'bg-brand-violet/12', border: 'border-brand-violet/20', text: 'text-violet-400' },
  { bg: 'bg-brand-cyan/12', border: 'border-brand-cyan/20', text: 'text-cyan-400' },
];

// Bento layout: first two items lead the grid as wider tiles
const SPAN = ['md:col-span-2', '', '', '', '', 'md:col-span-2'];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function Features() {
  const t = useTranslations('landing.features');

  const features = [
    { key: 'instant', Icon: ICONS[0], style: ICON_STYLE[0] },
    { key: 'actionable', Icon: ICONS[1], style: ICON_STYLE[1] },
    { key: 'ai', Icon: ICONS[2], style: ICON_STYLE[2] },
    { key: 'detailed', Icon: ICONS[3], style: ICON_STYLE[3] },
    { key: 'secure', Icon: ICONS[4], style: ICON_STYLE[4] },
    { key: 'free', Icon: ICONS[5], style: ICON_STYLE[5] },
  ];

  return (
    <section id="features" className="relative py-[140px] max-[640px]:py-20">
      <div className="mx-auto max-w-6xl px-8 max-[640px]:px-5">
        <motion.div
          className="mb-20 text-center max-[640px]:mb-12"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="gradient-text-bv mb-4 font-display text-[clamp(36px,5vw,52px)] font-bold tracking-[-0.025em]">{t('title')}</h2>
          <p className="mx-auto max-w-[520px] text-lg leading-[1.7] text-muted-foreground">{t('subtitle')}</p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 gap-5 md:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {features.map(({ key, Icon, style }, i) => (
            <motion.div
              key={i}
              className={`group relative overflow-hidden rounded-[20px] border border-foreground/6 bg-card/60 p-9 backdrop-blur-md transition duration-300 hover:-translate-y-1.5 hover:border-primary/25 hover:shadow-[0_16px_48px_rgba(99, 102, 241,0.12)] max-[640px]:p-7 ${SPAN[i]}`}
              variants={cardVariants}
            >
              <div className="pointer-events-none absolute -right-10 -top-10 size-[120px] rounded-full bg-primary/12 opacity-0 blur-[40px] transition-opacity duration-300 group-hover:opacity-100" />
              <div className={`mb-5 flex size-12 items-center justify-center rounded-xl border ${style.bg} ${style.border}`}>
                <Icon size={20} className={style.text} />
              </div>
              <h3 className="mb-2.5 font-display text-[17px] font-semibold tracking-[-0.025em] text-foreground">{t(`items.${key}.title`)}</h3>
              <p className="text-sm leading-[1.7] text-muted-foreground">{t(`items.${key}.description`)}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
