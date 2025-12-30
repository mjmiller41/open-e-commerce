import { supabase } from "./supabase";

export async function checkSkuExists(
  sku: string,
  excludeId?: number
): Promise<boolean> {
  if (!sku) return false;

  let query = supabase.from("products").select("id").eq("sku", sku);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error checking SKU existence:", error);
    throw error;
  }

  return data && data.length > 0;
}

export async function getSuggestedSku(baseSku: string): Promise<string> {
  if (!baseSku) return "";

  // Simply append -1, -2, etc. until we find a free one.
  // This is checking progressively, could be optimized if we expected MANY conflicts,
  // but for this use case checking 1, 2, 3... is fine and safe.
  let rootSku = baseSku;
  let counter = 1;

  // Check if baseSku already has a sequence number at the end
  // e.g. "ITEM-1" -> root="ITEM", counter=2
  const match = baseSku.match(/^(.*)-(\d+)$/);
  if (match) {
    rootSku = match[1];
    counter = parseInt(match[2], 10) + 1;
  }

  const formatSku = (root: string, n: number) =>
    `${root}-${n.toString().padStart(3, "0")}`;
  let candidate = formatSku(rootSku, counter);

  while (await checkSkuExists(candidate)) {
    counter++;
    candidate = formatSku(rootSku, counter);
    // Safety break to prevent infinite loops
    if (counter > 1000) break;
  }

  return candidate;
}
