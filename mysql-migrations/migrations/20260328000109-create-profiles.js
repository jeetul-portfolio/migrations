module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.sequelize.query(`
      CREATE TABLE profiles (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        full_name VARCHAR(120) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) DEFAULT NULL,
        location VARCHAR(150) DEFAULT NULL,
        linkedin_url VARCHAR(512) DEFAULT NULL,
        github_url VARCHAR(512) DEFAULT NULL,
        website_url VARCHAR(512) DEFAULT NULL,
        headline VARCHAR(180) DEFAULT NULL,
        bio TEXT DEFAULT NULL,
        avatar_url VARCHAR(512) DEFAULT NULL,
        is_public TINYINT(1) NOT NULL DEFAULT 1,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

        PRIMARY KEY (id),
        KEY idx_profiles_public_updated (is_public, updated_at),
        KEY idx_profiles_updated_at (updated_at)
      );
    `);
  },

  down: async ({ context: queryInterface }) => {
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS profiles;');
  },
};