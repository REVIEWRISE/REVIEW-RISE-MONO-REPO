/* eslint-disable import/no-unresolved */
'use client';

import Page from '@/components/layout/page';
import AdsDashboardV2 from '@/views/admin/ads/AdsDashboardV2';

export default function AdsDashboardPage() {
  return (
    <Page titleId="ad-rise.adsDashboard.title">
      <AdsDashboardV2 />
    </Page>
  );
}
