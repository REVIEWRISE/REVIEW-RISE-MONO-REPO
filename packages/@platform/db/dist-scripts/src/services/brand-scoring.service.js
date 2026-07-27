"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.brandScoringService = exports.BrandScoringService = void 0;
const repositories_1 = require("../repositories");
/**
 * Brand Scoring Service
 *
 * Computes high-level brand health scores:
 * - Visibility Score (0-100): Weighted search, local, social, reputation presence
 * - Trust Score (0-100): Based on ratings, reviews, sentiment, responsiveness
 * - Consistency Score (0-100): Adherence to Brand DNA
 */
class BrandScoringService {
    /**
     * Compute Visibility Score (0-100)
     * Weighted components: Search(25%) + Local(25%) + Social(20%) + Reputation(20%) + Consistency(10%)
     */
    async computeVisibilityScore(businessId) {
        const weights = {
            search: 0.25,
            local: 0.25,
            social: 0.20,
            reputation: 0.20,
            consistency: 0.10,
        };
        const searchScore = await this.computeSearchScore(businessId);
        const localScore = await this.computeLocalScore(businessId);
        const socialScore = await this.computeSocialScore(businessId);
        const reputationScore = await this.computeReputationScore(businessId);
        const consistencyScore = await this.computeConsistencyScore(businessId);
        const visibilityScore = searchScore * weights.search +
            localScore * weights.local +
            socialScore * weights.social +
            reputationScore * weights.reputation +
            consistencyScore * weights.consistency;
        return Math.round(visibilityScore);
    }
    /**
     * Search Score: Based on keyword rankings, SERP features, organic traffic
     */
    async computeSearchScore(businessId) {
        // Get keyword ranks from last 30 days
        const keywords = await repositories_1.repositories.keyword.findMany({
            where: { businessId },
            include: {
                ranks: {
                    where: {
                        capturedAt: {
                            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                        },
                    },
                    orderBy: { capturedAt: 'desc' },
                    take: 1,
                },
            },
        }); // Type assertion needed due to complex include in custom repository
        if (keywords.length === 0)
            return 0;
        let totalScore = 0;
        let totalKeywords = 0;
        for (const keyword of keywords) {
            if (!keyword.ranks || keyword.ranks.length === 0)
                continue;
            const rank = keyword.ranks[0];
            let keywordScore = 0;
            // Position scoring
            if (rank.rankPosition) {
                if (rank.rankPosition <= 3)
                    keywordScore += 40;
                else if (rank.rankPosition <= 10)
                    keywordScore += 30;
                else if (rank.rankPosition <= 20)
                    keywordScore += 20;
                else if (rank.rankPosition <= 50)
                    keywordScore += 10;
            }
            // SERP features bonus
            if (rank.hasFeaturedSnippet)
                keywordScore += 15;
            if (rank.hasLocalPack)
                keywordScore += 10;
            if (rank.hasKnowledgePanel)
                keywordScore += 10;
            if (rank.hasImagePack)
                keywordScore += 5;
            if (rank.hasVideoCarousel)
                keywordScore += 5;
            if (rank.hasPeopleAlsoAsk)
                keywordScore += 5;
            totalScore += Math.min(keywordScore, 100);
            totalKeywords++;
        }
        return totalKeywords > 0 ? totalScore / totalKeywords : 0;
    }
    /**
     * Local Score: Based on map pack appearances, local rankings
     */
    async computeLocalScore(businessId) {
        const visibilityMetrics = await repositories_1.repositories.visibilityMetric.findMany({
            where: {
                businessId,
                periodStart: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                },
            },
            orderBy: { periodStart: 'desc' },
            take: 1,
        });
        if (visibilityMetrics.length === 0)
            return 0;
        const metric = visibilityMetrics[0];
        const mapPackScore = Math.min((metric.mapPackVisibility / 100) * 100, 100);
        return mapPackScore;
    }
    /**
     * Social Score: Based on social presence, engagement (placeholder for now)
     */
    async computeSocialScore(businessId) {
        const profile = await repositories_1.repositories.brandProfile.findFirst({ where: { businessId } });
        if (!profile)
            return 0;
        // Basic score for having a profile set up
        let score = 50;
        if (profile.websiteUrl)
            score += 10;
        if (profile.status === 'completed')
            score += 40;
        return score;
    }
    /**
     * Reputation Score: Based on reviews, ratings, sentiment
     */
    async computeReputationScore(businessId) {
        const reviews = await repositories_1.repositories.review.findMany({ where: { businessId } });
        if (!reviews || reviews.length === 0)
            return 0;
        // Calculate average rating
        const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
        const averageRating = totalRating / reviews.length;
        // Normalize 5-star rating to 0-100 score
        return Math.round((averageRating / 5) * 100);
    }
    /**
     * Consistency Score: Based on Brand DNA adherence (rules-based v0)
     */
    async computeConsistencyScore(businessId) {
        const dna = await repositories_1.repositories.brandDNA.findFirst({ where: { businessId } });
        if (!dna)
            return 0;
        let score = 0;
        // Check for presence of key DNA elements
        if (dna.values && dna.values.length > 0)
            score += 25;
        if (dna.mission)
            score += 25;
        if (dna.voice)
            score += 25;
        if (dna.audience)
            score += 25;
        return score;
    }
    /**
     * Trust Score: Proxy based on rating velocity, sentiment, response rate
     */
    async computeTrustScore(businessId) {
        // Trust is heavily influenced by reputation and engagement
        const reputationScore = await this.computeReputationScore(businessId);
        // Simple trust proxy: 80% reputation + 20% base trust if DNA exists
        const consistencyScore = await this.computeConsistencyScore(businessId);
        const hasIdentity = consistencyScore > 50;
        return Math.round((reputationScore * 0.8) + (hasIdentity ? 20 : 0));
    }
    /**
     * Save all scores to database
     */
    async saveScores(businessId, periodStart, periodEnd) {
        const visibilityScore = await this.computeVisibilityScore(businessId);
        const trustScore = await this.computeTrustScore(businessId);
        const consistencyScore = await this.computeConsistencyScore(businessId);
        const existing = await repositories_1.repositories.brandScore.findByBusinessIdAndPeriod(businessId, periodStart, periodEnd);
        const scoreData = {
            businessId,
            visibilityScore,
            trustScore,
            consistencyScore,
            visibilityBreakdown: {
                search: await this.computeSearchScore(businessId),
                local: await this.computeLocalScore(businessId),
                social: await this.computeSocialScore(businessId),
                reputation: await this.computeReputationScore(businessId),
                consistency: consistencyScore,
            },
            trustBreakdown: {
                rating: 0, // TODO: Compute from reviews
                reviewCount: 0,
                responseRate: 0,
                sentiment: 0,
            },
            consistencyBreakdown: {
                namingConsistency: 0,
                brandingConsistency: 0,
                messagingConsistency: 0,
            },
            periodStart,
            periodEnd,
            computedAt: new Date(),
        };
        if (existing) {
            return repositories_1.repositories.brandScore.update(existing.id, scoreData);
        }
        else {
            return repositories_1.repositories.brandScore.create({
                ...scoreData,
                business: { connect: { id: businessId } }
            });
        }
    }
}
exports.BrandScoringService = BrandScoringService;
exports.brandScoringService = new BrandScoringService();
