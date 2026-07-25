import { defineConfig } from '@prisma/config';

// Load .env only in local development — in production/Docker, DATABASE_URL
// is already injected via environment variables so dotenv is not needed.
if (process.env.NODE_ENV !== 'production') {
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const dotenv = require('dotenv');
        dotenv.config({ path: '../../../.env' });
    } catch {
        // dotenv not available — fine in production containers
    }
}

// During `prisma generate` (build time) DATABASE_URL is not required.
// It is only required at migration/query time.
const url = process.env.DATABASE_URL ?? 'postgresql://placeholder:placeholder@localhost:5432/placeholder';

export default defineConfig({
    datasource: {
        url,
    },
});
