import logger from "./logger";

/**
 * The runtime configuration interface matching site.config.jsonc
 */
export interface AppConfig {
  siteTitle: string;
  siteDescription: string;
  baseUrl: string;
  themeColor: string;
  footer?: {
    text: string;
  };
}

/**
 * Access to the global application configuration injected at build time.
 * This object is safe to use anywhere in the application.
 */
declare const __APP_CONFIG__: AppConfig;
export const appConfig: AppConfig = __APP_CONFIG__;

if (!appConfig) {
  logger.error(
    "Global configuration not found. Ensure site.config.jsonc exists and build process injected __APP_CONFIG__."
  );
}
