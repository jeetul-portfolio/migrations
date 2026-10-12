// Extends the (previously unused) experiences table for the public Experience page.
// Existing rows get a placeholder slug and stay drafts, so nothing becomes public by accident.
module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE experiences
        ADD COLUMN slug VARCHAR(160) NULL AFTER id,
        ADD COLUMN company_url VARCHAR(1024) NULL AFTER company,
        ADD COLUMN logo_url VARCHAR(1024) NULL AFTER company_url,
        ADD COLUMN start_date DATE NULL AFTER employment_type,
        ADD COLUMN end_date DATE NULL AFTER start_date,
        ADD COLUMN is_current TINYINT(1) NOT NULL DEFAULT 0 AFTER end_date,
        ADD COLUMN description LONGTEXT NULL AFTER summary,
        ADD COLUMN responsibilities JSON NULL AFTER description,
        ADD COLUMN technologies JSON NULL AFTER achievements,
        ADD COLUMN tags JSON NULL AFTER technologies,
        ADD COLUMN links JSON NULL AFTER tags,
        ADD COLUMN status ENUM('draft','published') NOT NULL DEFAULT 'draft' AFTER sort_order,
        ADD COLUMN published_at DATETIME NULL AFTER status;
    `);

    await queryInterface.sequelize.query(`
      UPDATE experiences SET slug = CONCAT('experience-', id) WHERE slug IS NULL;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE experiences
        MODIFY COLUMN slug VARCHAR(160) NOT NULL,
        ADD UNIQUE KEY uq_experiences_slug (slug),
        ADD KEY idx_experiences_status_sort (status, sort_order),
        ADD CONSTRAINT chk_experiences_dates CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date);
    `);
  },

  down: async ({ context: queryInterface }) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE experiences
        DROP CHECK chk_experiences_dates,
        DROP KEY idx_experiences_status_sort,
        DROP KEY uq_experiences_slug,
        DROP COLUMN published_at,
        DROP COLUMN status,
        DROP COLUMN links,
        DROP COLUMN tags,
        DROP COLUMN technologies,
        DROP COLUMN responsibilities,
        DROP COLUMN description,
        DROP COLUMN is_current,
        DROP COLUMN end_date,
        DROP COLUMN start_date,
        DROP COLUMN logo_url,
        DROP COLUMN company_url,
        DROP COLUMN slug;
    `);
  },
};
