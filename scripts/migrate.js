import postgres from 'postgres';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrate() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const sql = postgres(databaseUrl);

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'migrations', '0001_create_transactions.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Split by -- Down migration and take only the up migration
    const upMigration = migrationSQL.split('-- Down migration')[0].trim();

    console.log('Running migration...');
    await sql.unsafe(upMigration);
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

migrate();