module.exports = () => {
  const modelUsers = (item) => {
    const user = {
      name: item.name,
      email: item.email,
      password: item.password,
      note: item.note,
      status: item.status,
    };
    return user;
  };

  return {
    modelUsers,
  };
};
