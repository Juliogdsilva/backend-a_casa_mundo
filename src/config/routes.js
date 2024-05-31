const pjson = require('../../package.json');
const upload = require('../middlewares/multer');

module.exports = (app) => {
  const controllers = { ...app.src.controllers };
  const { havePermission } = app.src.config.permission;

  // ------  AUTH REQUESTS ------
  app.post('/signin', controllers.auth.signin);
  app.post('/validate_token', controllers.auth.validateToken);

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

  // ------  ROLES ------
  app
    .route('/roles')
    .all(app.src.config.passport.authenticate())
    .get(controllers.roles.get);

  // ------  COMMON REQUESTS ------
  app.get('/', (req, res) => res.status(200).send({ msg: 'Backend' }));
  app.get('/version', (req, res) => res.status(200).send({ version: pjson.version }));
  app.use('*', (req, res) => res.status(404).send({ msg: 'o endpoint requisitado não foi encontrado' }));
  // app.use('*', (req, res) => res.status(404).send({ msg: 'requested endpoint not found' }));
};
