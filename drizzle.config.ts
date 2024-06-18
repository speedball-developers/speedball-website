import { defineConfig } from 'drizzle-kit';
// import dotenv from 'dotenv';
// dotenv.config();
import 'dotenv/config';

export default defineConfig({
	dialect: 'mysql',
	schema: './src/lib/server/schema.ts',
	out: './src/lib/server/drizzle',
	driver: 'mysql2',
	dbCredentials: {
		host: process.env.DATABASE_URL,
		user: process.env.DATABASE_USER,
		database: process.env.DATABASE_DATABASE,
		password: process.env.DATABASE_PASSWORD
	}
});
