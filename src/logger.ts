import createLogger, { LogLevelNames } from 'console-log-level';

const logger = createLogger({
  level: process.env.LOG_LEVEL as LogLevelNames || 'info', // Set the log level from environment variables
});

export default logger;
