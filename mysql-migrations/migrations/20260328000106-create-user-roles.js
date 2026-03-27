module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.sequelize.query(`
      CREATE TABLE user_roles (
        user_id BIGINT UNSIGNED NOT NULL,
        role_id BIGINT UNSIGNED NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, role_id),
        KEY idx_user_roles_role_id (role_id),
        CONSTRAINT fk_user_roles_user
          FOREIGN KEY (user_id) REFERENCES users(id)
          ON DELETE CASCADE
          ON UPDATE CASCADE,
        CONSTRAINT fk_user_roles_role
          FOREIGN KEY (role_id) REFERENCES roles(id)
          ON DELETE CASCADE
          ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  },

  down: async ({ context: queryInterface }) => {
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS user_roles;');
  },
};