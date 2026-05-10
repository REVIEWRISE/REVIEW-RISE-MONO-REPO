"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.brandProfileRepository = exports.BrandProfileRepository = void 0;
const client_1 = require("../client");
const base_repository_1 = require("./base.repository");
class BrandProfileRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(client_1.prisma.brandProfile, 'BrandProfile');
    }
    async findByBusinessId(businessId) {
        return this.findFirst({
            where: { businessId },
        });
    }
}
exports.BrandProfileRepository = BrandProfileRepository;
exports.brandProfileRepository = new BrandProfileRepository();
