'use client';

interface ScoreGaugeProps {
  score: number;
  size?: number;
  showLabel?: boolean;
}

import { useTranslations } from 'next-intl';

export default function ScoreGauge({ score, size = 200, showLabel = true }: ScoreGaugeProps) {
  const t = useTranslations('landing.results');
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  const getColor = () => {
    if (score >= 75) return '#10b981';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const getStatus = () => {
    if (score >= 75) return t('verdicts.excellent');
    if (score >= 50) return t('verdicts.good');
    return t('verdicts.poor');
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width={size} height={size} className="drop-shadow-[0_4px_6px_rgba(0,0,0,0.1)]">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--border)" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="transition-[stroke-dashoffset] duration-1000 ease-in-out"
        />
        <text x="50%" y="45%" textAnchor="middle" className="fill-foreground font-display text-[44px] font-bold">
          {score}
        </text>
        <text x="50%" y="60%" textAnchor="middle" className="fill-muted-foreground font-display text-base font-semibold">
          {'/ 100'}
        </text>
      </svg>

      {showLabel && (
        <div className="font-display text-[17px] font-bold tracking-[-0.01em]" style={{ color: getColor() }}>
          {getStatus()}
        </div>
      )}
    </div>
  );
}
