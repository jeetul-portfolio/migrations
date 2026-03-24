module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.sequelize.query(`
      CREATE TABLE git_commits (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        projectId BIGINT UNSIGNED NOT NULL,
        fullHash CHAR(40) NOT NULL,
        shortHash CHAR(8) NOT NULL,
        message VARCHAR(500) NOT NULL,
        authorName VARCHAR(200) NULL,
        authorAvatarUrl VARCHAR(500) NULL,
        committedAt DATETIME NOT NULL,
        commitUrl VARCHAR(500) NOT NULL,
        additions INT NULL,
        deletions INT NULL,
        positionRank TINYINT UNSIGNED NOT NULL,
        isLatest TINYINT(1) NOT NULL DEFAULT 0,
        syncedAt DATETIME NOT NULL,
        isAccessible TINYINT(1) NOT NULL DEFAULT 1,
        lastAccessCheckedAt DATETIME NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        CONSTRAINT fk_git_commits_project
          FOREIGN KEY (projectId) REFERENCES git_projects(id)
          ON DELETE CASCADE ON UPDATE CASCADE,
        UNIQUE KEY uq_git_commits_project_fullHash (projectId, fullHash),
        UNIQUE KEY uq_git_commits_project_positionRank (projectId, positionRank),
        KEY idx_git_commits_project_isLatest (projectId, isLatest),
        KEY idx_git_commits_project_positionRank (projectId, positionRank),
        KEY idx_git_commits_project_committedAt (projectId, committedAt DESC),
        KEY idx_git_commits_syncedAt (syncedAt),
        KEY idx_git_commits_isAccessible (isAccessible)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  },

  down: async ({ context: queryInterface }) => {
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS git_commits;');
  },
};
