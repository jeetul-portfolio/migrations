const path = require('path');
const { Sequelize } = require('sequelize');
const { Umzug, SequelizeStorage } = require('umzug');
const config = require('../config');

function createSequelizeInstance() {
  const mysqlConfig = config.mysql;

  return new Sequelize(
    mysqlConfig.database,
    mysqlConfig.user,
    mysqlConfig.password,
    {
      host: mysqlConfig.host,
      port: Number(mysqlConfig.port),
      dialect: 'mysql',
      logging: false,
      pool: {
        max: Number(mysqlConfig.maxConnections) || 10,
      },
    }
  );
}

function createMigrator(sequelizeInstance) {
  return new Umzug({
    migrations: {
      glob: path.join(__dirname, 'migrations', '*.js'),
    },
    context: sequelizeInstance.getQueryInterface(),
    storage: new SequelizeStorage({
      sequelize: sequelizeInstance,
      tableName: 'SequelizeMeta',
    }),
    logger: undefined,
  });
}

async function runMigrations() {
  const sequelizeInstance = createSequelizeInstance();
  const migrator = createMigrator(sequelizeInstance);

  try {
    const executedMigrations = await migrator.up();
    return executedMigrations.map((migration) => migration.name);
  } finally {
    await sequelizeInstance.close();
  }
}

async function rollbackLastMigration() {
  const sequelizeInstance = createSequelizeInstance();
  const migrator = createMigrator(sequelizeInstance);

  try {
    const revertedMigration = await migrator.down();

    if (Array.isArray(revertedMigration)) {
      return revertedMigration.map((migration) => migration.name);
    }

    if (!revertedMigration) {
      return [];
    }

    return [revertedMigration.name];
  } finally {
    await sequelizeInstance.close();
  }
}

module.exports = {
  runMigrations,
  rollbackLastMigration,
};
