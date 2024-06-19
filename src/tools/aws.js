const AWS = require('aws-sdk');

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3({});

module.exports = () => {
  function uploadFile(file, msg, folder) {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: folder,
      Body: file.buffer,
    };

    s3.upload(params, (err, data) => {
      if (err) {
        throw msg;
      }
    });
  }

  return {
    uploadFile,
  };
};
