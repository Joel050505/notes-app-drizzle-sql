import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "./schema";

// MySQL anslutningspool
const pool = mysql.createPool(process.env.DATABASE_URL!);
// URL ligger i .env filen som är kopplat till mitt MySQL DB

// Drizzle som använder anslutningspoolen
export const db = drizzle(pool, { schema, mode: "default" });
