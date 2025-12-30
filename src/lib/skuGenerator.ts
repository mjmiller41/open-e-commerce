import oedAbbreviationsRaw from "../assets/oed_abbreviations.json";

const oedAbbreviations = oedAbbreviationsRaw as Record<string, string>;

/**
 * Helper to look up an abbreviation in the OED list.
 * If found, returns the abbreviation in uppercase without periods.
 * If not found, returns the first 3 characters in uppercase.
 */
export function getAbbreviation(word: string): string {
  if (!word) return "";

  const cleanWord = word.trim().toLowerCase();

  // Check OED list
  if (oedAbbreviations[cleanWord]) {
    return oedAbbreviations[cleanWord].replace(/\./g, "").toUpperCase();
  }

  // Consonant Skeleton Fallback
  // 1. Start with the first character (always kept).
  // 2. Append all subsequent consonants.
  // 3. Take the first 3 characters of the result.

  // Remove non-alphanumeric chars first just in case
  const alphanumeric = cleanWord.replace(/[^a-z0-9]/g, "");
  const firstChar = alphanumeric[0].toUpperCase();
  const rest = alphanumeric.slice(1).toUpperCase();

  // Remove vowels (A, E, I, O, U) from the rest
  const consonants = rest.replace(/[AEIOU]/g, "");

  // Deduplicate adjacent consonants (e.g., "MM" -> "M")
  // "HAMMER" -> H + MMR -> H + MR -> HMR
  let uniqueConsonants = "";
  for (let i = 0; i < consonants.length; i++) {
    if (i === 0 || consonants[i] !== consonants[i - 1]) {
      uniqueConsonants += consonants[i];
    }
  }

  // Combine and truncate to 3 characters
  return (firstChar + uniqueConsonants).substring(0, 3);
}

/**
 * Generates a SKU based on the hierarchical pattern:
 * [CATEGORY]-[BRAND]-[MODEL]-[VARIANT]
 *
 * - Category: Uses the last segment of the category path (e.g., "Electronics > Audio" becomes "Audio").
 * - Brand: Abbreviated brand name.
 * - Model: First word of the product name/model.
 * - Variant: Abbreviated variant (optional).
 */
export function generateSKU(
  category: string,
  brand: string,
  name: string,
  variant?: string
): string {
  // 1. Category: Extract last segment
  const categorySegments = (category || "").split(">").map((s) => s.trim());
  const leafCategory =
    categorySegments.length > 0
      ? categorySegments[categorySegments.length - 1]
      : "";
  // Use the first word of the leaf category for abbreviation lookups if it's multi-word?
  // Or look up the whole leaf? The OED list has some multi-word entries but mostly single words.
  // Let's try the whole leaf first, then fallback to first word of leaf if needed?
  // For simplicity and consistency with the "First 3 chars" rule, splitting by space usually makes sense for "Name",
  // but for Category "Office Supplies", "Supplies" might be better than "Off".
  // However, "Electronics" is one word.
  // Let's split leaf category by space and take the first word for now to match strict "Word" lookup,
  // unless we want to map "Office Supplies".
  // The user prompt didn't specify, but "Standardize abbreviations" usually applies to words.

  // Logic: Take first word of the leaf category.
  const catWord = leafCategory.split(" ")[0] || "";
  const catPart = getAbbreviation(catWord);

  // 2. Brand
  const brandPart = getAbbreviation(brand || "");

  // 3. Model (Name) -> Take first word
  const modelWord = (name || "").split(" ")[0] || "";
  const modelPart = getAbbreviation(modelWord);

  // 4. Variant
  const variantPart = variant ? getAbbreviation(variant) : "";

  // Construct parts
  const parts = [catPart, brandPart, modelPart];
  if (variantPart) {
    parts.push(variantPart);
  }

  // Filter empty parts (though basic logic implies they might be generated as empty if input is empty)
  // We want to return something even if partial, or just join what we have.
  return parts.filter((p) => p.length > 0).join("-");
}
