"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewReplyRepository = exports.ReviewReplyRepository = void 0;
const client_1 = require("../client");
const base_repository_1 = require("./base.repository");
class ReviewReplyRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(client_1.prisma.reviewReply, 'ReviewReply');
    }
    async findByReviewId(reviewId) {
        return this.delegate.findMany({
            where: { reviewId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findLatestByReviewId(reviewId) {
        return this.delegate.findFirst({
            where: { reviewId },
            orderBy: { createdAt: 'desc' },
        });
    }
}
exports.ReviewReplyRepository = ReviewReplyRepository;
exports.reviewReplyRepository = new ReviewReplyRepository();
