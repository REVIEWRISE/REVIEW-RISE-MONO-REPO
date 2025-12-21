'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import axios from 'axios';

import VisibilitySummaryCards from '@/components/seo/VisibilitySummaryCards';
import KeywordsTable from '@/components/seo/KeywordsTable';
import type { VisibilityMetricDTO, KeywordDTO } from '@platform/contracts';

// This would typically come from an environment variable
const API_URL = 'http://localhost:3012/api/v1';

const VisibilityDashboard = () => {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<VisibilityMetricDTO | null>(null);
  const [keywords, setKeywords] = useState<KeywordDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch business ID first (simulation of context)
  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        // In a real app, we'd use the currently selected business from context
        // Here we'll try to guess it by fetching keywords without ID? No, endpoint requires it.
        // We'll trust that the user has keyed in the business ID or we fetch it from a list endpoint?
        // Since we don't have a list endpoint exposed in this SEO service easily (it's in the DB service),
        // we'll try to use the one from our seed data or fail gracefully.
        
        // For demonstration, we'll try to fetch keywords with a known ID from seed if possible, 
        // or asking the user to provide it.
        // Let's rely on the seed script's output in the console log which provided an ID.
        // But for now, let's assume valid ID is available or we need to prompt.
        
        // TEMPORARY: Hardcode the ID from the previous step's output to make it work immediately
        // ID: 5d5bb42e-26b... (Wait, I need the full ID)
        // I will add an input field if not found.
        
        // Let's implement a fallback Input if no ID is set
      } catch (err) {
        console.error(err);
      }
    };
    fetchBusiness();
  }, []);

  const fetchData = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch Metrics
      const metricsRes = await axios.get(`${API_URL}/visibility/metrics`, {
        params: { businessId: id, periodType: 'daily', limit: 1 }
      });
      
      if (metricsRes.data?.data?.[0]) {
        setMetrics(metricsRes.data.data[0]);
      } else {
        // Compute metrics if none exist?
        // For now just null
        setMetrics(null);
      }

      // 2. Fetch Keywords
      const keywordsRes = await axios.get(`${API_URL}/keywords`, {
        params: { businessId: id, limit: 50 }
      });
      
      if (keywordsRes.data?.data) {
        setKeywords(keywordsRes.data.data);
      }

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please check connection to SEO service.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = () => {
    if (businessId) {
      fetchData(businessId);
    }
  };

  const handleIdSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = formData.get('businessId') as string;
    if (id) {
      setBusinessId(id);
      fetchData(id);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            SERP Visibility
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track your map pack presence and organic ranking performance
          </Typography>
        </Box>
        <Box>
          {businessId && (
            <Button variant="outlined" onClick={handleRefresh}>
              Refresh Data
            </Button>
          )}
        </Box>
      </Stack>

      {!businessId ? (
        <Box sx={{ mt: 4, p: 4, border: '1px dashed grey', borderRadius: 2, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>Enter Business ID to View Data</Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            (Check your database or seed script output for a valid UUID)
          </Typography>
          <form onSubmit={handleIdSubmit} style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <input 
              name="businessId" 
              placeholder="e.g. 5d5bb42e-..." 
              style={{ padding: '8px', width: '300px', borderRadius: '4px', border: '1px solid #ccc' }} 
              required
            />
            <Button type="submit" variant="contained">Load Dashboard</Button>
          </form>
        </Box>
      ) : (
        <>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom fontWeight="medium">
              Performance Overview (Last 24h)
            </Typography>
            <VisibilitySummaryCards metrics={metrics} loading={loading} />
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom fontWeight="medium">
              Tracked Keywords
            </Typography>
            <KeywordsTable keywords={keywords} loading={loading} />
          </Box>
        </>
      )}
    </Container>
  );
};

export default VisibilityDashboard;
