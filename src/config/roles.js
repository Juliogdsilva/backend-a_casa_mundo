module.exports = (app) => {
  const haveRole = (role) => async (req, res, next) => {
    const { user } = req;

    const userRole = await app.db('user_role as ur')
      .select('ur.user_id', 'r.name as role', 'r.alias as role_alias')
      .leftJoin('roles as r', 'r.id', 'ur.role_id')
      .where('up.user_id', user.id)
      .catch((err) => {
        res.status(500).send({ msg: 'Erro inesperado' });
        throw err;
      });

    const isAllowed = await userRole.find((p) => p.role === role);
    if (isAllowed) next();
    else res.status(401).send({ msg: 'Nível de permissão negada!', status: true });
  };

  return {
    haveRole,
  };
};
