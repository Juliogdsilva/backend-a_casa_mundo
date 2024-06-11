const tableName = 'plans';

/* eslint-disable func-names */
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable(tableName, (t) => {
    t.increments('id').primary().unsigned();
    t.string('name').unique().notNullable();
    t.float('current_price').notNullable();
    t.float('initial_price').notNullable();
    t.integer('users_limit').nullable();
    t.integer('points_limit').nullable();
    t.integer('campains_limit').nullable();
    t.integer('daily_sending_limit').nullable();
    t.text('description').nullable();
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
