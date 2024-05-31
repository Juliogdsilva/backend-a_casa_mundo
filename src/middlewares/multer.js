const multer = require('multer');

/* eslint-disable eqeqeq */
module.exports = (multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './public/');
    },
    filename: (req, file, cb) => {
      const type = file.mimetype.split('/')[1];
      cb(null, `${Date.now().toString()}.${type}`);
    },
    fileFilter: (req, file, cb) => {
      const isAccepted = ['image/jpg', 'image/jpeg', 'image/png'].find((f) => f == file.mimetype);
      if (isAccepted) return cb(null, true);
      return cb(null, false);
    },
  }),
}));
