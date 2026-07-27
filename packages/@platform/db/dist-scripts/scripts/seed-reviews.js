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
console.log('Script started...');
// Load environment variables
const envPath = path_1.default.resolve(__dirname, '../../../../.env');
console.log('Loading .env from:', envPath);
try {
    const result = dotenv_1.default.config({ path: envPath });
    if (result.error) {
        console.warn('⚠️  Dotenv loaded with error:', result.error.message);
    }
    else {
        console.log('✅ Loaded .env');
    }
}
catch (error) {
    console.log('ℹ️  Skipping .env load:', error.message);
}
if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is missing from environment variables');
    process.exit(1);
}
else {
    // Obscure password/key
    const safeUrl = process.env.DATABASE_URL.replace(/:[^:@]*@/, ':****@');
    console.log('ℹ️  DATABASE_URL found:', safeUrl);
}
let prisma;
async function main() {
    console.log('Importing Prisma client...');
    try {
        const clientModule = await Promise.resolve().then(() => __importStar(require('../src/client')));
        prisma = clientModule.prisma;
        console.log('✅ Prisma client imported');
    }
    catch (e) {
        console.error('❌ Failed to import Prisma client:', e);
        throw e;
    }
    console.log('🌱 Starting review seed...');
    // Get all locations
    let locations;
    try {
        console.log('Fetching locations...');
        locations = await prisma.location.findMany();
    }
    catch (e) {
        console.error('❌ Failed to fetch locations:', e);
        throw e;
    }
    if (locations.length === 0) {
        console.log('⚠️ No locations found. Please run basic seed first.');
        return;
    }
    console.log(`Found ${locations.length} locations. Generating reviews...`);
    const reviewTemplates = [
        // Positive Reviews
        { rating: 5, sentiment: 'positive', content: 'Absolutely loved the service! The staff was friendly and efficient.', tags: ['service', 'staff', 'friendly'] },
        { rating: 5, sentiment: 'positive', content: 'Best experience I have had in a long time. Highly recommend to everyone.', tags: ['experience', 'recommend'] },
        { rating: 4, sentiment: 'positive', content: 'Great food, but the wait was a bit long. Still worth it!', tags: ['food', 'wait time'] },
        { rating: 5, sentiment: 'positive', content: 'Amazing atmosphere and delicious meals. Will definitely come back.', tags: ['atmosphere', 'food'] },
        { rating: 4, sentiment: 'positive', content: 'Good value for money. The portions were huge.', tags: ['value', 'portions'] },
        // Neutral Reviews
        { rating: 3, sentiment: 'neutral', content: 'It was okay. Nothing special, but not bad either.', tags: ['average'] },
        { rating: 3, sentiment: 'neutral', content: 'Service was average. Food was decent.', tags: ['service', 'food'] },
        { rating: 3, sentiment: 'neutral', content: 'A bit pricey for what you get, but convenient location.', tags: ['price', 'location'] },
        // Negative Reviews
        { rating: 2, sentiment: 'negative', content: 'Disappointed with the quality. The food was cold.', tags: ['quality', 'food', 'cold'] },
        { rating: 1, sentiment: 'negative', content: 'Terrible service. Waiter was rude and ignored us.', tags: ['service', 'rude', 'waiter'] },
        { rating: 1, sentiment: 'negative', content: 'Complete waste of money. Do not recommend.', tags: ['value', 'recommend'] },
        { rating: 2, sentiment: 'negative', content: 'Too noisy and crowded. Could not hear myself think.', tags: ['atmosphere', 'noise'] },
    ];
    const platforms = ['google', 'facebook', 'yelp'];
    let totalCreated = 0;
    for (const location of locations) {
        console.log(`Generating reviews for location: ${location.name}`);
        // Generate 10-15 random reviews per location
        const count = Math.floor(Math.random() * 6) + 10;
        for (let i = 0; i < count; i++) {
            const template = reviewTemplates[Math.floor(Math.random() * reviewTemplates.length)];
            const platform = platforms[Math.floor(Math.random() * platforms.length)];
            // Randomly decide if this review is already analyzed or needs analysis
            // 70% analyzed, 30% unanalyzed (sentiment: null)
            const isAnalyzed = Math.random() > 0.3;
            const publishedAt = new Date();
            publishedAt.setDate(publishedAt.getDate() - Math.floor(Math.random() * 30)); // Random date in last 30 days for better dashboard visibility
            try {
                await prisma.review.create({
                    data: {
                        businessId: location.businessId,
                        locationId: location.id,
                        platform: platform,
                        externalId: `seed-${location.id}-${i}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                        author: `User ${Math.floor(Math.random() * 1000)}`,
                        rating: template.rating,
                        content: template.content,
                        sentiment: isAnalyzed ? template.sentiment : null,
                        tags: isAnalyzed ? template.tags : [],
                        publishedAt: publishedAt,
                        createdAt: publishedAt, // To simulate history
                        aiSuggestions: isAnalyzed ? {
                            analysis: `Simulated analysis for: ${template.content}`,
                            confidence: 85 + Math.floor(Math.random() * 15),
                            reasoning: "Based on keywords and sentiment score.",
                            primaryEmotion: template.sentiment === 'Positive' ? 'Joy' : template.sentiment === 'Negative' ? 'Frustration' : 'Indifference',
                            topics: template.tags
                        } : undefined
                    }
                });
                totalCreated++;
            }
            catch (err) {
                console.error('Failed to create review:', err);
            }
        }
    }
    console.log(`✅ Successfully seeded ${totalCreated} reviews.`);
}
main()
    .catch((e) => {
    console.error('CRITICAL ERROR in main:', e);
    process.exit(1);
})
    .finally(async () => {
    if (prisma) {
        console.log('Disconnecting...');
        await prisma.$disconnect();
    }
});
