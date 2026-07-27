/* eslint-disable import/no-unresolved */
import { Suspense } from 'react'

import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'

import AdminErrorBoundary from '@/components/admin/layout/AdminErrorBoundary'
import ReviewsInboxDashboard from '@/views/admin/reviews/ReviewsInboxDashboard'

const InboxFallback = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
    </Box>
)

const AdminReviewsInboxPage = () => {
    return (
        <AdminErrorBoundary>
            <Grid container spacing={6}>
                <Grid size={{ xs: 12 }}>
                    <Suspense fallback={<InboxFallback />}>
                        <ReviewsInboxDashboard />
                    </Suspense>
                </Grid>
            </Grid>
        </AdminErrorBoundary>
    )
}

export default AdminReviewsInboxPage
