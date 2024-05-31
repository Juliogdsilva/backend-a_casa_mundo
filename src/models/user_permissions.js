module.exports = () => {
  const modelUserPermissions = (item) => {
    const userPermission = {
      permission_id: item.permission_id,
      user_id: item.user_id,
    };
    return userPermission;
  };

  return {
    modelUserPermissions,
  };
};
