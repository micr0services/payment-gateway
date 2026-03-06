import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { Transaction } from './entities/Transaction';

// load environment early so configuration values are available
dotenv.config();

// a simple data source that mirrors the existing PostgreSQL connection

// build the base configuration object
const dsOptions: any = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: false, // we use explicit migrations
  logging: false,
  entities: [Transaction],
  migrations: ['src/migration/**/*.ts'],
  // subscribers: [],
};

// determine whether SSL is needed.
// default to true for any host that is not localhost, or if the caller
// explicitly sets DATABASE_SSL=true or includes sslmode=require in the url.
const url = process.env.DATABASE_URL || '';
const remoteHost = url && !/^postgres(?:ql)?:\/\/(?:[^@]*@)?(?:localhost|127\.0\.0\.1)/.test(url);
if (remoteHost || process.env.DATABASE_SSL === 'true' || url.includes('sslmode=require')) {
  // pg expects an object for ssl; rejectUnauthorized=false is common for
  // managed hosts with self‑signed certs (e.g. Supabase, Render, etc.).
  dsOptions.ssl = { rejectUnauthorized: false };
}

export const AppDataSource = new DataSource(dsOptions);
