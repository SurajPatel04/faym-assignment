import dotenv from 'dotenv';
dotenv.config();
import app from './app.js';
import { env } from './config/env.js';
import prisma from './config/db.js';

const PORT = env.port;
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

const connectWithRetry = async (retriesLeft = MAX_RETRIES) => {
    try {
        await prisma.$connect();
        console.log('Connected to the database successfully.');

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

    } catch (error) {
        console.error(`DB connection failed. Retries left: ${retriesLeft}`);

        if (retriesLeft === 0) {
            console.error('Max retries reached. Shutting down.');
            process.exit(1);
        }

        console.log(`Retrying in ${RETRY_DELAY_MS / 1000} seconds...`);
        setTimeout(() => connectWithRetry(retriesLeft - 1), RETRY_DELAY_MS);
    }
};

connectWithRetry();