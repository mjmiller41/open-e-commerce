import { createClient } from "@supabase/supabase-js";
import { generateSKU } from "../src/lib/skuGenerator";
import type { Product } from "../src/lib/supabase";

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY; // OR SERVICE_KEY if available

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in environment variables."
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function backfillSkus() {
  console.log("Starting SKU backfill...");

  // 1. Fetch all products
  const { data: products, error } = await supabase.from("products").select("*");

  if (error) {
    console.error("Error fetching products:", error);
    return;
  }

  if (!products || products.length === 0) {
    console.log("No products found.");
    return;
  }

  console.log(`Found ${products.length} products. Processing...`);

  let updatedCount = 0;
  let errorCount = 0;

  // 2. Iterate and update
  for (const product of products) {
    try {
      // Generate SKU using the new logic
      const newSku = generateSKU(
        product.category,
        product.brand,
        product.name,
        product.variant // Assuming variant column exists now
      );

      console.log(
        `Product "${product.name}" (${product.id}): Generated SKU -> ${newSku}`
      );

      // Update product in DB
      const { error: updateError } = await supabase
        .from("products")
        .update({ sku: newSku })
        .eq("id", product.id);

      if (updateError) {
        console.error(
          `Failed to update product ${product.id}:`,
          updateError.message
        );
        errorCount++;
      } else {
        updatedCount++;
      }
    } catch (err) {
      console.error(`Exception processing product ${product.id}:`, err);
      errorCount++;
    }
  }

  console.log("------------------------------------------------");
  console.log(`Backfill complete.`);
  console.log(`Updated: ${updatedCount}`);
  console.log(`Errors:  ${errorCount}`);

  if (errorCount > 0) {
    console.warn(
      "Note: Updates might fail if Row Level Security (RLS) is enabled and you are using an Anon Key without proper policies."
    );
  }
}

backfillSkus();
