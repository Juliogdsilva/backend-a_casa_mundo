module.exports = (app) => {
  const get = async (req, res) => {
    if (!req.originalUrl.startsWith('/permissions')) { return res.status(403).send({ msg: 'Solicitação invalida.' }); }

    const currentPage = Number(req.query.page) || 1;
    const perPage = Number(req.query.perPage) || 10;

    const search = req.query.search || false;
    const order = req.query.or === 'asc' ? 'asc' : 'desc';

    const statues = await app
      .db('permissions')
      .select('*')
      .modify((query) => {
        if (search) query.andWhere('name', 'like', `%${search}%`);
        if (search) query.orWhere('alias', 'like', `%${search}%`);
      })
      .orderBy('id', order)
      .paginate({ perPage, currentPage, isLengthAware: true })
      .then()
      .catch((err) => {
        res.status(500).send({ msg: 'Erro inesperado' });
        throw err;
      });
    return res.status(200).send({ ...statues });
  };

  return {
    get,
  };
};
