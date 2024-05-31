const bodyParser = require('body-parser');
const cors = require('cors');

module.exports = (app) => {
  app.use(bodyParser.json({ limit: '100mb' }));
  app.use(bodyParser.urlencoded({ limit: '100mb', extended: true, parameterLimit: 50000 }));
  app.use(cors({ exposedHeaders: ['Content-Disposition'] }));

  app.use((req, res, next) => {
    const oldSend = res.send;
    res.send = function (data) {
      const newData = {
        ...data,
        info: {
          status: true,
          timestamp: new Date().getTime(),
        },
      };
      res.send = oldSend;
      return res.send(newData);
    };
    next();
  });
};
