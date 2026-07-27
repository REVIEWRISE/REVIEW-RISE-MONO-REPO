"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportRepository = exports.ReportRepository = void 0;
const client_1 = require("../client");
const base_repository_1 = require("./base.repository");
class ReportRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(client_1.prisma.report, 'Report');
    }
    async findByBusinessId(businessId) {
        return this.delegate.findMany({
            where: { businessId },
            orderBy: { generatedAt: 'desc' },
        });
    }
}
exports.ReportRepository = ReportRepository;
exports.reportRepository = new ReportRepository();
