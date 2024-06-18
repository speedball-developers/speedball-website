import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

import dotenv from 'dotenv';
dotenv.config();

// const connection = await mysql.createConnection({
const connection = mysql.createPool({
	host: process.env.DATABASE_URL,
	user: process.env.DATABASE_USER,
	database: process.env.DATABASE_DATABASE,
	password: process.env.DATABASE_PASSWORD
});
export const db = drizzle(connection);
