"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment variables
const envPath = path_1.default.resolve(__dirname, '../../../../.env');
dotenv_1.default.config({ path: envPath });
let prisma;
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
// Simulate gradual growth trend: base × (1 + growthRate * dayOffset / totalDays)
function trendedValue(base, growthFraction, dayOffset, totalDays, jitter = 0.15) {
    const trend = base * (1 + growthFraction * (dayOffset / totalDays));
    const noise = trend * jitter * (Math.random() * 2 - 1);
    return Math.max(0, Math.round(trend + noise));
}
async function main() {
    const clientModule = await Promise.resolve().then(() => __importStar(require('../src/client.js')));
    prisma = clientModule.prisma;
    const locationId = '11111111-1111-4111-8111-111111111111'; // ACME Downtown
    console.log('🌱 Seeding location_metrics for ACME Downtown (90 days)...');
    // Verify location exists
    const location = await prisma.location.findUnique({ where: { id: locationId } });
    if (!location) {
        console.error('❌ Location not found. Run pnpm db:seed first.');
        process.exit(1);
    }
    // Wipe existing metrics for a clean seed
    await prisma.$executeRawUnsafe(`DELETE FROM "location_metrics" WHERE "locationId" = $1::uuid`, locationId);
    await prisma.$executeRawUnsafe(`DELETE FROM "metric_jobs" WHERE "locationId" = $1::uuid`, locationId);
    console.log('🧹 Cleaned existing metrics');
    // Seed 90 days of daily metrics (trending upward ~30% growth)
    const DAYS = 90;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let seeded = 0;
    for (let i = DAYS; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dayOffset = DAYS - i; // 0 = oldest, 90 = today
        const impressionsDiscovery = trendedValue(320, 0.3, dayOffset, DAYS);
        const impressionsDirect = trendedValue(110, 0.2, dayOffset, DAYS);
        const impressionsTotal = impressionsDiscovery + impressionsDirect;
        const photoViews = trendedValue(90, 0.4, dayOffset, DAYS);
        const visibilityScore = Math.min(100, Math.round(60 + (dayOffset / DAYS) * 18 + (Math.random() * 4 - 2)));
        await prisma.$executeRawUnsafe(`INSERT INTO "location_metrics" (
                "id", "locationId", "date",
                "impressionsTotal", "impressionsDiscovery", "impressionsDirect",
                "photoViews", "visibilityScore", "createdAt", "updatedAt"
            )
            VALUES (gen_random_uuid(), $1::uuid, $2::date, $3, $4, $5, $6, $7, NOW(), NOW())
            ON CONFLICT ("locationId", "date") DO UPDATE SET
                "impressionsTotal" = $3,
                "impressionsDiscovery" = $4,
                "impressionsDirect" = $5,
                "photoViews" = $6,
                "visibilityScore" = $7,
                "updatedAt" = NOW()`, locationId, date, impressionsTotal, impressionsDiscovery, impressionsDirect, photoViews, visibilityScore);
        seeded++;
    }
    // Log a success job
    await prisma.$executeRawUnsafe(`INSERT INTO "metric_jobs" ("id", "locationId", "jobType", "status", "startedAt", "finishedAt")
         VALUES (gen_random_uuid(), $1::uuid, 'metrics_backfill', 'success', NOW(), NOW())`, locationId);
    console.log(`✅ Seeded ${seeded} daily metric records`);
    // Seed 3 sample location_competitors
    console.log('\n🌱 Seeding location_competitors...');
    await prisma.$executeRawUnsafe(`DELETE FROM "location_competitors" WHERE "locationId" = $1::uuid`, locationId);
    const competitors = [
        { name: "Blue Bottle Coffee", rating: 4.7, reviewCount: 2100, photoCount: 85, estVisibility: 82 },
        { name: "Ritual Coffee Roasters", rating: 4.6, reviewCount: 1450, photoCount: 62, estVisibility: 74 },
        { name: "Equator Coffees", rating: 4.5, reviewCount: 980, photoCount: 40, estVisibility: 61 },
    ];
    for (const c of competitors) {
        await prisma.$executeRawUnsafe(`INSERT INTO "location_competitors" (
                "id", "locationId", "competitorName", "rating", "reviewCount", "photoCount", "estimatedVisibility", "createdAt"
            )
            VALUES (gen_random_uuid(), $1::uuid, $2, $3, $4, $5, $6, NOW())`, locationId, c.name, c.rating, c.reviewCount, c.photoCount, c.estVisibility);
        console.log(`  ✓ Added competitor: ${c.name}`);
    }
    console.log('\n✅ Seed complete!');
    console.log(`📊 Location: ${locationId}`);
    console.log(`📈 90 days of daily metrics seeded (trending +30% impressions, +40% photo views)`);
    console.log(`🏆 3 local competitors added`);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
