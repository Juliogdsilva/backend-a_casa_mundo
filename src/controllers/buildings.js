module.exports = (app) => {
  const {
    existsOrError,
    notExistsOrError,
    equalsOrError,
    isEmailValid,
    isPasswordValid,
  } = app.src.tools.validation;
  const { encryptPassword } = app.src.tools.encrypt;
  const { modelBuildings } = app.src.models.buildings;

  const save = async (req, res) => {
    if (!req.originalUrl.startsWith('/buildings')) { return res.status(403).send({ msg: 'Solicitação invalida.' }); }

    const building = await modelBuildings(req.body);
    // const data = { ...req.body };
    const date = new Date();

    if (req.params.id) building.id = req.params.id;

    try {
      // if (!building.id)
      existsOrError(building.name, 'Nome não informado');
      existsOrError(building.cep, 'CEP não informado');
      existsOrError(building.address, 'Rua/Av não informado');
      existsOrError(building.neighborhood, 'Bairro não informado');
      existsOrError(building.city, 'Cidade não informado');
      existsOrError(building.state, 'Estado não informado');
    } catch (msg) {
      return res.status(400).send({ msg });
    }

    if (building.id) {
      building.updated_at = date;
      delete building.created_at;

      app
        .db('buildings')
        .update(building)
        .where({ id: building.id })
        .whereNot('status', 'deleted')
        .then()
        .catch((err) => {
          res.status(500).send({ msg: 'Erro inesperado' });
          throw err;
        });
    } else {
      await app
        .db('buildings')
        .insert(building)
        .then()
        .catch((err) => {
          res.status(500).send({ msg: 'Erro inesperado' });
          throw err;
        });
    }
    return res.status(204).send();
  };

  const get = async (req, res) => {
    if (!req.originalUrl.startsWith('/buildings')) { return res.status(403).send({ msg: 'Solicitação invalida.' }); }

    const currentPage = Number(req.query.page) || 1;
    const perPage = Number(req.query.perPage) || 10;

    const search = req.query.search || false;
    // const sectorId = Number(req.query.sc) || false;
    // const roleId = Number(req.query.ro) || false;
    const order = req.query.or === 'asc' ? 'asc' : 'desc';

    const users = await app
      .db('buildings')
      .select('*')
      .modify((query) => {
        if (search) {
          query.andWhere('name', 'like', `%${search}%`);
          query.orWhere('construction_companies', 'like', `%${search}%`);
          query.orWhere('id', 'like', `%${search}%`);
        }
        // if (sectorId) query.andWhere('s.id', sectorId);
        // if (roleId) query.andWhere('r.id', roleId);
      })
      .whereNot('status', 'deleted')
      // .leftJoin('user_role as ur', 'ur.user_id', 'u.id')
      // .leftJoin('roles as r', 'r.id', 'ur.role_id')
      // .leftJoin('sectors as s', 's.id', 'r.sector_id')
      .orderBy('id', order)
      .paginate({ perPage, currentPage, isLengthAware: true })
      .then()
      .catch((err) => {
        res.status(500).send({ msg: 'Erro inesperado' });
        throw err;
      });
    return res.status(200).send({ ...users });
  };

  const getById = async (req, res) => {
    if (!req.originalUrl.startsWith('/users')) { return res.status(403).send({ msg: 'Solicitação invalida.' }); }
    if (!req.params.id) {
      return res
        .status(400)
        .send({ msg: 'Verifique os parâmetro da requisição' });
    }

    const user = await app
      .db('users')
      .select(
        'id',
        'name',
        'email',
        'status',
        'created_at',
        'updated_at',
      )
      .where({ id: req.params.id })
      .then()
      .catch((err) => {
        res.status(500).send({ msg: 'Erro inesperado' });
        throw err;
      });
    return res.status(200).send({ data: user });
  };

  const getCities = async (req, res) => {
    const cities = await app
      .db('buildings')
      .select('city')
      .whereNot('status', 'deleted')
      .then()
      .catch((err) => {
        res.status(500).send({ msg: 'Erro inesperado' });
        throw err;
      });

    const newCities = cities.filter((valor, indice, self) => self.indexOf(valor) === indice);

    return res.status(200).send({ ...newCities });
  };

  const del = async (req, res) => {
    if (!req.originalUrl.startsWith('/users')) { return res.status(403).send({ msg: 'Solicitação invalida.' }); }
    if (!req.params.id) {
      return res
        .status(400)
        .send({ msg: 'Verifique os parâmetro da requisição' });
    }

    const user = await app
      .db('users')
      .select('id', 'name', 'email')
      .where({ id: req.params.id })
      .whereNot('status', 'deleted')
      .first()
      .then()
      .catch((err) => {
        res.status(500).send({ msg: 'Erro inesperado' });
        throw err;
      });
    if (!user) return res.status(404).send({ msg: 'Usuário não localizado' });

    await app
      .db('users')
      .update({ deleted_at: new Date(), status: 'deleted' })
      .where({ id: user.id })
      .then()
      .catch((err) => {
        res.status(500).send({ msg: 'Erro inesperado' });
        throw err;
      });

    return res.status(204).send();
  };

  return {
    save,
    get,
    getById,
    getCities,
    del,
  };
};
