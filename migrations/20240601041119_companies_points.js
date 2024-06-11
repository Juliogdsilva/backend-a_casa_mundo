const tableName = 'companies_points';

/* eslint-disable func-names */
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable(tableName, (t) => {
    t.increments('id').primary().unsigned();
    t.integer('company_id').unsigned().notNullable().references('id')
      .inTable('companies');
    t.string('cep').notNullable();
    t.string('address').notNullable();
    t.string('number').notNullable();
    t.string('complement').notNullable();
    t.string('neighborhood').notNullable();
    t.string('city').notNullable();
    t.string('state').notNullable();
    t.boolean('principal').notNullable().defaultTo(0);
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
