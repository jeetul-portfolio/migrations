module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.sequelize.query(`
      CREATE TABLE article_categories (
        article_id BIGINT UNSIGNED NOT NULL,
        category_id BIGINT UNSIGNED NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (article_id, category_id),
        KEY idx_article_categories_category_article (category_id, article_id),
        CONSTRAINT fk_article_categories_article_id FOREIGN KEY (article_id)
          REFERENCES articles (id) ON DELETE CASCADE,
        CONSTRAINT fk_article_categories_category_id FOREIGN KEY (category_id)
          REFERENCES categories (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  },

  down: async ({ context: queryInterface }) => {
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS article_categories;');
  },
};
