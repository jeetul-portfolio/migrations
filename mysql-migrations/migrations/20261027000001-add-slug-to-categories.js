const SLUG_MAX_LENGTH = 120;

function slugify(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, SLUG_MAX_LENGTH - 4)
    .replace(/-+$/, '');
}

module.exports = {
  up: async ({ context: queryInterface }) => {
    const { sequelize } = queryInterface;

    await sequelize.query(`
      ALTER TABLE categories
        ADD COLUMN slug VARCHAR(${SLUG_MAX_LENGTH}) NULL AFTER name;
    `);

    // Backfill existing (skill) categories; names are unique but may slugify identically.
    const [rows] = await sequelize.query('SELECT id, name FROM categories ORDER BY id ASC;');
    const used = new Set();
    for (const row of rows) {
      const base = slugify(row.name) || 'category';
      let slug = base;
      for (let n = 2; used.has(slug); n += 1) slug = `${base}-${n}`;
      used.add(slug);
      await sequelize.query('UPDATE categories SET slug = ? WHERE id = ?;', { replacements: [slug, row.id] });
    }

    await sequelize.query(`
      ALTER TABLE categories
        MODIFY COLUMN slug VARCHAR(${SLUG_MAX_LENGTH}) NOT NULL,
        ADD UNIQUE KEY uq_categories_slug (slug);
    `);
  },

  down: async ({ context: queryInterface }) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE categories
        DROP INDEX uq_categories_slug,
        DROP COLUMN slug;
    `);
  },
};
