const tableName = 'users';

/* eslint-disable func-names */
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable(tableName, (t) => {
    t.increments('id').primary().unsigned();
    t.string('name').notNullable();
    t.string('email').notNullable();
    t.string('password').notNullable();
    t.text('note').nullable();
    t.boolean('change_pass').notNullable().defaultTo(false);
    t.enum('status', ['active', 'waiting', 'blocked', 'deleted']).notNullable().defaultTo('active');
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
