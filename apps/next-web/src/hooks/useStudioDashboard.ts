import { useState, useEffect, useCallback } from 'react';
import { StudioService, type StudioDashboardStats, type GenerationItem } from '@/services/studio.service';

export function useStudioDashboard(businessId: string | null) {
    const [stats, setStats] = useState<StudioDashboardStats | null>(null);
    const [recentGenerations, setRecentGenerations] = useState<GenerationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (!businessId) return;
        setLoading(true);
        setError(null);

        try {
            const [statsData, generationsData] = await Promise.all([
                StudioService.getDashboardStats(businessId),
                StudioService.listGenerations(businessId, 5)
            ]);

            setStats(statsData);
            setRecentGenerations(generationsData);
        } catch (err: any) {
            console.error('Failed to fetch studio dashboard data:', err);
            setError(err.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    }, [businessId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        stats,
        recentGenerations,
        loading,
        error,
        refresh: fetchData
    };
}
