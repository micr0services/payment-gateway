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

  // Add SSL configuration for Render PostgreSQL
  const sql = postgres(databaseUrl, {
    ssl: 'require'
  });

  try {
    // Read the migration files in order
    const migrations = [
      '0001_create_transactions.sql',
      '0002_add_payment_provider_ids.sql'
    ];

    for (const migrationFile of migrations) {
      const migrationPath = path.join(__dirname, '..', 'migrations', migrationFile);
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

      // Split by -- Down migration and take only the up migration
      const upMigration = migrationSQL.split('-- Down migration')[0].trim();

      console.log(`Running migration: ${migrationFile}`);
      await sql.unsafe(upMigration);
      console.log(`Migration ${migrationFile} completed successfully!`);
    }
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

migrate();