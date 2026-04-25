/**
 * Payment utilities for amount handling and validation
 */

interface CurrencyConfig {
  minAmount: number; // Minimum amount in smallest unit (cents for USD)
  decimals: number;  // Number of decimal places for the currency
}

// Stripe minimum amounts and decimal places per currency
const CURRENCY_CONFIG: Record<string, CurrencyConfig> = {
  usd: { minAmount: 50, decimals: 2 },      // $0.50 minimum
  eur: { minAmount: 50, decimals: 2 },      // €0.50 minimum
  gbp: { minAmount: 30, decimals: 2 },      // £0.30 minimum
  cad: { minAmount: 50, decimals: 2 },      // $0.50 CAD minimum
  aud: { minAmount: 50, decimals: 2 },      // $0.50 AUD minimum
  jpy: { minAmount: 50, decimals: 0 },      // ¥50 minimum
  inr: { minAmount: 100, decimals: 2 },     // ₹1.00 minimum
};

/**
 * Converts an amount from decimal dollars/euros to smallest currency unit (cents)
 * Example: convertToSmallestUnit('usd', 24) => 2400 (cents)
 * 
 * @param currency - Currency code (usd, eur, gbp, etc)
 * @param decimalAmount - Amount in decimal format (e.g., 24.99)
 * @returns Amount in smallest currency unit (e.g., 2499 cents)
 * @throws Error if currency is unsupported or amount is invalid
 */
export function convertToSmallestUnit(currency: string, decimalAmount: number): number {
  const currencyLower = currency.toLowerCase();
  const config = CURRENCY_CONFIG[currencyLower];

  if (!config) {
    throw new Error(`Unsupported currency: ${currency}. Supported: ${Object.keys(CURRENCY_CONFIG).join(', ')}`);
  }

  if (typeof decimalAmount !== 'number' || decimalAmount <= 0) {
    throw new Error('Amount must be a positive number');
  }

  // Convert to smallest unit
  const multiplier = Math.pow(10, config.decimals);
  const smallestUnitAmount = Math.round(decimalAmount * multiplier);

  // Validate against minimum
  if (smallestUnitAmount < config.minAmount) {
    const minDecimal = config.minAmount / multiplier;
    throw new Error(
      `Amount ${decimalAmount} ${currencyLower.toUpperCase()} is below minimum of ${minDecimal} ${currencyLower.toUpperCase()}`
    );
  }

  return smallestUnitAmount;
}

/**
 * Validates payment parameters
 * @param amount - Amount in smallest unit (cents for USD)
 * @param currency - Currency code
 */
export function validatePaymentAmount(amount: number, currency: string): void {
  const currencyLower = currency.toLowerCase();
  const config = CURRENCY_CONFIG[currencyLower];

  if (!config) {
    throw new Error(`Unsupported currency: ${currency}`);
  }

  if (!Number.isInteger(amount)) {
    throw new Error(`Amount must be an integer in smallest currency unit (cents for ${currencyLower.toUpperCase()})`);
  }

  if (amount < config.minAmount) {
    const minDecimal = config.minAmount / Math.pow(10, config.decimals);
    throw new Error(`Amount ${amount} is below minimum of ${minDecimal} ${currencyLower.toUpperCase()}`);
  }
}

/**
 * Converts amount from smallest unit back to decimal
 * Example: convertFromSmallestUnit('usd', 2400) => 24.00
 */
export function convertFromSmallestUnit(currency: string, smallestUnitAmount: number): number {
  const currencyLower = currency.toLowerCase();
  const config = CURRENCY_CONFIG[currencyLower];

  if (!config) {
    throw new Error(`Unsupported currency: ${currency}`);
  }

  const divisor = Math.pow(10, config.decimals);
  return smallestUnitAmount / divisor;
}
