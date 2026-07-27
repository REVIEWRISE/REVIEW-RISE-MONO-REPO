import dotenv from 'dotenv';
import path from 'path';
import { spawn } from 'child_process';

const envPath = path.resolve(__dirname, '../../../../.env');
try {
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    // console.warn('⚠️  Dotenv loaded with error (ignoring if env vars exist):', result.error.message);
  }
} catch (error) {
  // console.log('ℹ️  Skipping .env load (likely in production/docker)');
}

function runScript(scriptRelPath: string) {
  return new Promise<void>((resolve, reject) => {
    const isWin = process.platform === 'win32';

    // In production the scripts are pre-compiled to dist-scripts/*.js
    // Use node to run them directly — no tsx needed.
    const scriptName = path.basename(scriptRelPath, '.ts') + '.js';
    const compiledPath = path.resolve(__dirname, '../dist-scripts', scriptName);
    const fs = require('fs');

    let cmd: string;
    let args: string[];

    if (fs.existsSync(compiledPath)) {
      cmd = 'node';
      args = [compiledPath];
    } else {
      // Local dev fallback — use tsx
      cmd = isWin ? 'tsx.cmd' : 'tsx';
      args = [scriptRelPath];
    }

    const child = spawn(cmd, args, {
      stdio: 'inherit',
      shell: false,
      env: process.env,
      cwd: path.resolve(__dirname, '../'),
    });
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Script failed: ${scriptRelPath} (code ${code})`));
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
