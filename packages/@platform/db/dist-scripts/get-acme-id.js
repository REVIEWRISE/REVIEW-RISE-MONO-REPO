"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const business = await prisma.business.findUnique({
        where: { slug: 'acme-restaurant' },
    });
    if (business) {
        console.log(`BUSINESS_ID:${business.id}`);
    }
    else {
        console.log('BUSINESS_NOT_FOUND');
    }
}
main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
