"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load env vars from root
const envPath = path_1.default.resolve(__dirname, '../../../../.env'); // packages/@platform/db/scripts/.. -> packages/@platform/db -> packages/@platform -> packages -> root
dotenv_1.default.config({ path: envPath });
const adminUrl = process.env.DATABASE_ADMIN_URL;
if (!adminUrl) {
    console.error('Error: DATABASE_ADMIN_URL is not defined in .env');
    process.exit(1);
}
// Check if we are aiming for the same DB
// Simple check: compare host/port/dbname if possible, or just trust the user.
// This script assumes we want to run the command AGAINST the DB pointed to by adminUrl
// BUT masquerading as DATABASE_URL for Prisma.
console.log('🔒 switching to ADMIN credentials for migration...');
const env = {
    ...process.env,
    DATABASE_URL: adminUrl,
};
// get args
const args = process.argv.slice(2);
const command = args[0]; // e.g. "prisma"
const commandArgs = args.slice(1);
// Windows compatibility for spawning commands (npx, prisma, etc)
const isWin = process.platform === 'win32';
const cmd = isWin && command === 'prisma' ? 'prisma.cmd' : command;
const child = (0, child_process_1.spawn)(cmd, commandArgs, {
    env,
    stdio: 'inherit',
    shell: true
});
child.on('exit', (code) => {
    process.exit(code ?? 0);
});
