module.exports = (app) => {
  function formatDateCalendar(date) {
    let day = date.getDate();
    let month = date.getMonth() + 1;
    day = day < 10 ? `0${day}` : day;
    month = month < 10 ? `0${month}` : month;
    return `${date.getFullYear()}-${month}-${day}`;
  }

  return {
    formatDateCalendar,
  };
};
