module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.sequelize.query(`
      CREATE TABLE roles (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        code VARCHAR(50) NOT NULL,
        name VARCHAR(100) NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_roles_code (code)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await queryInterface.sequelize.query(`
      INSERT INTO roles (code, name) VALUES
      ('admin', 'Administrator'),
      ('editor', 'Editor'),
      ('viewer', 'Viewer');
    `);
  },

  down: async ({ context: queryInterface }) => {
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS roles;');
  },
};