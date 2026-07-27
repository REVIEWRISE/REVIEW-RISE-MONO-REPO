"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.competitorRepository = exports.CompetitorRepository = void 0;
const client_1 = require("../client");
const base_repository_1 = require("./base.repository");
class CompetitorRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(client_1.prisma.competitor, 'Competitor');
    }
    async findByBusinessId(businessId) {
        return this.delegate.findMany({
            where: { businessId },
        });
    }
}
exports.CompetitorRepository = CompetitorRepository;
exports.competitorRepository = new CompetitorRepository();
