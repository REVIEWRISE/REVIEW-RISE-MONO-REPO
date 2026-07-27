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
  { text: '$ vyntrise scan https://your-site.com', type: 'cmd', delay: 0 },
  { text: '', type: 'dim', delay: 400 },
  { text: '✓ DNS resolved  (203.0.113.42)', type: 'success', delay: 800 },
  { text: '✓ HTTPS valid    TLS 1.3', type: 'success', delay: 1200 },
  { text: '', type: 'dim', delay: 1500 },
  { text: '▸ Running 80+ SEO checks…', type: 'info', delay: 1600 },
  { text: '', type: 'dim', delay: 2000 },
  { text: '  Technical SEO        92%', type: 'bar', delay: 2200, barPct: 92, barColor: '#10b981' },
  { text: '  Content Quality      78%', type: 'bar', delay: 2600, barPct: 78, barColor: '#3B82F6' },
  { text: '  On-Page SEO          85%', type: 'bar', delay: 3000, barPct: 85, barColor: '#8B5CF6' },
  { text: '', type: 'dim', delay: 3400 },
  { text: '────────────────────────────────────────', type: 'dim', delay: 3500 },
  { text: '  HEALTH SCORE', type: 'dim', delay: 3600 },
  { text: '  94 / 100  ■ Excellent', type: 'result', delay: 3800 },
  { text: '────────────────────────────────────────', type: 'dim', delay: 3900 },
  { text: '', type: 'dim', delay: 4000 },
  { text: '✓ Done in 8.2s', type: 'success', delay: 4200 },
];

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.09 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as any } },
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
    <section className="bottom-cta" ref={sectionRef}>
      <div className="orb orb-blue" />
      <div className="orb orb-violet" />

      <div className="cta-body">
        {/* Left copy */}
        <motion.div
          className="copy"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <motion.h2 className="headline" variants={fadeUp}>
            {t('bottomCta.title')}
          </motion.h2>
          <motion.p className="sub" variants={fadeUp}>
            {t('bottomCta.description')}
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
                {t('bottomCta.button')}
                <ArrowRight size={15} />
              </button>
            </div>
            <p className="hint">{t('bottomCta.hint')}</p>
          </motion.div>
        </motion.div>

        {/* Right: terminal card */}
        <motion.div
          className="term-card"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="term-glow" />

          <div className="term-chrome">
            <div className="chrome-dots">
              <span className="cd cd-r" />
              <span className="cd cd-y" />
              <span className="cd cd-g" />
            </div>
            <div className="chrome-title">vyntrise — SEO scan</div>
            <div className="chrome-spacer" />
          </div>

          <div className="term-body" ref={termRef}>
            {TERM_LINES.slice(0, visibleCount).map((line, i) => {
              if (line.text === '') return <div key={i} className="term-blank" />;
              if (line.type === 'bar') {
                const label = line.text.split(/\d+%/)[0];
                const pctStr = line.text.match(/\d+%/)?.[0] ?? '';
                return (
                  <div key={i} className="term-bar-row">
                    <span className="term-bar-label">{label}</span>
                    <div className="term-bar-track">
                      <motion.div
                        className="term-bar-fill"
                        style={{ background: line.barColor }}
                        initial={{ width: 0 }}
                        animate={{ width: `${line.barPct}%` }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                    <span className="term-bar-pct" style={{ color: line.barColor }}>{pctStr}</span>
                  </div>
                );
              }
              return (
                <motion.div
                  key={i}
                  className={`term-line term-${line.type}`}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {line.text}
                </motion.div>
              );
            })}
            {visibleCount < TERM_LINES.length && <span className="term-cursor">▋</span>}
            {visibleCount >= TERM_LINES.length && (
              <div className="term-line term-cmd">$ <span className="term-cursor">▋</span></div>
            )}
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .bottom-cta {
          position: relative;
          padding: 140px 0;
          overflow: hidden;
          background: var(--bg-secondary);
          border-top: 1px solid var(--border-color);
        }
        .orb { position:absolute;border-radius:50%;filter:blur(100px);pointer-events:none;z-index:0; }
        .orb-blue { width:600px;height:400px;background:rgba(59,130,246,0.08);bottom:-200px;left:-100px; }
        .orb-violet { width:500px;height:400px;background:rgba(139,92,246,0.06);top:-100px;right:-100px; }

        .cta-body {
          position: relative;
          z-index: 1;
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 48px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
        }

        .copy { display:flex;flex-direction:column;align-items:flex-start; }
        .headline {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(36px, 4vw, 52px);
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1.1;
          color: var(--text-primary);
          margin-bottom: 18px;
        }
        .sub {
          font-size: 17px;
          color: var(--text-secondary);
          line-height: 1.75;
          margin-bottom: 36px;
          max-width: 460px;
        }
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
        .hint { font-size:12px;color:var(--text-muted); }

        /* ── Terminal card (always dark) ─────── */
        .term-card {
          position: relative;
          width: 100%;
          max-width: 480px;
          border-radius: 16px;
          overflow: hidden;
          background: #0a0e1a;
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 48px 100px rgba(0,0,0,0.55), 0 0 0 1px rgba(59,130,246,0.06);
        }
        :global([data-theme='light']) .term-card {
          background: #0a0e1a;
          border-color: rgba(255,255,255,0.08);
          box-shadow: 0 48px 100px rgba(0,0,0,0.25), 0 0 0 1px rgba(59,130,246,0.08);
        }
        .term-glow {
          position: absolute;
          top: -80px; left: 50%; transform: translateX(-50%);
          width: 360px; height: 200px;
          background: radial-gradient(ellipse, rgba(59,130,246,0.15) 0%, transparent 70%);
          pointer-events: none;
        }

        .term-chrome {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 16px;
          background: rgba(255,255,255,0.03);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .chrome-dots { display:flex;gap:6px; }
        .cd { width:10px;height:10px;border-radius:50%; }
        .cd-r { background:#ef4444; }
        .cd-y { background:#FBBF24; }
        .cd-g { background:#10b981; }
        .chrome-title {
          font-family: 'SF Mono','Fira Code','Cascadia Code','JetBrains Mono',monospace;
          font-size: 11px; font-weight: 500;
          color: rgba(255,255,255,0.4);
        }
        .chrome-spacer { flex:1; }

        .term-body {
          padding: 20px 20px 24px;
          max-height: 380px;
          overflow-y: auto;
          background: transparent;
          color: #e2e8f0;
          font-family: 'SF Mono','Fira Code','Cascadia Code','JetBrains Mono','Courier New',monospace;
          font-size: 12.5px;
          line-height: 1.7;
          scrollbar-width: thin;
          scrollbar-color: rgba(59,130,246,0.3) transparent;
        }
        .term-body::-webkit-scrollbar { width:4px; }
        .term-body::-webkit-scrollbar-track { background:transparent; }
        .term-body::-webkit-scrollbar-thumb { background:rgba(59,130,246,0.3);border-radius:2px; }

        .term-blank { height: 10px; }
        .term-line { white-space: pre; }
        .term-cmd { color:#e2e8f0;font-weight:600; }
        .term-info { color:#60A5FA; }
        .term-success { color:#34d399; }
        .term-warn { color:#FBBF24;font-weight:600; }
        .term-error { color:#f87171; }
        .term-result { color:#a78bfa;font-weight:700;font-size:14px; }
        .term-dim { color:rgba(255,255,255,0.2); }

        .term-bar-row { display:flex;align-items:center;gap:8px;height:22px; }
        .term-bar-label { width:160px;color:rgba(255,255,255,0.55);font-size:12px;white-space:pre; }
        .term-bar-track { flex:1;height:4px;background:rgba(255,255,255,0.06);border-radius:2px;overflow:hidden; }
        .term-bar-fill { height:100%;border-radius:2px; }
        .term-bar-pct { width:36px;text-align:right;font-size:12px;font-weight:700; }

        .term-cursor { color:#60A5FA;animation:blink 1s step-end infinite; }
        @keyframes blink { 0%,100%{opacity:1;} 50%{opacity:0;} }

        @media (max-width: 1100px) {
          .cta-body { grid-template-columns:1fr;gap:60px;padding:0 32px; }
          .copy { align-items:center;text-align:center; }
          .sub { max-width:560px; }
          .input-wrap { max-width:100%; }
          .term-card { max-width:520px;margin:0 auto; }
        }
        @media (max-width: 640px) {
          .bottom-cta { padding:80px 0; }
          .cta-body { padding:0 20px;gap:48px; }
          .headline { font-size:32px; }
          .sub { font-size:16px; }
          .input-shell { flex-wrap:wrap;padding:8px;border-radius:14px; }
          .go-btn { width:100%;justify-content:center;margin-top:4px; }
          .term-body { max-height:300px;font-size:11.5px; }
          .term-bar-label { width:120px; }
        }
      `}</style>
    </section>
  );
}
