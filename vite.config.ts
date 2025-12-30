import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import json5 from "json5";
import fs from "node:fs";

// https://vite.dev/config/
export default defineConfig(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let config: any = {};

  try {
    const configFile = fs.readFileSync("./site.config.jsonc", "utf-8");
    config = json5.parse(configFile);
  } catch (e) {
    console.error(
      "CRITICAL: Could not load site.config.jsonc. Please ensure it exists and is valid JSONC.",
      e
    );
  }

  return {
    base: "/open-e-commerce/",
    plugins: [
      react(),
      {
        name: "html-transform",
        transformIndexHtml(html) {
          return html
            .replace(/%SITE_TITLE%/g, config.siteTitle)
            .replace(/%SITE_DESCRIPTION%/g, config.siteDescription);
        },
      },
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (
                id.includes("react") ||
                id.includes("react-dom") ||
                id.includes("react-router-dom")
              ) {
                return "react-vendor";
              }
              if (id.includes("@supabase")) {
                return "supabase";
              }
              if (
                id.includes("lucide-react") ||
                id.includes("clsx") ||
                id.includes("tailwind-merge")
              ) {
                return "ui-vendor";
              }
              if (id.includes("axios") || id.includes("papaparse")) {
                return "utils";
              }
            }
            if (id.includes("taxonomy.json")) {
              return "taxonomy";
            }
          },
        },
      },
    },
    define: {
      __APP_CONFIG__: JSON.stringify(config),
    },
  };
});
