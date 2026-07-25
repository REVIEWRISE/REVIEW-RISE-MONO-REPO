/* eslint-disable react/jsx-no-literals */
/* eslint-disable react/no-unescaped-entities */
'use client'
/* eslint-disable react/jsx-no-literals */

import React from 'react';
import { Box, Typography, TextField, MenuItem, CircularProgress, Alert } from '@mui/material';
import ReviewCard from './ReviewCard';
import { useReviewsInbox, type ReviewFeedFilters } from '@/views/admin/reviews/hooks/useReviewsInbox';
import { useLocationFilter } from '@/hooks/useLocationFilter';
import { Link } from '@/i18n/routing';

export default function ReviewInboxFeed() {
    const { locationId } = useLocationFilter();

    const { reviews, isLoading, isError, hasValidLocation, generateAiReply, postReply, filters, setFilters } = useReviewsInbox(locationId);

    const handleFilterChange = (key: keyof ReviewFeedFilters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    if (!hasValidLocation) {
        return (
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', p: 4 }}>
                Select a location to view the review inbox.
            </Typography>
        );
    }

    return (
        <Box>
            {!isLoading && reviews.length === 0 && (
                <Alert severity="info" sx={{ mb: 3 }}>
                    No synced reviews for this location yet.{' '}
                    <Link href={`/admin/locations/${locationId}?tab=integrations` as any} style={{ fontWeight: 600 }}>
                        Connect & sync reviews
                    </Link>
                </Alert>
            )}

            {/* Search & Filter Bar */}
            <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Search reviews..."
                    sx={{ bgcolor: 'background.paper', borderRadius: 1, maxWidth: 320 }}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                />
                <TextField
                    select
                    size="small"
                    value={filters.replyStatus || 'unanswered'}
                    onChange={(e) => handleFilterChange('replyStatus', e.target.value)}
                    sx={{ minWidth: 175, bgcolor: 'background.paper', borderRadius: 1 }}
                >
                    <MenuItem value="all">All Reviews</MenuItem>
                    <MenuItem value="unanswered">Unanswered</MenuItem>
                    <MenuItem value="replied">Replied</MenuItem>
                </TextField>
                <TextField
                    select
                    size="small"
                    value={filters.rating || 'all'}
                    onChange={(e) => handleFilterChange('rating', e.target.value)}
                    sx={{ minWidth: 140, bgcolor: 'background.paper', borderRadius: 1 }}
                >
                    <MenuItem value="all">All Ratings</MenuItem>
                    <MenuItem value="5">⭐⭐⭐⭐⭐ 5</MenuItem>
                    <MenuItem value="4">⭐⭐⭐⭐ 4+</MenuItem>
                    <MenuItem value="3">⭐⭐⭐ 3+</MenuItem>
                    <MenuItem value="2">⭐⭐ 2 or less</MenuItem>
                </TextField>
                <TextField
                    select
                    size="small"
                    value={filters.sentiment || 'all'}
                    onChange={(e) => handleFilterChange('sentiment', e.target.value)}
                    sx={{ minWidth: 150, bgcolor: 'background.paper', borderRadius: 1 }}
                >
                    <MenuItem value="all">All Sentiment</MenuItem>
                    <MenuItem value="Positive">Positive</MenuItem>
                    <MenuItem value="Neutral">Neutral</MenuItem>
                    <MenuItem value="Negative">Negative</MenuItem>
                </TextField>
            </Box>

            {/* Feed */}
            <Box>
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : isError ? (
                    <Typography variant="body1" color="error" sx={{ textAlign: 'center', p: 4 }}>
                        Failed to load reviews. Please try again.
                    </Typography>
                ) : reviews.length === 0 ? (
                    <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', p: 4 }}>
                        No synced reviews match your filters.
                    </Typography>
                ) : (
                    reviews.map((review) => (
                        <ReviewCard
                            key={review.id}
                            review={review}
                            onGenerateReply={(tone) => generateAiReply({ reviewId: review.id, tone })}
                            onPostReply={(content) => postReply({ reviewId: review.id, content })}
                        />
                    ))
                )}
            </Box>
        </Box>
    );
}
