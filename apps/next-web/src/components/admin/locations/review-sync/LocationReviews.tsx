'use client';

import { useEffect, useState } from 'react';

import { useParams, useRouter, useSearchParams } from 'next/navigation';

import FacebookIcon from '@mui/icons-material/Facebook';
import GoogleIcon from '@mui/icons-material/Google';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import ReplyOutlinedIcon from '@mui/icons-material/ReplyOutlined';
import StarIcon from '@mui/icons-material/Star';
import SyncIcon from '@mui/icons-material/Sync';
import {
    alpha,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    Grid,
    Rating,
    Skeleton,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';
import { useTranslations } from 'next-intl';

import CustomChip from '@core/components/mui/Chip';

import apiClient from '@/lib/apiClient';
import { SERVICES_CONFIG } from '@/configs/services';
import { resolveLocationIdFromParams } from '@/utils/locationId';

const REVIEWS_API_URL = SERVICES_CONFIG.review.url;

interface Review {
    id: string;
    platform: string;
    author: string;
    rating: number;
    content: string;
    publishedAt: string;
    response?: string;
}

const PlatformIcon = ({ platform }: { platform: string }) => {
    switch (platform.toLowerCase()) {
        case 'google':
        case 'gbp':
            return <GoogleIcon fontSize="small" color="info" />;
        case 'facebook':
            return <FacebookIcon fontSize="small" color="primary" />;
        case 'yelp':
            return <StarIcon fontSize="small" color="error" />;
        default:
            return <StarIcon fontSize="small" color="action" />;
    }
};

const getSentiment = (rating: number): { label: string; color: 'success' | 'info' | 'error' } => {
    if (rating >= 4) return { label: 'positive', color: 'success' };
    if (rating === 3) return { label: 'neutral', color: 'info' };
    
return { label: 'negative', color: 'error' };
};

const formatReviewDate = (date: string) =>
    new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

const normalizeReviews = (payload: unknown): Review[] => {
    if (Array.isArray(payload)) {
        return payload;
    }

    if (payload && typeof payload === 'object') {
        const record = payload as Record<string, unknown>;

        if (Array.isArray(record.data)) {
            return record.data as Review[];
        }

        if (Array.isArray(record.reviews)) {
            return record.reviews as Review[];
        }
    }

    return [];
};

const ReviewCardSkeleton = () => (
    <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <CardContent>
            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                <Skeleton variant="circular" width={40} height={40} />
                <Box sx={{ flex: 1 }}>
                    <Skeleton width="30%" height={24} />
                    <Skeleton width="50%" height={18} sx={{ mt: 0.5 }} />
                </Box>
            </Stack>
            <Skeleton height={60} />
        </CardContent>
    </Card>
);

const LocationReviews = () => {
    const theme = useTheme();
    const t = useTranslations('dashboard');
    const tc = useTranslations('common');
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const locationId = resolveLocationIdFromParams(params.id);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    const goToSources = () => {
        const nextParams = new URLSearchParams(searchParams.toString());

        nextParams.set('tab', 'sources');
        router.replace(`?${nextParams.toString()}`);
    };

    useEffect(() => {
        if (!locationId) return;

        const fetchReviews = async () => {
            try {
                const res = await apiClient.get<Review[] | { reviews?: Review[]; data?: Review[] }>(
                    `${REVIEWS_API_URL}/locations/${locationId}/reviews`,
                    { params: { limit: 50 } }
                );

                setReviews(normalizeReviews(res.data));
            } catch (error) {
                console.error('Failed to fetch reviews', error);
                setReviews([]);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [locationId]);

    if (loading) {
        return (
            <Stack spacing={2}>
                <ReviewCardSkeleton />
                <ReviewCardSkeleton />
            </Stack>
        );
    }

    if (reviews.length === 0) {
        return (
            <Card
                sx={{
                    border: '1px dashed',
                    borderColor: 'divider',
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                }}
            >
                <CardContent sx={{ textAlign: 'center', py: 6, px: 3 }}>
                    <Box
                        sx={{
                            width: 64,
                            height: 64,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 2,
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                            color: 'primary.main',
                        }}
                    >
                        <RateReviewOutlinedIcon sx={{ fontSize: 32 }} />
                    </Box>
                    <Typography variant="h6" gutterBottom>
                        {t('reviews.smart.noSyncedReviewsLocation')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420, mx: 'auto', mb: 3 }}>
                        {t('reviews.smart.noSyncedReviews')}
                    </Typography>
                    <Button variant="contained" color="primary" startIcon={<SyncIcon />} onClick={goToSources}>
                        {t('reviews.smart.connectToSync')}
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Stack spacing={3}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h5" fontWeight={600}>
                        {t('reviews.title')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {t('reviews.smart.manageSubtitle')}
                    </Typography>
                </Box>
                <Chip
                    label={t('reviews.smart.reviewsCount', { count: reviews.length })}
                    color="primary"
                    variant="tonal"
                    size="small"
                    sx={{ fontWeight: 600 }}
                />
            </Box>

            <Grid container spacing={2}>
                {reviews.map((review) => {
                    const sentiment = getSentiment(review.rating);
                    const hasReply = Boolean(review.response);
                    const authorName = review.author || t('reviews.smart.anonymous');

                    return (
                        <Grid size={12} key={review.id}>
                            <Card
                                sx={{
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 2,
                                    bgcolor: 'background.paper',
                                    transition: 'box-shadow 0.2s ease',
                                    '&:hover': { boxShadow: theme.shadows[2] },
                                }}
                            >
                                <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                                        <Box sx={{ display: 'flex', gap: 2, minWidth: 0 }}>
                                            <Avatar
                                                alt={authorName}
                                                sx={{
                                                    bgcolor: 'primary.lighter',
                                                    color: 'primary.main',
                                                    fontWeight: 700,
                                                }}
                                            >
                                                {authorName.charAt(0)}
                                            </Avatar>
                                            <Box sx={{ minWidth: 0 }}>
                                                <Typography variant="subtitle1" fontWeight={700} noWrap>
                                                    {authorName}
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                                                    <Rating value={review.rating} readOnly size="small" />
                                                    <Typography variant="caption" color="text.secondary">
                                                        {formatReviewDate(review.publishedAt)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>

                                        <Stack direction="row" spacing={1} alignItems="center" flexShrink={0} flexWrap="wrap" useFlexGap>
                                            <CustomChip
                                                size="small"
                                                variant="tonal"
                                                color={sentiment.color}
                                                label={t(`reviews.${sentiment.label}`)}
                                                sx={{ fontWeight: 600, textTransform: 'capitalize' }}
                                            />
                                            <CustomChip
                                                size="small"
                                                variant="tonal"
                                                color={hasReply ? 'success' : 'warning'}
                                                label={hasReply ? tc('status.replied') : tc('status.none')}
                                                sx={{ fontWeight: 600 }}
                                            />
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 0.5,
                                                    px: 1,
                                                    py: 0.25,
                                                    borderRadius: 1,
                                                    bgcolor: 'action.hover',
                                                    color: 'text.secondary',
                                                }}
                                            >
                                                <PlatformIcon platform={review.platform} />
                                                <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
                                                    {review.platform === 'google' ? 'Google' : review.platform}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </Box>

                                    <Typography
                                        variant="body2"
                                        color="text.primary"
                                        sx={{ lineHeight: 1.7, mb: hasReply ? 2 : 0 }}
                                    >
                                        {review.content || t('reviews.smart.noContent')}
                                    </Typography>

                                    {hasReply && (
                                        <>
                                            <Divider sx={{ my: 2 }} />
                                            <Box
                                                sx={{
                                                    p: 2,
                                                    borderRadius: 2,
                                                    bgcolor: alpha(theme.palette.success.main, 0.06),
                                                    borderLeft: '3px solid',
                                                    borderColor: 'success.main',
                                                }}
                                            >
                                                <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                                                    <ReplyOutlinedIcon sx={{ fontSize: 16, color: 'success.main' }} />
                                                    <Typography variant="caption" color="success.main" fontWeight={700}>
                                                        {t('reviews.smart.detail.yourReply')}
                                                    </Typography>
                                                </Stack>
                                                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                                    {review.response}
                                                </Typography>
                                            </Box>
                                        </>
                                    )}

                                    {!hasReply && (
                                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                                            <Button
                                                size="small"
                                                variant="contained"
                                                color="primary"
                                                href={`/admin/reviews/${review.id}`}
                                            >
                                                {t('reviews.reply')}
                                            </Button>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>
        </Stack>
    );
};

export default LocationReviews;
