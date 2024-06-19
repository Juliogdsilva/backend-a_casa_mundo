const tableName = 'buildings_images';

/* eslint-disable func-names */
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable(tableName, (t) => {
    t.increments('id').primary().unsigned();
    t.integer('building_id').unsigned().notNullable().references('id')
      .inTable('buildings');
    t.string('name').notNullable();
    t.string('url').notNullable();
    t.boolean('principal').notNullable().defaultTo(0);
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
