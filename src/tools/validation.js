const CPF = require('cpf');

module.exports = () => {
  function existsOrError(value, msg) {
    if (!value) throw msg;
    if (Array.isArray(value) && value.length === 0) throw msg;
    if (typeof value === 'string' && !value.trim()) throw msg;
  }

  function notExistsOrError(value, msg) {
    try {
      existsOrError(value, msg);
    } catch {
      return;
    }
    throw msg;
  }

  function equalsOrError(valueA, valueB, msg) {
    if (valueA !== valueB) throw msg;
  }

  function notEqualsOrError(valueA, valueB, msg) {
    if (valueA === valueB) throw msg;
  }

  function checkLimit(valueA, valueB, msg) {
    if (valueA >= valueB) throw msg;
  }

  function isEmailValid(value, msg) {
    if (/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value)) return true;
    throw msg;
  }

  function isPasswordValid(value, msg) {
    if (/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,15}$/.test(value)) return true;
    throw msg;
  }

  function isCPFValid(value, msg) {
    const isFormatted = /^(\d{3}.\d{3}.\d{3}-\d{2})|(\d{11})$/.test(value);
    const exist = CPF.isValid(value);
    if (exist && isFormatted) return true;
    throw msg;
  }

  function isCNPJValid(value, msg) {
    const isFormatted = /^(\d{2}.\d{3}.\d{3}\/\d{4}-\d{2})|(\d{14})$/.test(value);
    if (isFormatted) return true;
    throw msg;
  }

  function isCepValid(value, msg) {
    const isFormatted = /^(\d{5}-\d{3})|(\d{8})$/.test(value);
    if (isFormatted) return true;
    throw msg;
  }

  async function justNumbers(value) {
    const valueA = await value.replace(/[^0-9]/g, '');
    return valueA;
  }

  return {
    existsOrError,
    notExistsOrError,
    equalsOrError,
    notEqualsOrError,
    checkLimit,
    isEmailValid,
    isPasswordValid,
    isCPFValid,
    isCNPJValid,
    isCepValid,
    justNumbers,
  };
};
