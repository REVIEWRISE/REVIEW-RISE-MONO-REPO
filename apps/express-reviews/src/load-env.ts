import dotenv from 'dotenv';
import path from 'path';

// Load service .env before any other modules read process.env (e.g. Google OAuth).
dotenv.config({ path: path.resolve(__dirname, '../.env') });
