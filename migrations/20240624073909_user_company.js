const tableName = 'user_company';

/* eslint-disable func-names */
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable(tableName, (t) => {
    t.increments('id').primary().unsigned();
    t.integer('user_id').unsigned().notNullable().references('id')
      .inTable('users')
      .unique();
    t.integer('company_id').unsigned().notNullable().references('id')
      .inTable('companies');
    t.timestamps(true, true, false);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable(tableName);
};
