module.exports = (app) => {
  const {
    existsOrError,
    notExistsOrError,
    equalsOrError,
    isEmailValid,
    isPasswordValid,
  } = app.src.tools.validation;
  const { encryptPassword } = app.src.tools.encrypt;
  const { modelCampaigns } = app.src.models.campaigns;
  const { uploadFile } = app.src.tools.aws;

  const save = async (req, res) => {
    if (!req.originalUrl.startsWith('/campaigns')) { return res.status(403).send({ msg: 'Solicitação invalida.' }); }

    const campaign = await modelCampaigns(req.body);
    // const data = { ...req.body };
    const date = new Date();

    if (req.params.id) campaign.id = req.params.id;

    try {
      if (!campaign.id) {
        existsOrError(campaign.name, 'Nome não informado');
        existsOrError(campaign.company_id, 'Empresa não informada');
        existsOrError(req.file, 'Folder não informado');
      }
    } catch (msg) {
      return res.status(400).send({ msg });
    }

    const type = req.file.mimetype.split('/')[1];
    const name = `${Date.now().toString()}.${type}`;
    const path = `web/campaigns/${campaign.company_id}/${name}`;
    campaign.folder = `${process.env.CDN_LINK}/${path}`;
    uploadFile(req.file, 'Erro ao subir imagem', path);

    if (campaign.id) {
      campaign.updated_at = date;
      delete campaign.created_at;

      app
        .db('campaigns')
        .update(campaign)
        .where({ id: campaign.id })
        .whereNot('status', 'deleted')
        .then()
        .catch((err) => {
          res.status(500).send({ msg: 'Erro inesperado' });
          throw err;
        });
    } else {
      await app
        .db('campaigns')
        .insert(campaign)
        .then()
        .catch((err) => {
          res.status(500).send({ msg: 'Erro inesperado' });
          throw err;
        });
    }

    return res.status(204).send();
  };

  const get = async (req, res) => {
    if (!req.originalUrl.startsWith('/campaigns')) { return res.status(403).send({ msg: 'Solicitação invalida.' }); }

    const currentPage = Number(req.query.page) || 1;
    const perPage = Number(req.query.perPage) || 10;

    const search = req.query.search || false;
    const order = req.query.or === 'asc' ? 'asc' : 'desc';

    const campaigns = await app
      .db('campaigns')
      .select('*')
      .modify((query) => {
        if (search) {
          query.andWhere('name', 'like', `%${search}%`);
          query.orWhere('id', 'like', `%${search}%`);
        }
        if (req.params.id) query.andWhere('company_id', req.params.id);
      })
      .whereNot('status', 'blocked')
      .whereNot('status', 'deleted')
      .orderBy('id', order)
      .paginate({ perPage, currentPage, isLengthAware: true })
      .then()
      .catch((err) => {
        res.status(500).send({ msg: 'Erro inesperado' });
        throw err;
      });

    return res.status(200).send({ ...campaigns });
  };

  const getById = async (req, res) => {
    if (!req.originalUrl.startsWith('/campaigns')) { return res.status(403).send({ msg: 'Solicitação invalida.' }); }
    if (!req.params.id) {
      return res
        .status(400)
        .send({ msg: 'Verifique os parâmetro da requisição' });
    }

    const campaign = await app
      .db('campaigns')
      .select('*')
      .where({ id: req.params.id })
      .first()
      .then()
      .catch((err) => {
        res.status(500).send({ msg: 'Erro inesperado' });
        throw err;
      });

    return res.status(200).send({ data: campaign });
  };

  const del = async (req, res) => {
    if (!req.originalUrl.startsWith('/campaigns')) { return res.status(403).send({ msg: 'Solicitação invalida.' }); }
    if (!req.params.id) {
      return res
        .status(400)
        .send({ msg: 'Verifique os parâmetro da requisição' });
    }

    const campaign = await app
      .db('campaigns')
      .select('id')
      .where({ id: req.params.id })
      .whereNot('status', 'deleted')
      .first()
      .then()
      .catch((err) => {
        res.status(500).send({ msg: 'Erro inesperado' });
        throw err;
      });
    if (!campaign) return res.status(404).send({ msg: 'Campanha não localizado' });

    await app
      .db('campaigns')
      .update({ updated_at: new Date(), status: 'deleted' })
      .where({ id: campaign.id })
      .then()
      .catch((err) => {
        res.status(500).send({ msg: 'Erro inesperado' });
        throw err;
      });

    return res.status(204).send();
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
    const newCities = cities
      .map((i) => i.city)
      .filter((valor, indice, self) => self.indexOf(valor) === indice);

    return res.status(200).send({ data: newCities });
  };

  return {
    save,
    get,
    getById,
    getCities,
    del,
  };
};
