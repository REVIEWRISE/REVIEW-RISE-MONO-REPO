'use client';

import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import { styled } from '@mui/material/styles';
import type { VisibilityMetricDTO } from '@platform/contracts';

interface VisibilitySummaryCardsProps {
  metrics: VisibilityMetricDTO | null;
  loading?: boolean;
}

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const MetricValue = styled(Typography)(({ theme }) => ({
  fontSize: '2rem',
  fontWeight: 700,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(1),
}));

const MetricLabel = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.875rem',
  fontWeight: 500,
  marginBottom: theme.spacing(2),
}));

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 6,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: theme.palette.grey[200],
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
  },
}));

const VisibilitySummaryCards: React.FC<VisibilitySummaryCardsProps> = ({ metrics, loading }) => {
  if (loading || !metrics) {
    // Render skeletons or loading state
    return (
      <Grid container spacing={3}>
        {[1, 2, 3, 4].map((item) => (
          <Grid size={{ xs: 12, md: 3 }} key={item}>
            <StyledCard>
              <CardContent>
                <Box sx={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">Loading...</Typography>
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 3 }}>
        <StyledCard>
          <CardContent>
            <MetricLabel>Map Pack Visibility</MetricLabel>
            <MetricValue>{metrics.mapPackVisibility.toFixed(1)}%</MetricValue>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: '100%', mr: 1 }}>
                <BorderLinearProgress variant="determinate" value={metrics.mapPackVisibility} color="primary" />
              </Box>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {metrics.mapPackAppearances} appearances in {metrics.totalTrackedKeywords} keywords
            </Typography>
          </CardContent>
        </StyledCard>
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <StyledCard>
          <CardContent>
            <MetricLabel>Share of Voice</MetricLabel>
            <MetricValue>{metrics.shareOfVoice.toFixed(1)}%</MetricValue>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: '100%', mr: 1 }}>
                <BorderLinearProgress variant="determinate" value={metrics.shareOfVoice} color="secondary" />
              </Box>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Based on keyword search volume
            </Typography>
          </CardContent>
        </StyledCard>
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <StyledCard>
          <CardContent>
            <MetricLabel>Organic Rankings</MetricLabel>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">Top 3</Typography>
              <Typography variant="body2" fontWeight="bold">{metrics.top3Count}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">Top 10</Typography>
              <Typography variant="body2" fontWeight="bold">{metrics.top10Count}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">Top 20</Typography>
              <Typography variant="body2" fontWeight="bold">{metrics.top20Count}</Typography>
            </Box>
          </CardContent>
        </StyledCard>
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <StyledCard>
          <CardContent>
            <MetricLabel>SERP Features</MetricLabel>
            <Grid container spacing={1}>
              <Grid size={{ xs: 6 }}>
                <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Typography variant="h6" color="primary.main">{metrics.localPackCount}</Typography>
                  <Typography variant="caption" display="block">Local Pack</Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Typography variant="h6" color="info.main">{metrics.featuredSnippetCount}</Typography>
                  <Typography variant="caption" display="block">Snippets</Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </StyledCard>
      </Grid>
    </Grid>
  );
};

export default VisibilitySummaryCards;
