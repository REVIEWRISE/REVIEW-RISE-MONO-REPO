'use client';

import { Sun, Moon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTheme } from '@/contexts/ThemeContext';
import { useState, useEffect } from 'react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const t = useTranslations('landing.common');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid hydration mismatch by not rendering the dynamic icon/text until mounted
  if (!mounted) {
    return <button className="size-9" aria-hidden="true" />;
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === 'light' ? t('switchToDark') : t('switchToLight')}
      title={theme === 'light' ? t('switchToDark') : t('switchToLight')}
      className="flex size-9 items-center justify-center rounded-[10px] border border-border bg-foreground/[0.04] text-muted-foreground backdrop-blur-md transition hover:scale-105 hover:border-primary/30 hover:bg-primary/[0.06] hover:text-foreground"
    >
      {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  );
}
