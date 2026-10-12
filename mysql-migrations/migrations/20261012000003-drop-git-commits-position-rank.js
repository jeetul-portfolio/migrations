// git_commits is append-only history now (deduped by projectId + fullHash). positionRank/isLatest came from
// the old "latest N commits" design: the unique (projectId, positionRank) key made every incremental sync
// collide, and TINYINT capped history at 255 commits. Nothing reads either column.
module.exports = {
  up: async ({ context: queryInterface }) => {
    // Drop only indexes that exist, so this also applies cleanly after a rollback (down has no unique key).
    const [indexes] = await queryInterface.sequelize.query(`
      SELECT DISTINCT INDEX_NAME AS name
      FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'git_commits'
        AND INDEX_NAME IN (
          'uq_git_commits_project_positionRank',
          'idx_git_commits_project_positionRank',
          'idx_git_commits_project_isLatest'
        )
    `);
    const dropIndexes = indexes.map(({ name }) => `DROP INDEX ${name},`).join('\n        ');

    await queryInterface.sequelize.query(`
      ALTER TABLE git_commits
        ${dropIndexes}
        DROP COLUMN positionRank,
        DROP COLUMN isLatest;
    `);
  },

  down: async ({ context: queryInterface }) => {
    // Restored columns carry no ranking; values default to 0 and are not unique.
    await queryInterface.sequelize.query(`
      ALTER TABLE git_commits
        ADD COLUMN positionRank TINYINT UNSIGNED NOT NULL DEFAULT 0 AFTER deletions,
        ADD COLUMN isLatest TINYINT(1) NOT NULL DEFAULT 0 AFTER positionRank,
        ADD KEY idx_git_commits_project_positionRank (projectId, positionRank),
        ADD KEY idx_git_commits_project_isLatest (projectId, isLatest);
    `);
  },
};
