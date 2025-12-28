/**
 * Standardized logger utility for the application.
 * Wraps console methods to allow for easy future integration with external logging services (e.g., Sentry).
 */
const logger = {
  /**
   * Logs an informational message.
   *
   * @param message - The message to log.
   * @param data - Optional data to log with the message.
   */
  info: (message: string, ...data: unknown[]) => {
    console.info(`[INFO] ${message}`, ...data);
  },

  /**
   * Logs a warning message.
   *
   * @param message - The warning message.
   * @param data - Optional data to log with the warning.
   */
  warn: (message: string, ...data: unknown[]) => {
    console.warn(`[WARN] ${message}`, ...data);
  },

  /**
   * Logs an error message.
   *
   * @param message - The error message.
   * @param error - The error object or data associated with the error.
   * @param data - Additional data to log.
   */
  error: (message: string, error?: unknown, ...data: unknown[]) => {
    console.error(`[ERROR] ${message}`, error, ...data);
    // Future integration point for error reporting services (e.g., Sentry)
  },
};

export default logger;
