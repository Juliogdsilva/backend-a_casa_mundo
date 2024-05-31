module.exports = (app) => {
  const havePermission = (permission) => async (req, res, next) => {
    const { user } = req;

    const userPermissions = await app.db('user_permissions as up')
      .select('up.user_id', 'p.name as permission', 'p.alias as permission_alias')
      .leftJoin('permissions as p', 'p.id', 'up.permission_id')
      .where('up.user_id', user.id)
      .catch((err) => {
        res.status(500).send({ msg: 'Erro inesperado' });
        throw err;
      });

    const isAllowed = await userPermissions.find((p) => p.permission === permission);
    if (isAllowed) next();
    else res.status(401).send({ msg: 'Nível de permissão negada!', status: true });
  };

  return {
    havePermission,
  };
};
