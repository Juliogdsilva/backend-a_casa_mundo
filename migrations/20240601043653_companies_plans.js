const tableName = 'companies_plans';

/* eslint-disable func-names */
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable(tableName, (t) => {
    t.increments('id').primary().unsigned();
    t.string('transaction_id').notNullable().unique();
    t.integer('company_id').unsigned().notNullable().references('id')
      .inTable('companies');
    t.integer('plan_id').unsigned().notNullable().references('id')
      .inTable('plans');
    t.integer('payment_method_id').unsigned().notNullable().references('id')
      .inTable('payment_methods');
    t.integer('payment_by').unsigned().notNullable().references('id')
      .inTable('users');
    t.string('partner_number').nullable();
    t.integer('installments').nullable();
    t.float('discount').nullable();
    t.boolean('recurrence').defaultTo(1);
    t.timestamp('start_at').notNullable().defaultTo(knex.fn.now());
    t.timestamp('end_at').nullable();
    t.timestamp('last_payment_at').nullable();
    t.enum('status', ['active', 'waiting', 'waiting_payment', 'late_payment', 'blocked', 'cancelled', 'finished', 'deleted']).notNullable().defaultTo('waiting_payment');
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
