module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE skills DROP COLUMN category;
    `);
  },

  down: async ({ context: queryInterface }) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE skills ADD COLUMN category VARCHAR(100) NULL AFTER name;
    `);
  },
};
