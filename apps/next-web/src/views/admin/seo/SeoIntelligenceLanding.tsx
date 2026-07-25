/* eslint-disable react/jsx-no-literals */
'use client'
/* eslint-disable react/jsx-no-literals */

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'

import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'

import SearchIcon from '@mui/icons-material/Search'
import BarChartIcon from '@mui/icons-material/BarChart'
import ListAltIcon from '@mui/icons-material/ListAlt'
import LocationOnIcon from '@mui/icons-material/LocationOn'

import SEOCard from '@/components/shared/dashboard/widgets/SEOCard'
import VisibilitySummaryCards from '@/components/seo/VisibilitySummaryCards'
import HomeDateFilter, { type DateFilterValue } from '@/components/shared/dashboard/widgets/HomeDateFilter'

import { useHomeDashboard } from '@/hooks/dashboard/useHomeDashboard'
import { useLocationFilter } from '@/hooks/useLocationFilter'
import { useAuth } from '@/contexts/AuthContext'
import apiClient from '@/lib/apiClient'
import { SERVICES } from '@/configs/services'

const sections = [
    {
        icon: <BarChartIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
        title: 'SERP Visibility',
        description: 'Track keyword rankings, map pack appearances, and share of voice over time.',
        href: 'visibility',
        badge: 'Live Data',
        badgeColor: 'success' as const,
    },
    {
        icon: <SearchIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
        title: 'SEO Analyzer',
        description: 'Run a full on-page SEO audit. Get scores, critical issues, and a fix plan.',
        href: 'analyzer',
        badge: 'Scan on demand',
        badgeColor: 'info' as const,
    },
    {
        icon: <ListAltIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
        title: 'Keywords',
        description: 'Manage your tracked keyword list, assign priorities, and monitor difficulty.',
        href: 'keywords',
        badge: null,
        badgeColor: 'default' as const,
    },
    {
        icon: <LocationOnIcon sx={{ fontSize: 40, color: 'error.main' }} />,
        title: 'Listings',
        description: 'Audit your local business listings across Google, Yelp, and directories.',
        href: 'listings',
        badge: null,
        badgeColor: 'default' as const,
    },
]

export default function SeoIntelligenceLanding() {
    const router = useRouter()
    const { user } = useAuth()
    const { locationId } = useLocationFilter()
    const [dateFilter, setDateFilter] = useState<DateFilterValue>('30D')

    const [businessId, setBusinessId] = useState<string | null>(null)

    // 1. Resolve businessId from locationId sequentially
    useEffect(() => {
        const fetchContext = async () => {
            if (!user?.id) return

            try {
                if (locationId && locationId !== 'all') {
                    const loc = await apiClient.get<any>(`/api/admin/locations/${locationId}`).then(r => r.data)

                    if (loc && loc.businessId) {
                        setBusinessId(loc.businessId)
                        
return
                    }
                }


                // Fallback to first business
                const responseData = await apiClient.get<any[]>(`/api/admin/users/${user.id}/businesses`).then(res => res.data)

                if (responseData && responseData.length > 0) {
                    setBusinessId(responseData[0].id)
                }
            } catch (err) {
                console.error('Error fetching dashboard context:', err)
            }
        }

        fetchContext()
    }, [user?.id, locationId])

    // 2. Fetch Home metrics (SEO Score, Trends, Fixes) securely
    const safeLocation = locationId && locationId !== 'all' ? locationId : 'all'
    const { data: homeData, isLoading: isHomeLoading } = useHomeDashboard(safeLocation, dateFilter)

    // 3. Fetch specific Visibility Metrics securely
    const { data: visibilityMetrics, isLoading: isVisLoading } = useQuery({
        queryKey: ['seo', 'visibility', 'metrics', businessId, safeLocation, dateFilter],
        enabled: !!businessId,
        queryFn: async () => {
            const locParam = safeLocation !== 'all' ? { locationId: safeLocation } : {}

            const res = await apiClient.get(`${SERVICES.seo.url}/visibility/metrics`, {
                params: {
                    businessId,
                    limit: 1,
                    ...locParam
                }
            })

            
return res.data?.data?.[0] || null
        },
    })

    const navigate = (href: string) => {
        const qs = safeLocation !== 'all' ? `?locationId=${safeLocation}` : ''

        router.push(`/en/admin/seo-intelligence/${href}${qs}`)
    }

    return (
        <Box sx={{ pb: 6 }}>
            {/* Header & Filter Row */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" mb={4} gap={2}>
                <Box>
                    <Typography variant="h4" fontWeight={800} gutterBottom>
                        SEO Intelligence Hub
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Monitor rankings, audit pages, and grow your organic visibility — all in one place.
                    </Typography>
                </Box>
                <HomeDateFilter value={dateFilter} onChange={setDateFilter} />
            </Stack>

            {/* Metrics Overview Row */}
            <Grid container spacing={3} sx={{ mb: 5 }}>
                <Grid size={{ xs: 12, md: 4, lg: 3 }}>
                    <SEOCard
                        score={homeData.seoScore}
                        delta={homeData.weeklyDigest.seoChange}
                        fixes={homeData.seoFixes}
                        trendData={homeData.trends}
                        onRunScan={() => navigate('analyzer')}
                        isLoading={isHomeLoading}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 8, lg: 9 }}>
                    <VisibilitySummaryCards
                        metrics={visibilityMetrics}
                        loading={!businessId || isVisLoading}
                    />
                </Grid>
            </Grid>

            {/* Quick Navigation Action Hub */}
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                Tools & Capabilities
            </Typography>
            <Grid container spacing={3}>
                {sections.map(s => (
                    <Grid key={s.href} size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card
                            sx={{
                                height: '100%',
                                borderRadius: 3,
                                border: '1px solid',
                                borderColor: 'divider',
                                transition: 'box-shadow 0.2s, transform 0.2s',
                                '&:hover': { boxShadow: 6, transform: 'translateY(-2px)' },
                            }}
                        >
                            <CardActionArea onClick={() => navigate(s.href)} sx={{ height: '100%', p: 1 }}>
                                <CardContent>
                                    <Box sx={{ mb: 2 }}>{s.icon}</Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                                        <Typography variant="h6" fontWeight={700}>{s.title}</Typography>
                                        {s.badge && (
                                            <Chip label={s.badge} color={s.badgeColor} size="small" />
                                        )}
                                    </Box>
                                    <Typography variant="body2" color="text.secondary">
                                        {s.description}
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    )
}
