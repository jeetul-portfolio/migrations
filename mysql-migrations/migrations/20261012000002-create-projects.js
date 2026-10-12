module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.sequelize.query(`
      CREATE TABLE projects (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        slug VARCHAR(160) NOT NULL,
        title VARCHAR(255) NOT NULL,
        summary TEXT NULL,
        description LONGTEXT NULL,
        problem LONGTEXT NULL,
        solution LONGTEXT NULL,
        technical_decisions LONGTEXT NULL,
        outcomes LONGTEXT NULL,
        technologies JSON NULL,
        tags JSON NULL,
        links JSON NULL,
        cover_image VARCHAR(1024) NULL,
        images JSON NULL,
        is_featured TINYINT(1) NOT NULL DEFAULT 0,
        sort_order INT UNSIGNED NOT NULL DEFAULT 0,
        status ENUM('draft','published') NOT NULL DEFAULT 'draft',
        published_at DATETIME NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_projects_slug (slug),
        KEY idx_projects_status_sort (status, sort_order),
        KEY idx_projects_featured (is_featured)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  },

  down: async ({ context: queryInterface }) => {
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS projects;');
  },
};
