module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE git_commits
        MODIFY COLUMN message TEXT NOT NULL,
        MODIFY COLUMN authorName TEXT NULL,
        MODIFY COLUMN authorAvatarUrl TEXT NULL,
        MODIFY COLUMN commitUrl TEXT NOT NULL;
    `);
  },

  down: async ({ context: queryInterface }) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE git_commits
        MODIFY COLUMN message VARCHAR(500) NOT NULL,
        MODIFY COLUMN authorName VARCHAR(200) NULL,
        MODIFY COLUMN authorAvatarUrl VARCHAR(500) NULL,
        MODIFY COLUMN commitUrl VARCHAR(500) NOT NULL;
    `);
  },
};
