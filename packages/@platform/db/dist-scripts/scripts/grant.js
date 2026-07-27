"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
async function main() {
    const client = new pg_1.Client({ connectionString: 'postgresql://postgres:password@localhost:5432/reviewrise_db?sslmode=prefer' });
    try {
        await client.connect();
        await client.query('GRANT ALL PRIVILEGES ON SCHEMA public TO reviewrise_app;');
        await client.query('GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO reviewrise_app;');
        await client.query('GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO reviewrise_app;');
        console.log('✅ Privileges restored to reviewrise_app');
    }
    catch (err) {
        console.error('Error granting privileges:', err);
    }
    finally {
        await client.end();
    }
}
main();
