module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.sequelize.query(`
      CREATE TABLE auth_audit_logs (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id BIGINT UNSIGNED NULL,
        event_type VARCHAR(50) NOT NULL,
        success TINYINT(1) NOT NULL,
        ip_address VARCHAR(64) NULL,
        user_agent VARCHAR(512) NULL,
        request_id VARCHAR(64) NULL,
        metadata JSON NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_auth_audit_user_created (user_id, created_at),
        KEY idx_auth_audit_event_created (event_type, created_at),
        KEY idx_auth_audit_success_created (success, created_at),
        CONSTRAINT fk_auth_audit_user
          FOREIGN KEY (user_id) REFERENCES users(id)
          ON DELETE SET NULL
          ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  },

  down: async ({ context: queryInterface }) => {
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS auth_audit_logs;');
  },
};