'use client';

import { Sun, Moon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const t = useTranslations('landing.common');

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label={theme === 'light' ? t('switchToDark') : t('switchToLight')}
      title={theme === 'light' ? t('switchToDark') : t('switchToLight')}
    >
      {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}

      <style jsx>{`
        .theme-toggle {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          padding: 9px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          backdrop-filter: blur(10px);
          transition: border-color 0.2s ease, background 0.2s ease, color 0.2s ease, transform 0.2s ease;
        }
        .theme-toggle:hover {
          border-color: rgba(59, 130, 246, 0.3);
          background: rgba(59, 130, 246, 0.06);
          color: var(--text-primary);
          transform: scale(1.05);
        }
        :global([data-theme='light']) .theme-toggle {
          background: rgba(15, 23, 42, 0.04);
        }
        :global([data-theme='light']) .theme-toggle:hover {
          background: rgba(59, 130, 246, 0.06);
        }
      `}</style>
    </button>
  );
}
