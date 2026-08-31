'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Linkedin, Instagram, Facebook } from 'lucide-react';

export default function Footer() {
  const t = useTranslations('landing');

  return (
    <footer className="relative border-t border-border bg-background px-8 pb-10 pt-[72px] max-[768px]:px-5">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex items-center justify-between gap-6 max-[768px]:flex-col max-[768px]:items-start">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.png" alt={t('common.brandName')} width={28} height={28} className="rounded-md object-contain" />
            <span className="font-display text-[15px] font-bold tracking-tight text-foreground">{t('common.brandName')}</span>
          </div>
          <div className="flex gap-8 max-[768px]:flex-col max-[768px]:gap-4">
            <Link href="https://app.vyntrise.com/" className="text-sm font-medium text-muted-foreground transition hover:text-foreground">
              {t('footer.login')}
            </Link>
          </div>
        </div>

        <div className="mb-8 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        <div className="flex items-center justify-between max-[768px]:flex-col-reverse max-[768px]:gap-6">
          <p className="text-[13px] text-muted-foreground">
            {'©'} {new Date().getFullYear()} {t('common.brandName')}{'.'} {t('footer.rights')}
          </p>
          <div className="flex items-center gap-5">
            <Link href="https://www.linkedin.com/company/vyntrise-technologies" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="flex text-muted-foreground transition hover:-translate-y-0.5 hover:text-foreground">
              <Linkedin size={20} />
            </Link>
            <Link href="https://www.instagram.com/vyntrisellc" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex text-muted-foreground transition hover:-translate-y-0.5 hover:text-foreground">
              <Instagram size={20} />
            </Link>
            <Link href="https://www.facebook.com/share/1cBw5oDbhj/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex text-muted-foreground transition hover:-translate-y-0.5 hover:text-foreground">
              <Facebook size={20} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
