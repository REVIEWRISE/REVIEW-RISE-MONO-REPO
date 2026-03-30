/* eslint-disable import/no-unresolved */
'use client';

import { useState, useEffect, useCallback } from 'react';

import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { useTranslations } from 'next-intl';

import { BrandService, type ScheduledPost, type PublishingLog, type BrandScore, type BrandRecommendation, type Competitor, type BrandDNA } from '@/services/brand.service';
import { useBusinessId } from '@/hooks/useBusinessId';
import DashboardLineChart from '@/components/shared/dashboard/DashboardLineChart';
import DashboardDonutChart from '@/components/shared/dashboard/DashboardDonutChart';
import LinearProgress from '@mui/material/LinearProgress';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';

const Icon = ({ icon, fontSize, ...rest }: { icon: string; fontSize?: number;[key: string]: any }) => {
    return <i className={icon} style={{ fontSize }} {...rest} />
}

const SocialRiseOverviewPage = () => {
    const theme = useTheme();
    const router = useRouter();
    const t = useTranslations('dashboard');
    const ts = useTranslations('social.overview');
    const { businessId } = useBusinessId();

    const [stats, setStats] = useState({
        totalScheduled: 0,
        publishedLast30: 0,
        failedLast30: 0,
    });

    const [recentPosts, setRecentPosts] = useState<ScheduledPost[]>([]);
    const [recentLogs, setRecentLogs] = useState<PublishingLog[]>([]);
    const [brandScores, setBrandScores] = useState<BrandScore | null>(null);
    const [recommendations, setRecommendations] = useState<BrandRecommendation[]>([]);
    const [competitors, setCompetitors] = useState<Competitor[]>([]);
    const [brandDNA, setBrandDNA] = useState<BrandDNA | null>(null);
    const [seasonalEvents, setSeasonalEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [chartData, setChartData] = useState<{
        activitySeries: { name: string; data: number[] }[];
        activityCategories: string[];
        platformSeries: number[];
        platformLabels: string[];
    }>({
        activitySeries: [],
        activityCategories: [],
        platformSeries: [],
        platformLabels: [],
    });

    const isDark = theme.palette.mode === 'dark';

    const fetchData = useCallback(async () => {
        if (!businessId) return;
        setLoading(true);

        const ensureArray = (data: any): any[] => {
            if (!data) return [];
            if (Array.isArray(data)) return data;
            if (data.data && Array.isArray(data.data)) return data.data;
            return [];
        };

        try {
            const [postsRaw, logsRaw, scores, recsRaw, compsRaw, dna, eventsRaw] = await Promise.all([
                BrandService.listScheduledPosts(businessId),
                BrandService.listPublishingLogs(businessId, {
                    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                }),
                BrandService.getBrandScores(businessId),
                BrandService.getRecommendations(businessId, { status: 'open' }),
                BrandService.listCompetitors(businessId),
                BrandService.getDNA(businessId),
                BrandService.listPlannerEvents(businessId, new Date().getMonth() + 1, new Date().getFullYear())
            ]);

            const posts = ensureArray(postsRaw);
            const logs = ensureArray(logsRaw);
            const recs = ensureArray(recsRaw);
            const comps = ensureArray(compsRaw);
            const events = ensureArray(eventsRaw);

            // Stats
            setStats({
                totalScheduled: posts.filter(p => p.status === 'scheduled').length,
                publishedLast30: logs.filter(l => l.status === 'completed').length,
                failedLast30: logs.filter(l => l.status === 'failed').length,
            });

            // Activity Chart (Last 14 days)
            const last14Days = [...Array(14)].map((_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (13 - i));
                return d.toISOString().split('T')[0];
            });

            const activityMap = logs.reduce((acc, log) => {
                const date = new Date(log.updatedAt).toISOString().split('T')[0];
                if (!acc[date]) acc[date] = { completed: 0, failed: 0 };
                if (log.status === 'completed') acc[date].completed++;
                if (log.status === 'failed') acc[date].failed++;
                return acc;
            }, {} as Record<string, { completed: number; failed: number }>);

            const completedData = last14Days.map(date => activityMap[date]?.completed || 0);
            const failedData = last14Days.map(date => activityMap[date]?.failed || 0);

            // Platform Distribution
            const platformCounts = posts.reduce((acc, post) => {
                const ALL_SUPPORTED_PLATFORMS = ['INSTAGRAM', 'FACEBOOK', 'LINKEDIN', 'TWITTER', 'GOOGLE_BUSINESS'];
                const normalizedPlatforms = (post.platforms || []).reduce((pAcc: string[], curr: string) => {
                    if (typeof curr === 'string' && (curr.toUpperCase() === 'ALL PLATFORMS' || curr.toUpperCase() === 'ALL_PLATFORMS')) {
                        return [...pAcc, ...ALL_SUPPORTED_PLATFORMS];
                    }
                    if (typeof curr === 'string' && curr.includes(',')) {
                        const split = curr.split(',').map(p => p.trim());
                        return [...pAcc, ...split.reduce((spAcc: string[], p) => {
                            if (p.toUpperCase() === 'ALL PLATFORMS' || p.toUpperCase() === 'ALL_PLATFORMS') {
                                return [...spAcc, ...ALL_SUPPORTED_PLATFORMS];
                            }
                            const normalized = p.toUpperCase().replace(/\s+/g, '_');
                            const finalPlatform = normalized === 'X' ? 'TWITTER' : normalized;
                            return [...spAcc, finalPlatform];
                        }, [])];
                    }
                    const normalized = curr.toUpperCase().replace(/\s+/g, '_');
                    const finalPlatform = normalized === 'X' ? 'TWITTER' : normalized;
                    return [...pAcc, finalPlatform];
                }, []);

                const uniquePlatforms = Array.from(new Set(normalizedPlatforms)) as string[];
                uniquePlatforms.forEach((p) => {
                    acc[p] = (acc[p] || 0) + 1;
                });
                return acc;
            }, {} as Record<string, number>);

            setChartData({
                activitySeries: [
                    { name: ts('charts.successful'), data: completedData },
                    { name: ts('charts.failed'), data: failedData }
                ],
                activityCategories: last14Days.map(d => new Date(d).toLocaleDateString([], { month: 'short', day: 'numeric' })),
                platformSeries: Object.values(platformCounts),
                platformLabels: Object.keys(platformCounts),
            });

            setRecentPosts(posts.sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()).slice(0, 5));
            setRecentLogs(logs.slice(0, 5));
            setBrandScores(scores);
            setRecommendations(recs.slice(0, 3));
            setCompetitors(comps.slice(0, 5));
            setBrandDNA(dna);
            setSeasonalEvents(events.slice(0, 3));
        } catch (error) {
            console.error('Failed to fetch social overview data', error);
        } finally {
            setLoading(false);
        }
    }, [businessId, ts]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Helper Components
    const StatCard = ({ title, value, icon, color }: { title: string; value: number | string; icon: string; color: string }) => (
        <Card sx={{
            height: '100%',
            bgcolor: isDark ? alpha(color, 0.05) : alpha(color, 0.02),
            border: `1px solid ${alpha(color, 0.1)}`,
            borderRadius: '16px',
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-4px)' }
        }}>
            <CardContent sx={{ p: 5 }}>
                <Stack direction="row" spacing={4} alignItems="center">
                    <Box sx={{
                        p: 2,
                        borderRadius: '12px',
                        bgcolor: alpha(color, 0.1),
                        color: color,
                        display: 'flex'
                    }}>
                        <Icon icon={icon} fontSize={24} />
                    </Box>
                    <Box>
                        <Typography variant="h4" fontWeight="800">{value}</Typography>
                        <Typography variant="body2" color="text.secondary" fontWeight="500">
                            {title}
                        </Typography>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );

    const ScoreItem = ({ label, score, color }: { label: string; score: number; color: string }) => (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle2" fontWeight="700">{label}</Typography>
                <Typography variant="subtitle2" fontWeight="800" color={color}>{score}%</Typography>
            </Box>
            <LinearProgress
                variant="determinate"
                value={score}
                sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: alpha(color, 0.1),
                    '& .MuiLinearProgress-bar': { bgcolor: color }
                }}
            />
        </Box>
    );

    const RecommendationCard = ({ rec }: { rec: BrandRecommendation }) => (
        <Box sx={{
            p: 4,
            borderRadius: '16px',
            bgcolor: isDark ? alpha(theme.palette.primary.main, 0.05) : alpha(theme.palette.primary.main, 0.02),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            position: 'relative',
            overflow: 'hidden'
        }}>
            <Stack direction="row" spacing={4} alignItems="flex-start">
                <Avatar sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    width: 40,
                    height: 40
                }}>
                    <Icon icon="tabler-bulb" fontSize={20} />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight="800" sx={{ mb: 1 }}>{rec.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {rec.description}
                    </Typography>
                    <Stack direction="row" spacing={2}>
                        <Chip
                            label={rec.impact.toUpperCase()}
                            size="small"
                            color={rec.impact === 'high' || rec.impact === 'critical' ? 'error' : 'primary'}
                            variant="tonal"
                            sx={{ fontWeight: 800, fontSize: '0.65rem' }}
                        />
                        <Chip
                            label={`${rec.confidence * 100}% Confidence`}
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 800, fontSize: '0.65rem' }}
                        />
                    </Stack>
                </Box>
            </Stack>
        </Box>
    );

    const CompetitorCard = ({ competitor }: { competitor: Competitor }) => (
        <Box sx={{
            p: 4,
            borderRadius: '16px',
            bgcolor: isDark ? alpha(theme.palette.common.white, 0.03) : alpha(theme.palette.common.black, 0.02),
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            mb: 4
        }}>
            <Stack direction="row" spacing={4} alignItems="center">
                <Avatar src={competitor.logo} sx={{ width: 40, height: 40, bgcolor: 'primary.light' }}>
                    {competitor.name.charAt(0)}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" fontWeight="700">{competitor.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{competitor.website}</Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="subtitle2" fontWeight="800" color="primary.main">
                        {competitor.relevanceScore || 85}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Visibility</Typography>
                </Box>
            </Stack>
        </Box>
    );

    if (loading) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                width: '100%',
                bgcolor: isDark ? 'background.default' : '#F8F9FA'
            }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{
            width: '100%',
            p: { xs: 4, sm: 6, md: 8 },
            minHeight: '100vh',
            bgcolor: isDark ? 'background.default' : '#F8F9FA'
        }}>
            {/* Header Section */}
            <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', lg: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', lg: 'flex-end' },
                mb: 8,
                gap: 4
            }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                        <Box sx={{
                            p: 1.5,
                            borderRadius: '12px',
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                            display: 'flex'
                        }}>
                            <Icon icon="tabler-chart-pie" fontSize={24} />
                        </Box>
                        <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '1px' }}>
                            {ts('studio')}
                        </Typography>
                    </Box>
                    <Typography variant="h2" fontWeight="800" sx={{ mb: 1.5, letterSpacing: '-1.5px', lineHeight: 1.1 }}>
                        {t('navigation.social-overview', { defaultValue: 'Overview' })}
                    </Typography>
                    <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, opacity: 0.7, maxWidth: 600, lineHeight: 1.5 }}>
                        {ts('description')}
                    </Typography>
                </Box>
            </Box>

            {/* Stats Grid */}
            <Grid container spacing={6} sx={{ mb: 8 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <StatCard
                        title={ts('stats.scheduledPosts')}
                        value={stats.totalScheduled}
                        icon="tabler-calendar-check"
                        color={theme.palette.primary.main}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <StatCard
                        title={ts('stats.published30d')}
                        value={stats.publishedLast30}
                        icon="tabler-circle-check"
                        color={theme.palette.success.main}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <StatCard
                        title={ts('stats.failedPosts')}
                        value={stats.failedLast30}
                        icon="tabler-alert-circle"
                        color={theme.palette.error.main}
                    />
                </Grid>
            </Grid>

            {/* Performance & Health Section */}
            <Grid container spacing={6} sx={{ mb: 8 }}>
                <Grid size={{ xs: 12, lg: 8 }}>
                    <DashboardLineChart
                        title={ts('charts.performanceTitle')}
                        subtitle={ts('charts.performanceSubtitle')}
                        series={chartData.activitySeries}
                        categories={chartData.activityCategories}
                    />
                </Grid>
                <Grid size={{ xs: 12, lg: 4 }}>
                    <Card sx={{
                        height: '100%',
                        boxShadow: isDark ? 'none' : '0 20px 60px 0 rgba(0, 0, 0, 0.03)',
                        border: `1px solid ${isDark ? theme.palette.divider : alpha(theme.palette.divider, 0.6)}`,
                        borderRadius: '24px',
                        bgcolor: 'background.paper'
                    }}>
                        <CardContent sx={{ p: 6 }}>
                            <Typography variant="h4" fontWeight="800" sx={{ mb: 6 }}>Brand Health</Typography>
                            <Stack spacing={6}>
                                <ScoreItem
                                    label="Visibility Score"
                                    score={brandScores?.visibilityScore || 0}
                                    color={theme.palette.primary.main}
                                />
                                <ScoreItem
                                    label="Trust & Reputation"
                                    score={brandScores?.trustScore || 0}
                                    color={theme.palette.success.main}
                                />
                                <ScoreItem
                                    label="Content Consistency"
                                    score={brandScores?.consistencyScore || 0}
                                    color={theme.palette.warning.main}
                                />

                                <Divider sx={{ my: 2 }} />

                                <Box sx={{ p: 4, borderRadius: '16px', bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                                    <Typography variant="caption" fontWeight="800" color="primary.main" display="block" sx={{ mb: 1, textTransform: 'uppercase' }}>
                                        AI Summary
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                                        "Your brand visibility is up 12% this month, primarily driven by consistent daily updates on Google Business."
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Growth & Distribution Section */}
            <Grid container spacing={6} sx={{ mb: 8 }}>
                <Grid size={{ xs: 12, lg: 8 }}>
                    <Card sx={{
                        boxShadow: isDark ? 'none' : '0 20px 60px 0 rgba(0, 0, 0, 0.03)',
                        border: `1px solid ${isDark ? theme.palette.divider : alpha(theme.palette.divider, 0.6)}`,
                        borderRadius: '24px',
                        bgcolor: 'background.paper',
                        height: '100%'
                    }}>
                        <CardContent sx={{ p: 8 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 6 }}>
                                <Box>
                                    <Typography variant="h4" fontWeight="800">Growth Opportunities</Typography>
                                    <Typography variant="body2" color="text.secondary">AI-driven recommendations for your brand</Typography>
                                </Box>
                                <Button variant="tonal" size="small" onClick={() => router.push('./brand-strategist')}>
                                    Full Strategy
                                </Button>
                            </Stack>

                            <Grid container spacing={4}>
                                {recommendations.length > 0 ? (
                                    recommendations.map((rec) => (
                                        <Grid key={rec.id} size={{ xs: 12, md: 4 }}>
                                            <RecommendationCard rec={rec} />
                                        </Grid>
                                    ))
                                ) : (
                                    <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 8, width: '100%' }}>
                                        No new recommendations at this time.
                                    </Typography>
                                )}
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, lg: 4 }}>
                    <DashboardDonutChart
                        title={ts('charts.distributionTitle')}
                        subtitle={ts('charts.distributionSubtitle')}
                        series={chartData.platformSeries}
                        labels={chartData.platformLabels}
                    />
                </Grid>
            </Grid>

            {/* Main Content Grid */}
            <Grid container spacing={8}>
                <Grid size={{ xs: 12, lg: 8 }}>
                    <Card sx={{
                        boxShadow: isDark ? 'none' : '0 20px 60px 0 rgba(0, 0, 0, 0.03)',
                        border: `1px solid ${isDark ? theme.palette.divider : alpha(theme.palette.divider, 0.6)}`,
                        borderRadius: '24px',
                        overflow: 'hidden',
                        bgcolor: 'background.paper'
                    }}>
                        <CardContent sx={{ p: 8 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={6}>
                                <Typography variant="h4" fontWeight="800">{ts('upcoming.title')}</Typography>
                                <Typography
                                    variant="button"
                                    color="primary"
                                    sx={{ cursor: 'pointer', fontWeight: 700 }}
                                    onClick={() => router.push('../social-rise?tab=calendar')}
                                >
                                    {ts('upcoming.contentMessaging')}
                                </Typography>
                            </Stack>

                            <Stack spacing={4}>
                                {recentPosts.length > 0 ? (
                                    recentPosts.map((post) => (
                                        <Box key={post.id} sx={{
                                            p: 4,
                                            borderRadius: '16px',
                                            bgcolor: isDark ? alpha(theme.palette.common.white, 0.03) : alpha(theme.palette.common.black, 0.02),
                                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                                        }}>
                                            <Stack direction="row" spacing={4} alignItems="center">
                                                <Box sx={{
                                                    p: 2,
                                                    borderRadius: '10px',
                                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                    color: theme.palette.primary.main,
                                                    display: 'flex'
                                                }}>
                                                    <Icon icon="tabler-calendar-event" fontSize={20} />
                                                </Box>
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography variant="subtitle1" fontWeight="700" noWrap>
                                                        {post.content.title || post.content.text.substring(0, 50)}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {ts('upcoming.scheduledFor', {
                                                            date: new Date(post.scheduledAt).toLocaleDateString(),
                                                            time: new Date(post.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                        })}
                                                    </Typography>
                                                </Box>
                                                <Stack direction="row" spacing={1}>
                                                    {post.platforms.map(p => (
                                                        <Chip
                                                            key={p}
                                                            label={p}
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{ fontSize: '0.65rem', fontWeight: 700 }}
                                                        />
                                                    ))}
                                                </Stack>
                                            </Stack>
                                        </Box>
                                    ))
                                ) : (
                                    <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                                        {ts('upcoming.noPosts')}
                                    </Typography>
                                )}
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, lg: 4 }}>
                    <Card sx={{
                        boxShadow: isDark ? 'none' : '0 20px 60px 0 rgba(0, 0, 0, 0.03)',
                        border: `1px solid ${isDark ? theme.palette.divider : alpha(theme.palette.divider, 0.6)}`,
                        borderRadius: '24px',
                        overflow: 'hidden',
                        bgcolor: 'background.paper',
                        height: '100%',
                        maxHeight: 600
                    }}>
                        <CardContent sx={{ p: 8 }}>
                            <Typography variant="h4" fontWeight="800" sx={{ mb: 6 }}>Competitor Visibility</Typography>
                            {competitors.length > 0 ? (
                                competitors.map((comp) => (
                                    <CompetitorCard key={comp.id} competitor={comp} />
                                ))
                            ) : (
                                <Typography variant="body2" color="text.secondary" textAlign="center" py={8}>
                                    No competitors added yet.
                                </Typography>
                            )}
                            <Divider sx={{ my: 6 }} />
                            <Button
                                fullWidth
                                variant="outlined"
                                color="primary"
                                onClick={() => router.push('./brand-rise/competitors')}
                                startIcon={<Icon icon="tabler-plus" />}
                            >
                                Manage Competitors
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Bottom Row: DNA & Logs */}
            <Grid container spacing={8} sx={{ mt: 0 }}>
                <Grid size={{ xs: 12, lg: 8 }}>
                    <Card sx={{
                        boxShadow: isDark ? 'none' : '0 20px 60px 0 rgba(0, 0, 0, 0.03)',
                        border: `1px solid ${isDark ? theme.palette.divider : alpha(theme.palette.divider, 0.6)}`,
                        borderRadius: '24px',
                        bgcolor: 'background.paper'
                    }}>
                        <CardContent sx={{ p: 8 }}>
                            <Typography variant="h4" fontWeight="800" sx={{ mb: 6 }}>{ts('logs.title')}</Typography>
                            <Stack spacing={4}>
                                {recentLogs.length > 0 ? (
                                    recentLogs.map((log) => (
                                        <Box key={log.id} sx={{ pb: 4, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`, '&:last-child': { borderBottom: 'none', pb: 0 } }}>
                                            <Stack direction="row" spacing={3} alignItems="flex-start">
                                                <Box sx={{
                                                    mt: 0.5,
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: '50%',
                                                    bgcolor: log.status === 'completed' ? 'success.main' : log.status === 'failed' ? 'error.main' : 'warning.main',
                                                    flexShrink: 0
                                                }} />
                                                <Box>
                                                    <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 0.5 }}>
                                                        {ts('logs.publishing', { platform: log.platform })}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                                                        {new Date(log.updatedAt).toLocaleDateString()}
                                                    </Typography>
                                                    <Chip
                                                        label={log.status}
                                                        size="small"
                                                        color={log.status === 'completed' ? 'success' : log.status === 'failed' ? 'error' : 'warning'}
                                                        variant="tonal"
                                                        sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase' }}
                                                    />
                                                </Box>
                                            </Stack>
                                        </Box>
                                    ))
                                ) : (
                                    <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                                        {ts('logs.noLogs')}
                                    </Typography>
                                )}
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, lg: 4 }}>
                    <Stack spacing={6}>
                        <Card sx={{
                            boxShadow: isDark ? 'none' : '0 20px 60px 0 rgba(0, 0, 0, 0.03)',
                            border: `1px solid ${isDark ? theme.palette.divider : alpha(theme.palette.divider, 0.6)}`,
                            borderRadius: '24px',
                            bgcolor: isDark ? alpha(theme.palette.primary.main, 0.05) : alpha(theme.palette.primary.main, 0.02),
                        }}>
                            <CardContent sx={{ p: 6 }}>
                                <Typography variant="h5" fontWeight="800" sx={{ mb: 4, color: 'primary.main' }}>Brand Identity</Typography>
                                <Typography variant="caption" fontWeight="800" sx={{ opacity: 0.6, letterSpacing: 1 }}>TARGET AUDIENCE</Typography>
                                <Typography variant="body2" fontWeight="600" sx={{ mb: 4 }}>{brandDNA?.audience || 'Not defined'}</Typography>
                                <Divider sx={{ my: 4, opacity: 0.1 }} />
                                <Typography variant="caption" fontWeight="800" sx={{ opacity: 0.6, letterSpacing: 1 }}>BRAND VOICE</Typography>
                                <Typography variant="body2" fontWeight="600">{brandDNA?.voice || 'Not defined'}</Typography>
                            </CardContent>
                        </Card>

                        <Card sx={{
                            boxShadow: isDark ? 'none' : '0 20px 60px 0 rgba(0, 0, 0, 0.03)',
                            border: `1px solid ${isDark ? theme.palette.divider : alpha(theme.palette.divider, 0.6)}`,
                            borderRadius: '24px',
                            bgcolor: 'background.paper'
                        }}>
                            <CardContent sx={{ p: 6 }}>
                                <Typography variant="h5" fontWeight="800" sx={{ mb: 4 }}>Upcoming Moments</Typography>
                                <Stack spacing={4}>
                                    {seasonalEvents.length > 0 ? (
                                        seasonalEvents.map((event, idx) => (
                                            <Box key={idx}>
                                                <Typography variant="subtitle2" fontWeight="800">{event.title}</Typography>
                                                <Typography variant="caption" color="text.secondary">{new Date(event.startDate).toLocaleDateString([], { month: 'long', day: 'numeric' })}</Typography>
                                            </Box>
                                        ))
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">No upcoming seasonal moments.</Typography>
                                    )}
                                </Stack>
                            </CardContent>
                        </Card>
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
};

export default SocialRiseOverviewPage;
