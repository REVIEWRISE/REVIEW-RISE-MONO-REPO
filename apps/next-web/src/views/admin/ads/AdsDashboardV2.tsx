/* eslint-disable import/no-unresolved */
'use client';

import React, { useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Card,
  Chip,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Skeleton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useTranslations } from 'next-intl';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { GridColDef } from '@mui/x-data-grid';
import TableListing from '@/components/shared/listing/list-types/table-listing';

import type { AdsCopyResponse, AdsDashboardSummary, AdsDateRange } from '@platform/contracts';
import { AdsDashboardService } from '@/services/ad-rise/ads-dashboard.service';
import { SERVICES } from '@/configs/services';
import apiClient from '@/lib/apiClient';
import { useLocationFilter } from '@/hooks/useLocationFilter';
import { useBusinessId } from '@/hooks/useBusinessId';
import MetricCard from '@/components/shared/analytics/MetricCard';
import CustomerJourneyFunnel from '@/components/shared/dashboard/widgets/CustomerJourneyFunnel';

const dateOptions: AdsDateRange[] = ['7D', '30D', '90D'];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const isValidUuid = (value: string | null | undefined): value is string =>
  typeof value === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

const formatPercent = (value: number) => `${value.toFixed(1)}%`;

const getDeltaTone = (value: number, positiveIsGood = true) => {
  const isGood = positiveIsGood ? value >= 0 : value <= 0;

  return isGood ? 'success' : 'warning';
};

const formatRoasLabel = (value?: number) => `${value?.toFixed(2) ?? '0.00'}x`;

const formatIndexedCopy = (index: number, value: string) => `${index + 1}. ${value}`;

const toTrendDirection = (delta: number) => (delta > 0 ? 'up' : delta < 0 ? 'down' : 'neutral') as
  | 'up'
  | 'down'
  | 'neutral';

// removed skeleton in favor of MetricCard.loading

export default function AdsDashboardV2() {
  const t = useTranslations('ad-rise.adsDashboard');
  const theme = useTheme();
  const { locationId } = useLocationFilter();
  const { businessId } = useBusinessId();
  const [dateRange, setDateRange] = useState<AdsDateRange>('30D');
  const [selectedTemplate, setSelectedTemplate] = useState('review_booster');
  const [copyOutput, setCopyOutput] = useState<AdsCopyResponse | null>(null);
  const [appliedAlerts, setAppliedAlerts] = useState<Record<string, boolean>>({});
  const safeLocationId = isValidUuid(locationId) ? locationId : undefined;
  const safeBusinessId = isValidUuid(businessId) ? businessId : undefined;

  const adsQuery = useQuery({
    queryKey: ['ads-dashboard', businessId, locationId, dateRange],
    queryFn: () =>
      AdsDashboardService.getSummary({
        businessId: safeBusinessId,
        locationId: safeLocationId,
        dateRange
      }),
    enabled: Boolean(businessId)
  });

  const keywordsQuery = useQuery({
    queryKey: ['ads-dashboard', 'keywords', businessId, locationId],
    queryFn: async () => {
      const response = await apiClient.get<any>(`${SERVICES.seo.url}/keywords`, {
        params: { businessId: safeBusinessId, locationId: safeLocationId, limit: 8 }
      });

      
return response.data ?? [];
    },
    enabled: Boolean(businessId)
  });

  const copyMutation = useMutation({
    mutationFn: (payload: { keywords: string[] }) =>
      AdsDashboardService.generateCopy({
        businessId: safeBusinessId,
        locationId: safeLocationId,
        template: selectedTemplate,
        keywords: payload.keywords
      }),
    onSuccess: (data) => setCopyOutput(data)
  });

  const applyAlertMutation = useMutation({
    mutationFn: (alertId: string) => AdsDashboardService.applyAlert(alertId),
    onSuccess: (data) => setAppliedAlerts(prev => ({ ...prev, [data.alertId]: true }))
  });

  const keywords = useMemo(() => {
    if (!keywordsQuery.data || !Array.isArray(keywordsQuery.data)) return [];

    return keywordsQuery.data
      .map((item: any) => item.keyword)
      .filter(Boolean)
      .slice(0, 6);
  }, [keywordsQuery.data]);

  const summaryResponse = adsQuery.data as
    | AdsDashboardSummary
    | { data: null; unavailable: true; message: string }
    | undefined;

  const isServiceUnavailable = Boolean(summaryResponse && 'unavailable' in summaryResponse);
  const summary = !isServiceUnavailable ? (summaryResponse as AdsDashboardSummary) : undefined;
  const efficiencyWinner = summary?.efficiency?.[0]?.platform || '';

  const roasScore = clamp(Math.round((summary?.roas || 0) * 20), 0, 100);

  const templates = [
    {
      id: 'review_booster',
      title: t('templates.reviewBooster.title'),
      description: t('templates.reviewBooster.description')
    },
    {
      id: 'foot_traffic',
      title: t('templates.footTraffic.title'),
      description: t('templates.footTraffic.description')
    }
  ];

  const funnel = summary?.funnel ?? { impressions: 0, clicks: 0, visits: 0, conversions: 0 };

  const leadLogColumns: GridColDef[] = useMemo(
    () => [
      {
        field: 'type',
        headerName: t('conversion.leadLog.type'),
        flex: 0.8,
        sortable: false,
        renderCell: params => {
          const type: string = params.row.type;
          const typeColor = type === 'Call' ? 'success' : type === 'Form' ? 'primary' : 'secondary';
          
          return <Chip label={type} size="small" color={typeColor as any} variant="outlined" />;
        }
      },
      {
        field: 'source',
        headerName: t('conversion.leadLog.source'),
        flex: 1.6,
        sortable: false
      },
      {
        field: 'value',
        headerName: t('conversion.leadLog.value'),
        flex: 0.8,
        sortable: false,
        renderCell: params =>
          params.row.value ? (
            <Typography variant="body2">{formatCurrency(params.row.value)}</Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {t('conversion.leadLog.na')}
            </Typography>
          )
      },
      {
        field: 'occurredAt',
        headerName: t('conversion.leadLog.time'),
        flex: 1,
        sortable: false,
        renderCell: params => <Typography variant="body2">{new Date(params.row.occurredAt).toLocaleString()}</Typography>
      }
    ],
    [t]
  );

  return (
    <Stack spacing={3}>
      <Box
        sx={{
          p: { xs: 2.5, md: 3.5 },
          borderRadius: 5,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.18)} 0%, ${alpha(
            theme.palette.info.main,
            0.2
          )} 45%, ${alpha(theme.palette.background.paper, 0.96)} 100%)`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          boxShadow: `0 18px 42px ${alpha(theme.palette.primary.main, 0.14)}`
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2.5}>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.2 }}>
              <Avatar
                sx={{
                  width: 34,
                  height: 34,
                  bgcolor: alpha(theme.palette.primary.main, 0.2),
                  color: theme.palette.primary.main,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.32)}`
                }}
              >
                <i className="tabler-badge-ad" />
              </Avatar>
              <Chip size="small" label={t('subtitle')} sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.common.white, 0.65) }} />
            </Stack>
            <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: -0.4 }}>
              {t('title')}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              {t('subtitle')}
            </Typography>
          </Box>
          <ToggleButtonGroup
            value={dateRange}
            exclusive
            onChange={(_, value) => value && setDateRange(value)}
            size="small"
            color="primary"
            sx={{
              '& .MuiToggleButton-root': {
                minHeight: 24,
                height: 24,
                minWidth: 0,
                lineHeight: 1,
                fontSize: '0.74rem'
              }
            }}
          >
            {dateOptions.map(option => (
              <ToggleButton
                key={option}
                value={option}
                sx={{
                  px: 1.1,
                  py: 0,
                  fontWeight: 700,
                  borderColor: alpha(theme.palette.primary.main, 0.35),
                  '&.Mui-selected': {
                    bgcolor: alpha(theme.palette.primary.main, 0.18),
                    borderColor: theme.palette.primary.main
                  }
                }}
              >
                {t(`filters.${option.toLowerCase()}`)}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Stack>
      </Box>

      {isServiceUnavailable && (
        <Card
          sx={{
            p: 3,
            borderRadius: 3,
            border: `1px solid ${theme.palette.warning.light}`,
            bgcolor: alpha(theme.palette.warning.main, 0.08)
          }}
        >
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                {t('status.offlineTitle')}
              </Typography>
              <Typography color="text.secondary">
                {t('status.offlineSubtitle')}
              </Typography>
            </Box>
            <Chip label={t('status.offlineBadge')} color="warning" variant="outlined" />
          </Stack>
        </Card>
      )}

      <Grid container spacing={2.5}>
        <Grid size={4}>
          <MetricCard
            title={t('kpis.totalSpend')}
            value={formatCurrency(summary?.totalSpend || 0)}
            color="primary"
            loading={adsQuery.isLoading}
            trend={{
              value: formatPercent(summary?.deltas.spend || 0),
              direction: toTrendDirection(summary?.deltas.spend || 0),
              label: t('kpis.vsPrevious', { value: '' }) as string
            }}
            icon={<i className="tabler-currency-dollar" />}
          />
        </Grid>
        <Grid size={4}>
          <MetricCard
            title={t('kpis.roas')}
            value={formatRoasLabel(summary?.roas)}
            color="success"
            loading={adsQuery.isLoading}
            trend={{
              value: roasScore,
              direction: 'neutral',
              label: t('kpis.score') as string
            }}
            icon={<i className="tabler-arrow-badge-up" />}
            footer={
              <Typography variant="caption" color="text.secondary">
                {t('kpis.roasHint')}
              </Typography>
            }
          />
        </Grid>
        <Grid size={4}>
          <MetricCard
            title={t('kpis.performanceDelta')}
            value="—"
            color="info"
            loading={adsQuery.isLoading}
            footer={
              <Stack spacing={1.2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">{t('kpis.cpc')}</Typography>
                  <Chip
                    size="small"
                    label={formatPercent(summary?.deltas.cpc || 0)}
                    color={getDeltaTone(summary?.deltas.cpc || 0, false)}
                    variant="outlined"
                  />
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">{t('kpis.ctr')}</Typography>
                  <Chip
                    size="small"
                    label={formatPercent(summary?.deltas.ctr || 0)}
                    color={getDeltaTone(summary?.deltas.ctr || 0)}
                    variant="outlined"
                  />
                </Stack>
              </Stack>
            }
            icon={<i className="tabler-activity" />}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={12}>
          <Card
            sx={{
              p: 3,
              borderRadius: 4,
              height: '100%',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.08)}`
            }}
          >
            <Typography variant="h6" fontWeight={700}>
              {t('blueprint.title')}
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              {t('blueprint.subtitle')}
            </Typography>
            <Grid container spacing={2}>
              {templates.map(template => (
                <Grid size={{ xs: 12, md: 6 }} key={template.id}>
                  <Card
                    onClick={() => setSelectedTemplate(template.id)}
                    sx={{
                      p: 2,
                      borderRadius: 2.5,
                      border: `1px solid ${
                        selectedTemplate === template.id ? theme.palette.primary.main : theme.palette.divider
                      }`,
                      bgcolor:
                        selectedTemplate === template.id
                          ? alpha(theme.palette.primary.main, 0.09)
                          : theme.palette.background.paper,
                      cursor: 'pointer',
                      height: '100%',
                      transition: 'all .2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.16)}`
                      }
                    }}
                  >
                    <Typography fontWeight={700}>{template.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {template.description}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Stack spacing={2}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="h6" fontWeight={700}>
                  {t('copywriter.title')}
                </Typography>
                {copyOutput ? (
                  <Button
                    variant="contained"
                    onClick={() => copyMutation.mutate({ keywords })}
                    disabled={copyMutation.isPending}
                    startIcon={copyMutation.isPending ? <CircularProgress size={16} color="inherit" /> : undefined}
                    sx={{ fontWeight: 700, px: 2.2 }}
                  >
                    {copyMutation.isPending ? t('copywriter.generating') : t('copywriter.generate')}
                  </Button>
                ) : null}
              </Stack>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('copywriter.keywordTitle')}
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
                  {keywords.length === 0 ? (
                    <Chip label={t('copywriter.noKeywords')} size="small" />
                  ) : (
                    keywords.map(keyword => (
                      <Chip key={keyword} label={keyword} size="small" variant="outlined" />
                    ))
                  )}
                </Stack>
              </Box>

              {copyOutput ? (
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography fontWeight={700}>{t('copywriter.headlines')}</Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => navigator.clipboard?.writeText(copyOutput.headlines.join('\n'))}
                          startIcon={<i className="tabler-copy" />}
                          sx={{ fontWeight: 700 }}
                        >
                          {t('copywriter.copyAll')}
                        </Button>
                      </Stack>
                      <Stack spacing={0.75} sx={{ mt: 1 }}>
                        {copyOutput.headlines.map((headline, index) => (
                          <Stack key={`${headline}-${index}`} direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2" sx={{ pr: 1, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {formatIndexedCopy(index, headline)}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => navigator.clipboard?.writeText(headline)}
                              aria-label={t('copywriter.copyToClipboard')}
                              sx={{ border: '1px solid', borderColor: 'divider' }}
                            >
                              <i className="tabler-copy" />
                            </IconButton>
                          </Stack>
                        ))}
                      </Stack>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography fontWeight={700}>{t('copywriter.descriptions')}</Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => navigator.clipboard?.writeText(copyOutput.descriptions.join('\n'))}
                          startIcon={<i className="tabler-copy" />}
                          sx={{ fontWeight: 700 }}
                        >
                          {t('copywriter.copyAll')}
                        </Button>
                      </Stack>
                      <Stack spacing={0.75} sx={{ mt: 1 }}>
                        {copyOutput.descriptions.map((description, index) => (
                          <Stack key={`${description}-${index}`} direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2" sx={{ pr: 1, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {formatIndexedCopy(index, description)}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => navigator.clipboard?.writeText(description)}
                              aria-label={t('copywriter.copyToClipboard')}
                              sx={{ border: '1px solid', borderColor: 'divider' }}
                            >
                              <i className="tabler-copy" />
                            </IconButton>
                          </Stack>
                        ))}
                      </Stack>
                    </Card>
                  </Grid>
                  <Grid size={12}>
                    <Card sx={{ p: 2, borderRadius: 2 }}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography fontWeight={700}>{t('copywriter.primaryText')}</Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => navigator.clipboard?.writeText(copyOutput.primaryTexts.join('\n'))}
                          startIcon={<i className="tabler-copy" />}
                          sx={{ fontWeight: 700 }}
                        >
                          {t('copywriter.copyAll')}
                        </Button>
                      </Stack>
                      <Stack spacing={0.75} sx={{ mt: 1 }}>
                        {copyOutput.primaryTexts.map((text, index) => (
                          <Stack key={`${text}-${index}`} direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2" sx={{ pr: 1, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {formatIndexedCopy(index, text)}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => navigator.clipboard?.writeText(text)}
                              aria-label={t('copywriter.copyToClipboard')}
                              sx={{ border: '1px solid', borderColor: 'divider' }}
                            >
                              <i className="tabler-copy" />
                            </IconButton>
                          </Stack>
                        ))}
                      </Stack>
                      {Array.isArray(copyOutput.keywordsUsed) && copyOutput.keywordsUsed.length > 0 && (
                        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 2 }}>
                          <Chip label={t('copywriter.keywordTitle')} size="small" />
                          {copyOutput.keywordsUsed.map(k => (
                            <Chip key={k} label={k} size="small" variant="outlined" />
                          ))}
                        </Stack>
                      )}
                    </Card>
                  </Grid>
                </Grid>
              ) : (
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: `1px dashed ${alpha(theme.palette.primary.main, 0.35)}`,
                    bgcolor: alpha(theme.palette.primary.main, 0.06),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                    flexDirection: { xs: 'column', md: 'row' }
                  }}
                >
                  <Stack spacing={1.2} sx={{ flex: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar
                        variant="rounded"
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: alpha(theme.palette.primary.main, 0.15),
                          color: theme.palette.primary.main,
                          border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
                        }}
                      >
                        <i className="tabler-sparkles" />
                      </Avatar>
                      <Typography fontWeight={700}>{t('copywriter.title')}</Typography>
                    </Stack>
                    <Typography color="text.secondary">
                      {t('copywriter.placeholder')}
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Chip label={t('copywriter.headlines')} size="small" variant="outlined" />
                      <Chip label={t('copywriter.descriptions')} size="small" variant="outlined" />
                      <Chip label={t('copywriter.primaryText')} size="small" variant="outlined" />
                    </Stack>
                  </Stack>
                  <Button
                    variant="contained"
                    onClick={() => copyMutation.mutate({ keywords })}
                    disabled={copyMutation.isPending}
                    startIcon={copyMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <i className="tabler-wand" />}
                    sx={{ fontWeight: 700, px: 2.6, flexShrink: 0 }}
                  >
                    {copyMutation.isPending ? t('copywriter.generating') : t('copywriter.generate')}
                  </Button>
                </Box>
              )}
            </Stack>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card
            sx={{
              p: 3,
              borderRadius: 4,
              height: '100%',
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
            }}
          >
            <Typography variant="h6" fontWeight={700}>
              {t('comparison.title')}
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              {t('comparison.subtitle')}
            </Typography>
            {adsQuery.isLoading ? (
              <Stack spacing={2}>
                <Skeleton variant="rectangular" height={120} />
                <Skeleton variant="rectangular" height={120} />
              </Stack>
            ) : (
              <Stack spacing={2}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <MetricCard
                      title={t('comparison.google.title')}
                      value={formatPercent(summary?.google?.ctr || 0)}
                      color="info"
                      icon={<i className="tabler-brand-google" />}
                      footer={
                        <Stack direction="row" spacing={2}>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              {t('comparison.google.impressionShare')}
                            </Typography>
                            <Typography fontWeight={700}>
                              {formatPercent(summary?.google.impressionShare || 0)}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              {t('comparison.google.keywords')}
                            </Typography>
                            <Typography fontWeight={700}>{summary?.google.keywords}</Typography>
                          </Box>
                        </Stack>
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <MetricCard
                      title={t('comparison.meta.title')}
                      value={summary?.meta?.frequency?.toFixed(2) ?? '0.00'}
                      color="secondary"
                      icon={<i className="tabler-brand-meta" />}
                      footer={
                        <Stack direction="row" spacing={2}>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              {t('comparison.meta.reach')}
                            </Typography>
                            <Typography fontWeight={700}>{summary?.meta.reach}</Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              {t('comparison.meta.engagement')}
                            </Typography>
                            <Typography fontWeight={700}>{summary?.meta.engagement}</Typography>
                          </Box>
                        </Stack>
                      }
                    />
                  </Grid>
                </Grid>
 
                <Divider />
 
                <Box>
                  <Typography fontWeight={700}>{t('comparison.leaderboard')}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                    {t('comparison.leaderboardHint')}
                  </Typography>
                  <Stack spacing={1.5} sx={{ mt: 1 }}>
                    {(summary?.efficiency || []).map(entry => (
                      <Box key={entry.platform}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" fontWeight={600}>
                            {entry.platform}
                          </Typography>
                          <Stack direction="row" spacing={1} alignItems="center">
                            {entry.platform === efficiencyWinner && (
                              <Chip label={t('comparison.winner')} size="small" color="success" />
                            )}
                            <Typography variant="body2">{formatCurrency(entry.cpl)}</Typography>
                          </Stack>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={clamp(100 - entry.cpl * 3, 10, 100)}
                          sx={{ mt: 0.75, height: 8, borderRadius: 999 }}
                        />
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </Stack>
            )}
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card
            sx={{
              p: 3,
              borderRadius: 4,
              height: '100%',
              border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`
            }}
          >
            <Typography variant="h6" fontWeight={700}>
              {t('optimization.title')}
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              {t('optimization.subtitle')}
            </Typography>
            <Stack spacing={2}>
              {(summary?.optimizationFeed || []).map(alert => (
                <Card
                  key={alert.id}
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    border: `1px solid ${theme.palette.divider}`,
                    background:
                      alert.severity === 'high'
                        ? alpha(theme.palette.error.main, 0.05)
                        : alert.severity === 'medium'
                          ? alpha(theme.palette.warning.main, 0.06)
                          : alpha(theme.palette.info.main, 0.05)
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                    <Box>
                      <Typography fontWeight={700}>{alert.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {alert.impact}
                      </Typography>
                    </Box>
                    <Chip label={t(`optimization.severity.${alert.severity}`)} size="small" />
                  </Stack>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {alert.recommendation}
                  </Typography>
                  {alert.steps && alert.steps.length > 0 && (
                    <Stack spacing={0.5} sx={{ mt: 1 }}>
                      {alert.steps.map(step => (
                        <Typography key={step} variant="caption" color="text.secondary">
                          {step}
                        </Typography>
                      ))}
                    </Stack>
                  )}
                  {alert.actionType === 'apply' ? (
                    <Button
                      size="small"
                      variant="contained"
                      sx={{ mt: 1 }}
                      disabled={appliedAlerts[alert.id]}
                      onClick={() => applyAlertMutation.mutate(alert.id)}
                    >
                      {appliedAlerts[alert.id] ? t('optimization.applied') : alert.actionLabel}
                    </Button>
                  ) : (
                    <Chip label={alert.actionLabel} size="small" sx={{ mt: 1, alignSelf: 'flex-start' }} />
                  )}
                </Card>
              ))}
            </Stack>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={12}>
          <Card
            sx={{
              p: 3,
              borderRadius: 4,
              height: '100%',
              border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
            }}
          >
            <Typography variant="h6" fontWeight={700}>
              {t('conversion.title')}
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              {t('conversion.subtitle')}
            </Typography>
            <Stack spacing={2}>
              <CustomerJourneyFunnel
                isLoading={adsQuery.isLoading}
                steps={[
                  { icon: 'tabler-eye', label: t('conversion.funnel.impressions'), value: funnel.impressions, color: theme.palette.info.main },
                  { icon: 'tabler-click', label: t('conversion.funnel.clicks'), value: funnel.clicks, color: theme.palette.primary.main },
                  { icon: 'tabler-user', label: t('conversion.funnel.visits'), value: funnel.visits, color: theme.palette.warning.main },
                  { icon: 'tabler-check', label: t('conversion.funnel.conversions'), value: funnel.conversions, color: theme.palette.success.main }
                ]}
                title={t('conversion.funnel.title')}
                subtitle={t('conversion.funnel.subtitle')}
              />
              <Card
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
                  bgcolor: alpha(theme.palette.background.paper, 1)
                }}
              >
                <Typography fontWeight={700} sx={{ mb: 1 }}>
                  {t('conversion.leadLog.title')}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <TableListing
                    columns={leadLogColumns}
                    items={(summary?.leadLog || []) as any}
                    isLoading={adsQuery.isLoading}
                  />
                </Box>
              </Card>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}
