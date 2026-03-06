import { AppDataSource } from '../data-source';

async function run() {
  try {
    await AppDataSource.initialize();
    console.log('Data source initialized');

    const migrations = await AppDataSource.runMigrations();
    console.log('Applied migrations:', migrations.map(m => m.name));

    await AppDataSource.destroy();
    process.exit(0);
  } catch (err) {
    console.error('Migration error', err);
    process.exit(1);
  }
}

run();
