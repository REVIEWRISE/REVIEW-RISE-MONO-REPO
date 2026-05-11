'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Globe, ArrowRight, Sparkles, TrendingUp, Shield, CheckCircle2, AlertTriangle, Zap } from 'lucide-react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { analyzeSEO, type SEOAnalysisResult } from '@/lib/api';
import ResultsDisplay from './ResultsDisplay';
import AnalysisLoader from './AnalysisLoader';

const BARS = [
  { label: 'Technical SEO', pct: 62, color: '#FBBF24' },
  { label: 'Content Quality', pct: 81, color: '#10b981' },
  { label: 'On-Page SEO', pct: 44, color: '#ef4444' },
];
const ISSUES = [
  { text: 'Missing meta descriptions (3)', sev: 'error' },
  { text: 'Images missing alt text (12)', sev: 'error' },
  { text: 'Mobile speed score: 58', sev: 'warn' },
  { text: 'HTTPS configured correctly', sev: 'ok' },
];

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.09 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as any } },
};

export default function Hero() {
  const t = useTranslations('landing');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SEOAnalysisResult | null>(null);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);

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

  const handleAnalyze = async () => {
    if (!url) return;
    let u = url.trim();
    if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
    u = u.replace(/\/+$/, '');
    setLoading(true); setError(''); setResult(null);
    try { setResult(await analyzeSEO(u)); }
    catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const showDefault = !loading && !result;

  return (
    <>
      <section className="hero">
        <div className="bg-grid" />
        <div className="orb orb-blue" />
        <div className="orb orb-violet" />
        <div className="orb orb-cyan" />

        {loading && (
          <div className="loader-wrap">
            <AnalysisLoader />
          </div>
        )}

        {showDefault && (
          <div className="hero-body">
            <motion.div className="copy" variants={stagger} initial="hidden" animate="visible">
              <motion.div className="badge" variants={fadeUp}>
                <Sparkles size={11} />
                {t('hero.badge')}
              </motion.div>

              <motion.h1 className="headline" variants={fadeUp}>
                <span className="line-plain">{t('hero.titleLine1')}</span>
                <span className="line-gradient">{t('hero.titleLine2')}</span>
              </motion.h1>

              <motion.p className="sub" variants={fadeUp}>
                {t('hero.description')}
              </motion.p>

              <motion.div className="input-wrap" variants={fadeUp}>
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

              {error && (
                <motion.p className="err" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  {error}
                </motion.p>
              )}

              <motion.div className="proof" variants={fadeUp}>
                <div className="avatars">
                  {['#3B82F6', '#8B5CF6', '#06B6D4', '#10b981'].map((c, i) => (
                    <div key={i} className="av" style={{ background: c, marginLeft: i ? '-8px' : 0 }} />
                  ))}
                </div>
                <span className="proof-text">
                  <strong>{'50,000+'}</strong>{' sites analyzed this month'}
                </span>
              </motion.div>
            </motion.div>

            <motion.div
              ref={cardRef}
              className="card"
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.85, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={{ rotateX, rotateY, transformPerspective: 1200 }}
              onMouseMove={onCardMove}
              onMouseLeave={() => { mx.set(0); my.set(0); }}
            >
              <div className="card-glow" />
              <div className="card-head">
                <div className="url-row">
                  <span className="dot-green" />
                  <span className="card-url">{'acme-store.com'}</span>
                </div>
                <span className="live-pill">{'Live scan'}</span>
              </div>

              <div className="score-row">
                <div className="ring-wrap">
                  <svg width="88" height="88" viewBox="0 0 88 88">
                    <circle cx="44" cy="44" r="36" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
                    <motion.circle
                      cx="44" cy="44" r="36" fill="none"
                      stroke="url(#hg)" strokeWidth="7" strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 36}`}
                      initial={{ strokeDashoffset: `${2 * Math.PI * 36}` }}
                      animate={{ strokeDashoffset: `${2 * Math.PI * 36 * 0.32}` }}
                      transition={{ duration: 1.4, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
                      transform="rotate(-90 44 44)"
                    />
                    <defs>
                      <linearGradient id="hg" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="100%" stopColor="#8B5CF6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="ring-center">
                    <span className="ring-num">{'68'}</span>
                    <span className="ring-den">{'/100'}</span>
                  </div>
                </div>
                <div className="score-meta">
                  <p className="score-lbl">{'SEO Health Score'}</p>
                  <div className="chips">
                    <span className="chip chip-warn">{'14 issues'}</span>
                    <span className="chip chip-err">{'3 critical'}</span>
                  </div>
                </div>
              </div>

              <div className="bars">
                {BARS.map(({ label, pct, color }) => (
                  <div key={label} className="bar-row">
                    <div className="bar-head">
                      <span className="bar-lbl">{label}</span>
                      <span className="bar-pct" style={{ color }}>{pct}{'%'}</span>
                    </div>
                    <div className="bar-track">
                      <motion.div
                        className="bar-fill"
                        style={{ background: color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.9, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="issues">
                {ISSUES.map(({ text, sev }, i) => (
                  <motion.div
                    key={i}
                    className={`issue issue-${sev}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.1 + i * 0.07 }}
                  >
                    {sev === 'ok' ? <CheckCircle2 size={12} /> : sev === 'warn' ? <Zap size={12} /> : <AlertTriangle size={12} />}
                    <span>{text}</span>
                  </motion.div>
                ))}
              </div>

              <motion.div className="fb fb-top" animate={{ y: [0, -7, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
                <TrendingUp size={12} /><span>{'+23% CTR potential'}</span>
              </motion.div>
              <motion.div className="fb fb-bot" animate={{ y: [0, 7, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}>
                <Shield size={12} /><span>{'HTTPS · Secure'}</span>
              </motion.div>
            </motion.div>
          </div>
        )}

        <style jsx>{`
          .hero { position:relative;min-height:100vh;display:flex;align-items:center;overflow:hidden;padding:100px 0 80px; }
          .bg-grid { position:absolute;inset:0;z-index:0;background-image:radial-gradient(rgba(255,255,255,0.04) 1px,transparent 1px);background-size:36px 36px;mask-image:radial-gradient(ellipse 90% 80% at 50% 40%,black 20%,transparent 100%);-webkit-mask-image:radial-gradient(ellipse 90% 80% at 50% 40%,black 20%,transparent 100%); }
          :global([data-theme='light']) .bg-grid { background-image:radial-gradient(rgba(15,23,42,0.05) 1px,transparent 1px); }
          .orb { position:absolute;border-radius:50%;filter:blur(100px);pointer-events:none;z-index:0; }
          .orb-blue   { width:800px;height:600px;background:rgba(59,130,246,0.13);top:-200px;left:-200px;animation:drift 12s ease-in-out infinite; }
          .orb-violet { width:700px;height:500px;background:rgba(139,92,246,0.09);top:-150px;right:-200px;animation:drift 15s ease-in-out infinite reverse; }
          .orb-cyan   { width:600px;height:400px;background:rgba(6,182,212,0.06);bottom:-100px;left:30%;animation:drift 18s ease-in-out infinite; }
          @keyframes drift { 0%,100%{transform:translate(0,0);}33%{transform:translate(24px,-24px);}66%{transform:translate(-18px,18px);} }
          .loader-wrap { position:relative;z-index:1;width:100%;display:flex;justify-content:center;align-items:center;padding:0 24px; }
          .hero-body { position:relative;z-index:1;max-width:1240px;margin:0 auto;padding:0 48px;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center;width:100%; }
          .copy { display:flex;flex-direction:column;align-items:flex-start; }
          .badge { display:inline-flex;align-items:center;gap:7px;background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.22);border-radius:100px;padding:6px 16px;font-size:11px;font-weight:700;color:#60A5FA;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:28px; }
          .headline { font-family:'Space Grotesk',sans-serif;font-size:clamp(40px,4.8vw,66px);font-weight:700;line-height:1.0;letter-spacing:-0.04em;margin-bottom:22px;display:flex;flex-direction:column;gap:4px; }
          .line-plain { color:var(--text-primary); }
          .line-gradient { background:linear-gradient(135deg,#3B82F6 0%,#8B5CF6 55%,#06B6D4 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text; }
          .sub { font-size:17px;color:var(--text-secondary);line-height:1.75;margin-bottom:40px;max-width:460px; }
          .input-wrap { width:100%;max-width:540px; }
          .input-shell { display:flex;align-items:center;background:rgba(11,16,32,0.7);border:1.5px solid rgba(255,255,255,0.08);border-radius:16px;padding:6px 6px 6px 18px;backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);transition:border-color 0.25s ease,box-shadow 0.25s ease;margin-bottom:12px;box-shadow:0 4px 24px rgba(0,0,0,0.2); }
          .input-shell.focused { border-color:rgba(59,130,246,0.5);box-shadow:0 0 0 4px rgba(59,130,246,0.1),0 8px 40px rgba(0,0,0,0.3); }
          :global([data-theme='light']) .input-shell { background:rgba(255,255,255,0.92);border-color:rgba(15,23,42,0.1);box-shadow:0 4px 24px rgba(15,23,42,0.06); }
          :global([data-theme='light']) .input-shell.focused { border-color:rgba(59,130,246,0.45);box-shadow:0 0 0 4px rgba(59,130,246,0.08); }
          :global(.globe-icon) { color:#3B82F6;flex-shrink:0;margin-right:10px; }
          input { flex:1;padding:13px 12px 13px 0;background:transparent;border:none;color:var(--text-primary);font-family:'Inter',sans-serif;font-size:15px;outline:none;min-width:0; }
          input::placeholder { color:var(--text-muted); }
          .go-btn { display:flex;align-items:center;gap:8px;background:linear-gradient(135deg,#3B82F6,#8B5CF6);color:#fff;border:none;padding:13px 24px;border-radius:12px;font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:14px;letter-spacing:-0.01em;cursor:pointer;white-space:nowrap;flex-shrink:0;transition:transform 0.2s ease,box-shadow 0.2s ease;box-shadow:0 4px 20px rgba(59,130,246,0.4);position:relative;overflow:hidden; }
          .go-btn::before { content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.18) 0%,transparent 60%);opacity:0;transition:opacity 0.2s ease; }
          .go-btn:hover { transform:translateY(-1px);box-shadow:0 6px 28px rgba(59,130,246,0.55); }
          .go-btn:hover::before { opacity:1; }
          .hint { font-size:12px;color:var(--text-muted);margin-bottom:36px; }
          .err { background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);color:#F87171;padding:11px 16px;border-radius:10px;margin-bottom:20px;font-size:14px;max-width:540px; }
          .proof { display:flex;align-items:center;gap:12px; }
          .avatars { display:flex; }
          .av { width:28px;height:28px;border-radius:50%;border:2px solid var(--bg-primary);flex-shrink:0; }
          .proof-text { font-size:13px;color:var(--text-muted); }
          .proof-text strong { color:var(--text-secondary);font-weight:600; }
          .card { position:relative;background:rgba(11,16,32,0.82);border:1px solid rgba(255,255,255,0.09);border-radius:24px;padding:28px;backdrop-filter:blur(28px);-webkit-backdrop-filter:blur(28px);box-shadow:0 48px 96px rgba(0,0,0,0.5),0 0 0 1px rgba(59,130,246,0.07);width:100%;max-width:420px;cursor:default;will-change:transform; }
          :global([data-theme='light']) .card { background:rgba(255,255,255,0.92);border-color:rgba(15,23,42,0.08);box-shadow:0 48px 96px rgba(15,23,42,0.12); }
          .card-glow { position:absolute;top:-80px;left:50%;transform:translateX(-50%);width:360px;height:220px;background:radial-gradient(ellipse,rgba(59,130,246,0.2) 0%,transparent 70%);pointer-events:none; }
          .card-head { display:flex;justify-content:space-between;align-items:center;margin-bottom:22px;padding-bottom:18px;border-bottom:1px solid rgba(255,255,255,0.06); }
          :global([data-theme='light']) .card-head { border-bottom-color:rgba(15,23,42,0.06); }
          .url-row { display:flex;align-items:center;gap:8px; }
          .dot-green { width:8px;height:8px;border-radius:50%;background:#10b981;box-shadow:0 0 8px rgba(16,185,129,0.6); }
          .card-url { font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:600;color:var(--text-primary);letter-spacing:-0.01em; }
          .live-pill { font-size:10px;font-weight:700;background:rgba(16,185,129,0.12);border:1px solid rgba(16,185,129,0.25);color:#10b981;padding:3px 10px;border-radius:100px;letter-spacing:0.04em;text-transform:uppercase; }
          .score-row { display:flex;align-items:center;gap:18px;margin-bottom:22px; }
          .ring-wrap { position:relative;width:88px;height:88px;flex-shrink:0; }
          .ring-center { position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:1px; }
          .ring-num { font-family:'Space Grotesk',sans-serif;font-size:26px;font-weight:700;letter-spacing:-0.04em;background:linear-gradient(135deg,#3B82F6,#8B5CF6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text; }
          .ring-den { font-size:11px;font-weight:600;color:var(--text-muted);align-self:flex-end;padding-bottom:3px; }
          .score-meta { flex:1; }
          .score-lbl { font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:var(--text-muted);margin-bottom:10px; }
          .chips { display:flex;gap:6px;flex-wrap:wrap; }
          .chip { font-size:11px;font-weight:700;padding:3px 10px;border-radius:100px;letter-spacing:0.02em; }
          .chip-warn { background:rgba(251,191,36,0.12);color:#FBBF24;border:1px solid rgba(251,191,36,0.2); }
          .chip-err  { background:rgba(239,68,68,0.12);color:#ef4444;border:1px solid rgba(239,68,68,0.2); }
          .bars { display:flex;flex-direction:column;gap:11px;margin-bottom:18px; }
          .bar-head { display:flex;justify-content:space-between;margin-bottom:5px; }
          .bar-lbl { font-size:12px;font-weight:500;color:var(--text-secondary); }
          .bar-pct { font-family:'Space Grotesk',sans-serif;font-size:12px;font-weight:700; }
          .bar-track { height:4px;background:rgba(255,255,255,0.06);border-radius:2px;overflow:hidden; }
          :global([data-theme='light']) .bar-track { background:rgba(15,23,42,0.08); }
          .bar-fill { height:100%;border-radius:2px; }
          .issues { display:flex;flex-direction:column;gap:6px; }
          .issue { display:flex;align-items:center;gap:8px;font-size:12px;font-weight:500;padding:7px 10px;border-radius:8px;border-left:2px solid transparent; }
          .issue-error { background:rgba(239,68,68,0.06);border-left-color:#ef4444;color:var(--text-secondary); }
          .issue-warn  { background:rgba(251,191,36,0.06);border-left-color:#FBBF24;color:var(--text-secondary); }
          .issue-ok    { background:rgba(16,185,129,0.06);border-left-color:#10b981;color:var(--text-secondary); }
          .issue-error :global(svg) { color:#ef4444;flex-shrink:0; }
          .issue-warn  :global(svg) { color:#FBBF24;flex-shrink:0; }
          .issue-ok    :global(svg) { color:#10b981;flex-shrink:0; }
          .fb { position:absolute;display:flex;align-items:center;gap:6px;background:rgba(11,16,32,0.92);border:1px solid rgba(255,255,255,0.1);border-radius:100px;padding:7px 16px;font-size:12px;font-weight:600;color:var(--text-secondary);backdrop-filter:blur(12px);white-space:nowrap;box-shadow:0 8px 24px rgba(0,0,0,0.3); }
          :global([data-theme='light']) .fb { background:rgba(255,255,255,0.96);border-color:rgba(15,23,42,0.1); }
          .fb :global(svg) { color:#3B82F6; }
          .fb-top { top:-18px;right:-18px; }
          .fb-bot { bottom:-18px;left:-18px; }
          @media (max-width:1100px) { .hero-body{grid-template-columns:1fr;gap:60px;padding:0 32px;} .copy{align-items:center;text-align:center;} .sub{max-width:560px;} .input-wrap{max-width:100%;} .card{max-width:480px;margin:0 auto;} }
          @media (max-width:640px) { .hero{padding:90px 0 60px;min-height:auto;} .hero-body{padding:0 20px;gap:48px;} .headline{font-size:36px;} .sub{font-size:16px;} .input-shell{flex-wrap:wrap;padding:8px;border-radius:14px;} .go-btn{width:100%;justify-content:center;margin-top:4px;} .orb{display:none;} .fb-top,.fb-bot{display:none;} }
        `}</style>
      </section>

      {result && (
        <motion.div
          id="results"
          style={{ scrollMarginTop: '20px' }}
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <ResultsDisplay result={result} />
        </motion.div>
      )}
    </>
  );
}
