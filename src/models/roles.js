module.exports = () => {
  const modelRoles = (item) => {
    const role = {
      name: item.name,
      alias: item.alias,
      description: item.description,
      sector_id: item.sector_id,
      status: item.status,
    };
    return role;
  };

  return {
    modelRoles,
  };
};
