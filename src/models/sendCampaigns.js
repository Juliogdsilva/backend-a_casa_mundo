module.exports = () => {
  const modelCampaigns = (item) => {
    const role = {
      folder: item.folder,
      name: item.name,
      company_id: item.company_id,
      note: item.note,
      status: item.status,
    };
    return role;
  };

  return {
    modelCampaigns,
  };
};
