'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, Loader2, Zap, Smartphone, Shield } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';

interface AnalysisStep {
  id: string;
  label: string;
  subtext: string;
}

export default function AnalysisLoader() {
  const t = useTranslations('landing.loader');

  const steps: AnalysisStep[] = [
    { id: 'fetch', label: t('fetching'), subtext: t('connecting') },
    { id: 'technical', label: t('technical'), subtext: t('checking') },
    { id: 'content', label: t('content'), subtext: t('scanning') },
    { id: 'mobile', label: t('mobile'), subtext: t('simulating') },
    { id: 'performance', label: t('performance'), subtext: t('calculating') },
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 100 : prev + 1));
    }, 50);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const stepDuration = 100 / steps.length;
    const step = Math.floor(progress / stepDuration);
    setCurrentStep(Math.min(step, steps.length - 1));
  }, [progress, steps.length]);

  const insights = [
    { Icon: Zap, text: t('insightLoadTime') },
    { Icon: Smartphone, text: t('insightMobile') },
    { Icon: Shield, text: t('insightSecurity') },
  ];

  return (
    <motion.div
      className="mx-auto flex max-w-[560px] flex-col gap-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card/80 px-10 py-12 text-center backdrop-blur-xl max-[640px]:px-6 max-[640px]:py-9">
        <div className="pointer-events-none absolute -top-[60px] left-1/2 h-[200px] w-[300px] -translate-x-1/2 bg-[radial-gradient(ellipse,rgba(99, 102, 241,0.12)_0%,transparent_70%)]" />

        {/* Agent avatar: pulsing orb signaling "the agent is working" */}
        <div className="relative z-[1] mx-auto mb-7 flex size-20 items-center justify-center">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/20" />
          <span className="absolute inline-flex size-[68px] animate-pulse rounded-full bg-primary/15" />
          <div className="relative z-[1] flex size-16 items-center justify-center rounded-[18px] bg-gradient-to-br from-brand-blue to-brand-violet shadow-[0_8px_32px_rgba(99, 102, 241,0.4)]">
            <Zap size={28} className="fill-white text-white" />
          </div>
        </div>

        <p className="relative z-[1] mb-2 text-xs font-bold uppercase tracking-[0.1em] text-violet-400">{t('agentLabel')}</p>

        <h3 className="relative z-[1] mb-5 font-display text-[17px] font-semibold tracking-[-0.01em] text-muted-foreground">
          <AnimatePresence mode="wait">
            <motion.span
              key={steps[currentStep].id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="inline-block"
            >
              {steps[currentStep].label}
            </motion.span>
          </AnimatePresence>
          <span className="text-primary"> {progress}{'%'}</span>
        </h3>

        <div className="relative z-[1] mx-auto mb-9 h-1 max-w-[240px] overflow-hidden rounded-full bg-foreground/6">
          <div className="h-full rounded-full bg-gradient-to-r from-brand-blue to-brand-violet transition-[width] duration-300" style={{ width: `${progress}%` }} />
        </div>

        <div className="relative z-[1] mx-auto flex max-w-[320px] flex-col gap-3.5 text-left">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            return (
              <div key={step.id} className={`flex items-center gap-3 transition-opacity duration-300 ${isCurrent || isCompleted ? 'opacity-100' : 'opacity-35'}`}>
                <div className="flex shrink-0 items-center">
                  {isCompleted ? (
                    <CheckCircle2 size={18} className="text-emerald-500" />
                  ) : isCurrent ? (
                    <Loader2 size={18} className="animate-spin text-primary" />
                  ) : (
                    <div className="size-[18px] rounded-full border-[1.5px] border-foreground/12" />
                  )}
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] font-medium text-muted-foreground">{step.subtext}</span>
                  {isCompleted && <span className="text-[11px] font-semibold text-emerald-500">{'✓'} {t('completed')}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <motion.div
        className="rounded-[18px] border border-brand-violet/18 bg-brand-violet/6 px-7 py-6 backdrop-blur-md"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mb-[18px] flex items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.06em] text-violet-300">
          <Zap size={16} className="text-violet-300" />
          <span>{t('earlyInsights')}</span>
        </div>
        {insights.map(({ Icon, text }, i) => (
          <div key={i} className="mb-3 flex items-center gap-3 text-[13px] leading-[1.5] text-muted-foreground last:mb-0">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-brand-violet/20 bg-brand-violet/12">
              <Icon size={14} className="text-violet-300" />
            </div>
            <span>{text}</span>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}
