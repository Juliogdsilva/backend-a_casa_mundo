/* eslint-disable import/order */

const config = require('../../knexfile');
const knex = require('knex')(config);

const { attachPaginate } = require('knex-paginate');

attachPaginate();

module.exports = knex;
