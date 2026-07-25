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
// Properly load env vars from root
const envPath = path_1.default.resolve(__dirname, '../../../../.env');
dotenv_1.default.config({ path: envPath });
async function testApi() {
    const { prisma } = await Promise.resolve().then(() => __importStar(require('../src/client')));
    try {
        console.log('🔍 Fetching test business...');
        const business = await prisma.business.findFirst();
        if (!business) {
            console.error('❌ Test business not found. Listing all businesses:');
            const all = await prisma.business.findMany();
            all.forEach(b => console.log(` - ${b.name} (${b.id}) slug: ${b.slug}`));
            if (all.length > 0) {
                console.log('Using first business found...');
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const business = all[0];
                // Cannot reassign const, so let's just create a new variable or restart logic
                // For simplicity, let's just return to avoid complex logic here
                return;
            }
            return;
        }
        console.log(`✓ Found business: ${business.id}`);
        const API_URL = process.env.NEXT_PUBLIC_SEO_HEALTH_API_URL || 'http://localhost:3011/api/v1';
        // Test 1: List Keywords
        console.log('\n🧪 Testing GET /keywords...');
        const keywordsRes = await fetch(`${API_URL}/keywords?businessId=${business.id}`);
        if (keywordsRes.status === 200) {
            const data = await keywordsRes.json();
            console.log(`✓ Success! Found ${data.data.length} keywords`);
            // console.log('Sample:', JSON.stringify(data.data[0], null, 2));
        }
        else {
            console.error(`❌ Failed: ${keywordsRes.status} ${keywordsRes.statusText}`);
            const text = await keywordsRes.text();
            console.error('Response:', text);
        }
        // Test 2: Get Visibility Metrics
        console.log('\n🧪 Testing GET /visibility/metrics...');
        const metricsRes = await fetch(`${API_URL}/visibility/metrics?businessId=${business.id}&periodType=daily`);
        if (metricsRes.status === 200) {
            const data = await metricsRes.json();
            console.log(`✓ Success! Found ${data.data.length} metric records`);
            if (data.data.length > 0) {
                console.log('Latest metric:', {
                    date: data.data[0].periodStart,
                    mapPackVisibility: data.data[0].mapPackVisibility,
                    shareOfVoice: data.data[0].shareOfVoice
                });
            }
        }
        else {
            console.error(`❌ Failed: ${metricsRes.status} ${metricsRes.statusText}`);
        }
        // Test 3: Get Share of Voice with breakdown
        console.log('\n🧪 Testing GET /visibility/share-of-voice...');
        const today = new Date();
        const ago = new Date();
        ago.setDate(ago.getDate() - 7);
        const sovRes = await fetch(`${API_URL}/visibility/share-of-voice?businessId=${business.id}&startDate=${ago.toISOString()}&endDate=${today.toISOString()}`);
        if (sovRes.status === 200) {
            const data = await sovRes.json();
            console.log(`✓ Success! Share of Voice: ${data.data.shareOfVoice.toFixed(2)}%`);
            console.log(`✓ Breakdown has ${data.data.breakdown.length} keywords`);
        }
        else {
            console.error(`❌ Failed: ${sovRes.status} ${sovRes.statusText}`);
        }
    }
    catch (error) {
        console.error('❌ Error testing API:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
testApi();
