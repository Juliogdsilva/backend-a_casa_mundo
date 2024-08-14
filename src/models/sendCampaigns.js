module.exports = () => {
  const modelSendCampaigns = (item) => {
    const role = {
      campaign_id: item.campaign_id,
      company_id: item.company_id,
      units: item.units,
      note: item.note,
      status: item.status,
    };
    return role;
  };

  return {
    modelSendCampaigns,
  };
};
