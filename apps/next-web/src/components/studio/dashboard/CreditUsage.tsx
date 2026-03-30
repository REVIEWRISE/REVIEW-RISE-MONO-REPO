import React from 'react'
import { Card, CardContent, Typography, Box, LinearProgress } from '@mui/material'
import { useTranslations } from 'next-intl'
import { type StudioDashboardStats } from '@/services/studio.service'

interface CreditUsageProps {
    stats: StudioDashboardStats | null
}

export default function CreditUsage({ stats }: CreditUsageProps) {
    const t = useTranslations('studio')

    const usageItems = [
        { label: t('captions.title'), current: stats?.captions || 0, max: 100, color: 'primary' },
        { label: t('images.title'), current: stats?.images || 0, max: 50, color: 'secondary' },
        { label: t('planner.title'), current: stats?.carousels || 0, max: 20, color: 'info' },
        { label: t('scripts.title'), current: stats?.scripts || 0, max: 20, color: 'warning' },
    ]

    return (
        <Card variant="outlined">
            <CardContent>
                <Typography variant="h6" fontWeight="bold" mb={3}>{t('dashboard.creditsTitle')}</Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {usageItems.map((item, idx) => (
                        <Box key={idx}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" fontWeight="medium" color="text.primary">{item.label}</Typography>
                                <Typography variant="caption" fontWeight="bold" color="text.secondary">
                                    {item.current}/{item.max}
                                </Typography>
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={Math.min((item.current / item.max) * 100, 100)}
                                color={item.color as any}
                                sx={{ height: 6, borderRadius: 3, bgcolor: 'action.hover' }}
                            />
                        </Box>
                    ))}
                </Box>
            </CardContent>
        </Card>
    )
}
