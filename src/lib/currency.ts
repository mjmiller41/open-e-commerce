import type { StoreSettings } from "../context/StoreSettingsContext";

/**
 * Formats a numeric price into a currency string based on store settings.
 *
 * @param amount - The price amount to format.
 * @param settings - The store settings object containing currency configuration.
 * @returns The formatted currency string.
 */
export function formatCurrency(
  amount: number,
  settings: StoreSettings | null
): string {
  if (!settings) {
    return `$${amount.toFixed(2)}`;
  }

  // Default locale is 'en-US' for now, could be made configurable later
  const locale = "en-US";
  const currency = "USD"; // Could be made configurable in settings later

  if (settings.currency_code_enabled) {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      currencyDisplay: "code", // Displays "USD 10.00"
    }).format(amount);
  } else {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      currencyDisplay: "symbol", // Displays "$10.00"
    }).format(amount);
  }
}
