module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.sequelize.query(`
      CREATE TABLE tag_references (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        tag_id BIGINT UNSIGNED NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id BIGINT UNSIGNED NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_tag_references (tag_id, entity_type, entity_id),
        KEY idx_tag_references_entity (entity_type, entity_id),
        KEY idx_tag_references_tag_id (tag_id),
        CONSTRAINT fk_tag_references_tag_id FOREIGN KEY (tag_id)
          REFERENCES tags (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  },

  down: async ({ context: queryInterface }) => {
    await queryInterface.sequelize.query(`
      DROP TABLE IF EXISTS tag_references;
    `);
  },
};
