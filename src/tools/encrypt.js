const bcrypt = require("bcrypt-nodejs");
const CryptoJS = require("crypto-js");
const speakeasy = require("speakeasy");

module.exports = () => {
  function encryptPassword(password) {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
  }

  function comparePassword(valueA, valueB) {
    const isMatch = bcrypt.compareSync(valueA, valueB);
    if (!isMatch) return false;
    return true;
  }

  function encryptQRcode(qrcode) {
    const encrypted = CryptoJS.DES.encrypt(
      qrcode,
      process.env.AUTH_SECRET
    ).toString();
    return encrypted;
  }

  function decryptQRcode(qrcode) {
    const bytes = CryptoJS.DES.decrypt(qrcode, process.env.AUTH_SECRET);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText;
  }

  async function verify2FA(token, saveSecret) {
    const secret = JSON.parse(saveSecret).base32;
    const verified = speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token,
      window: process.env.QT_2FA_WINDOW,
    });

    return verified;
  }

  return {
    encryptPassword,
    comparePassword,
    encryptQRcode,
    decryptQRcode,
    verify2FA,
  };
};
