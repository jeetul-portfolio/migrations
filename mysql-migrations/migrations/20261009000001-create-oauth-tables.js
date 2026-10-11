module.exports = {
  up: async ({ context: queryInterface }) => {
    const q = (sql) => queryInterface.sequelize.query(sql);

    await q(`
      CREATE TABLE oauth_clients (
        client_id CHAR(36) NOT NULL COMMENT 'uuid',
        client_name VARCHAR(100) NOT NULL,
        client_secret_hash VARCHAR(255) NOT NULL COMMENT 'scrypt$salt$hash; plaintext is never stored',
        redirect_uris TEXT NOT NULL COMMENT 'JSON array of exact-match redirect URIs',
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (client_id),
        UNIQUE KEY uq_oauth_clients_name (client_name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await q(`
      CREATE TABLE oauth_authorization_codes (
        code_hash CHAR(64) NOT NULL,
        client_id CHAR(36) NOT NULL,
        user_id BIGINT UNSIGNED NOT NULL,
        redirect_uri VARCHAR(2048) NOT NULL,
        code_challenge VARCHAR(128) NOT NULL,
        scope VARCHAR(255) NOT NULL,
        resource VARCHAR(2048) NOT NULL,
        expires_at BIGINT UNSIGNED NOT NULL COMMENT 'unix seconds',
        used_at DATETIME NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (code_hash),
        KEY idx_oauth_codes_expires_at (expires_at),
        CONSTRAINT fk_oauth_codes_client FOREIGN KEY (client_id) REFERENCES oauth_clients(client_id) ON DELETE CASCADE,
        CONSTRAINT fk_oauth_codes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await q(`
      CREATE TABLE oauth_refresh_tokens (
        token_hash CHAR(64) NOT NULL,
        family_id CHAR(36) NOT NULL,
        client_id CHAR(36) NOT NULL,
        user_id BIGINT UNSIGNED NOT NULL,
        scope VARCHAR(255) NOT NULL,
        resource VARCHAR(2048) NOT NULL,
        expires_at BIGINT UNSIGNED NOT NULL COMMENT 'unix seconds',
        revoked_at DATETIME NULL,
        replaced_by_hash CHAR(64) NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (token_hash),
        KEY idx_oauth_refresh_family (family_id),
        KEY idx_oauth_refresh_user (user_id),
        CONSTRAINT fk_oauth_refresh_client FOREIGN KEY (client_id) REFERENCES oauth_clients(client_id) ON DELETE CASCADE,
        CONSTRAINT fk_oauth_refresh_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  },

  down: async ({ context: queryInterface }) => {
    const q = (sql) => queryInterface.sequelize.query(sql);
    await q('DROP TABLE IF EXISTS oauth_refresh_tokens;');
    await q('DROP TABLE IF EXISTS oauth_authorization_codes;');
    await q('DROP TABLE IF EXISTS oauth_clients;');
  },
};
