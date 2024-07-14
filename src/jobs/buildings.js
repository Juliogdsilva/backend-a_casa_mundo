/* eslint-disable import/no-extraneous-dependencies */
const cron = require('node-cron');
const axios = require('axios');

module.exports = (app) => {
  cron.schedule('*/2 * * * *', async () => {
    const date = new Date();
    const buildings = await app
      .db('buildings')
      .select('id', 'cep')
      .whereNull('latitude')
      .whereNull('longitude')
      .whereNotNull('cep')
      .whereNot({ not_found_brasil_api: 1, not_found_ibge_api: 1 })
      .whereNot({ status: 'deleted' })
      .limit(4)
      .then()
      .catch((err) => {
        throw err;
      });

    for (let i = 0; i < buildings.length; i += 1) {
      const building = buildings[i];

      // eslint-disable-next-line no-await-in-loop
      let getCoordinates = await axios(`https://brasilapi.com.br/api/cep/v2/${building.cep}`)
        .then()
        .catch((err) => {
          if (err.response?.status === 404) {
            app
              .db('buildings')
              .update({ not_found_brasil_api: 1, updated_at: date })
              .where({ id: building.id })
              .then()
              .catch((err) => {
                throw err;
              });
            return;
          }
          if (err.response?.status === 524) return;
          throw err;
        });
      let latitude = getCoordinates?.data?.location?.coordinates?.latitude;
      let longitude = getCoordinates?.data?.location?.coordinates?.longitude;

      if (latitude && longitude) {
        app
          .db('buildings')
          .update({ latitude, longitude, updated_at: date })
          .where({ id: building.id })
          .then()
          .catch((err) => {
            throw err;
          });
        continue;
      }

      // eslint-disable-next-line no-await-in-loop
      getCoordinates = await axios(`https://cep.awesomeapi.com.br/json/${building.cep}`)
        .then()
        .catch((err) => {
          if (err.response?.status === 404) {
            app
              .db('buildings')
              .update({ not_found_ibge_api: 1, updated_at: date })
              .where({ id: building.id })
              .then()
              .catch((err) => {
                throw err;
              });
            return;
          }
          if (err.response?.status === 524) return;
          throw err;
        });
      latitude = getCoordinates?.data?.lat;
      longitude = getCoordinates?.data?.lng;

      if (latitude && longitude) {
        app
          .db('buildings')
          .update({ latitude, longitude, updated_at: date })
          .where({ id: building.id })
          .then()
          .catch((err) => {
            throw err;
          });
      }
    }
  });
};
