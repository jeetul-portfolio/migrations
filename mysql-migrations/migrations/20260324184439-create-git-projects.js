module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.sequelize.query(`
      CREATE TABLE git_projects (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        projectKey VARCHAR(80) NOT NULL,
        displayName VARCHAR(120) NOT NULL,
        repoOwner VARCHAR(120) NOT NULL,
        repoName VARCHAR(120) NOT NULL,
        repoUrl VARCHAR(300) NOT NULL,
        defaultBranch VARCHAR(120) NOT NULL DEFAULT 'main',
        isActive TINYINT(1) NOT NULL DEFAULT 1,
        lastSyncedAt DATETIME NULL,
        nextSyncAt DATETIME NULL,
        syncStatus ENUM('success','partial','failed') NOT NULL DEFAULT 'success',
        isStale TINYINT(1) NOT NULL DEFAULT 0,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_git_projects_projectKey (projectKey),
        UNIQUE KEY uq_git_projects_owner_repo (repoOwner, repoName),
        KEY idx_git_projects_isActive (isActive),
        KEY idx_git_projects_syncStatus (syncStatus),
        KEY idx_git_projects_nextSyncAt (nextSyncAt),
        KEY idx_git_projects_lastSyncedAt (lastSyncedAt)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  },

  down: async ({ context: queryInterface }) => {
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS git_projects;');
  },
};
