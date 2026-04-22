/* eslint-disable @typescript-eslint/no-explicit-any */
// @react-pdf/renderer is loaded dynamically at runtime.
// We use createElement instead of JSX to avoid needing
// react or @react-pdf/renderer type declarations at compile time.

type WhiteLabelConfig = {
  primaryColor?: string | null;
  accentColor?: string | null;
  title?: string | null;
  intro?: string | null;
  footer?: string | null;
  logoDataUrl?: string | null;
};

type BuildPdfInput = {
  sections: string[];
  whiteLabel: WhiteLabelConfig;
  formatSectionTitle: (value: string) => string;
  sectionContent?: Record<string, { bullets: string[] }>;
};

export const buildReportsCenterPdf = async (input: BuildPdfInput): Promise<Buffer> => {
  const { sections, whiteLabel, formatSectionTitle, sectionContent = {} } = input;

  const renderer = (await import('@react-pdf/renderer' as any)) as any;
  const { Document: Doc, Page: Pg, Text: Txt, View: Vw, Image: Img, StyleSheet, renderToBuffer } = renderer;

  // react-pdf uses React.createElement internally; we use it directly to avoid JSX compile deps
  const React = (await import('react' as any)) as any;
  const cr = React.default?.createElement ?? React.createElement;

  const styles = StyleSheet.create({
    page: { fontFamily: 'Helvetica', fontSize: 11, color: '#0f172a', backgroundColor: '#ffffff' },
    header: { padding: 24, backgroundColor: whiteLabel.primaryColor || '#0F172A', color: '#ffffff' },
    headerTitle: { fontSize: 20, marginTop: 8, marginBottom: 4 },
    headerIntro: { fontSize: 11, lineHeight: 1.4 },
    logo: { width: 96, height: 32, objectFit: 'contain' as const },
    content: { padding: 24, gap: 12 },
    section: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 16 },
    sectionTitle: { fontSize: 13, color: whiteLabel.accentColor || '#2563EB', marginBottom: 6 },
    bulletRow: { display: 'flex', flexDirection: 'row', gap: 6, marginBottom: 4 },
    bulletDot: { fontSize: 10, marginTop: 2 },
    bulletText: { fontSize: 11, lineHeight: 1.4 },
    footer: {
      padding: 16,
      position: 'absolute' as const,
      left: 0, right: 0, bottom: 0,
      backgroundColor: '#f8fafc',
      fontSize: 9, color: '#475569'
    }
  });

  const PdfDocument = cr(Doc, null,
    cr(Pg, { size: 'A4', style: styles.page },
      cr(Vw, { style: styles.header },
        whiteLabel.logoDataUrl ? cr(Img, { style: styles.logo, src: whiteLabel.logoDataUrl }) : null,
        cr(Txt, { style: styles.headerTitle }, whiteLabel.title || 'Monthly Performance Report'),
        whiteLabel.intro ? cr(Txt, { style: styles.headerIntro }, whiteLabel.intro) : null
      ),
      cr(Vw, { style: [styles.content, { paddingBottom: 72 }] },
        ...sections.map((section: string) =>
          cr(Vw, { key: section, style: styles.section },
            cr(Txt, { style: styles.sectionTitle }, formatSectionTitle(section)),
            ...(sectionContent[section]?.bullets || [
              `Key findings and highlights for ${formatSectionTitle(section)} will appear here.`
            ]).map((item: string, idx: number) =>
              cr(Vw, { key: `${section}-${idx}`, style: styles.bulletRow },
                cr(Txt, { style: styles.bulletDot }, '\u2022'),
                cr(Txt, { style: styles.bulletText }, item)
              )
            )
          )
        )
      ),
      cr(Vw, { style: styles.footer, fixed: true },
        cr(Txt, null, whiteLabel.footer || '')
      )
    )
  );

  const pdfBuffer = await renderToBuffer(PdfDocument);
  return Buffer.from(pdfBuffer);
};
