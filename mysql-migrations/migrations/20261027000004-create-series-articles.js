/**
 * Article <-> series membership. part_number NULL = plain association; non-NULL = sequential part.
 * - uq_series_articles_part: part numbers are unique within a series (NULLs don't collide).
 * - sequential_article_id is article_id only for sequential rows, so its unique key allows
 *   each article to be a numbered part of at most one series.
 * Deleting a series or an article removes its memberships only.
 */
module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.sequelize.query(`
      CREATE TABLE series_articles (
        series_id BIGINT UNSIGNED NOT NULL,
        article_id BIGINT UNSIGNED NOT NULL,
        part_number INT UNSIGNED NULL,
        sequential_article_id BIGINT UNSIGNED AS (IF(part_number IS NULL, NULL, article_id)) VIRTUAL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (series_id, article_id),
        UNIQUE KEY uq_series_articles_part (series_id, part_number),
        UNIQUE KEY uq_series_articles_sequential_article (sequential_article_id),
        KEY idx_series_articles_article (article_id),
        CONSTRAINT chk_series_articles_part_positive CHECK (part_number IS NULL OR part_number > 0),
        CONSTRAINT fk_series_articles_series_id FOREIGN KEY (series_id)
          REFERENCES series (id) ON DELETE CASCADE,
        CONSTRAINT fk_series_articles_article_id FOREIGN KEY (article_id)
          REFERENCES articles (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  },

  down: async ({ context: queryInterface }) => {
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS series_articles;');
  },
};
