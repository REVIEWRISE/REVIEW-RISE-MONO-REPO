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
      <main className="results-page">
        {/* Back link */}
        <div className="container">
          <Link href="/" className="back-link">
            <ArrowLeft size={16} />
            <span>{tResults('backToChecker')}</span>
          </Link>
        </div>

        <div className="results-content-wrapper">
          {/* Loading state */}
          {loading && (
            <div key="loader" className="loader-section">
              <AnalysisLoader />
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div key="error" className="container">
              <motion.div
                className="error-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="error-title">{tResults('analysisFailedTitle')}</h2>
                <p className="error-msg">{error}</p>
                <Link href="/" className="retry-btn">
                  {tResults('tryAnotherUrl')}
                </Link>
              </motion.div>
            </div>
          )}

          {/* Results */}
          {!loading && result && (
            <div key="results">
              <motion.div
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <ResultsDisplay result={result} />
              </motion.div>
            </div>
          )}
        </div>
      </main>
      <Footer />

      <style jsx>{`
        .results-page {
          min-height: 80vh;
          padding-top: 32px;
          padding-bottom: 80px;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 32px;
        }
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 500;
          padding: 8px 16px;
          border-radius: 10px;
          border: 1px solid var(--border-color);
          margin-bottom: 40px;
          transition: color 0.2s ease, border-color 0.2s ease, background 0.2s ease;
        }
        .back-link:hover {
          color: var(--text-primary);
          border-color: var(--border-hover);
          background: rgba(59, 130, 246, 0.04);
        }
        .loader-section {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 60vh;
          padding: 0 24px;
        }
        .error-card {
          max-width: 480px;
          margin: 80px auto;
          text-align: center;
          background: var(--bg-card);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--border-color);
          border-radius: 24px;
          padding: 56px 40px;
          box-shadow: var(--shadow);
        }
        .error-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 24px;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #ef4444;
          margin-bottom: 16px;
        }
        .error-msg {
          font-size: 15px;
          color: var(--text-secondary);
          line-height: 1.7;
          margin-bottom: 32px;
        }
        .retry-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--gradient-primary);
          color: #fff;
          padding: 14px 28px;
          border-radius: 12px;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 15px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
        }
        .retry-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(59, 130, 246, 0.45);
          color: #fff;
        }
        @media (max-width: 768px) {
          .container { padding: 0 20px; }
          .error-card { padding: 40px 24px; margin: 48px auto; }
        }
      `}</style>
    </>
  );
}
