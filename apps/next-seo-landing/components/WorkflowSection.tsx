'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

export default function WorkflowSection() {
  const t = useTranslations('landing.workflow');

  return (
    <section className="workflow">
      <div className="container">
        <motion.div
          className="header"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="section-title gradient-text-blue-violet">{t('title')}</h2>
        </motion.div>

        <motion.div
          className="browser-mockup"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Browser chrome */}
          <div className="browser-bar">
            <div className="browser-dots">
              <span className="dot dot-red" />
              <span className="dot dot-yellow" />
              <span className="dot dot-green" />
            </div>
            <div className="browser-url">
              <span>app.vyntrise.com/dashboard</span>
            </div>
          </div>

          {/* Dashboard content */}
          <div className="dashboard">
            <div className="dash-sidebar">
              <div className="sidebar-logo">
                <div className="logo-icon" />
                <span>Vyntrise</span>
              </div>
              <div className="sidebar-nav">
                <div className="nav-item active">
                  <div className="nav-dot" />
                  <span>Dashboard</span>
                </div>
                <div className="nav-item">
                  <div className="nav-dot" />
                  <span>Reports</span>
                </div>
                <div className="nav-item">
                  <div className="nav-dot" />
                  <span>Settings</span>
                </div>
              </div>
            </div>

            <div className="dash-main">
              <div className="dash-hero-text">
                <p className="tagline">{t('mockupTagline')}</p>
              </div>

              <div className="dash-cards">
                <div className="dash-card">
                  <div className="dash-card-bar" style={{ width: '72%', background: '#3B82F6' }} />
                  <span className="dash-card-label">SEO Score</span>
                </div>
                <div className="dash-card">
                  <div className="dash-card-bar" style={{ width: '58%', background: '#8B5CF6' }} />
                  <span className="dash-card-label">Performance</span>
                </div>
                <div className="dash-card">
                  <div className="dash-card-bar" style={{ width: '85%', background: '#10b981' }} />
                  <span className="dash-card-label">Content</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .workflow {
          padding: 140px 0;
          position: relative;
          overflow: hidden;
        }
        .container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 0 32px;
        }
        .header {
          text-align: center;
          margin-bottom: 64px;
        }
        .section-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(36px, 5vw, 52px);
          font-weight: 700;
          letter-spacing: -0.03em;
        }

        /* Browser mockup */
        .browser-mockup {
          border-radius: 16px;
          overflow: hidden;
          background: rgba(11, 16, 32, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 32px 80px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(59, 130, 246, 0.06);
        }
        :global([data-theme='light']) .browser-mockup {
          background: rgba(255, 255, 255, 0.95);
          border-color: rgba(15, 23, 42, 0.08);
          box-shadow: 0 32px 80px rgba(15, 23, 42, 0.1);
        }

        .browser-bar {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          background: rgba(0, 0, 0, 0.15);
        }
        :global([data-theme='light']) .browser-bar {
          border-bottom-color: rgba(15, 23, 42, 0.06);
          background: rgba(0, 0, 0, 0.03);
        }
        .browser-dots {
          display: flex;
          gap: 6px;
        }
        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        .dot-red { background: #ef4444; }
        .dot-yellow { background: #FBBF24; }
        .dot-green { background: #10b981; }
        .browser-url {
          flex: 1;
          background: rgba(255, 255, 255, 0.04);
          border-radius: 6px;
          padding: 6px 14px;
          font-size: 12px;
          color: var(--text-muted);
          font-weight: 500;
        }
        :global([data-theme='light']) .browser-url {
          background: rgba(15, 23, 42, 0.04);
        }

        /* Dashboard */
        .dashboard {
          display: grid;
          grid-template-columns: 180px 1fr;
          min-height: 320px;
        }

        .dash-sidebar {
          border-right: 1px solid rgba(255, 255, 255, 0.06);
          padding: 20px 16px;
          display: flex;
          flex-direction: column;
          gap: 28px;
        }
        :global([data-theme='light']) .dash-sidebar {
          border-right-color: rgba(15, 23, 42, 0.06);
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
        }
        .logo-icon {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          background: linear-gradient(135deg, #3B82F6, #8B5CF6);
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          border-radius: 8px;
          font-size: 13px;
          color: var(--text-muted);
          font-weight: 500;
          transition: background 0.2s ease, color 0.2s ease;
        }
        .nav-item.active {
          background: rgba(59, 130, 246, 0.1);
          color: #60A5FA;
        }
        .nav-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
          opacity: 0.5;
        }
        .nav-item.active .nav-dot {
          opacity: 1;
          background: #3B82F6;
        }

        .dash-main {
          padding: 32px;
          display: flex;
          flex-direction: column;
          gap: 28px;
        }
        .tagline {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(18px, 2.5vw, 24px);
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.02em;
          line-height: 1.3;
          max-width: 340px;
        }

        .dash-cards {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .dash-card {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .dash-card-bar {
          height: 6px;
          border-radius: 3px;
          transition: width 0.6s ease;
        }
        .dash-card-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          letter-spacing: 0.02em;
        }

        @media (max-width: 768px) {
          .workflow { padding: 80px 0; }
          .container { padding: 0 20px; }
          .dashboard { grid-template-columns: 1fr; }
          .dash-sidebar { display: none; }
          .dash-main { padding: 24px; }
        }
      `}</style>
    </section>
  );
}
