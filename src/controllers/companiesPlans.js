module.exports = (app) => {
  const {
    existsOrError,
    justNumbers,
  } = app.src.tools.validation;
  const { getUUID } = app.src.tools.generator;
  const { modelCompaniesPlans } = app.src.models.companiesPlans;

  const save = async (req, res) => {
    if (!req.originalUrl.startsWith('/companies_plans')) { return res.status(403).send({ msg: 'Solicitação invalida.' }); }

    const companiesPlans = await modelCompaniesPlans(req.body);
    const data = { ...req.body };
    const date = new Date();

    if (req.params.id) companiesPlans.id = req.params.id;

    try {
      if (!companiesPlans.id) {
        companiesPlans.transaction_id = await getUUID();
        existsOrError(companiesPlans.company_id, 'Empresa não informada');
        existsOrError(companiesPlans.plan_id, 'Plano não informado');
        existsOrError(companiesPlans.payment_method_id, 'Método de pagamento não informado');
        existsOrError(companiesPlans.payment_by, 'Pagador não informado');
        existsOrError(companiesPlans.amount, 'Valor não informado');
      }
      if (companiesPlans.amount) justNumbers(companiesPlans.amount);
      if (companiesPlans.discount) justNumbers(companiesPlans.discount);
      if (companiesPlans.installments) justNumbers(companiesPlans.installments);
    } catch (msg) {
      return res.status(400).send({ msg });
    }

    if (data.seller_id) companiesPlans.seller_id = data.seller_id;

    if (companiesPlans.id) {
      companiesPlans.updated_at = date;
      delete companiesPlans.created_at;

      app
        .db('companies_plans')
        .update(companiesPlans)
        .where({ id: companiesPlans.id })
        .whereNot('status', 'deleted')
        .then()
        .catch((err) => {
          res.status(500).send({ msg: 'Erro inesperado' });
          throw err;
        });
    } else {
      await app
        .db('companies_plans')
        .insert(companiesPlans)
        .then()
        .catch((err) => {
          res.status(500).send({ msg: 'Erro inesperado' });
          throw err;
        });
    }

    return res.status(204).send();
  };

  const get = async (req, res) => {
    if (!req.originalUrl.startsWith('/companies_plans')) { return res.status(403).send({ msg: 'Solicitação invalida.' }); }

    const currentPage = Number(req.query.page) || 1;
    const perPage = Number(req.query.perPage) || 10;

    const search = req.query.search || false;
    const order = req.query.or === 'asc' ? 'asc' : 'desc';

    const companiesPlans = await app
      .db('companies_plans as cp')
      .select('cp.transaction_id', 'cp.company_id', 'pl.name as plan', 'pm.name as payment_method', 'pa.name as payment_by', 'se.name as seller', 'cp.amount', 'cp.installments', 'cp.discount')
      .leftJoin('plans as pl', 'pl.id', 'cp.plan_id')
      .leftJoin('payment_methods as pm', 'pm.id', 'cp.payment_method_id')
      .leftJoin('users as pa', 'pa.id', 'cp.payment_by')
      .leftJoin('users as se', 'se.id', 'cp.seller_id')
      .modify((query) => {
        if (search) {
          query.andWhere('cp.transaction_id', 'like', `%${search}%`);
          query.orWhere('cp.id', 'like', `%${search}%`);
        }
        if (req.params.sellerId) query.andWhere('cp.seller_id', req.params.sellerId);
        if (req.params.companyId) query.andWhere('cp.company_id', req.params.companyId);
      })
      .whereNot('cp.status', 'deleted')
      .orderBy('cp.id', order)
      .paginate({ perPage, currentPage, isLengthAware: true })
      .then()
      .catch((err) => {
        res.status(500).send({ msg: 'Erro inesperado' });
        throw err;
      });

    return res.status(200).send({ ...companiesPlans });
  };

  const getById = async (req, res) => {
    if (!req.originalUrl.startsWith('/companies_plans')) { return res.status(403).send({ msg: 'Solicitação invalida.' }); }
    if (!req.params.id) {
      return res
        .status(400)
        .send({ msg: 'Verifique os parâmetro da requisição' });
    }

    const companiesPlans = await app
      .db('companies_plans')
      .select('*')
      .where({ id: req.params.id })
      .first()
      .then()
      .catch((err) => {
        res.status(500).send({ msg: 'Erro inesperado' });
        throw err;
      });

    return res.status(200).send({ data: companiesPlans });
  };

  const del = async (req, res) => {
    if (!req.originalUrl.startsWith('/companies_plans')) { return res.status(403).send({ msg: 'Solicitação invalida.' }); }
    if (!req.params.id) {
      return res
        .status(400)
        .send({ msg: 'Verifique os parâmetro da requisição' });
    }

    const companiesPlans = await app
      .db('companies_plans')
      .select('id')
      .where({ id: req.params.id })
      .whereNot('status', 'deleted')
      .first()
      .then()
      .catch((err) => {
        res.status(500).send({ msg: 'Erro inesperado' });
        throw err;
      });
    if (!companiesPlans) return res.status(404).send({ msg: 'Plano não localizado' });

    await app
      .db('companies_plans')
      .update({ updated_at: new Date(), status: 'deleted' })
      .where({ id: companiesPlans.id })
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
