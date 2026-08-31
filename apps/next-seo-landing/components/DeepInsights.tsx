'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { CheckCircle2, Check } from 'lucide-react';

export default function DeepInsights() {
  const t = useTranslations('landing.deepInsights');

  return (
    <section className="border-y border-border bg-[color-mix(in_oklab,var(--background)_60%,var(--card))] py-[140px] max-[640px]:py-20">
      <div className="mx-auto max-w-6xl px-8 max-[640px]:px-5">
        <div className="grid grid-cols-1 items-center gap-20 lg:grid-cols-2 max-[900px]:gap-[60px]">
          {/* Left Column - Copy */}
          <motion.div
            className="max-w-[520px] max-[900px]:mx-auto max-[900px]:max-w-full max-[900px]:text-center"
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="mb-6 font-display text-[clamp(36px,4vw,48px)] font-bold leading-[1.1] tracking-[-0.025em] text-foreground">{t('title')}</h2>
            <p className="mb-8 text-lg leading-[1.7] text-muted-foreground">{t('description')}</p>

            <div className="mb-8 space-y-3.5 border-l-2 border-primary/20 pl-5 max-[900px]:border-l-0 max-[900px]:pl-0">
              <p className="text-[15px] leading-[1.8] text-muted-foreground">{t('p1')}</p>
              <p className="text-[15px] leading-[1.8] text-muted-foreground">{t('p2')}</p>
              <p className="text-[15px] leading-[1.8] text-muted-foreground">{t('p3')}</p>
              <p className="text-[15px] leading-[1.8] text-muted-foreground">{t('p4')}</p>
              <p className="text-[15px] leading-[1.8] text-muted-foreground">{t('p5')}</p>
              <p className="text-[15px] leading-[1.8] text-muted-foreground">{t('p6')}</p>
            </div>

            <ul className="flex flex-col gap-4 max-[900px]:items-center">
              {['bullet1', 'bullet2', 'bullet3'].map((key) => (
                <li key={key} className="flex items-center gap-3 text-[15px] font-medium text-foreground">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
                    <Check size={14} className="text-primary" />
                  </span>
                  {t(key)}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Right Column - Card */}
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          >
            <div className="w-full max-w-[540px] overflow-hidden rounded-3xl border border-border bg-card/80 shadow-[0_32px_80px_rgba(0,0,0,0.3),0_0_0_1px_rgba(99, 102, 241,0.05)] backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <span className="font-display text-sm font-semibold text-foreground">example.com</span>
                </div>
                <div className="rounded-full border border-emerald-500/25 bg-emerald-500/12 px-2.5 py-1 text-[10px] font-bold tracking-[0.04em] text-emerald-500">
                  {'GOOD HEALTH'}
                </div>
              </div>

              <div className="grid grid-cols-[140px_1fr] gap-6 p-8 max-[640px]:grid-cols-1 max-[640px]:gap-8">
                <div className="flex items-center justify-center">
                  <div className="relative size-[100px]">
                    <svg width="100" height="100" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="var(--border)" strokeWidth="8" />
                      <circle
                        cx="50" cy="50" r="42" fill="none"
                        stroke="url(#scoreGrad2)" strokeWidth="8" strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 42}`}
                        strokeDashoffset={`${2 * Math.PI * 42 * (1 - 0.85)}`}
                        transform="rotate(-90 50 50)"
                      />
                      <defs>
                        <linearGradient id="scoreGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#41A5FF" />
                          <stop offset="100%" stopColor="#6366F1" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="gradient-text-bv font-display text-4xl font-bold leading-none tracking-[-0.025em]">{t('cardScore')}</span>
                      <span className="text-[11px] font-semibold text-muted-foreground">{'/100'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="mb-1 text-[11px] font-bold tracking-[0.06em] text-red-500">{t('cardKeyResults')}</div>
                  <div className="flex items-center justify-between border-b border-foreground/5 pb-2 text-[13px]">
                    <span className="font-medium text-foreground">{t('issue1')}</span>
                    <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-500">High</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-foreground/5 pb-2 text-[13px]">
                    <span className="font-medium text-foreground">{t('issue2')}</span>
                    <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-[10px] font-bold text-amber-400">Med</span>
                  </div>
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="font-medium text-foreground">{t('issue3')}</span>
                    <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-500">High</span>
                  </div>
                </div>
              </div>

              <div className="h-px bg-border" />

              <div className="p-8">
                <div className="mb-4 text-[11px] font-bold tracking-[0.06em] text-emerald-500">{t('passedDetails')} (24)</div>
                <div className="grid grid-cols-2 gap-3 max-[640px]:grid-cols-1">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    <span>SSL Certificate valid</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    <span>Robots.txt found</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    <span>XML Sitemap present</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    <span>{t('mobilePassed')}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
