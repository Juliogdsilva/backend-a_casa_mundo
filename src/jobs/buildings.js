/* eslint-disable import/no-extraneous-dependencies */
const cron = require('node-cron');
const axios = require('axios');

module.exports = (app) => {
  cron.schedule('* * * * *', async () => {
    const buildings = await app
      .db('buildings')
      .select('id', 'cep')
      .where('latitude', null)
      .orWhere('longitude', null)
      .whereNot('cep', null)
      .limit(20)
      .then()
      .catch((err) => {
        throw err;
      });

    for (let i = 0; i < buildings.length; i += 1) {
      const building = buildings[i];

      const getCoordinates = await axios(`https://brasilapi.com.br/api/cep/v2/${building.cep}`)
        .then()
        .catch((err) => {
          if (err.response?.status === 404) return;
          if (err.response?.status === 524) return;
          throw err;
        });
      console.log(getCoordinates);
      const latitude = getCoordinates?.location?.coordinates?.latitude;
      const longitude = getCoordinates?.location?.coordinates?.longitude;

      if (latitude && longitude) {
        const date = new Date();
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
