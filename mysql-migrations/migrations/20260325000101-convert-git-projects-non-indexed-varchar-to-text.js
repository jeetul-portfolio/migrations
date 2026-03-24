module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE git_projects
        MODIFY COLUMN displayName TEXT NOT NULL,
        MODIFY COLUMN repoUrl TEXT NOT NULL,
        MODIFY COLUMN defaultBranch TEXT NOT NULL;
    `);
  },

  down: async ({ context: queryInterface }) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE git_projects
        MODIFY COLUMN displayName VARCHAR(120) NOT NULL,
        MODIFY COLUMN repoUrl VARCHAR(300) NOT NULL,
        MODIFY COLUMN defaultBranch VARCHAR(120) NOT NULL DEFAULT 'main';
    `);
  },
};
