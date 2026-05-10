'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, Loader2, Zap, Smartphone, Shield } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

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
      className="loader-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="progress-card">
        <div className="card-glow" />
        <div className="app-icon-wrapper">
          <div className="app-icon">
            <Zap size={28} color="white" fill="white" />
          </div>
          <div className="ripple" />
        </div>
        <h3 className="progress-text">
          {steps[currentStep].label}
          <span className="percentage"> {progress}{'%'}</span>
        </h3>
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="steps-list">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            return (
              <div key={step.id} className={`step-item ${isCurrent ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                <div className="step-icon">
                  {isCompleted ? (
                    <CheckCircle2 size={18} color="#10b981" />
                  ) : isCurrent ? (
                    <Loader2 size={18} color="#3B82F6" style={{ animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <div className="circle-placeholder" />
                  )}
                </div>
                <div className="step-content">
                  <span className="step-label">{step.subtext}</span>
                  {isCompleted && <span className="step-time">{'✓'} {t('completed')}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <motion.div
        className="insights-card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="insights-header">
          <Zap size={16} color="#A78BFA" />
          <span>{t('earlyInsights')}</span>
        </div>
        {insights.map(({ Icon, text }, i) => (
          <div key={i} className="insight-item">
            <div className="insight-icon">
              <Icon size={14} color="#A78BFA" />
            </div>
            <span>{text}</span>
          </div>
        ))}
      </motion.div>

      <style jsx>{`
        .loader-container {
          max-width: 560px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .progress-card {
          background: rgba(11, 16, 32, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          padding: 48px 40px;
          text-align: center;
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }
        :global([data-theme='light']) .progress-card {
          background: rgba(255, 255, 255, 0.9);
          border-color: rgba(15, 23, 42, 0.08);
        }
        .card-glow {
          position: absolute;
          top: -60px;
          left: 50%;
          transform: translateX(-50%);
          width: 300px;
          height: 200px;
          background: radial-gradient(ellipse, rgba(59, 130, 246, 0.12) 0%, transparent 70%);
          pointer-events: none;
        }
        .app-icon-wrapper {
          position: relative;
          width: 80px;
          height: 80px;
          margin: 0 auto 28px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .app-icon {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #3B82F6, #8B5CF6);
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
          box-shadow: 0 8px 32px rgba(59, 130, 246, 0.4);
        }
        .ripple {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 2px solid rgba(59, 130, 246, 0.25);
          animation: ripple 2s infinite;
        }
        @keyframes ripple {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .progress-text {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 17px;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 20px;
          letter-spacing: -0.01em;
        }
        .percentage {
          color: #3B82F6;
          font-weight: 700;
        }
        .progress-bar-bg {
          height: 4px;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 36px;
          max-width: 240px;
          margin-left: auto;
          margin-right: auto;
        }
        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(to right, #3B82F6, #8B5CF6);
          border-radius: 2px;
          transition: width 0.3s ease;
        }
        .steps-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
          text-align: left;
          max-width: 320px;
          margin: 0 auto;
        }
        .step-item {
          display: flex;
          align-items: center;
          gap: 12px;
          opacity: 0.35;
          transition: opacity 0.3s ease;
        }
        .step-item.active, .step-item.completed { opacity: 1; }
        .step-icon {
          flex-shrink: 0;
          display: flex;
          align-items: center;
        }
        .step-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .step-label {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-secondary);
        }
        .step-time {
          font-size: 11px;
          color: #10b981;
          font-weight: 600;
        }
        .circle-placeholder {
          width: 18px;
          height: 18px;
          border: 1.5px solid rgba(255, 255, 255, 0.12);
          border-radius: 50%;
        }
        .insights-card {
          background: rgba(139, 92, 246, 0.06);
          border: 1px solid rgba(139, 92, 246, 0.18);
          border-radius: 18px;
          padding: 24px 28px;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .insights-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 18px;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 12px;
          font-weight: 700;
          color: #C4B5FD;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .insight-item {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.5;
        }
        .insight-item:last-child { margin-bottom: 0; }
        .insight-icon {
          width: 28px;
          height: 28px;
          background: rgba(139, 92, 246, 0.12);
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
      `}</style>
    </motion.div>
  );
}
