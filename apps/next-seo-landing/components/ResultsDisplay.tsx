'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Download,
  Share2,
  Zap,
  Clock,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Layout,
  FileText,
  RefreshCw,
  Lock
} from 'lucide-react';
import { type SEOAnalysisResult } from '@/lib/api';

interface ResultsDisplayProps {
  result: SEOAnalysisResult;
}

const VERDICT_STYLE: Record<string, { text: string; bg: string }> = {
  excellent: { text: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  good: { text: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  fair: { text: 'text-amber-500', bg: 'bg-amber-500/10' },
  poor: { text: 'text-red-500', bg: 'bg-red-500/10' },
};

export default function ResultsDisplay({ result }: ResultsDisplayProps) {
  const t = useTranslations('landing.results');
  const [expandedIssue, setExpandedIssue] = useState<number | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [isHtmlDetailsExpanded, setIsHtmlDetailsExpanded] = useState(true);

  const toggleCategory = (key: string) => {
    setExpandedCategories(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getScoreVerdict = (score: number) => {
    if (score >= 85) return { label: t('verdicts.excellent'), key: 'excellent' };
    if (score >= 70) return { label: t('verdicts.good'), key: 'good' };
    if (score >= 50) return { label: t('verdicts.fair'), key: 'fair' };
    return { label: t('verdicts.poor'), key: 'poor' };
  };

  const verdict = getScoreVerdict(result.healthScore);
  const verdictStyle = VERDICT_STYLE[verdict.key];
  const issuesFound = result.recommendations.length;
  const criticalIssues = result.recommendations.filter(r => r.priority === 'high').length;

  const sortedCategories = [
    { key: 'technical', label: t('categories.technical.label'), data: result.categoryScores.technical, icon: Zap, description: t('categories.technical.description') },
    { key: 'content', label: t('categories.content.label'), data: result.categoryScores.content, icon: FileText, description: t('categories.content.description') },
    { key: 'onPage', label: t('categories.onPage.label'), data: result.categoryScores.onPage, icon: Layout, description: t('categories.onPage.description') },
  ].sort((a, b) => (a.data?.percentage || 0) - (b.data?.percentage || 0));

  return (
    <>
      <div className="mx-auto max-w-6xl px-6 pb-[120px] font-sans max-[768px]:px-5">
        {/* Result Context Bar */}
        <div className="glass-panel mb-8 flex items-center justify-between rounded-2xl px-7 py-5 max-[768px]:flex-col max-[768px]:items-start max-[768px]:gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="text-[11px] font-semibold uppercase tracking-[1px] text-muted-foreground">{t('analysisFor')}</div>
            <div className="font-display text-lg font-bold tracking-[-0.025em] text-foreground">{result.url.replace('https://', '').replace('http://', '')}</div>
            <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
              <Clock size={14} />
              <span>{t('scannedAt', { date: new Date(result.timestamp).toLocaleString() })}</span>
            </div>
          </div>
          <button className="flex items-center gap-2 rounded-[10px] border border-border px-5 py-2.5 font-display text-sm font-semibold text-muted-foreground transition hover:border-primary/30 hover:bg-primary/6 hover:text-foreground">
            <RefreshCw size={16} />
            {t('rescan')}
          </button>
        </div>

        {/* Score Hero Section */}
        <div className="glass-panel relative mb-12 flex justify-between gap-12 overflow-hidden rounded-3xl border-primary/15 p-12 max-[1024px]:flex-col max-[768px]:p-6">
          <div className="pointer-events-none absolute -left-[60px] -top-[60px] size-[300px] rounded-full bg-[radial-gradient(circle,rgba(99, 102, 241,0.08)_0%,transparent_70%)]" />

          <div className="relative flex-1">
            <div className="mb-4 font-display text-[11px] font-bold uppercase tracking-[1.5px] text-muted-foreground">{t('healthScore')}</div>
            <div className="mb-5 flex items-baseline gap-2">
              <div className="gradient-text font-display text-[80px] font-bold leading-none tracking-[-0.025em] max-[768px]:text-[64px]">{result.healthScore}</div>
              <div className="font-display text-3xl font-semibold text-muted-foreground">{'/ 100'}</div>
            </div>
            <div className={`mb-8 inline-flex rounded-lg px-5 py-2 text-[15px] font-bold ${verdictStyle.bg} ${verdictStyle.text}`}>
              {verdict.label}
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="h-1.5 w-10 rounded-full bg-red-500" />
                <span className="text-[13px] text-muted-foreground">{t('legend.poor')}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-1.5 w-10 rounded-full bg-amber-500" />
                <span className="text-[13px] text-muted-foreground">{t('legend.fair')}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-1.5 w-10 rounded-full bg-emerald-500" />
                <span className="text-[13px] text-muted-foreground">{t('legend.good')}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-1.5 w-10 rounded-full bg-emerald-500" />
                <span className="text-[13px] text-muted-foreground">{t('legend.excellent')}</span>
              </div>
            </div>
          </div>

          <div className="relative flex flex-col gap-6">
            <div className="grid grid-cols-3 gap-4 max-[768px]:grid-cols-1">
              <div className="rounded-[14px] border border-border bg-card/60 p-5 text-center backdrop-blur-md">
                <div className="mb-2 font-display text-3xl font-bold tracking-[-0.025em] text-foreground">{issuesFound}</div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">{t('totalIssues')}</div>
              </div>
              <div className="rounded-[14px] border border-red-500/25 bg-red-500/4 p-5 text-center backdrop-blur-md">
                <div className="mb-2 font-display text-3xl font-bold tracking-[-0.025em] text-red-500">{criticalIssues}</div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">{t('critical')}</div>
              </div>
              <div className="rounded-[14px] border border-border bg-card/60 p-5 text-center backdrop-blur-md">
                <div className="mb-2 font-display text-3xl font-bold tracking-[-0.025em] text-foreground">{result.technicalAnalysis.pageSpeed.loadTime}{'ms'}</div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">{t('loadTime')}</div>
              </div>
            </div>

            <div className="flex gap-3 max-[768px]:flex-col">
              <button className="relative flex flex-1 items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-blue to-brand-violet px-8 py-4 font-display text-[15px] font-semibold tracking-[-0.01em] text-white shadow-[0_4px_24px_rgba(99, 102, 241,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_40px_rgba(99, 102, 241,0.5)]">
                <Download size={18} />
                {t('getFullReport')}
              </button>
              <button className="flex items-center gap-2 rounded-2xl border border-border px-6 py-4 font-display text-sm font-semibold text-muted-foreground transition hover:border-primary/30 hover:bg-primary/6 hover:text-foreground">
                <Share2 size={16} />
                {t('share')}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.5fr_1fr]">
          {/* Left Column */}
          <div>
            {/* SEO Breakdown */}
            <section className="mb-12">
              <h2 className="mb-6 font-display text-[22px] font-bold tracking-[-0.025em] text-foreground">{t('healthBreakdown')}</h2>

              {/* HTML Page Details Card */}
              <div className="glass-panel mb-6 rounded-[18px] p-7 transition hover:border-border-strong">
                <div
                  className={`flex cursor-pointer items-center justify-between ${isHtmlDetailsExpanded ? 'mb-5' : ''}`}
                  onClick={() => setIsHtmlDetailsExpanded(!isHtmlDetailsExpanded)}
                >
                  <h3 className="font-display text-lg font-bold text-foreground">{t('htmlPage')}</h3>
                  <button className="flex text-muted-foreground transition hover:text-foreground">
                    {isHtmlDetailsExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </button>
                </div>

                {isHtmlDetailsExpanded && (
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
                    {[
                      { label: t('htmlDetails.metaTitle'), value: typeof result.seoElements?.title === 'object' && result.seoElements.title !== null ? (result.seoElements.title as any).value || '-' : result.seoElements?.title || '-', desc: t('htmlDetails.titleDesc') },
                      { label: t('htmlDetails.metaDescription'), value: typeof result.seoElements?.description === 'object' && result.seoElements.description !== null ? (result.seoElements.description as any).value || 'Not set' : result.seoElements?.description || 'Not set', desc: t('htmlDetails.descDesc') },
                      { label: t('htmlDetails.url'), value: result.url, desc: t('htmlDetails.urlDesc'), mono: true },
                      { label: t('htmlDetails.statusCode'), value: result.technicalAnalysis?.pageSpeed?.status || '200', desc: t('htmlDetails.statusDesc') },
                      { label: t('htmlDetails.responseTime'), value: `${(result.technicalAnalysis?.pageSpeed?.loadTime / 1000).toFixed(2)} sec`, desc: t('htmlDetails.timeDesc') },
                      { label: t('htmlDetails.wordCount'), value: typeof result.seoElements?.wordCount === 'number' ? result.seoElements.wordCount : '-', desc: t('htmlDetails.countDesc') },
                    ].map((item, i) => (
                      <div key={i} className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold uppercase tracking-[0.5px] text-muted-foreground">{item.label}</span>
                          <span className="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.5px] text-white">{t('aiAnalysis')}</span>
                        </div>
                        <span className={`text-sm font-medium text-foreground ${item.mono ? 'break-all font-mono text-xs' : ''}`}>{item.value}</span>
                        <p className="mt-1 text-xs leading-[1.5] text-muted-foreground/80">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4">
                {sortedCategories.map((cat) => {
                  const Icon = cat.icon;
                  const percentage = cat.data?.percentage || 0;
                  const scoreColor = percentage >= 70 ? '#10b981' : percentage >= 50 ? '#f59e0b' : '#ef4444';
                  const categoryRecs = result.recommendations.filter(r => r.category === cat.key);
                  const criticalCount = categoryRecs.filter(r => r.priority === 'high').length;
                  const expanded = expandedCategories[cat.key] || false;

                  return (
                    <div key={cat.key} className="glass-panel flex items-start gap-4 rounded-[18px] p-6 transition hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[0_8px_32px_rgba(99, 102, 241,0.08)]">
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-xl" style={{ background: `${scoreColor}15`, color: scoreColor }}>
                        <Icon size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="mb-3 flex cursor-pointer items-center justify-between" onClick={() => toggleCategory(cat.key)}>
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-bold text-foreground">{cat.label}</h3>
                            <span className="font-display text-xl font-bold" style={{ color: scoreColor }}>{Math.round(percentage)}{'%'}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            {categoryRecs.length > 0 && (
                              <span className="rounded-md bg-foreground/5 px-3 py-1 text-xs font-semibold text-muted-foreground">
                                {categoryRecs.length} {'issue'}{categoryRecs.length !== 1 ? 's' : ''}{criticalCount > 0 && ` • ${criticalCount} critical`}
                              </span>
                            )}
                            <button className="flex text-muted-foreground transition hover:text-foreground">
                              {expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                            </button>
                          </div>
                        </div>

                        <div className="mb-1.5 flex justify-end">
                          <span className="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.5px] text-white">{t('aiAnalysis')}</span>
                        </div>
                        <p className="mb-4 text-sm leading-[1.5] text-muted-foreground">{cat.description}</p>

                        <div className="h-1.5 overflow-hidden rounded-full bg-foreground/5">
                          <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${percentage}%`, background: scoreColor }} />
                        </div>

                        {expanded && categoryRecs.length > 0 && (
                          <div className="mt-5 border-t border-border pt-5">
                            <h4 className="mb-4 text-base font-bold text-foreground">{t('checks')}</h4>
                            <div className="flex flex-col gap-3">
                              {categoryRecs.map((rec, i) => {
                                const checkStatus = rec.priority === 'high' ? 'error' : rec.priority === 'medium' ? 'warning' : 'tip';
                                const statusIcon = checkStatus === 'error' ? <AlertTriangle size={16} /> : checkStatus === 'warning' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />;
                                const borderColor = checkStatus === 'error' ? 'border-l-red-500' : checkStatus === 'warning' ? 'border-l-amber-500' : 'border-l-indigo-500';
                                const iconColor = checkStatus === 'error' ? 'text-red-500' : checkStatus === 'warning' ? 'text-amber-500' : 'text-indigo-500';
                                const badgeClass = checkStatus === 'error' ? 'bg-red-500/15 text-red-500' : checkStatus === 'warning' ? 'bg-amber-500/15 text-amber-500' : 'bg-indigo-500/15 text-indigo-500';

                                return (
                                  <div key={i} className={`rounded-xl border-l-[3px] bg-foreground/[0.02] p-4 ${borderColor}`}>
                                    <div className="mb-3 flex items-start justify-between">
                                      <div className="flex flex-1 items-start gap-2.5">
                                        <span className={`mt-0.5 flex shrink-0 ${iconColor}`}>{statusIcon}</span>
                                        <span className="text-[15px] font-semibold leading-[1.4] text-foreground">{rec.issue}</span>
                                      </div>
                                      <span className={`shrink-0 rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.5px] ${badgeClass}`}>{t(checkStatus)}</span>
                                    </div>
                                    <div className="pl-[26px]">
                                      <p className="mb-2 text-sm leading-[1.6] text-muted-foreground">{rec.recommendation}</p>
                                      {rec.impact && (
                                        <p className="text-[13px] text-muted-foreground">
                                          <strong className="text-foreground">{t('impact')}{':'}</strong> {rec.impact}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Critical Issues */}
            <section className="mb-12">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-display text-[22px] font-bold tracking-[-0.025em] text-foreground">{t('criticalIssues')}</h2>
                <span className="rounded-md bg-red-500/10 px-3 py-1 text-[13px] font-semibold text-red-500">{t('issuesFound', { count: criticalIssues })}</span>
              </div>

              <div className="flex flex-col gap-3.5">
                {result.recommendations.filter(r => r.priority === 'high').slice(0, 3).map((issue, idx) => (
                  <div
                    key={idx}
                    className="glass-panel cursor-pointer rounded-[18px] p-6 transition hover:-translate-y-0.5 hover:border-red-500/30 hover:shadow-[0_8px_32px_rgba(239,68,68,0.08)]"
                    onClick={() => setExpandedIssue(expandedIssue === idx ? null : idx)}
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex flex-1 gap-4">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-red-500/10 text-red-500">
                          <AlertTriangle size={18} />
                        </div>
                        <div>
                          <div className="mb-1 flex items-center gap-2">
                            <h3 className="text-lg font-bold text-foreground">{issue.issue}</h3>
                            <span className="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">{'AI'}</span>
                          </div>
                          <p className="text-sm leading-[1.6] text-muted-foreground">{issue.recommendation}</p>
                        </div>
                      </div>
                      <button className="flex shrink-0 text-muted-foreground">
                        {expandedIssue === idx ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                      </button>
                    </div>

                    <div className="mb-4 flex flex-wrap gap-2">
                      <span className="rounded-md bg-red-500/15 px-3 py-1.5 text-xs font-bold text-red-500">{t('critical')}</span>
                      <span className="rounded-md bg-emerald-500/15 px-3 py-1.5 text-xs font-bold text-emerald-500">{'+15-20% CTR'}</span>
                      <span className="rounded-md bg-primary/12 px-3 py-1.5 text-xs font-bold text-blue-400">{'Easy Fix'}</span>
                    </div>

                    {expandedIssue === idx && (
                      <div className="flex gap-3 border-t border-border pt-4">
                        <button className="flex items-center gap-1.5 rounded-[10px] bg-gradient-to-br from-brand-blue to-brand-violet px-4 py-2.5 font-display text-[13px] font-semibold text-white shadow-[0_4px_16px_rgba(99, 102, 241,0.3)] transition hover:-translate-y-px hover:shadow-[0_6px_24px_rgba(99, 102, 241,0.45)]">
                          <ExternalLink size={14} />
                          {t('fixGuide')}
                        </button>
                        <button className="rounded-[10px] border border-border px-4 py-2.5 font-display text-[13px] font-semibold text-muted-foreground transition hover:border-primary/30 hover:bg-primary/6 hover:text-foreground">{t('learnMore')}</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {issuesFound > 3 && (
                <div className="mt-4 flex items-center justify-center gap-3 rounded-2xl border border-dashed border-primary/20 bg-primary/4 p-6 text-sm text-muted-foreground">
                  <Lock size={16} />
                  <span>{t('moreIssuesHidden', { count: issuesFound - 3 })}</span>
                  <button className="ml-auto rounded-lg bg-gradient-to-br from-brand-blue to-brand-violet px-[18px] py-2 font-display text-[13px] font-semibold text-white shadow-[0_4px_16px_rgba(99, 102, 241,0.3)] transition hover:-translate-y-px hover:shadow-[0_6px_24px_rgba(99, 102, 241,0.45)]">{t('unlockFullReport')}</button>
                </div>
              )}
            </section>
          </div>

          {/* Right Column */}
          <div>
            {/* AI Strategic Insights */}
            <section className="mb-12">
              <h2 className="mb-6 font-display text-[22px] font-bold tracking-[-0.025em] text-foreground">{t('strategicInsights')}</h2>

              {result.strategicRecommendations && result.strategicRecommendations.length > 0 ? (
                <div className="flex flex-col gap-3.5">
                  {result.strategicRecommendations.map((rec, idx) => (
                    <div key={rec.id} className="glass-panel flex gap-4 rounded-[18px] p-5 transition hover:-translate-y-0.5 hover:border-brand-violet/25 hover:shadow-[0_8px_32px_rgba(99, 102, 241,0.1)]">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-blue to-brand-violet font-display text-sm font-bold text-white">{'#'}{idx + 1}</div>
                      <div className="flex-1">
                        <h3 className="mb-2.5 text-base font-bold text-foreground">{rec.title}</h3>
                        <p className="mb-3 text-sm leading-[1.6] text-muted-foreground">{rec.description}</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-md bg-emerald-500/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.5px] text-emerald-500">{t('impactValue', { value: rec.impact })}</span>
                          <span className="rounded-md bg-brand-violet/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.5px] text-violet-400">{rec.type}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center italic text-muted-foreground">
                  <p>{t('noInsights')}</p>
                </div>
              )}
            </section>

            {/* Upgrade Card */}
            <div className="relative overflow-hidden rounded-[22px] border border-brand-violet/25 bg-gradient-to-br from-brand-blue/15 to-brand-violet/15 p-9 backdrop-blur-xl">
              <div className="pointer-events-none absolute -right-10 -top-10 size-[200px] rounded-full bg-[radial-gradient(circle,rgba(99, 102, 241,0.2)_0%,transparent_70%)]" />
              <div className="relative mb-3 flex items-center gap-3 text-violet-400">
                <Zap size={24} className="fill-current" />
                <h3 className="font-display text-xl font-bold tracking-[-0.025em] text-foreground">{t('unlockPower')}</h3>
              </div>
              <p className="relative mb-6 text-sm leading-[1.6] text-muted-foreground">{t('upgradeDesc')}</p>
              <ul className="relative mb-7 flex flex-col gap-3">
                <li className="flex items-center gap-2.5 text-sm text-muted-foreground"><CheckCircle2 size={16} className="shrink-0 text-emerald-500" /> {t('upgradeFeatures.recs')}</li>
                <li className="flex items-center gap-2.5 text-sm text-muted-foreground"><CheckCircle2 size={16} className="shrink-0 text-emerald-500" /> {t('upgradeFeatures.competitor')}</li>
                <li className="flex items-center gap-2.5 text-sm text-muted-foreground"><CheckCircle2 size={16} className="shrink-0 text-emerald-500" /> {t('upgradeFeatures.keywords')}</li>
                <li className="flex items-center gap-2.5 text-sm text-muted-foreground"><CheckCircle2 size={16} className="shrink-0 text-emerald-500" /> {t('upgradeFeatures.support')}</li>
              </ul>
              <button className="relative w-full rounded-xl bg-gradient-to-br from-brand-blue to-brand-violet py-3.5 font-display text-[15px] font-semibold tracking-[-0.01em] text-white shadow-[0_4px_20px_rgba(99, 102, 241,0.3)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(99, 102, 241,0.45)]">{t('upgradeToPro')}</button>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom CTA */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/92 px-6 py-4 shadow-[0_-4px_32px_rgba(0,0,0,0.2)] backdrop-blur-2xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="gradient-text font-display text-3xl font-bold tracking-[-0.025em]">{result.healthScore}{'/100'}</div>
            <div className="flex flex-col gap-0.5">
              <span className="font-display text-[13px] font-semibold text-foreground">{t('healthScore')}</span>
              <span className="text-xs font-semibold text-red-500">{t('criticalIssuesFound', { count: criticalIssues })}</span>
            </div>
          </div>
          <button className="flex items-center gap-2.5 rounded-xl bg-gradient-to-br from-brand-blue to-brand-violet px-7 py-3 font-display text-sm font-semibold text-white shadow-[0_4px_20px_rgba(99, 102, 241,0.35)] transition hover:-translate-y-px hover:shadow-[0_6px_28px_rgba(99, 102, 241,0.5)]">
            <Download size={16} />
            {t('getFullReport')}
          </button>
        </div>
      </div>
    </>
  );
}
