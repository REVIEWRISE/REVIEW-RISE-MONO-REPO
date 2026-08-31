'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

export default function WorkflowSection() {
  const t = useTranslations('landing.workflow');

  return (
    <section className="relative overflow-hidden py-[140px] max-[768px]:py-20">
      <div className="mx-auto max-w-3xl px-8 max-[768px]:px-5">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="gradient-text-bv font-display text-[clamp(36px,5vw,52px)] font-bold tracking-[-0.025em]">{t('title')}</h2>
        </motion.div>

        <motion.div
          className="overflow-hidden rounded-2xl border border-border bg-card/90 shadow-[0_32px_80px_rgba(0,0,0,0.4),0_0_0_1px_rgba(99, 102, 241,0.06)]"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Browser chrome */}
          <div className="flex items-center gap-4 border-b border-border bg-black/[0.08] px-4 py-3">
            <div className="flex gap-1.5">
              <span className="size-2.5 rounded-full bg-red-500" />
              <span className="size-2.5 rounded-full bg-amber-400" />
              <span className="size-2.5 rounded-full bg-emerald-500" />
            </div>
            <div className="flex-1 rounded-md bg-foreground/5 px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
              <span>app.vyntrise.com/dashboard</span>
            </div>
          </div>

          {/* Dashboard content */}
          <div className="grid min-h-[320px] grid-cols-[180px_1fr] max-[768px]:grid-cols-1">
            <div className="flex flex-col gap-7 border-r border-border p-5 max-[768px]:hidden">
              <div className="flex items-center gap-2 font-display text-sm font-bold text-foreground">
                <div className="size-6 rounded-md bg-gradient-to-br from-brand-blue to-brand-violet" />
                <span>Vyntrise</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-2.5 py-2 text-[13px] font-medium text-blue-400">
                  <div className="size-1.5 rounded-full bg-primary" />
                  <span>Dashboard</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] font-medium text-muted-foreground">
                  <div className="size-1.5 rounded-full bg-current opacity-50" />
                  <span>Reports</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] font-medium text-muted-foreground">
                  <div className="size-1.5 rounded-full bg-current opacity-50" />
                  <span>Settings</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-7 p-8 max-[768px]:p-6">
              <p className="max-w-[340px] font-display text-[clamp(18px,2.5vw,24px)] font-bold leading-[1.3] tracking-[-0.025em] text-foreground">
                {t('mockupTagline')}
              </p>

              <div className="flex flex-col gap-3.5">
                <div className="flex flex-col gap-1.5">
                  <div className="h-1.5 w-[72%] rounded-full bg-brand-blue" />
                  <span className="text-[11px] font-semibold tracking-[0.02em] text-muted-foreground">SEO Score</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="h-1.5 w-[58%] rounded-full bg-brand-violet" />
                  <span className="text-[11px] font-semibold tracking-[0.02em] text-muted-foreground">Performance</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="h-1.5 w-[85%] rounded-full bg-emerald-500" />
                  <span className="text-[11px] font-semibold tracking-[0.02em] text-muted-foreground">Content</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
