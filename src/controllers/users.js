module.exports = (app) => {
  const {
    existsOrError,
    notExistsOrError,
    equalsOrError,
    isEmailValid,
    isPasswordValid,
  } = app.src.tools.validation;
  const { encryptPassword } = app.src.tools.encrypt;
  const { modelUsers } = app.src.models.users;

  const save = async (req, res) => {
    if (!req.originalUrl.startsWith('/users')) { return res.status(403).send({ msg: 'Solicitação invalida.' }); }

    const user = await modelUsers(req.body);
    const data = { ...req.body };
    const date = new Date();

    if (req.params.id) user.id = req.params.id;

    try {
      if (!user.id) existsOrError(user.name, 'Nome não informado');
      if (user.email || !user.id) {
        existsOrError(user.email, 'E-mail não informado');
        isEmailValid(user.email, 'E-mail informado inválido');
        existsOrError(
          data.confirm_email,
          'Confirmação de E-mail não informado',
        );

        const existsClient = await app
          .db('users')
          .where({ email: user.email })
          .whereNot('status', 'deleted')
          .first();
        notExistsOrError(existsClient, 'E-mail em uso');
      }
      if (data.password || !user.id) {
        existsOrError(data.password, 'Senha não informada');
        isPasswordValid(data.password, 'Senha não tem os requisitos');
        existsOrError(
          data.confirm_password,
          'Confirmação de senha não informada',
        );
        equalsOrError(
          data.password,
          data.confirm_password,
          'Senhas não conferem',
        );
        user.password = await encryptPassword(data.password);
      }
    } catch (msg) {
      return res.status(400).send({ msg });
    }

    if (user.id) {
      user.updated_at = date;
      delete user.created_at;

      app
        .db('users')
        .update(user)
        .where({ id: user.id })
        .whereNot('status', 'deleted')
        .then()
        .catch((err) => {
          res.status(500).send({ msg: 'Erro inesperado' });
          throw err;
        });
    } else {
      await app
        .db('users')
        .insert(user)
        .then()
        .catch((err) => {
          res.status(500).send({ msg: 'Erro inesperado' });
          throw err;
        });
    }
    return res.status(204).send();
  };

  const get = async (req, res) => {
    if (!req.originalUrl.startsWith('/users')) { return res.status(403).send({ msg: 'Solicitação invalida.' }); }

    const currentPage = Number(req.query.page) || 1;
    const perPage = Number(req.query.perPage) || 10;

    const search = req.query.search || false;
    const sectorId = Number(req.query.sc) || false;
    const roleId = Number(req.query.ro) || false;
    const order = req.query.or === 'asc' ? 'asc' : 'desc';

    const users = await app
      .db('users as u')
      .select('u.id', 'u.name', 'u.email', 'u.status', 'u.created_at', 'r.alias as role', 'r.name as role_name', 'r.id as role_id', 's.alias as sector', 's.name as sector_names', 's.id as sector_id')
      .modify((query) => {
        if (search) {
          query.andWhere('u.name', 'like', `%${search}%`);
          query.andWhere('u.email', 'like', `%${search}%`);
        }
        if (sectorId) query.andWhere('s.id', sectorId);
        if (roleId) query.andWhere('r.id', roleId);
      })
      .whereNot('u.status', 'deleted')
      .leftJoin('user_role as ur', 'ur.user_id', 'u.id')
      .leftJoin('roles as r', 'r.id', 'ur.role_id')
      .leftJoin('sectors as s', 's.id', 'r.sector_id')
      .orderBy('u.id', order)
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
    del,
  };
};
