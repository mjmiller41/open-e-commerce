import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import {
  ImageMagick,
  initializeImageMagick,
  MagickFormat,
} from "https://deno.land/x/imagemagick_deno@0.0.31/mod.ts";

const wasmUrl =
  "https://cdn.jsdelivr.net/npm/@imagemagick/magick-wasm@0.0.31/dist/magick.wasm";

let magickInitialized = false;

async function initMagick() {
  if (magickInitialized) {
    return;
  }

  try {
    const response = await fetch(wasmUrl);
    const wasmBytes = new Uint8Array(await response.arrayBuffer());
    await initializeImageMagick(wasmBytes);
    magickInitialized = true;
  } catch (e) {
    console.error("Failed to load ImageMagick WASM:", e);
    throw e;
  }
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.time("Total Duration");

    const { bucket, path, options, warmup } = await req.json();

    // Warmup mode to initialize WASM without heavy processing
    if (warmup) {
      console.time("WASM Init");
      await initMagick();
      console.timeEnd("WASM Init");
      return new Response(JSON.stringify({ message: "Wormed up" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Initialize ImageMagick WASM (if not already)
    console.time("WASM Init Check");
    await initMagick();
    console.timeEnd("WASM Init Check");

    const { width, quality, format } = options || {};

    if (!bucket || !path) {
      throw new Error("Bucket and path are required");
    }

    // Create Supabase Client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 1. Download Image
    const { data: fileData, error: downloadError } =
      await supabaseClient.storage.from(bucket).download(path);

    if (downloadError) throw downloadError;

    const arrayBuffer = await fileData.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    console.log(`Processing image size: ${uint8Array.length} bytes`);
    console.time("Image Process");

    // 2. Process Image
    let processedBytes: Uint8Array;
    let contentType = "image/webp";

    await ImageMagick.read(uint8Array, async (img) => {
      // Resize if width is provided
      if (width && img.width > width) {
        img.resize(width, 0); // 0 keeps aspect ratio
      }

      // Set output format
      let outputFormat = MagickFormat.WebP; // default

      if (format === "jpeg") {
        outputFormat = MagickFormat.Jpeg;
        contentType = "image/jpeg";
      } else if (format === "png") {
        outputFormat = MagickFormat.Png;
        contentType = "image/png";
      }

      // Write to buffer
      img.quality = quality || 80;

      await img.write(outputFormat, (data) => {
        processedBytes = data;
      });
    });

    // 3. Upload back (overwrite)
    // Note: If format changed, we might want to change extension, but for "Optimize" we often keep same path
    // OR we change path. Current plan said "replace".
    // BUT if I convert JPG to WebP, I should probably change the extension to .webp?
    // User plan: "replace image or save as copy? usually replace..."
    // If I change extension, I need to update the database references too!
    // That adds complexity.
    // OPTION A: Keep original extension but file content is WebP? No, browser might be confused if extension is .jpg but mime is image/webp. Chrome handles it, but it's bad practice.
    // OPTION B: Update DB references.
    // Let's implement SAFE mode: If format changes, new file is created with new extension, and we return the new path. Frontend can then update DB references if it wants, OR we do it here.
    // Plan said: "Delete & Update Products... For optimize: replace existing image...".
    // Simplify: If user selects format='webp' and original is 'jpg', we upload 'filename.webp'.
    // Then we need to update products.
    // Let's stick to simple REPLACEMENT if format matches, or NEW FILE if format differs.
    // BETTER: Just return the result status. Frontend can refresh.
    // Wait, if I change the file extension, the frontend logic 'Optimize' button might expect the old file to be updated.
    // Let's try to KEEP the code simple: If extension changes, we upload a NEW file, and delete the old one, AND update products.
    // This is getting heavy for an Edge Function.
    // ALTERNATIVE: Just overwrite the original file? Bad if extension mismatches.

    // DECISION: For this iteration, if format differs, we upload new file with correct extension.
    // We will attempt to update products associated with the OLD image to point to the NEW image.

    let targetPath = path;
    const oldExt = path.split(".").pop()?.toLowerCase();
    const targetFormat = format || "webp";
    const newExt = targetFormat === "jpeg" ? "jpg" : targetFormat; // webp, png, jpg

    if (oldExt !== newExt) {
      // Replace extension
      targetPath = path.substring(0, path.lastIndexOf(".")) + "." + newExt;
    }

    const { error: uploadError } = await supabaseClient.storage
      .from(bucket)
      .upload(targetPath, processedBytes!, {
        contentType,
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // 4. If path changed, update Database References and Delete old file
    let pathChanged = targetPath !== path;

    // IMPORTANT: If we simply renamed it, we must update all products using 'path' to use 'targetPath'
    if (pathChanged) {
      // Find products using the old image
      // Usage map logic is on frontend, but we can do it here too to be safe/atomic?
      // Or we just return the new path and let frontend do it?
      // Edge function is better place for atomic updates if possible.

      // Fetch all products is heavy?
      // We can do a text search on the 'images' column if it's JSONB or Array.
      // Schema says `images` is TEXT[] (array of strings) or similar?
      // `images` column is text[] based on context earlier (e.g. {1.jpg}).

      // Supabase Query: contains?
      const { data: products } = await supabaseClient
        .from("products")
        .select("id, images")
        .contains("images", [path]);

      if (products && products.length > 0) {
        for (const product of products) {
          const newImages = product.images.map((img: string) =>
            img === path ? targetPath : img
          );
          await supabaseClient
            .from("products")
            .update({ images: newImages })
            .eq("id", product.id);
        }
      }

      // Delete old file
      await supabaseClient.storage.from(bucket).remove([path]);
    }

    return new Response(
      JSON.stringify({ success: true, newPath: targetPath, oldPath: path }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Edge Function Error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Unknown error occurred",
        details: JSON.stringify(error),
        stack: error.stack,
      }),
      {
        status: 400, // Or 500 depending on error, but 400 is safer for now to avoid auto-retries
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
