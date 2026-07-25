'use client'
/* eslint-disable react/jsx-no-literals */

import React, { useMemo } from 'react'
import { Card, Typography, Box, Skeleton, useTheme } from '@mui/material'
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'

import { useLocationFilter } from '@/hooks/useLocationFilter'
import { useBusinessId } from '@/hooks/useBusinessId'
import { useSentimentHeatmap } from '@/hooks/reviews/useReviewAnalytics'
import { resolveScopedLocationId } from '@/utils/locationId'

const formatDayLabel = (dateStr: string) => {
    const date = new Date(dateStr)

    if (Number.isNaN(date.getTime())) return dateStr

    return date.toLocaleDateString(undefined, { weekday: 'short' })
}

export default function SentimentTrendChart() {
    const theme = useTheme()
    const { locationId } = useLocationFilter()
    const scopedLocationId = resolveScopedLocationId(locationId)
    const { businessId, loading: businessLoading } = useBusinessId()

    const { data, isLoading } = useSentimentHeatmap({
        businessId: businessId || '',
        locationId: scopedLocationId,
        period: 7,
        groupBy: 'day',
    })

    const chartData = useMemo(() => {
        if (!Array.isArray(data) || data.length === 0) return []

        return data.slice(-7).map((point: { date: string; positive: number; neutral: number; negative: number }) => {
            const total = point.positive + point.neutral + point.negative

            if (total === 0) {
                return {
                    day: formatDayLabel(point.date),
                    positive: 0,
                    neutral: 0,
                    negative: 0,
                }
            }

            return {
                day: formatDayLabel(point.date),
                positive: Math.round((point.positive / total) * 100),
                neutral: Math.round((point.neutral / total) * 100),
                negative: Math.round((point.negative / total) * 100),
            }
        })
    }, [data])

    const totals = useMemo(() => {
        if (!Array.isArray(data) || data.length === 0) {
            return { positive: 0, neutral: 0, negative: 0 }
        }

        const sum = data.reduce(
            (acc, point: { positive: number; neutral: number; negative: number }) => ({
                positive: acc.positive + point.positive,
                neutral: acc.neutral + point.neutral,
                negative: acc.negative + point.negative,
            }),
            { positive: 0, neutral: 0, negative: 0 }
        )

        const total = sum.positive + sum.neutral + sum.negative

        if (total === 0) return { positive: 0, neutral: 0, negative: 0 }

        return {
            positive: Math.round((sum.positive / total) * 100),
            neutral: Math.round((sum.neutral / total) * 100),
            negative: Math.round((sum.negative / total) * 100),
        }
    }, [data])

    const positiveColor = theme.palette.success?.main ?? '#56ca00'
    const neutralColor = theme.palette.info?.main ?? '#16b1ff'
    const negativeColor = theme.palette.error?.main ?? '#ff4c51'

    if (businessLoading || isLoading) {
        return (
            <Card sx={{ p: 3, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
                <Skeleton variant="rounded" height={260} />
            </Card>
        )
    }

    return (
        <Card sx={{ p: 3, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Sentiment Trends</Typography>

            {chartData.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 6, textAlign: 'center' }}>
                    No synced review sentiment data for the last 7 days.
                </Typography>
            ) : (
                <Box sx={{ height: 200, width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="inbox_positive" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={positiveColor} stopOpacity={0.35} />
                                    <stop offset="95%" stopColor={positiveColor} stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="inbox_neutral" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={neutralColor} stopOpacity={0.25} />
                                    <stop offset="95%" stopColor={neutralColor} stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="inbox_negative" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={negativeColor} stopOpacity={0.25} />
                                    <stop offset="95%" stopColor={negativeColor} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                            <XAxis dataKey="day" stroke={theme.palette.text.secondary} fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis hide />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: theme.palette.background.paper,
                                    border: `1px solid ${theme.palette.divider}`,
                                    borderRadius: 8,
                                    color: theme.palette.text.primary,
                                }}
                            />
                            <Area type="monotone" dataKey="positive" stroke={positiveColor} fill="url(#inbox_positive)" strokeWidth={2} />
                            <Area type="monotone" dataKey="neutral" stroke={neutralColor} fill="url(#inbox_neutral)" strokeWidth={2} />
                            <Area type="monotone" dataKey="negative" stroke={negativeColor} fill="url(#inbox_negative)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </Box>
            )}

            <Box sx={{ mt: 2 }}>
                {([
                    { key: 'positive', color: positiveColor, value: totals.positive },
                    { key: 'neutral', color: neutralColor, value: totals.neutral },
                    { key: 'negative', color: negativeColor, value: totals.negative },
                ] as const).map(({ key, color, value }, index, arr) => (
                    <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', mb: index === arr.length - 1 ? 0 : 1, alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>{key}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '70%' }}>
                            <Box sx={{ height: 4, bgcolor: color, flex: 1, borderRadius: 2 }} />
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{value}%</Typography>
                        </Box>
                    </Box>
                ))}
            </Box>
        </Card>
    )
}
