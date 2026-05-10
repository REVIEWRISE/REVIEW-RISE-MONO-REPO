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
try {
    dotenv_1.default.config({ path: envPath });
}
catch (e) {
    // Ignore missing .env in production
}
async function seedCompetitorData() {
    // Dynamic import to ensure env vars are loaded first
    const { prisma } = await Promise.resolve().then(() => __importStar(require('../src/client')));
    console.log('🌱 Seeding Competitor data...');
    try {
        // 1. Get the ACME Restaurant business
        const business = await prisma.business.findUnique({
            where: { slug: 'acme-restaurant' },
        });
        if (!business) {
            console.log('⚠️ ACME Restaurant not found. Skipping competitor seeding. Please run the main seed script first.');
            return;
        }
        console.log(`✓ Found business: ${business.name} (${business.id})`);
        // 2. Create Competitors
        const competitorsData = [
            {
                domain: 'joeys-pizza.com',
                name: "Joey's Pizza",
                type: 'DIRECT_LOCAL',
                website: 'https://joeys-pizza.com',
            },
            {
                domain: 'dominos.com',
                name: "Domino's",
                type: 'AGGREGATOR', // Technically a chain, but acting as a major external force
                website: 'https://dominos.com',
            },
            {
                domain: 'sliceup.com',
                name: "Slice Up",
                type: 'UNKNOWN',
                website: 'https://sliceup.com',
            }
        ];
        const createdCompetitors = [];
        for (const data of competitorsData) {
            const competitor = await prisma.competitor.upsert({
                where: {
                    businessId_domain: {
                        businessId: business.id,
                        domain: data.domain,
                    },
                },
                update: {
                    type: data.type,
                },
                create: {
                    businessId: business.id,
                    name: data.name, // Added name here
                    domain: data.domain,
                    website: data.website,
                    type: data.type,
                },
            });
            createdCompetitors.push(competitor);
            console.log(`✓ Upserted competitor: ${competitor.domain}`);
        }
        // 3. Create a Competitor Snapshot for Joey's Pizza
        const joeys = createdCompetitors.find(c => c.name === "Joey's Pizza");
        if (joeys) {
            await prisma.competitorSnapshot.create({
                data: {
                    competitorId: joeys.id,
                    headline: "Best Pizza in Town",
                    uvp: "Authentic NY Style Pizza made with fresh ingredients.",
                    serviceList: ["Dine-in", "Takeout", "Delivery", "Catering"], // Renamed from services
                    pricingCues: ["$$"], // Mapped pricing to pricingCues array or similar logic
                    trustSignals: { badges: ["4.5 stars on Google"], certifications: ["Family owned since 1990"] }, // structured as JSON
                    ctaStyles: ["Order Now", "View Menu"],
                    differentiators: {
                        strengths: ["Strong local reputation", "High quality ingredients"],
                        weaknesses: ["Limited delivery radius", "No online ordering app"],
                        opportunities: ["Expand delivery", "Launch loyalty program"],
                        threats: ["Rising cheese prices"],
                        unique: ["Secret family recipe sauce", "Brick oven"],
                        summary: "A strong local competitor with a loyal following."
                    },
                    whatToLearn: ["Community engagement", "Authenticity"],
                    whatToAvoid: ["Slow delivery times during peak hours"]
                },
            });
            console.log(`✓ Created snapshot for ${joeys.name}`);
        }
        // 4. Create an Opportunities Report
        await prisma.opportunitiesReport.create({
            data: {
                businessId: business.id,
                // Removed status, summary (not in schema)
                gaps: [
                    { title: "Ordering Speed", description: "Your online ordering process is slower than Domino's", priority: 8 },
                    { title: "Catering", description: "Joey's Pizza offers better catering deals", priority: 6 }
                ],
                strategies: [
                    { title: "Improve Speed", description: "Optimize website load time", pros: ["Better UX"], cons: ["Cost"] },
                    { title: "Lunch Special", description: "Launch a 'Lunch Special' to compete with Slice Up", pros: ["Volume"], cons: ["Lower margin"] }
                ],
                positioningMap: {
                    x_axis: "Price",
                    y_axis: "Quality",
                    entities: [
                        { name: "You", x: 7, y: 8 },
                        { name: "Joey's Pizza", x: 6, y: 7 },
                        { name: "Domino's", x: 4, y: 5 },
                    ]
                },
                contentIdeas: [
                    { topic: "Fresh Ingredients", rationale: "Highlight quality difference", competitorGap: "High" },
                    { topic: "Kitchen Tour", rationale: "Show transparency", competitorGap: "Medium" }
                ],
                suggestedTaglines: ["Pizza Done Right", "Taste the Tradition"],
                generatedAt: new Date(),
            },
        });
        console.log(`✓ Created sample Opportunities Report`);
    }
    catch (error) {
        console.error('❌ Error seeding competitor data:', error);
        throw error;
    }
}
async function main() {
    const { prisma } = await Promise.resolve().then(() => __importStar(require('../src/client')));
    try {
        await seedCompetitorData();
    }
    catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
