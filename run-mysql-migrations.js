const logger = require('./utils/logger');
const { runMigrations, rollbackLastMigration } = require('./mysql-migrations');

function formatError(error) {
  if (!error) {
    return {
      name: 'UnknownError',
      message: 'Unknown error',
      stack: undefined,
    };
  }

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message || String(error),
      stack: error.stack,
    };
  }

  return {
    name: 'NonErrorThrow',
    message: String(error),
    stack: undefined,
  };
}

async function main() {
  const args = process.argv.slice(2);
  const shouldRollback = args.includes('--down');

  if (shouldRollback) {
    logger.info('Starting MySQL migration rollback');
    const revertedMigrations = await rollbackLastMigration();

    if (!revertedMigrations.length) {
      logger.info('No migration was rolled back');
      return;
    }

    logger.info({
      message: 'MySQL migration rollback completed',
      revertedMigrations,
    });
    return;
  }

  logger.info('Starting MySQL migrations');
  const executedMigrations = await runMigrations();

  if (!executedMigrations.length) {
    logger.info('No pending migrations found');
    return;
  }

  logger.info({
    message: 'MySQL migrations completed',
    executedMigrations,
  });
}

main().catch((error) => {
  const formattedError = formatError(error);

  logger.error({
    message: 'MySQL migration run failed',
    error: formattedError,
  });
  process.exitCode = 1;
});
