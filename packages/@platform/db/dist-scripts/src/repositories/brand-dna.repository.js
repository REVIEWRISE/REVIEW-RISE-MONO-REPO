"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.brandDNARepository = exports.BrandDNARepository = void 0;
const client_1 = require("../client");
const base_repository_1 = require("./base.repository");
class BrandDNARepository extends base_repository_1.BaseRepository {
    constructor() {
        super(client_1.prisma.brandDNA, 'BrandDNA');
    }
    async findByBusinessId(businessId) {
        return this.findFirst({
            where: { businessId },
        });
    }
}
exports.BrandDNARepository = BrandDNARepository;
exports.brandDNARepository = new BrandDNARepository();
