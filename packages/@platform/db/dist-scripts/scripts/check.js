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
try {
    dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../../.env') });
}
catch (e) { }
async function main() {
    const { prisma } = await Promise.resolve().then(() => __importStar(require('../src/client')));
    const businesses = await prisma.business.findMany({
        include: {
            locations: {
                select: {
                    id: true,
                    name: true,
                    address: true,
                    status: true,
                }
            },
            userBusinessRoles: {
                include: {
                    user: { select: { id: true, email: true, name: true } }
                }
            }
        }
    });
    const snapshots = await prisma.seoSnapshot.findMany({ select: { url: true, healthScore: true, userId: true, createdAt: true } });
    const visibility = await prisma.visibilityMetric.findMany({ select: { businessId: true, locationId: true, periodType: true, periodStart: true, shareOfVoice: true } });
    const keywords = await prisma.keyword.findMany({ select: { businessId: true, locationId: true, keyword: true } });
    console.log('\n=== BUSINESS + LOCATION TREE ===\n');
    for (const biz of businesses) {
        console.log(`📦 Business: ${biz.name}`);
        console.log(`   ID:      ${biz.id}`);
        console.log(`   Website: ${biz.website || 'null'}`);
        console.log(`   Status:  ${biz.status}`);
        console.log(`   Users:`);
        for (const ubr of biz.userBusinessRoles) {
            console.log(`     - ${ubr.user.email} (${ubr.user.name})`);
        }
        console.log(`   Locations (${biz.locations.length}):`);
        for (const loc of biz.locations) {
            const locVisibility = visibility.filter(v => v.locationId === loc.id).length;
            const locKeywords = keywords.filter(k => k.locationId === loc.id).length;
            console.log(`     📍 ${loc.name}`);
            console.log(`        ID:         ${loc.id}`);
            console.log(`        Address:    ${loc.address || 'null'}`);
            console.log(`        Status:     ${loc.status}`);
            console.log(`        Visibility: ${locVisibility} records`);
            console.log(`        Keywords:   ${locKeywords}`);
        }
        const bizVisibility = visibility.filter(v => v.businessId === biz.id).length;
        const bizKeywords = keywords.filter(k => k.businessId === biz.id).length;
        console.log(`   Total VisibilityMetrics: ${bizVisibility}`);
        console.log(`   Total Keywords: ${bizKeywords}`);
        console.log('');
    }
    console.log('\n=== SEO SNAPSHOTS ===');
    for (const snap of snapshots) {
        console.log(`  URL: ${snap.url} | Score: ${snap.healthScore} | Created: ${snap.createdAt.toISOString().split('T')[0]}`);
    }
    await prisma.$disconnect();
}
main();
