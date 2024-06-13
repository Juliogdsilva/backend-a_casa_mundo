const tableName = 'buildings';

/* eslint-disable func-names */
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable(tableName, (t) => {
    t.increments('id').primary().unsigned();
    t.string('name').unique().notNullable();
    t.string('cep').notNullable();
    t.string('address').notNullable();
    t.string('number').nullable();
    t.string('complement').nullable();
    t.string('neighborhood').notNullable();
    t.string('city').notNullable();
    t.string('state').notNullable();
    t.integer('units').nullable();
    t.integer('towers').nullable();
    t.string('construction_companies').nullable();
    // t.integer('construction_id').unsigned().notNullable().references('id')
    //   .inTable('construction_companies');
    t.string('completion_date').nullable();
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
