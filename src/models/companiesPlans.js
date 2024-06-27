module.exports = () => {
  const modelCompaniesPlans = (item) => {
    const companiesPlans = {
      transaction_id: item.transaction_id,
      company_id: item.company_id,
      plan_id: item.plan_id,
      payment_method_id: item.payment_method_id,
      payment_by: item.payment_by,
      partner_number: item.partner_number,
      installments: item.installments,
      discount: item.discount,
      recurrence: item.recurrence,
      end_at: item.end_at,
      last_payment_at: item.last_payment_at,
      status: item.status,
    };
    return companiesPlans;
  };

  return {
    modelCompaniesPlans,
  };
};
