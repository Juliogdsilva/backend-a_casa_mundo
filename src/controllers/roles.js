module.exports = (app) => {
  const get = async (req, res) => {
    if (!req.originalUrl.startsWith('/roles')) { return res.status(403).send({ msg: 'Solicitação invalida.' }); }

    const currentPage = Number(req.query.page) || 1;
    const perPage = Number(req.query.perPage) || 10;

    const search = req.query.search || false;

    const roles = await app
      .db('roles as r')
      .select('r.*', 's.name as sector_name', 's.alias as sector')
      .leftJoin('sectors as s', 's.id', 'r.sector_id')
      .whereNot('r.status', 'deleted')
      .modify((query) => {
        if (search) {
          // eslint-disable-next-line func-names
          query.andWhere(function () {
            this.where('r.name', 'like', `%${search}%`);
            this.orWhere('r.alias', 'like', `%${search}%`);
          });
        }
      })
      .paginate({ perPage, currentPage, isLengthAware: true })
      .then()
      .catch((err) => {
        res.status(500).send({ msg: 'Erro inesperado' });
        throw err;
      });
    return res.status(200).send({ ...roles });
  };

  const getById = async (req, res) => {
    if (!req.originalUrl.startsWith('/roles')) { return res.status(403).send({ msg: 'Solicitação invalida.' }); }
    if (!req.params.id) {
      return res
        .status(400)
        .send({ msg: 'Verifique os parâmetro da requisição' });
    }

    const role = await app
      .db('roles')
      .select('*')
      .where({ id: req.params.id })
      .then()
      .catch((err) => {
        res.status(500).send({ msg: 'Erro inesperado' });
        throw err;
      });
    return res.status(200).send({ data: role });
  };

  return {
    get,
    getById,
  };
};
