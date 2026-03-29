module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE articles
        ADD COLUMN tags TEXT NULL AFTER title;
    `);
  },

  down: async ({ context: queryInterface }) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE articles
        DROP COLUMN tags;
    `);
  },
};
