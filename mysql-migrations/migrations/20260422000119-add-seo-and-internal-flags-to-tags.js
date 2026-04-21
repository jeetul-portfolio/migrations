module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE tags
        ADD COLUMN is_seo_enabled TINYINT(1) NOT NULL DEFAULT 1 AFTER description,
        ADD COLUMN is_internal TINYINT(1) NOT NULL DEFAULT 0 AFTER is_seo_enabled;
    `);
  },

  down: async ({ context: queryInterface }) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE tags
        DROP COLUMN is_seo_enabled,
        DROP COLUMN is_internal;
    `);
  },
};
