import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTransactions1688612345678 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        idempotency_key VARCHAR(255) UNIQUE NOT NULL,
        gateway VARCHAR(50) NOT NULL,
        amount INTEGER NOT NULL,
        currency VARCHAR(3) NOT NULL DEFAULT 'USD',
        status VARCHAR(50) NOT NULL,
        transaction_id VARCHAR(255),
        error TEXT,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS transactions;`);
  }
}
