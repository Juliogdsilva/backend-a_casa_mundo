module.exports = () => {
  const modelBuildings = (item) => {
    const buildings = {
      name: item.name,
      cep: item.cep,
      address: item.address,
      number: item.number,
      complement: item.complement,
      neighborhood: item.neighborhood,
      city: item.city,
      state: item.state,
      units: item.units,
      towers: item.towers,
      construction_companies: item.construction_companies,
      completion_date: item.completion_date,
      description: item.description,
      status: item.status,
    };
    return buildings;
  };

  return {
    modelBuildings,
  };
};
