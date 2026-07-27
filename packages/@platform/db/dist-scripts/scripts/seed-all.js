"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const envPath = path_1.default.resolve(__dirname, '../../../../.env');
try {
    const result = dotenv_1.default.config({ path: envPath });
    if (result.error) {
        // console.warn('⚠️  Dotenv loaded with error (ignoring if env vars exist):', result.error.message);
    }
}
catch (error) {
    // console.log('ℹ️  Skipping .env load (likely in production/docker)');
}
function runScript(scriptRelPath) {
    return new Promise((resolve, reject) => {
        const isWin = process.platform === 'win32';
        const cmd = isWin ? 'tsx.cmd' : 'tsx';
        const child = (0, child_process_1.spawn)(cmd, [scriptRelPath], {
            stdio: 'inherit',
            shell: true,
            env: process.env,
            cwd: path_1.default.resolve(__dirname, '../') // run from package dir to avoid Windows space path issues
        });
        child.on('exit', (code) => {
            if (code === 0)
                resolve();
            else
                reject(new Error(`Script failed: ${scriptRelPath} (code ${code})`));
        });
    });
}
async function main() {
    console.log('🌱 Seeding: base data');
    await runScript('scripts/seed.ts');
    console.log('🌱 Seeding: visibility data');
    await runScript('scripts/seed-visibility.ts');
    console.log('🌱 Seeding: competitors data');
    await runScript('scripts/seed-competitors.ts');
    console.log('🌱 Seeding: brand rise data');
    await runScript('scripts/seed-brand-rise.ts');
    console.log('🌱 Seeding: reviews data');
    await runScript('scripts/seed-reviews.ts');
    console.log('🌱 Seeding: metrics data');
    await runScript('scripts/seed-metrics.ts');
    console.log('🌱 Seeding: GBP profile snapshots');
    await runScript('scripts/seed-snapshot.ts');
    console.log('✅ All seeders completed');
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
