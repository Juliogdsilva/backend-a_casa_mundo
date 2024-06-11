module.exports = () => {
  const modelUserRoles = (item) => {
    const userRoles = {
      role_id: item.role_id,
      user_id: item.user_id,
    };
    return userRoles;
  };

  return {
    modelUserRoles,
  };
};
