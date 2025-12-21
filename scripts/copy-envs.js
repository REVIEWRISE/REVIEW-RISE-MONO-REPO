const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const ignoreDirs = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage'];

function walkDir(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (!ignoreDirs.includes(file)) {
                walkDir(fullPath);
            }
        } else if (file === '.env.example') {
            const envPath = path.join(dir, '.env');

            // --- CHANGE START ---
            // Check if .env already exists and delete it
            if (fs.existsSync(envPath)) {
                try {
                    fs.unlinkSync(envPath);
                    console.log(`Deleted old .env in ${dir}`);
                } catch (err) {
                    console.error(`Error deleting existing .env in ${dir}:`, err);
                    continue; // Skip copy if we couldn't delete the old one
                }
            }

            // Copy the new file
            try {
                fs.copyFileSync(fullPath, envPath);
                console.log(`Created .env from .env.example in ${dir}`);
            } catch (err) {
                console.error(`Error copying .env in ${dir}:`, err);
            }
            // --- CHANGE END ---
        }
    }
}

console.log('Scanning for .env.example files...');
walkDir(rootDir);
console.log('Done.');