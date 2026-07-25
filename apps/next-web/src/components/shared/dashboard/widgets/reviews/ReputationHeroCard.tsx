'use client'
/* eslint-disable react/jsx-no-literals */

import React from 'react'
import { Card, Typography, Box, Skeleton, useTheme } from '@mui/material'
import GoogleIcon from '@mui/icons-material/Google'
import FacebookIcon from '@mui/icons-material/Facebook'

import { useLocationFilter } from '@/hooks/useLocationFilter'
import { useReviewsInbox } from '@/views/admin/reviews/hooks/useReviewsInbox'

const YelpIcon = () => (
    <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'error.main' }}>Y</Typography>
)

const platformIcon = (platform: string) => {
    switch (platform) {
        case 'google':
        case 'gbp':
            return <GoogleIcon sx={{ fontSize: 16 }} />
        case 'facebook':
            return <FacebookIcon sx={{ fontSize: 16 }} />
        case 'yelp':
            return <YelpIcon />
        default:
            return null
    }
}

export default function ReputationHeroCard() {
    const theme = useTheme()
    const { locationId } = useLocationFilter()
    const { stats, statsLoading, hasValidLocation } = useReviewsInbox(locationId)

    if (!hasValidLocation) {
        return (
            <Card sx={{ mb: 3, p: 3, borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="body2" color="text.secondary">
                    Select a location to view reputation metrics.
                </Typography>
            </Card>
        )
    }

    if (statsLoading) {
        return (
            <Card sx={{ mb: 3, p: 3, borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}` }}>
                <Skeleton variant="rounded" height={140} />
            </Card>
        )
    }

    const totalReviews = stats?.totalReviews ?? 0
    const averageRating = stats?.averageRating ?? 0
    const unrepliedCount = stats?.unrepliedCount ?? 0
    const responseRate = stats?.responseRate ?? 0
    const positiveSentiment = stats?.positiveSentiment ?? 0
    const avgResponseTimeHours = stats?.avgResponseTimeHours
    const platformBreakdown = stats?.platformBreakdown ?? []

    const reputationLabel = averageRating >= 4.5
        ? 'Excellent Reputation'
        : averageRating >= 4
            ? 'Strong Reputation'
            : averageRating >= 3
                ? 'Good Reputation'
                : totalReviews > 0
                    ? 'Needs Attention'
                    : 'No Synced Reviews'

    return (
        <Card sx={{ mb: 3, p: { xs: 2, md: 3 }, borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}` }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 2, alignItems: 'stretch' }}>

                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: 'center', flex: { lg: '0 0 auto' }, minWidth: { lg: 380 } }}>
                    <Box
                        sx={{
                            width: 100,
                            height: 120,
                            borderRadius: 3,
                            bgcolor: totalReviews > 0 ? 'warning.main' : 'action.hover',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            p: 2,
                            boxShadow: totalReviews > 0 ? `0 8px 16px ${theme.palette.warning.main}30` : 'none',
                            color: totalReviews > 0 ? 'warning.contrastText' : 'text.secondary'
                        }}
                    >
                        <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1 }}>
                            {totalReviews > 0 ? averageRating.toFixed(1) : '—'}
                        </Typography>
                        <Typography variant="caption" sx={{ mt: 1, textAlign: 'center', lineHeight: 1.2, opacity: 0.9 }}>
                            Based on<br />{totalReviews.toLocaleString()}<br />synced reviews
                        </Typography>
                    </Box>

                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
                            {reputationLabel}
                        </Typography>
                        {unrepliedCount > 0 ? (
                            <Box sx={{ p: 1.5, bgcolor: 'warning.light', borderRadius: 1.5, color: 'warning.dark', display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                <Typography sx={{ fontSize: '1rem', lineHeight: 1 }}>⚠️</Typography>
                                <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>
                                    You have {unrepliedCount} unanswered review{unrepliedCount === 1 ? '' : 's'} from connected providers.
                                </Typography>
                            </Box>
                        ) : totalReviews === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                                Connect Google Business Profile and sync reviews to populate this inbox.
                            </Typography>
                        ) : (
                            <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                                All synced reviews have been answered.
                            </Typography>
                        )}
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, flex: { lg: 1 } }}>
                    <Box sx={{ flex: 1, p: 2, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 1, fontWeight: 700, letterSpacing: 0.5 }}>
                            RESPONSE RATE
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 2 }}>
                            <Typography variant="h4" sx={{ fontWeight: 800 }}>
                                {totalReviews > 0 ? `${responseRate}%` : '—'}
                            </Typography>
                        </Box>
                        <Box sx={{ width: '100%', bgcolor: 'success.dark', opacity: 0.2, height: 4, borderRadius: 2, position: 'relative' }}>
                            <Box sx={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${responseRate}%`, bgcolor: 'success.main', borderRadius: 2 }} />
                        </Box>
                    </Box>

                    <Box sx={{ flex: 1, p: 2, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 1, fontWeight: 700, letterSpacing: 0.5 }}>
                            AVG RESPONSE TIME
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
                            {avgResponseTimeHours != null ? `${avgResponseTimeHours}h` : '—'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                            From synced provider replies
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ p: 2, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, flex: { lg: 1.2 }, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 0.5, fontWeight: 700, letterSpacing: 0.5, display: 'block' }}>
                                POSITIVE SENTIMENT
                            </Typography>
                            <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1 }}>
                                {totalReviews > 0 ? `${positiveSentiment}%` : '—'}
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{ mt: 'auto', pt: 1 }}>
                        {platformBreakdown.length > 0 ? (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                                {platformBreakdown.map((item) => (
                                    <Box key={item.platform}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            {platformIcon(item.platform)}
                                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{item.averageRating.toFixed(1)}</Typography>
                                        </Box>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                            {item.totalReviews} review{item.totalReviews === 1 ? '' : 's'}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        ) : (
                            <Typography variant="caption" color="text.secondary">
                                No connected provider breakdown yet.
                            </Typography>
                        )}
                    </Box>
                </Box>

            </Box>
        </Card>
    )
}
