import dotenv from 'dotenv';
import path from 'path';

// Properly load env vars from root
const envPath = path.resolve(__dirname, '../../../../.env');
try {
  dotenv.config({ path: envPath });
} catch (e) {
  // Ignore missing .env in production
}

/**
 * Seed script for SERP Visibility data
 * Creates test keywords and rank data for demonstration
 */

async function seedVisibilityData() {
  // Dynamic import to ensure env vars are loaded first
  const { prisma } = await import('../src/client');

  console.log('🌱 Seeding SERP visibility data...');

  try {
    const acmeBusinessId = 'a1dd8e07-694c-499f-a01a-2b991c283921';
    const acmeLocationId = '11111111-1111-4111-8111-111111111111';

    // Get the primary ACME business from the database
    let business = await prisma.business.findUnique({
      where: { id: acmeBusinessId }
    });

    if (!business) {
      console.warn('⚠️ ACME Restaurant business not found! Please run the main seed script first.');
      return;
    }
    console.log(`✓ Using business: ${business.name} (${business.id})`);

    // Get the ACME Downtown location
    let location = await prisma.location.findUnique({
      where: { id: acmeLocationId }
    });

    if (!location) {
      console.warn('⚠️ ACME Downtown location not found! Please run the main seed script first.');
      return;
    }
    console.log(`✓ Using location: ${location.name} (${location.id})`);

    // Define test keywords with realistic search volumes
    const keywordsData = [
      { keyword: 'best coffee shop nyc', volume: 5400, difficulty: 72 },
      { keyword: 'coffee near me', volume: 33100, difficulty: 45 },
      { keyword: 'specialty coffee new york', volume: 880, difficulty: 58 },
      { keyword: 'third wave coffee nyc', volume: 320, difficulty: 42 },
      { keyword: 'artisan coffee manhattan', volume: 720, difficulty: 55 },
      { keyword: 'organic coffee shop', volume: 1900, difficulty: 48 },
      { keyword: 'cold brew coffee nyc', volume: 2400, difficulty: 52 },
      { keyword: 'espresso bar new york', volume: 1300, difficulty: 60 },
      { keyword: 'coffee roastery nyc', volume: 590, difficulty: 65 },
      { keyword: 'cafe with wifi nyc', volume: 1100, difficulty: 38 },
    ];

    console.log('🔑 Creating keywords...');
    const keywords = [];

    for (const kw of keywordsData) {
      const keyword = await prisma.keyword.create({
        data: {
          businessId: business.id,
          locationId: location.id,
          keyword: kw.keyword,
          searchVolume: kw.volume,
          difficulty: kw.difficulty,
          tags: ['coffee', 'local'],
          status: 'active',
        },
      });
      keywords.push(keyword);
    }

    console.log(`✓ Created ${keywords.length} keywords`);

    // Generate rank data for the last 30 days
    console.log('📊 Generating rank data for last 30 days...');
    const today = new Date();
    let totalRanks = 0;

    for (let daysAgo = 29; daysAgo >= 0; daysAgo--) {
      const date = new Date(today);
      date.setDate(date.getDate() - daysAgo);
      date.setHours(0, 0, 0, 0);

      for (const keyword of keywords) {
        // Simulate rank fluctuations (better ranks for higher volume keywords)
        const baseRank = keyword.searchVolume && keyword.searchVolume > 5000
          ? Math.floor(Math.random() * 5) + 1
          : Math.floor(Math.random() * 15) + 1;

        // Add some variance
        const variance = Math.floor(Math.random() * 5) - 2;
        const rankPosition = Math.max(1, Math.min(100, baseRank + variance));

        // Map Pack presence (30% chance for local keywords)
        const hasMapPack = Math.random() < 0.3;
        const mapPackPosition = hasMapPack ? Math.floor(Math.random() * 3) + 1 : null;

        // SERP features (various probabilities)
        await prisma.keywordRank.create({
          data: {
            keywordId: keyword.id,
            rankPosition,
            mapPackPosition,
            hasFeaturedSnippet: Math.random() < 0.1,
            hasPeopleAlsoAsk: Math.random() < 0.4,
            hasLocalPack: hasMapPack,
            hasKnowledgePanel: Math.random() < 0.05,
            hasImagePack: Math.random() < 0.2,
            hasVideoCarousel: Math.random() < 0.15,
            rankingUrl: 'https://example.com',
            searchLocation: 'New York, NY',
            device: 'desktop',
            capturedAt: date,
          },
        });

        totalRanks++;
      }
    }

    console.log(`✓ Created ${totalRanks} rank records`);

    // Now compute visibility metrics for the last 7 days
    console.log('📈 Computing visibility metrics...');
    const { visibilityComputationService } = await import('../src/services/visibility-computation.service');

    for (let daysAgo = 6; daysAgo >= 0; daysAgo--) {
      const periodStart = new Date(today);
      periodStart.setDate(periodStart.getDate() - daysAgo);
      periodStart.setHours(0, 0, 0, 0);

      const periodEnd = new Date(periodStart);
      periodEnd.setHours(23, 59, 59, 999);

      await visibilityComputationService.computeAllMetrics(
        business.id,
        location.id,
        'daily',
        periodStart,
        periodEnd
      );
    }

    console.log('✓ Computed visibility metrics for last 7 days');

    console.log('📸 Creating SEO Snapshot...');
    const url = business.website || 'https://test-business.com';
    await prisma.seoSnapshot.deleteMany({
      where: { url }
    });

    await prisma.seoSnapshot.create({
      data: {
        url,
        healthScore: 82,
        categoryScores: {
          common_seo: { score: 90, percentage: 90 },
          server_security: { score: 75, percentage: 75 },
          advanced_seo: { score: 85, percentage: 85 },
          mobile: { score: 80, percentage: 80 }
        },
        recommendations: [
          { priority: "high", category: "technical", issue: "Slow page load time", recommendation: "Optimize images and minify CSS/JS", impact: "Severity: High" },
          { priority: "medium", category: "content", issue: "Missing H1 tag", recommendation: "Ensure each page has an H1 tag", impact: "Severity: Medium" },
          { priority: "low", category: "onPage", issue: "Missing alt text on some images", recommendation: "Add alt attributes to all images", impact: "Severity: Low" }
        ],
        seoElements: {
          title: { exists: true, length: 55, value: `${business.name} - Home` },
          metaDescription: { exists: true, length: 150 },
          headings: { h1Count: 0, h2Count: 5 },
          images: { properlySized: false },
          performance: { ttfb: 1.2 },
          advanced: { schemaDetected: true, schemaTypes: ['LocalBusiness'], schemaHasLocalBusiness: true }
        }
      }
    });
    console.log('✓ Created SEO snapshot');

    console.log('\n✅ Seeding completed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   - Business: ${business.name}`);
    console.log(`   - Location: ${location.name}`);
    console.log(`   - Keywords: ${keywords.length}`);
    console.log(`   - Rank records: ${totalRanks}`);
    console.log(`   - Visibility metrics: 7 days`);
    console.log(`   - SEO snapshots: 1\n`);

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  }
}

async function main() {
  const { prisma } = await import('../src/client');
  try {
    await seedVisibilityData();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
