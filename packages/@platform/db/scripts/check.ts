import dotenv from 'dotenv';
import path from 'path';

try {
    dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
} catch (e) { }

async function main() {
    const { prisma } = await import('../src/client');

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
