import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

let pool: InstanceType<typeof Pool>;

const connectDB = async () => {
    try {
        pool = new Pool({
            connectionString: process.env.DB_INTERNAL_URL,
            ssl: { rejectUnauthorized: false }
        });

        const client = await pool.connect();
        console.log(`\nPostgreSQL connected successfully!`);
        client.release();

        pool.on('error', (err) => {
            console.error(' Database pool error:', err);
        });

    } catch (error) {
        console.log("PostgreSQL connection error:", error);
        process.exit(1);
    }
};

const closeDB = async () => {
    if (!pool) return;
    try {
        await pool.end();
        console.log('PostgreSQL pool has ended.');
    } catch (err) {
        console.error('Error closing PostgreSQL pool:', err);
    }
};

export { connectDB, pool, closeDB };