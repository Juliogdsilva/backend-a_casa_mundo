const tableName = 'send_campaigns';

/* eslint-disable func-names */
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable(tableName, (t) => {
    t.increments('id').primary().unsigned();
    t.integer('campaign_id').unsigned().notNullable().references('id')
      .inTable('campaigns');
    t.integer('company_id').unsigned().notNullable().references('id')
      .inTable('companies');
    t.integer('building_id').unsigned().nullable().references('id')
      .inTable('buildings');
    t.integer('building_unit_id').unsigned().nullable().references('id')
      .inTable('buildings_units');
    t.text('note').nullable();
    t.enum('status', ['sent', 'waiting', 'processing', 'blocked', 'cancelled']).notNullable().defaultTo('waiting');
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
