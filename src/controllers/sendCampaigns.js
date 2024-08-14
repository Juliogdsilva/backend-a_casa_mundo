module.exports = (app) => {
  const {
    existsOrError,
    notExistsOrError,
    equalsOrError,
    isEmailValid,
    isPasswordValid,
  } = app.src.tools.validation;
  const { modelSendCampaigns } = app.src.models.sendCampaigns;

  const save = async (req, res) => {
    if (!req.originalUrl.startsWith("/send_campaigns")) {
      return res.status(403).send({ msg: "Solicitação invalida." });
    }

    const send = await modelSendCampaigns(req.body);
    const data = { ...req.body };
    const date = new Date();

    let buildings = 0;
    let units = 0;

    if (req.params.id) send.id = req.params.id;

    try {
      if (!send.id) {
        existsOrError(send.campaign_id, "Campanha não informada");
        existsOrError(send.company_id, "Empresa não informada");
        existsOrError(data.items, "Empreendimentos não informados");
      }

      buildings = data.items.length;

      for (let i = 0; i < data.items.length; i += 1) {
        const sc = data.items[i];
        const building = await app
          .db("buildings")
          .select("units")
          .where({ id: sc.id })
          .whereNot("status", "deleted")
          .first()
          .then()
          .catch((err) => {
            res.status(500).send({ msg: "Erro inesperado" });
            throw err;
          });
        const building_units = building.units ? Number(building.units) : 0;
        units += building_units;

        await app
          .db("send_campaigns")
          .insert({
            campaign_id: send.campaign_id,
            company_id: send.company_id,
            building_id: sc.id,
            units: building_units,
          })
          .then()
          .catch((err) => {
            res.status(500).send({ msg: "Erro inesperado" });
            throw err;
          });
      }
    } catch (msg) {
      return res.status(400).send({ msg });
    }

    const msg = `Campanha enviada para ${buildings} empreendimentos ${
      units <= 0 ? "" : `e ${units} unidades`
    } `;

    return res.status(200).send({ msg });
  };

  return {
    save,
  };
};
