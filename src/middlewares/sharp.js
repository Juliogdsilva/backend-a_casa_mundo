const sharp = require('sharp');

module.exports = async (file) => {
  const data = await sharp(file.path)
    .resize({
      width: 1920,
      fit: 'inside',
    })
    .toBuffer();

  return data;
};
