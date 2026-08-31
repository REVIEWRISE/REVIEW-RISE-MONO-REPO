'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { Globe, ArrowRight, TrendingUp, Sparkles } from 'lucide-react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

const MOCK_SCORE = 94;
const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.09 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function Hero() {
  const t = useTranslations('landing');
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [focused, setFocused] = useState(false);
  const [terminalStep, setTerminalStep] = useState(0);
  const [spinnerFrame, setSpinnerFrame] = useState(0);

  /* 3-D tilt */
  const cardRef = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [4, -4]), { stiffness: 150, damping: 30 });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-4, 4]), { stiffness: 150, damping: 30 });
  const onCardMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = cardRef.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  const terminalUrl = useMemo(() => {
    const raw = url.trim();
    if (!raw) return 'https://example.com';
    if (/^https?:\/\//i.test(raw)) return raw.replace(/\/+$/, '');
    return `https://${raw.replace(/\/+$/, '')}`;
  }, [url]);

  const terminalSteps = useMemo(() => {
    return [
      { kind: 'cmd' as const, text: `$ vyntrise agent run ${terminalUrl}` },
      { kind: 'spin' as const, text: t('hero.cardScan1') },
      { kind: 'ok' as const, text: t('hero.cardScan2') },
      { kind: 'ok' as const, text: t('hero.cardScan3') },
      { kind: 'dim' as const, text: '────────────────────────────────' },
      { kind: 'ok' as const, text: `${t('hero.healthScoreLabel')}: ${t('hero.cardVerdict')} (${MOCK_SCORE}/100)` },
    ];
  }, [t, terminalUrl]);

  useEffect(() => {
    setTerminalStep(0);
  }, [terminalUrl]);

  useEffect(() => {
    const spinner = setInterval(() => {
      setSpinnerFrame((prev) => (prev + 1) % SPINNER_FRAMES.length);
    }, 90);

    const stepper = setInterval(() => {
      setTerminalStep((prev) => {
        const next = prev + 1;
        if (next > terminalSteps.length + 5) return 0;
        return next;
      });
    }, 700);

    return () => {
      clearInterval(spinner);
      clearInterval(stepper);
    };
  }, [terminalSteps.length]);

  const handleAnalyze = () => {
    if (!url.trim()) return;
    let u = url.trim();
    if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
    u = u.replace(/\/+$/, '');
    router.push(`/results?url=${encodeURIComponent(u)}`);
  };

  return (
    <section className="relative min-h-screen overflow-hidden pb-20 pt-24 max-[640px]:min-h-0 max-[640px]:pb-14 max-[640px]:pt-[90px]">
      <div className="bg-grid-fade absolute inset-0 z-0" />
      <div className="animate-drift absolute -left-52 -top-52 z-0 size-[800px] rounded-full bg-brand-blue/[0.13] blur-[100px] max-[640px]:hidden" />
      <div className="animate-drift absolute -right-52 -top-40 z-0 size-[700px] rounded-full bg-brand-violet/[0.09] blur-[100px] [animation-direction:reverse] max-[640px]:hidden" />
      <div className="animate-drift absolute bottom-[-100px] left-[30%] z-0 size-[600px] rounded-full bg-brand-cyan/[0.06] blur-[100px] max-[640px]:hidden" />

      <div className="relative z-[1] mx-auto grid max-w-[1240px] items-center gap-20 px-12 max-[1100px]:grid-cols-1 max-[1100px]:gap-[60px] max-[1100px]:px-8 min-[1101px]:grid-cols-2 max-[640px]:px-5">
        {/* ── Left: copy ────────────────────────── */}
        <motion.div className="flex flex-col items-start max-[1100px]:items-center max-[1100px]:text-center" variants={stagger} initial="hidden" animate="visible">
          <motion.div
            variants={fadeUp}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-violet/20 bg-brand-violet/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-brand-violet"
          >
            <Sparkles size={12} />
            {t('hero.badge')}
          </motion.div>

          <motion.h1
            className="mb-[18px] flex flex-col font-display text-[clamp(44px,5vw,72px)] font-extrabold leading-[1.02] tracking-[-0.025em]"
            variants={fadeUp}
          >
            <span className="text-foreground">{t('hero.titleLine1')}</span>
            <span className="gradient-text">{t('hero.titleLine2')}</span>
          </motion.h1>

          <motion.p className="mb-[26px] max-w-[520px] text-base leading-[1.7] text-muted-foreground" variants={fadeUp}>
            {t('hero.description')}
          </motion.p>

          <motion.div className="w-full max-w-[540px]" variants={fadeUp} id="hero-input">
            <div
              className={`mb-2.5 flex items-center rounded-xl border py-1.5 pl-3.5 pr-1.5 backdrop-blur-md transition-all ${
                focused
                  ? 'border-primary/60 shadow-[0_0_0_4px_rgba(99, 102, 241,0.12),0_10px_36px_rgba(0,0,0,0.35)]'
                  : 'border-border shadow-[0_10px_36px_rgba(0,0,0,0.25)]'
              } bg-card/80`}
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
                className="min-w-0 flex-1 bg-transparent py-3 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <button
                onClick={handleAnalyze}
                className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-[10px] bg-primary px-5 py-3 font-sans text-sm font-semibold text-white shadow-[0_10px_28px_rgba(99, 102, 241,0.25)] transition hover:-translate-y-px hover:bg-primary/90 hover:shadow-[0_14px_34px_rgba(99, 102, 241,0.32)]"
              >
                {t('hero.analyzeButton')}
                <ArrowRight size={15} />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">{t('hero.featuresText')}</p>
          </motion.div>
        </motion.div>

        {/* ── Right: agent console card ────────────────── */}
        <motion.div
          ref={cardRef}
          className="relative mx-auto w-full max-w-[480px] cursor-default overflow-hidden rounded-[22px] bg-gradient-to-b from-[#101a2e] to-[#0a1122] text-white [color-scheme:dark] shadow-[0_48px_100px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.04),0_0_90px_rgba(79,70,229,0.1)]"
          initial={{ y: 28, scale: 0.985 }}
          animate={{ y: 0, scale: 1 }}
          transition={{ duration: 0.85, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={{ rotateX, rotateY, transformPerspective: 1200 }}
          onMouseMove={onCardMove}
          onMouseLeave={() => { mx.set(0); my.set(0); }}
        >
          <div className="absolute -top-3.5 right-3.5 z-[2] inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-white/8 bg-[#0a1122]/70 px-2.5 py-2 text-xs font-semibold tracking-[-0.01em] text-white/90 shadow-[0_18px_50px_rgba(0,0,0,0.55)] backdrop-blur-md">
            <TrendingUp size={14} />
            <span>{t('hero.trafficBadge')}</span>
            <span className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.18)]" />
            <span>{t('hero.trafficLive')}</span>
          </div>

          <div className="pointer-events-none absolute -top-20 left-1/2 h-[200px] w-[360px] -translate-x-1/2 bg-[radial-gradient(ellipse,rgba(99, 102, 241,0.15)_0%,transparent_70%)] opacity-65" />

          <div className="relative z-[1] flex items-center gap-3 border-b border-white/5 bg-white/[0.02] px-4 py-3">
            <div className="flex gap-1.5">
              <span className="size-2.5 rounded-full bg-red-500" />
              <span className="size-2.5 rounded-full bg-amber-400" />
              <span className="size-2.5 rounded-full bg-emerald-500" />
            </div>
            <div className="font-mono text-[11px] font-medium text-white/40">{t('hero.consoleTitle')}</div>
            <div className="flex-1" />
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-violet/60" />
              <span className="relative inline-flex size-1.5 rounded-full bg-brand-violet" />
            </span>
          </div>

          <div className="relative z-[1] flex flex-col gap-3.5 p-[18px] pb-3.5 font-sans text-white/90">
            <div className="grid grid-cols-[110px_1fr] items-center gap-4 rounded-[18px] bg-black/20 p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] max-[640px]:grid-cols-1 max-[640px]:justify-items-center max-[640px]:text-center">
              <div className="relative grid size-[88px] place-items-center">
                <svg width="88" height="88" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="heroGaugeGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#4f46e5" />
                      <stop offset="100%" stopColor="#22c55e" />
                    </linearGradient>
                  </defs>
                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="url(#heroGaugeGrad)"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={(1 - MOCK_SCORE / 100) * 2 * Math.PI * 40}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute inset-0 grid place-items-center font-display text-[26px] font-extrabold text-white/95">{MOCK_SCORE}</div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <div className="text-[10px] font-bold tracking-[0.12em] text-white/40">{t('hero.healthScoreLabel')}</div>
                  <div className="mt-1.5 font-display text-lg font-extrabold text-blue-400">{t('hero.cardVerdict')}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold tracking-[0.12em] text-white/40">{t('hero.cardSamples')}</div>
                  <div className="mt-1.5 font-display text-lg font-extrabold">3</div>
                </div>
              </div>
            </div>

            <div className="rounded-[18px] bg-black/20 p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]">
              <div className="mb-2.5 text-[10px] font-extrabold tracking-[0.12em] text-white/40">{t('hero.liveActivity')}</div>
              <div className="h-[154px] overflow-hidden rounded-2xl bg-black/[0.18] p-3 pb-2.5 font-mono text-xs leading-[1.65] text-white/90 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
                {terminalSteps.slice(0, Math.min(terminalStep, terminalSteps.length)).map((line, idx) => {
                  const prefix =
                    line.kind === 'cmd' ? '' :
                    line.kind === 'ok' ? '✓' :
                    line.kind === 'spin' ? SPINNER_FRAMES[spinnerFrame] :
                    '';
                  const textColor =
                    line.kind === 'cmd' ? 'font-bold text-slate-200' :
                    line.kind === 'dim' ? 'text-white/25' :
                    'text-white/80';
                  const prefixColor = line.kind === 'ok' ? 'text-emerald-500' : line.kind === 'spin' ? 'text-blue-400' : 'text-white/55';

                  return (
                    <div key={`${line.kind}-${idx}`} className="flex items-start gap-2.5 whitespace-pre-wrap break-words py-0.5">
                      {prefix ? <span className={`inline-flex w-4 shrink-0 justify-center ${prefixColor}`}>{prefix}</span> : null}
                      <span className={`flex-1 ${textColor}`}>{line.text}</span>
                    </div>
                  );
                })}

                <div className="mt-1.5 flex items-center gap-2.5 border-t border-white/5 pt-1.5">
                  <span className="inline-flex w-4 justify-center text-slate-200/85">$</span>
                  <span className="animate-blink text-blue-400">▋</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 rounded-[18px] bg-black/20 p-2.5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]">
              <div className="grid justify-items-center gap-1 py-2">
                <div className="font-display text-lg font-extrabold text-white/90">1.2k</div>
                <div className="text-[10px] font-extrabold tracking-[0.12em] text-white/35">{t('hero.statsCrawled')}</div>
              </div>
              <div className="grid justify-items-center gap-1 py-2">
                <div className="font-display text-lg font-extrabold text-white/90">12</div>
                <div className="text-[10px] font-extrabold tracking-[0.12em] text-white/35">{t('hero.statsIssues')}</div>
              </div>
              <div className="grid justify-items-center gap-1 py-2">
                <div className="font-display text-lg font-extrabold text-emerald-500">+4</div>
                <div className="text-[10px] font-extrabold tracking-[0.12em] text-white/35">{t('hero.statsScoreLift')}</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
