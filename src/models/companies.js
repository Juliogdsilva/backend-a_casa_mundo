module.exports = () => {
  const modelCompanies = (item) => {
    const user = {
      cnpj: item.cnpj,
      name: item.name,
      fantasy_name: item.fantasy_name,
      email: item.email,
      phone: item.phone,
      other_phone: item.other_phone,
      site: item.site,
      finantial_email: item.finantial_email,
      finantial_responsible: item.finantial_responsible,
      note: item.note,
      status: item.status,
    };
    return user;
  };

  return {
    modelCompanies,
  };
};
