import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();


// configure the Postgres pool; copy the same SSL logic used by TypeORM
const poolConfig: any = { connectionString: process.env.DATABASE_URL };
// mirror the automatic ssl detection from data-source.ts
const dbUrl = process.env.DATABASE_URL || '';
const remote = dbUrl && !/^postgres(?:ql)?:\/\/(?:[^@]*@)?(?:localhost|127\.0\.0\.1)/.test(dbUrl);
if (remote || process.env.DATABASE_SSL === 'true' || dbUrl.includes('sslmode=require')) {
  poolConfig.ssl = { rejectUnauthorized: false };
}
const pool = new Pool(poolConfig);

export default pool;