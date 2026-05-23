/**
 * Utility functions for phone number formatting
 */

/**
 * Format phone number to include Kenyan country code (254)
 * Handles various input formats and ensures consistent output
 *
 * @param phoneNumber - The phone number to format
 * @returns Formatted phone number with country code
 */
export function formatPhoneNumber(phoneNumber: string): string {
  // Remove any non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');

  // If it starts with 0 (Kenya), replace with 254
  if (cleaned.startsWith('0')) {
    return '254' + cleaned.substring(1);
  }

  // If it already has country code, use as is
  if (cleaned.startsWith('254')) {
    return cleaned;
  }

  // Default: prepend 254
  return '254' + cleaned;
}