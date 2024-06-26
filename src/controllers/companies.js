module.exports = (app) => {
  const {
    existsOrError,
    notExistsOrError,
    equalsOrError,
    isEmailValid,
  } = app.src.tools.validation;
  const { modelCompanies } = app.src.models.companies;

  const save = async (req, res) => {
    if (!req.originalUrl.startsWith('/companies')) { return res.status(403).send({ msg: 'Solicitação invalida.' }); }

    const companies = await modelCompanies(req.body);
    const data = { ...req.body };
    const date = new Date();

    if (req.params.id) companies.id = req.params.id;

    try {
      if (!companies.id) {
        existsOrError(companies.cnpj, 'CNPJ não informado');
        const existsCompany = await app
          .db('companies')
          .where({ cnpj: companies.cnpj })
          .whereNot('status', 'deleted')
          .first();
        notExistsOrError(existsCompany, 'CNPJ já cadastrado');

        existsOrError(companies.name, 'Nome não informado');
      }

      if (companies.finantial_email || !companies.id) {
        existsOrError(companies.finantial_email, 'E-mail financeiro não informado');
        isEmailValid(companies.finantial_email, 'E-mail financeiro informado inválido');
        existsOrError(
          data.confirm_finantial_email,
          'Confirmação de E-mail financeiro não informado',
        );
        equalsOrError(companies.finantial_email, data.confirm_finantial_email, 'E-mails financeiros informados não são idênticos');
      }

      if (companies.email) {
        existsOrError(companies.email, 'E-mail não informado');
        isEmailValid(companies.email, 'E-mail informado inválido');
        existsOrError(
          data.confirm_email,
          'Confirmação de E-mail não informado',
        );
        equalsOrError(companies.email, data.confirm_email, 'E-mails informados não são idênticos');
      }
    } catch (msg) {
      return res.status(400).send({ msg });
    }

    if (companies.id) {
      companies.updated_at = date;
      delete companies.created_at;

      app
        .db('companies')
        .update(companies)
        .where({ id: companies.id })
        .whereNot('status', 'deleted')
        .then()
        .catch((err) => {
          res.status(500).send({ msg: 'Erro inesperado' });
          throw err;
        });
    } else {
      await app
        .db('companies')
        .insert(companies)
        .then()
        .catch((err) => {
          res.status(500).send({ msg: 'Erro inesperado' });
          throw err;
        });
    }
    return res.status(204).send();
  };

  const get = async (req, res) => {
    if (!req.originalUrl.startsWith('/companies')) { return res.status(403).send({ msg: 'Solicitação invalida.' }); }

    const currentPage = Number(req.query.page) || 1;
    const perPage = Number(req.query.perPage) || 10;

    const search = req.query.search || false;
    const cnpj = req.query.cnpj || false;
    const order = req.query.or === 'asc' ? 'asc' : 'desc';

    const companies = await app
      .db('companies')
      .select('id', 'name', 'fantasy_name', 'phone', 'email', 'finantial_email', 'status', 'created_at')
      .modify((query) => {
        if (search) {
          query.andWhere('name', 'like', `%${search}%`);
          query.orWhere('fantasy_name', 'like', `%${search}%`);
          query.orWhere('email', 'like', `%${search}%`);
        }
        if (cnpj) query.andWhere('cnpj', 'like', `%${cnpj}%`);
      })
      .whereNot('status', 'deleted')
      .orderBy('id', order)
      .paginate({ perPage, currentPage, isLengthAware: true })
      .then()
      .catch((err) => {
        res.status(500).send({ msg: 'Erro inesperado' });
        throw err;
      });
    return res.status(200).send({ ...companies });
  };

  const getById = async (req, res) => {
    if (!req.originalUrl.startsWith('/companies')) { return res.status(403).send({ msg: 'Solicitação invalida.' }); }
    if (!req.params.id) {
      return res
        .status(400)
        .send({ msg: 'Verifique os parâmetro da requisição' });
    }

    const companies = await app
      .db('companies')
      .select('*')
      .where({ id: req.params.id })
      .first()
      .then()
      .catch((err) => {
        res.status(500).send({ msg: 'Erro inesperado' });
        throw err;
      });
    return res.status(200).send({ data: companies });
  };

  const del = async (req, res) => {
    if (!req.originalUrl.startsWith('/companies')) { return res.status(403).send({ msg: 'Solicitação invalida.' }); }
    if (!req.params.id) {
      return res
        .status(400)
        .send({ msg: 'Verifique os parâmetro da requisição' });
    }

    const companies = await app
      .db('companies')
      .select('id')
      .where({ id: req.params.id })
      .whereNot('status', 'deleted')
      .first()
      .then()
      .catch((err) => {
        res.status(500).send({ msg: 'Erro inesperado' });
        throw err;
      });
    if (!companies) return res.status(404).send({ msg: 'Empresa não localizada' });

    await app
      .db('companies')
      .update({ updated_at: new Date(), status: 'deleted' })
      .where({ id: companies.id })
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
