const tableName = 'companies';

/* eslint-disable func-names */
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable(tableName, (t) => {
    t.increments('id').primary().unsigned();
    t.string('cnpj').notNullable();
    t.string('name').notNullable();
    t.string('fantasy_name').nullable();
    t.string('email').nullable();
    t.string('phone').nullable();
    t.string('other_phone').nullable();
    t.string('site').nullable();
    t.string('finantial_email').notNullable();
    t.integer('finantial_responsible').unsigned().notNullable().references('id')
      .inTable('users');
    t.text('note').nullable();
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
