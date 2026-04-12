module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.sequelize.query(`
      CREATE TABLE skill_references (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        skill_id BIGINT UNSIGNED NOT NULL,
        type VARCHAR(50) NOT NULL,
        reference_id BIGINT UNSIGNED NOT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY uq_skill_references_skill_type_ref (skill_id, type, reference_id),
        KEY idx_skill_references_skill_id (skill_id),
        CONSTRAINT fk_skill_references_skill_id FOREIGN KEY (skill_id) REFERENCES skills (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  },

  down: async ({ context: queryInterface }) => {
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS skill_references;');
  },
};
