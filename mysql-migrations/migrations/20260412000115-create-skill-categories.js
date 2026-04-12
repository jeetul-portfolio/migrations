module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS skill_categories (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        skill_id BIGINT UNSIGNED NOT NULL,
        category_id BIGINT UNSIGNED NOT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY uq_skill_category (skill_id, category_id),
        KEY idx_skill_categories_category_id (category_id),
        CONSTRAINT fk_skill_categories_skill_id FOREIGN KEY (skill_id) REFERENCES skills (id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT fk_skill_categories_category_id FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  },

  down: async ({ context: queryInterface }) => {
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS skill_categories;');
  },
};
