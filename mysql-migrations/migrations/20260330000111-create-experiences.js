module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.sequelize.query(`
      CREATE TABLE experiences (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        company VARCHAR(255) NOT NULL,
        role VARCHAR(255) NOT NULL,
        location VARCHAR(255) NULL,
        duration VARCHAR(120) NULL,
        summary TEXT NULL,
        employment_type VARCHAR(50) NOT NULL DEFAULT 'Full-time',
        achievements LONGTEXT NULL,
        sort_order INT UNSIGNED NOT NULL DEFAULT 0,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_experiences_sort_order_created_at (sort_order, created_at DESC)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  },

  down: async ({ context: queryInterface }) => {
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS experiences;');
  },
};
