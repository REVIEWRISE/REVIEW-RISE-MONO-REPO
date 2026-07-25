'use client'

import React from 'react'
import { Card, Typography, Box, Skeleton, useTheme, Chip } from '@mui/material'

import { useLocationFilter } from '@/hooks/useLocationFilter'
import { useReviewsInbox } from '@/views/admin/reviews/hooks/useReviewsInbox'

export default function TopicCloudCard() {
    const theme = useTheme()
    const { locationId } = useLocationFilter()
    const { keywords, keywordsLoading, hasValidLocation } = useReviewsInbox(locationId)

    if (!hasValidLocation) {
        return null
    }

    if (keywordsLoading) {
        return (
            <Card sx={{ p: 3, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
                <Skeleton variant="rounded" height={120} />
            </Card>
        )
    }

    return (
        <Card sx={{ p: 3, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Top Topics</Typography>
            {keywords.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                    No topics from synced reviews yet. Tags appear after sentiment analysis runs on imported reviews.
                </Typography>
            ) : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {keywords.map((topic) => (
                        <Chip
                            key={topic.keyword}
                            label={`${topic.keyword} (${topic.count})`}
                            size="small"
                            sx={{
                                fontWeight: 600,
                                bgcolor: 'primary.light',
                                color: 'primary.dark',
                            }}
                        />
                    ))}
                </Box>
            )}
        </Card>
    )
}
