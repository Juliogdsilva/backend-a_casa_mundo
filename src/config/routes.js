const pjson = require('../../package.json');
const upload = require('../middlewares/multer');

module.exports = (app) => {
  const controllers = { ...app.src.controllers };
  const { havePermission } = app.src.config.permission;
  // const { haveRole } = app.src.config.roles;

  // ------  AUTH REQUESTS ------
  app.post('/signin', controllers.auth.signin);
  app.post('/validate_token', controllers.auth.validateToken);

  // ------  ROLES ------
  app
    .route('/roles')
    .all(app.src.config.passport.authenticate())
    .get(controllers.roles.get);

  // ------  USERS ------
  app
    .route('/users')
    .all(app.src.config.passport.authenticate())
    .post(controllers.users.save)
    .get(controllers.users.get);

  app
    .route('/users/:id')
    .all(app.src.config.passport.authenticate())
    .put(controllers.users.save)
    .get(controllers.users.getById)
    .delete(controllers.users.del);

  // ------  COMPANIES ------
  app
    .route('/companies')
    .all(app.src.config.passport.authenticate())
    .post(controllers.companies.save)
    .get(controllers.companies.get);

  app
    .route('/companies/:id')
    .all(app.src.config.passport.authenticate())
    .put(controllers.companies.save)
    .get(controllers.companies.getById)
    .delete(controllers.companies.del);

  // ------  Buildings ------
  app
    .route('/buildings')
    .all(app.src.config.passport.authenticate())
    .post(upload.array('images'), controllers.buildings.save)
    .get(controllers.buildings.get);

  app
    .route('/buildings/cities')
    .all(app.src.config.passport.authenticate())
    .get(controllers.buildings.getCities);

  app
    .route('/buildings/:id')
    .all(app.src.config.passport.authenticate())
    .put(upload.array('images'), controllers.buildings.save)
    .get(controllers.buildings.getById);

  // ------  Campaigns ------
  // app
  //   .route('/campaigns/:id')
  //   .all(app.src.config.passport.authenticate())
  //   .post(upload.single('folder'), controllers.campaigns.save)
  //   .get(controllers.campaigns.get);

  // ------  REPORTS REQUESTS ------
  app.get('/reports/buildings', app.src.config.passport.authenticate(), controllers.reports.getTotalBuildings);
  app.get('/reports/campaigns/:id', app.src.config.passport.authenticate(), controllers.reports.getTotalCampaigns);

  // ------  COMMON REQUESTS ------
  app.get('/', (req, res) => res.status(200).send({ msg: 'Casa Mundo Api' }));
  app.get('/version', (req, res) => res.status(200).send({ version: pjson.version }));
  app.use('*', (req, res) => res.status(404).send({ msg: 'o endpoint requisitado não foi encontrado' }));
  // app.use('*', (req, res) => res.status(404).send({ msg: 'requested endpoint not found' }));
};
