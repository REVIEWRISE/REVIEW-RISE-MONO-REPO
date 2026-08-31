'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { analyzeSEO, type SEOAnalysisResult } from '@/lib/api';
import ResultsDisplay from '@/components/ResultsDisplay';
import AnalysisLoader from '@/components/AnalysisLoader';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const rawUrl = searchParams.get('url') || '';
  const tResults = useTranslations('landing.results');

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<SEOAnalysisResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!rawUrl) {
      setError(tResults('noUrlProvided'));
      setLoading(false);
      return;
    }

    let u = rawUrl.trim();
    if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
    u = u.replace(/\/+$/, '');

    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await analyzeSEO(u);
        setResult(data);
      } catch (err: any) {
        setError(err.message || tResults('analysisFailedTitle'));
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [rawUrl, tResults]);

  return (
    <>
      <Header />
      <main className="min-h-[80vh] pb-20 pt-8">
        {/* Back link */}
        <div className="mx-auto max-w-6xl px-8 max-[768px]:px-5">
          <Link
            href="/"
            className="mb-10 inline-flex items-center gap-2 rounded-[10px] border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition hover:border-border-strong hover:bg-primary/4 hover:text-foreground"
          >
            <ArrowLeft size={16} />
            <span>{tResults('backToChecker')}</span>
          </Link>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex min-h-[60vh] items-center justify-center px-6">
            <AnalysisLoader />
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="mx-auto max-w-6xl px-8 max-[768px]:px-5">
            <motion.div
              className="glass-panel mx-auto my-20 max-w-[480px] rounded-3xl p-14 text-center max-[768px]:my-12 max-[768px]:p-9"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="mb-4 font-display text-2xl font-bold tracking-[-0.025em] text-red-500">{tResults('analysisFailedTitle')}</h2>
              <p className="mb-8 text-[15px] leading-[1.7] text-muted-foreground">{error}</p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-brand-blue to-brand-violet px-7 py-3.5 font-display text-[15px] font-semibold text-white shadow-[0_4px_20px_rgba(99, 102, 241,0.3)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(99, 102, 241,0.45)]"
              >
                {tResults('tryAnotherUrl')}
              </Link>
            </motion.div>
          </div>
        )}

        {/* Results */}
        {!loading && result && (
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <ResultsDisplay result={result} />
          </motion.div>
        )}
      </main>
      <Footer />
    </>
  );
}
