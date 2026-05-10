import { defineConfig } from '@prisma/config';

// Load .env only in local development — in production/Docker, DATABASE_URL
// is already injected via environment variables so dotenv is not needed.
if (process.env.NODE_ENV !== 'production') {
    try {
        // Dynamic require so this file doesn't hard-depend on dotenv at runtime
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const dotenv = require('dotenv');
        dotenv.config({ path: '../../../.env' });
    } catch {
        // dotenv not available — fine in production containers
    }
}

const url = process.env.DATABASE_URL;
if (!url) {
    throw new Error('DATABASE_URL environment variable is not set');
}

export default defineConfig({
    datasource: {
        url,
    },
});
