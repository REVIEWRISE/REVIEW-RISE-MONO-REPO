'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { Globe, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

/* ── Terminal lines (shortened for bottom CTA) ───────────────────────── */
interface TermLine {
  text: string;
  type: 'cmd' | 'info' | 'success' | 'warn' | 'error' | 'result' | 'dim' | 'bar';
  delay: number;
  barPct?: number;
  barColor?: string;
}

const TERM_LINES: TermLine[] = [
  { text: '$ vyntrise agent run https://your-site.com', type: 'cmd', delay: 0 },
  { text: '', type: 'dim', delay: 400 },
  { text: '✓ DNS resolved  (203.0.113.42)', type: 'success', delay: 800 },
  { text: '✓ HTTPS valid    TLS 1.3', type: 'success', delay: 1200 },
  { text: '', type: 'dim', delay: 1500 },
  { text: '▸ Running 80+ SEO checks…', type: 'info', delay: 1600 },
  { text: '', type: 'dim', delay: 2000 },
  { text: '  Technical SEO        92%', type: 'bar', delay: 2200, barPct: 92, barColor: '#10b981' },
  { text: '  Content Quality      78%', type: 'bar', delay: 2600, barPct: 78, barColor: '#41A5FF' },
  { text: '  On-Page SEO          85%', type: 'bar', delay: 3000, barPct: 85, barColor: '#6366F1' },
  { text: '', type: 'dim', delay: 3400 },
  { text: '────────────────────────────────────────', type: 'dim', delay: 3500 },
  { text: '  HEALTH SCORE', type: 'dim', delay: 3600 },
  { text: '  94 / 100  ■ Excellent', type: 'result', delay: 3800 },
  { text: '────────────────────────────────────────', type: 'dim', delay: 3900 },
  { text: '', type: 'dim', delay: 4000 },
  { text: '✓ Done in 8.2s', type: 'success', delay: 4200 },
];

const TERM_TEXT_CLASS: Record<TermLine['type'], string> = {
  cmd: 'font-semibold text-slate-200',
  info: 'text-blue-400',
  success: 'text-emerald-400',
  warn: 'font-semibold text-amber-400',
  error: 'text-red-400',
  result: 'text-base font-bold text-violet-400',
  dim: 'text-white/20',
  bar: '',
};

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.09 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function BottomCTA() {
  const t = useTranslations('landing');
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [focused, setFocused] = useState(false);

  /* Terminal typewriter */
  const [visibleCount, setVisibleCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const termRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !hasStarted) setHasStarted(true); },
      { threshold: 0.3 }
    );
    obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    TERM_LINES.forEach((line, i) => {
      timers.push(setTimeout(() => {
        setVisibleCount(i + 1);
        requestAnimationFrame(() => {
          if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight;
        });
      }, line.delay));
    });
    return () => timers.forEach(clearTimeout);
  }, [hasStarted]);

  const handleAnalyze = () => {
    if (!url.trim()) return;
    let u = url.trim();
    if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
    u = u.replace(/\/+$/, '');
    router.push(`/results?url=${encodeURIComponent(u)}`);
  };

  return (
    <section ref={sectionRef} className="relative overflow-hidden border-t border-border bg-[color-mix(in_oklab,var(--background)_60%,var(--card))] py-[140px] max-[640px]:py-20">
      <div className="pointer-events-none absolute -bottom-52 -left-[100px] size-[600px] rounded-full bg-brand-blue/8 blur-[100px]" />
      <div className="pointer-events-none absolute -top-[100px] -right-[100px] size-[500px] rounded-full bg-brand-violet/6 blur-[100px]" />

      <div className="relative z-[1] mx-auto grid max-w-[1240px] items-center gap-20 px-12 max-[1100px]:grid-cols-1 max-[1100px]:gap-[60px] max-[1100px]:px-8 min-[1101px]:grid-cols-2 max-[640px]:px-5">
        {/* Left copy */}
        <motion.div
          className="flex flex-col items-start max-[1100px]:items-center max-[1100px]:text-center"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <motion.h2 className="mb-[18px] font-display text-[clamp(36px,4vw,52px)] font-bold leading-[1.1] tracking-[-0.025em] text-foreground" variants={fadeUp}>
            {t('bottomCta.title')}
          </motion.h2>
          <motion.p className="mb-9 max-w-[460px] text-[17px] leading-[1.75] text-muted-foreground" variants={fadeUp}>
            {t('bottomCta.description')}
          </motion.p>

          <motion.div className="w-full max-w-[540px]" variants={fadeUp}>
            <div
              className={`mb-3 flex items-center rounded-2xl border py-1.5 pl-[18px] pr-1.5 backdrop-blur-xl transition-all ${
                focused
                  ? 'border-primary/50 shadow-[0_0_0_4px_rgba(99, 102, 241,0.1),0_8px_40px_rgba(0,0,0,0.3)]'
                  : 'border-border shadow-[0_4px_24px_rgba(0,0,0,0.2)]'
              } bg-card/70`}
            >
              <Globe size={18} className="mr-2.5 shrink-0 text-primary" />
              <input
                type="url"
                placeholder={t('hero.inputPlaceholder')}
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className="min-w-0 flex-1 bg-transparent py-3 pr-3 text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <button
                onClick={handleAnalyze}
                className="relative flex shrink-0 items-center gap-2 overflow-hidden whitespace-nowrap rounded-xl bg-gradient-to-br from-brand-blue to-brand-violet px-6 py-3.5 font-display text-sm font-semibold tracking-[-0.01em] text-white shadow-[0_4px_20px_rgba(99, 102, 241,0.4)] transition hover:-translate-y-px hover:shadow-[0_6px_28px_rgba(99, 102, 241,0.55)]"
              >
                {t('bottomCta.button')}
                <ArrowRight size={15} />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">{t('bottomCta.hint')}</p>
          </motion.div>
        </motion.div>

        {/* Right: terminal card */}
        <motion.div
          className="relative w-full max-w-[480px] overflow-hidden rounded-2xl border border-white/8 bg-[#0a0e1a] shadow-[0_48px_100px_rgba(0,0,0,0.55),0_0_0_1px_rgba(99, 102, 241,0.06)] max-[1100px]:mx-auto"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="pointer-events-none absolute -top-20 left-1/2 h-[200px] w-[360px] -translate-x-1/2 bg-[radial-gradient(ellipse,rgba(99, 102, 241,0.15)_0%,transparent_70%)]" />

          <div className="relative flex items-center gap-3 border-b border-white/6 bg-white/[0.03] px-4 py-3">
            <div className="flex gap-1.5">
              <span className="size-2.5 rounded-full bg-red-500" />
              <span className="size-2.5 rounded-full bg-amber-400" />
              <span className="size-2.5 rounded-full bg-emerald-500" />
            </div>
            <div className="font-mono text-[11px] font-medium text-white/40">vyntrise — SEO scan</div>
            <div className="flex-1" />
          </div>

          <div
            ref={termRef}
            className="relative max-h-[380px] overflow-y-auto px-5 pb-6 pt-5 font-mono text-[12.5px] leading-[1.7] text-slate-200 max-[640px]:max-h-[300px] max-[640px]:text-[11.5px]"
          >
            {TERM_LINES.slice(0, visibleCount).map((line, i) => {
              if (line.text === '') return <div key={i} className="h-2.5" />;
              if (line.type === 'bar') {
                const label = line.text.split(/\d+%/)[0];
                const pctStr = line.text.match(/\d+%/)?.[0] ?? '';
                return (
                  <div key={i} className="flex h-[22px] items-center gap-2">
                    <span className="w-40 whitespace-pre text-xs text-white/55 max-[640px]:w-[120px]">{label}</span>
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/6">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: line.barColor }}
                        initial={{ width: 0 }}
                        animate={{ width: `${line.barPct}%` }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                    <span className="w-9 text-right text-xs font-bold" style={{ color: line.barColor }}>{pctStr}</span>
                  </div>
                );
              }
              return (
                <motion.div
                  key={i}
                  className={`whitespace-pre ${TERM_TEXT_CLASS[line.type]}`}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {line.text}
                </motion.div>
              );
            })}
            {visibleCount < TERM_LINES.length && <span className="animate-blink text-blue-400">▋</span>}
            {visibleCount >= TERM_LINES.length && (
              <div className="font-semibold text-slate-200">$ <span className="animate-blink text-blue-400">▋</span></div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
