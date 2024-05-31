module.exports = () => {
  const modelUsers = (item) => {
    const user = {
      name: item.name,
      email: item.email,
      status: item.status,
    };
    return user;
  };

  return {
    modelUsers,
  };
};
