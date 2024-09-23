// Generic log function to console
const logToConsole = (level, message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

  switch (level) {
    case "info":
      console.log(logMessage);
      break;
    case "error":
      console.error(logMessage);
      break;
    case "debug":
      console.debug(logMessage);
      break;
    default:
      console.log(logMessage);
  }
};

// Log info messages
export const logInfo = (message) => {
  logToConsole("info", message);
};

// Log error messages
export const logError = (message) => {
  logToConsole("error", message);
};

// Log debug messages
export const logDebug = (message) => {
  logToConsole("debug", message);
};
