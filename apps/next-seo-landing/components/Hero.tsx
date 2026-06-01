'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { Globe, ArrowRight, TrendingUp } from 'lucide-react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

const MOCK_SCORE = 94;
const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.09 } } };
const fadeUp = {
  hidden: { opacity: 1, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as any } },
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
      { kind: 'cmd' as const, text: `$ vyntrise scan ${terminalUrl}` },
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
    <section className="hero" id="hero-top">
      <div className="bg-grid" />
      <div className="orb orb-blue" />
      <div className="orb orb-violet" />
      <div className="orb orb-cyan" />

      <div className="hero-body">
        {/* ── Left: copy ────────────────────────── */}
        <motion.div className="copy" variants={stagger} initial="hidden" animate="visible">
          <motion.h1 className="headline" variants={fadeUp}>
            <span className="line-plain">{t('hero.titleLine1')}</span>
            <span className="line-gradient">{t('hero.titleLine2')}</span>
          </motion.h1>

          <motion.p className="sub" variants={fadeUp}>
            {t('hero.description')}
          </motion.p>

          <motion.div className="input-wrap" variants={fadeUp} id="hero-input">
            <div className={`input-shell ${focused ? 'focused' : ''}`}>
              <Globe size={18} className="globe-icon" />
              <input
                type="url"
                placeholder={t('hero.inputPlaceholder')}
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
              />
              <button className="go-btn" onClick={handleAnalyze}>
                {t('hero.analyzeButton')}
                <ArrowRight size={15} />
              </button>
            </div>
            <p className="hint">{t('hero.featuresText')}</p>
          </motion.div>
        </motion.div>

        {/* ── Right: terminal card ────────────────── */}
        <motion.div
          ref={cardRef}
          className="term-card"
          initial={{ y: 28, scale: 0.985 }}
          animate={{ y: 0, scale: 1 }}
          transition={{ duration: 0.85, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={{
            rotateX,
            rotateY,
            transformPerspective: 1200,
            colorScheme: 'dark',
            background: 'linear-gradient(180deg, #101a2e 0%, #0a1122 100%)',
            backgroundColor: '#0a1122',
          }}
          onMouseMove={onCardMove}
          onMouseLeave={() => { mx.set(0); my.set(0); }}
        >
          <div className="console-float-badge">
            <TrendingUp size={14} />
            <span>{t('hero.trafficBadge')}</span>
            <span className="badge-dot" />
            <span>{t('hero.trafficLive')}</span>
          </div>

          <div className="term-glow" />

          <div className="term-chrome">
            <div className="chrome-dots">
              <span className="cd cd-r" />
              <span className="cd cd-y" />
              <span className="cd cd-g" />
            </div>
            <div className="chrome-title">{t('hero.consoleTitle')}</div>
            <div className="chrome-spacer" />
          </div>

          <div className="console-body">
            <div className="console-top">
              <div className="gauge">
                <svg width="88" height="88" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
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
                    stroke="url(#g1)"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={(1 - MOCK_SCORE / 100) * 2 * Math.PI * 40}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="gauge-center">
                  <div className="gauge-score">{MOCK_SCORE}</div>
                </div>
              </div>

              <div className="console-metrics">
                <div className="metric">
                  <div className="metric-label">{t('hero.healthScoreLabel')}</div>
                  <div className="metric-value metric-value-accent">{t('hero.cardVerdict')}</div>
                </div>
                <div className="metric">
                  <div className="metric-label">{t('hero.cardSamples')}</div>
                  <div className="metric-value">3</div>
                </div>
              </div>
            </div>

            <div className="console-section">
              <div className="section-title">{t('hero.liveActivity')}</div>
              <div className="terminal">
                {terminalSteps.slice(0, Math.min(terminalStep, terminalSteps.length)).map((line, idx) => {
                  const prefix =
                    line.kind === 'cmd' ? '' :
                    line.kind === 'ok' ? '✓' :
                    line.kind === 'spin' ? SPINNER_FRAMES[spinnerFrame] :
                    '';

                  return (
                    <div key={`${line.kind}-${idx}`} className={`term-line term-${line.kind}`}>
                      {prefix ? <span className="term-prefix">{prefix}</span> : null}
                      <span className="term-text">{line.text}</span>
                    </div>
                  );
                })}

                <div className="term-prompt">
                  <span className="term-prefix">$</span>
                  <span className="term-cursor">▋</span>
                </div>
              </div>
            </div>

            <div className="console-bottom">
              <div className="stat">
                <div className="stat-value">1.2k</div>
                <div className="stat-label">{t('hero.statsCrawled')}</div>
              </div>
              <div className="stat">
                <div className="stat-value">12</div>
                <div className="stat-label">{t('hero.statsIssues')}</div>
              </div>
              <div className="stat stat-positive">
                <div className="stat-value">+4</div>
                <div className="stat-label">{t('hero.statsScoreLift')}</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        /* ── Hero layout ─────────────────────── */
        .hero { position:relative;min-height:100vh;display:flex;align-items:center;overflow:hidden;padding:100px 0 80px; }
        .bg-grid { position:absolute;inset:0;z-index:0;background-image:radial-gradient(rgba(255,255,255,0.04) 1px,transparent 1px);background-size:36px 36px;mask-image:radial-gradient(ellipse 90% 80% at 50% 40%,black 20%,transparent 100%);-webkit-mask-image:radial-gradient(ellipse 90% 80% at 50% 40%,black 20%,transparent 100%); }
        :global([data-theme='light']) .bg-grid { background-image:radial-gradient(rgba(15,23,42,0.05) 1px,transparent 1px); }
        .orb { position:absolute;border-radius:50%;filter:blur(100px);pointer-events:none;z-index:0; }
        .orb-blue   { width:800px;height:600px;background:rgba(59,130,246,0.13);top:-200px;left:-200px;animation:drift 12s ease-in-out infinite; }
        .orb-violet { width:700px;height:500px;background:rgba(139,92,246,0.09);top:-150px;right:-200px;animation:drift 15s ease-in-out infinite reverse; }
        .orb-cyan   { width:600px;height:400px;background:rgba(6,182,212,0.06);bottom:-100px;left:30%;animation:drift 18s ease-in-out infinite; }
        @keyframes drift { 0%,100%{transform:translate(0,0);}33%{transform:translate(24px,-24px);}66%{transform:translate(-18px,18px);} }
        .hero-body { position:relative;z-index:1;max-width:1240px;margin:0 auto;padding:0 48px;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center;width:100%; }

        /* ── Left copy ──────────────────────── */
        .copy { display:flex;flex-direction:column;align-items:flex-start; }
        .headline { font-family:'Space Grotesk',sans-serif;font-size:clamp(44px,5vw,72px);font-weight:800;line-height:1.02;letter-spacing:-0.04em;margin-bottom:18px;display:flex;flex-direction:column;gap:0; }
        .line-plain { color:var(--text-primary); }
        .line-gradient { color:var(--text-primary); }
        .sub { font-size:16px;color:var(--text-secondary);line-height:1.7;margin-bottom:26px;max-width:520px; }
        .input-wrap { width:100%;max-width:540px; }
        .input-shell { display:flex;align-items:center;background:rgba(255,255,255,0.92);border:1px solid rgba(15,23,42,0.12);border-radius:12px;padding:6px 6px 6px 14px;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);transition:border-color 0.25s ease,box-shadow 0.25s ease;margin-bottom:10px;box-shadow:0 8px 28px rgba(15,23,42,0.08); }
        .input-shell.focused { border-color:rgba(79,70,229,0.5);box-shadow:0 0 0 4px rgba(79,70,229,0.12),0 10px 34px rgba(15,23,42,0.10); }
        :global([data-theme='dark']) .input-shell { background:rgba(11,16,32,0.72);border-color:rgba(255,255,255,0.10);box-shadow:0 10px 36px rgba(0,0,0,0.35); }
        :global([data-theme='dark']) .input-shell.focused { border-color:rgba(79,70,229,0.6);box-shadow:0 0 0 4px rgba(79,70,229,0.12),0 10px 36px rgba(0,0,0,0.45); }
        :global(.globe-icon) { color:#4f46e5;flex-shrink:0;margin-right:10px; }
        input { flex:1;padding:13px 12px 13px 0;background:transparent;border:none;color:var(--text-primary);font-family:'Inter',sans-serif;font-size:14px;outline:none;min-width:0; }
        input::placeholder { color:var(--text-muted); }
        .go-btn { display:flex;align-items:center;gap:8px;background:#4f46e5;color:#fff;border:none;padding:13px 20px;border-radius:10px;font-family:'Inter',sans-serif;font-weight:600;font-size:14px;cursor:pointer;white-space:nowrap;flex-shrink:0;transition:transform 0.2s ease,box-shadow 0.2s ease,background 0.2s ease;box-shadow:0 10px 28px rgba(79,70,229,0.25); }
        .go-btn:hover { transform:translateY(-1px);background:#4338ca;box-shadow:0 14px 34px rgba(79,70,229,0.32); }
        .hint { font-size:12px;color:var(--text-muted); }

        /* ── Terminal card (always dark) ─────── */
        .term-card {
          position: relative;
          width: 100%;
          max-width: 480px;
          border-radius: 22px;
          overflow: hidden;
          cursor: default;
          will-change: transform;
          color-scheme: dark;
          background: linear-gradient(180deg, #101a2e 0%, #0a1122 100%) !important;
          background-color: #0a1122 !important;
          box-shadow:
            0 48px 100px rgba(0,0,0,0.55),
            0 0 0 1px rgba(255,255,255,0.04),
            0 0 90px rgba(79,70,229,0.10);
        }
        :global([data-theme='light']) .term-card {
          color-scheme: dark;
          background: linear-gradient(180deg, #101a2e 0%, #0a1122 100%) !important;
          background-color: #0a1122 !important;
          box-shadow:
            0 48px 100px rgba(0,0,0,0.55),
            0 0 0 1px rgba(255,255,255,0.04),
            0 0 90px rgba(79,70,229,0.10);
        }
        .term-card::before {
          content: '';
          position: absolute;
          inset: 0;
          padding: 1px;
          border-radius: 22px;
          background: linear-gradient(
            135deg,
            rgba(255,255,255,0.14),
            rgba(255,255,255,0.03) 35%,
            rgba(79,70,229,0.18) 70%,
            rgba(255,255,255,0.06)
          );
          -webkit-mask:
            linear-gradient(#000 0 0) content-box,
            linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
          opacity: 0.9;
        }
        .term-card::after {
          content: '';
          position: absolute;
          inset: 1px;
          border-radius: 21px;
          background: radial-gradient(1200px 500px at 20% 0%, rgba(79,70,229,0.16), transparent 55%),
            radial-gradient(900px 420px at 90% 10%, rgba(59,130,246,0.14), transparent 50%),
            radial-gradient(700px 420px at 60% 100%, rgba(34,197,94,0.10), transparent 55%);
          pointer-events: none;
          opacity: 0.55;
        }
        .console-float-badge {
          position: absolute;
          top: -14px;
          right: 14px;
          z-index: 2;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          border-radius: 999px;
          background: rgba(10,17,34,0.72);
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: 0 18px 50px rgba(0,0,0,0.55);
          color: rgba(255,255,255,0.9);
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: -0.01em;
          white-space: nowrap;
        }
        .badge-dot { width:6px;height:6px;border-radius:50%; background:#22c55e; box-shadow:0 0 0 3px rgba(34,197,94,0.18); }
        .term-glow {
          position: absolute;
          top: -80px;
          left: 50%;
          transform: translateX(-50%);
          width: 360px;
          height: 200px;
          background: radial-gradient(ellipse, rgba(59,130,246,0.15) 0%, transparent 70%);
          pointer-events: none;
          opacity: 0.65;
        }

        /* Chrome bar */
        .term-chrome {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: rgba(255,255,255,0.02);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .chrome-dots { display:flex;gap:6px; }
        .cd { width:10px;height:10px;border-radius:50%; }
        .cd-r { background:#ef4444; }
        .cd-y { background:#FBBF24; }
        .cd-g { background:#10b981; }
        .chrome-title {
          font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 500;
          color: rgba(255,255,255,0.4);
          letter-spacing: 0.02em;
        }
        .chrome-spacer { flex:1; }

        .console-body {
          padding: 18px 18px 14px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          color: rgba(255,255,255,0.92);
          font-family: 'Inter', sans-serif;
          position: relative;
          z-index: 1;
        }
        .console-top {
          display: grid;
          grid-template-columns: 110px 1fr;
          gap: 16px;
          align-items: center;
          padding: 12px;
          border-radius: 18px;
          background: rgba(0,0,0,0.20);
          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.05);
        }
        .gauge { position: relative; width: 88px; height: 88px; display: grid; place-items: center; }
        .gauge-center { position: absolute; inset: 0; display: grid; place-items: center; }
        .gauge-score { font-family: 'Space Grotesk', sans-serif; font-size: 26px; font-weight: 800; color: rgba(255,255,255,0.95); }
        .console-metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .metric-label { font-size: 10px; letter-spacing: 0.12em; color: rgba(255,255,255,0.42); font-weight: 700; }
        .metric-value { margin-top: 6px; font-family: 'Space Grotesk', sans-serif; font-size: 18px; font-weight: 800; }
        .metric-value-accent { color: #60a5fa; }

        .console-section { padding: 12px; border-radius: 18px; background: rgba(0,0,0,0.20); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.05); }
        .section-title { font-size: 10px; letter-spacing: 0.12em; color: rgba(255,255,255,0.42); font-weight: 800; margin-bottom: 10px; }
        .terminal {
          border-radius: 16px;
          background: rgba(0,0,0,0.18);
          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.04);
          padding: 12px 12px 10px;
          height: 154px;
          overflow: hidden;
          font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace;
          font-size: 12px;
          line-height: 1.65;
          color: rgba(255,255,255,0.9);
        }
        .term-line {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 2px 0;
          white-space: pre-wrap;
          word-break: break-word;
        }
        .term-prefix {
          width: 16px;
          flex: 0 0 16px;
          display: inline-flex;
          justify-content: center;
          color: rgba(255,255,255,0.55);
        }
        .term-cmd .term-text { color: rgba(226,232,240,0.92); font-weight: 700; }
        .term-ok .term-prefix { color: #22c55e; }
        .term-spin .term-prefix { color: #60a5fa; }
        .term-dim .term-text { color: rgba(255,255,255,0.24); }
        .term-text { flex: 1; color: rgba(255,255,255,0.82); }
        .term-prompt {
          display: flex;
          align-items: center;
          gap: 10px;
          padding-top: 6px;
          margin-top: 6px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .term-prompt .term-prefix { width: 16px; justify-content: center; color: rgba(226,232,240,0.85); }
        .term-cursor { color: #60a5fa; animation: blink 1s step-end infinite; }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }

        .console-bottom {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 18px;
          background: rgba(0,0,0,0.20);
          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.05);
        }
        .stat { display: grid; gap: 4px; justify-items: center; padding: 8px 0; }
        .stat-value { font-family: 'Space Grotesk', sans-serif; font-size: 18px; font-weight: 800; color: rgba(255,255,255,0.92); }
        .stat-label { font-size: 10px; letter-spacing: 0.12em; font-weight: 800; color: rgba(255,255,255,0.38); }
        .stat-positive .stat-value { color: #22c55e; }

        /* ── Responsive ─────────────────────── */
        @media (max-width:1100px) {
          .hero-body { grid-template-columns:1fr;gap:60px;padding:0 32px; }
          .copy { align-items:center;text-align:center; }
          .sub { max-width:560px; }
          .input-wrap { max-width:100%; }
          .term-card { max-width:520px;margin:0 auto; }
        }
        @media (max-width:640px) {
          .hero { padding:90px 0 60px;min-height:auto; }
          .hero-body { padding:0 20px;gap:48px; }
          .headline { font-size:38px; }
          .sub { font-size:16px; }
          .input-shell { flex-wrap:wrap;padding:8px;border-radius:14px; }
          .go-btn { width:100%;justify-content:center;margin-top:4px; }
          .orb { display:none; }
          .console-top { grid-template-columns: 1fr; justify-items: center; text-align: center; }
          .console-metrics { grid-template-columns: 1fr 1fr; width: 100%; }
        }
      `}</style>
    </section>
  );
}
