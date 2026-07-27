import type { InboxReview } from '../hooks/useReviewsInbox'
import { isValidLocationId } from '@/utils/locationId'

export { isValidLocationId }

const formatTimeAgo = (date: string | Date | undefined): string => {
    if (!date) return ''

    const publishedAt = new Date(date)

    if (Number.isNaN(publishedAt.getTime())) return ''

    const diffMs = Date.now() - publishedAt.getTime()
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (days <= 0) return 'Today'
    if (days === 1) return '1 day ago'

    return `${days} days ago`
}

const normalizeSentiment = (sentiment: string | null | undefined): InboxReview['sentiment'] => {
    const value = sentiment?.toLowerCase()

    if (value === 'positive') return 'Positive'
    if (value === 'negative') return 'Negative'

    return 'Neutral'
}

const normalizePlatform = (platform: string | null | undefined): InboxReview['platform'] => {
    const value = platform?.toLowerCase()

    if (value === 'yelp' || value === 'facebook') return value

    return 'google'
}

export const mapReviewToInbox = (review: Record<string, unknown>): InboxReview => ({
    id: String(review.id ?? ''),
    authorName: String(review.authorName ?? review.author ?? 'Anonymous'),
    authorPhotoUrl: typeof review.authorPhotoUrl === 'string' ? review.authorPhotoUrl : undefined,
    rating: typeof review.rating === 'number' ? review.rating : 0,
    timeAgo: typeof review.timeAgo === 'string' ? review.timeAgo : formatTimeAgo(review.publishedAt as string | Date | undefined),
    content: String(review.content ?? ''),
    platform: normalizePlatform(typeof review.platform === 'string' ? review.platform : undefined),
    sentiment: normalizeSentiment(typeof review.sentiment === 'string' ? review.sentiment : undefined),
    isReplied: Boolean(
        review.isReplied ??
        review.response ??
        review.respondedAt
    ),
    aiSuggestedReply: typeof review.aiSuggestedReply === 'string' ? review.aiSuggestedReply : undefined,
})

export const normalizeInboxReviews = (data: unknown): InboxReview[] => {
    const rawReviews = Array.isArray(data)
        ? data
        : (data as { reviews?: unknown[] } | null | undefined)?.reviews ?? []

    return rawReviews
        .filter((review): review is Record<string, unknown> => !!review && typeof review === 'object')
        .map(mapReviewToInbox)
}
