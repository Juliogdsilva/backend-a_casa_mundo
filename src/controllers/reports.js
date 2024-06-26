module.exports = (app) => {
  const {
    existsOrError,
    notExistsOrError,
    equalsOrError,
    isEmailValid,
    isPasswordValid,
  } = app.src.tools.validation;

  const getTotalBuildings = async (req, res) => {
    if (!req.originalUrl.startsWith('/reports')) { return res.status(403).send({ msg: 'Solicitação invalida.' }); }

    const buildings = await app
      .db('buildings')
      .count('id as count')
      .then()
      .catch((err) => {
        res.status(500).send({ msg: 'Erro inesperado' });
        throw err;
      });

    return res.status(200).send({ data: buildings[0] });
  };

  const getTotalCampaigns = async (req, res) => {
    if (!req.originalUrl.startsWith('/reports')) { return res.status(403).send({ msg: 'Solicitação invalida.' }); }
    if (!req.params.id) {
      return res
        .status(400)
        .send({ msg: 'Verifique os parâmetro da requisição' });
    }

    const campaigns = await app
      .db('campaigns')
      .count('id as count')
      .where({ company_id: req.params.id })
      .then()
      .catch((err) => {
        res.status(500).send({ msg: 'Erro inesperado' });
        throw err;
      });

    return res.status(200).send({ data: campaigns[0] });
  };

  return {
    getTotalBuildings,
    getTotalCampaigns,
  };
};
