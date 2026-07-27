'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { useApiGet } from '@/hooks/useApi'
import { SERVICES_CONFIG } from '@/configs/services'
import { isValidLocationId, normalizeInboxReviews } from '../utils/mapInboxReview'

const REVIEWS_API = SERVICES_CONFIG.review.url

export interface ReviewFeedFilters {
    rating?: string
    replyStatus?: string
    sentiment?: string
    search?: string
}

export interface InboxReview {
    id: string
    authorName: string
    authorPhotoUrl?: string
    rating: number
    timeAgo: string
    content: string
    platform: 'google' | 'yelp' | 'facebook'
    sentiment: 'Positive' | 'Neutral' | 'Negative'
    isReplied: boolean
    aiSuggestedReply?: string
}

export interface LocationInboxStats {
    totalReviews: number
    averageRating: number
    platforms: string[]
    unrepliedCount: number
    responseRate: number
    positiveSentiment: number
    avgResponseTimeHours: number | null
    platformBreakdown: Array<{
        platform: string
        totalReviews: number
        averageRating: number
    }>
    sentimentBreakdown: {
        positive: number
        neutral: number
        negative: number
    }
}

export function useReviewsInbox(locationId: string | null) {
    const queryClient = useQueryClient()
    const hasValidLocation = isValidLocationId(locationId)

    const [filters, setFilters] = useState<ReviewFeedFilters>({
        replyStatus: 'unanswered',
        rating: 'all',
        sentiment: 'all'
    })

    const [isGenerating, setIsGenerating] = useState(false)

    const reviewsQuery = useApiGet<{ reviews?: unknown[] }>(
        ['reviews', 'inbox', locationId ?? 'none', JSON.stringify(filters)],
        `${REVIEWS_API}/reviews/locations/${locationId}/reviews`,
        {
            limit: 50,
            ...(filters.rating && filters.rating !== 'all' ? { rating: filters.rating } : {}),
            ...(filters.sentiment && filters.sentiment !== 'all' ? { sentiment: filters.sentiment } : {}),
            ...(filters.replyStatus && filters.replyStatus !== 'all' ? { replyStatus: filters.replyStatus } : {}),
            ...(filters.search?.trim() ? { search: filters.search.trim() } : {}),
        },
        { enabled: hasValidLocation }
    )

    const statsQuery = useApiGet<LocationInboxStats>(
        ['reviews', 'stats', locationId ?? 'none'],
        `${REVIEWS_API}/reviews/locations/${locationId}/stats`,
        {},
        { enabled: hasValidLocation }
    )

    const keywordsQuery = useApiGet<{ keywords: Array<{ keyword: string; count: number }> }>(
        ['reviews', 'keywords', locationId ?? 'none'],
        `${REVIEWS_API}/reviews/locations/${locationId}/keywords`,
        { timeRange: '30d' },
        { enabled: hasValidLocation }
    )

    const generateAiReply = async ({ reviewId, tone }: { reviewId: string; tone: string }): Promise<string> => {
        setIsGenerating(true)

        try {
            const response = await fetch(`${SERVICES_CONFIG.ai.url}/review-reply/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ reviewId, tone })
            })

            if (!response.ok) {
                throw new Error('Failed to generate AI reply')
            }

            const json = await response.json()
            const variations: Array<{ tone: string; reply: string }> = json?.data?.variations || []
            const match = variations.find(v => v.tone.toLowerCase() === tone.toLowerCase())

            return (match?.reply || variations[0]?.reply || 'No reply generated.')
        } finally {
            setIsGenerating(false)
        }
    }

    const postReplyForReview = async ({ reviewId, content }: { reviewId: string; content: string }) => {
        const response = await fetch(`${REVIEWS_API}/reviews/${reviewId}/reply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ comment: content })
        })

        if (!response.ok) throw new Error('Failed to post reply')

        queryClient.invalidateQueries({ queryKey: ['reviews', 'inbox', locationId] })
        queryClient.invalidateQueries({ queryKey: ['reviews', 'stats', locationId] })
        queryClient.invalidateQueries({ queryKey: ['reviews', 'keywords', locationId] })
    }

    const reviews = normalizeInboxReviews(reviewsQuery.data)

    return {
        reviews,
        total: reviews.length,
        isLoading: hasValidLocation && reviewsQuery.isLoading,
        isError: hasValidLocation && reviewsQuery.isError,
        hasValidLocation,

        stats: statsQuery.data,
        statsLoading: statsQuery.isLoading,

        keywords: keywordsQuery.data?.keywords ?? [],
        keywordsLoading: keywordsQuery.isLoading,

        filters,
        setFilters,

        postReply: postReplyForReview,
        isPosting: false,

        generateAiReply,
        isGenerating
    }
}
