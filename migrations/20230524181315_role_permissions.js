const tableName = 'role_permissions';

/* eslint-disable func-names */
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable(tableName, (t) => {
    t.increments('id').primary().unsigned();
    t.integer('role_id').unsigned().notNullable().references('id')
      .inTable('roles');
    t.integer('permission_id').unsigned().notNullable().references('id')
      .inTable('permissions');
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable(tableName);
};
