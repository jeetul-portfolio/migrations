module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.sequelize.query(`
      CREATE TABLE refresh_tokens (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id BIGINT UNSIGNED NOT NULL,
        token_hash CHAR(64) NOT NULL,
        token_family_id CHAR(36) NOT NULL,
        jwt_jti CHAR(36) NULL,
        issued_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NOT NULL,
        revoked_at DATETIME NULL,
        replaced_by_token_hash CHAR(64) NULL,
        revoke_reason VARCHAR(255) NULL,
        ip_address VARCHAR(64) NULL,
        user_agent VARCHAR(512) NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_refresh_tokens_token_hash (token_hash),
        KEY idx_refresh_tokens_user_id (user_id),
        KEY idx_refresh_tokens_expires_at (expires_at),
        KEY idx_refresh_tokens_user_active (user_id, revoked_at, expires_at),
        KEY idx_refresh_tokens_family (token_family_id),
        KEY idx_refresh_tokens_jti (jwt_jti),
        CONSTRAINT fk_refresh_tokens_user
          FOREIGN KEY (user_id) REFERENCES users(id)
          ON DELETE CASCADE
          ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  },

  down: async ({ context: queryInterface }) => {
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS refresh_tokens;');
  },
};