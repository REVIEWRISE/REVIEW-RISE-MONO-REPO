'use client'

import React, { Suspense } from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import ReputationHeroCard from '@/components/shared/dashboard/widgets/reviews/ReputationHeroCard';
import ReviewInboxFeed from '@/components/shared/dashboard/widgets/reviews/ReviewInboxFeed';
import SentimentTrendChart from '@/components/shared/dashboard/widgets/reviews/SentimentTrendChart';
import TopicCloudCard from '@/components/shared/dashboard/widgets/reviews/TopicCloudCard';
import ReputationActionsCard from '@/components/shared/dashboard/widgets/reviews/ReputationActionsCard';

const FeedFallback = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
    </Box>
);

export default function ReviewsInboxDashboard() {
    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <ReputationHeroCard />

            <Grid container spacing={4}>
                <Grid size={{ xs: 12, lg: 8 }}>
                    <Suspense fallback={<FeedFallback />}>
                        <ReviewInboxFeed />
                    </Suspense>
                </Grid>

                <Grid size={{ xs: 12, lg: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <SentimentTrendChart />
                        <TopicCloudCard />
                        <ReputationActionsCard />
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
}
