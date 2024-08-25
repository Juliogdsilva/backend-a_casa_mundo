/* eslint-disable operator-assignment */
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
  const { uploadFile } = app.src.tools.aws;

  const save = async (req, res) => {
    if (!req.originalUrl.startsWith("/buildings")) {
      return res.status(403).send({ msg: "Solicitação invalida." });
    }

    const building = await modelBuildings(req.body);
    // const data = { ...req.body };
    const date = new Date();

    if (req.params.id) building.id = req.params.id;

    try {
      if (!building.id) {
        existsOrError(building.name, "Nome não informado");
        existsOrError(building.cep, "CEP não informado");
        existsOrError(building.address, "Rua/Av não informado");
        existsOrError(building.neighborhood, "Bairro não informado");
        existsOrError(building.city, "Cidade não informado");
        existsOrError(building.state, "Estado não informado");
      }
    } catch (msg) {
      return res.status(400).send({ msg });
    }

    if (building.id) {
      building.updated_at = date;
      delete building.created_at;

      app
        .db("buildings")
        .update(building)
        .where({ id: building.id })
        .whereNot("status", "deleted")
        .then()
        .catch((err) => {
          res.status(500).send({ msg: "Erro inesperado" });
          throw err;
        });
    } else {
      const id = await app
        .db("buildings")
        .insert(building)
        .then()
        .catch((err) => {
          res.status(500).send({ msg: "Erro inesperado" });
          throw err;
        });
      building.id = id[0];
    }

    if (req.files) {
      req.files.forEach((file) => {
        const type = file.mimetype.split("/")[1];
        const name = `${Date.now().toString()}.${type}`;
        const path = `web/buildings/${building.id}/${name}`;
        const url = `${process.env.CDN_LINK}/${path}`;
        uploadFile(file, "Erro ao subir imagem", path);

        app
          .db("buildings_images")
          .insert({ building_id: building.id, name, url })
          .then()
          .catch((err) => {
            res.status(500).send({ msg: "Erro inesperado" });
            throw err;
          });
      });
    }

    return res.status(204).send();
  };

  const get = async (req, res) => {
    if (!req.originalUrl.startsWith("/buildings")) {
      return res.status(403).send({ msg: "Solicitação invalida." });
    }

    const currentPage = Number(req.query.page) || 1;
    const perPage = Number(req.query.perPage) || 10;

    const search = req.query.search || false;
    const city = req.query.city || false;
    const date = req.query.date || false;
    const sn = req.query.sn || [];
    const order = req.query.or === "asc" ? "asc" : "desc";

    const buildings = await app
      .db("buildings")
      .select("*")
      .modify((query) => {
        if (search) {
          query.where("name", "like", `%${search}%`);
          query.orWhere("construction_companies", "like", `%${search}%`);
          query.orWhere("id", "like", `%${search}%`);
        }
        if (city) query.where("city", "like", `%${city}%`);
        if (date) query.where("completion_date", "like", `%${date}%`);
        if (sn.length > 0) {
          for (let i = 0; i < sn.length; i = i + 1) {
            const n = sn[i];
            query.orWhere("neighborhood", "like", `%${n}%`);
          }
        }
      })
      .where("status", "active")
      .orderBy("id", order)
      .paginate({ perPage, currentPage, isLengthAware: true })
      .then()
      .catch((err) => {
        res.status(500).send({ msg: "Erro inesperado" });
        throw err;
      });
    for (let i = 0; i < buildings.data.length; i = i + 1) {
      const building = buildings.data[i];

      const images = await app
        .db("buildings_images")
        .select("id", "name", "url")
        .where({ building_id: building.id })
        .catch((err) => {
          res.status(500).send({ msg: "Erro inesperado" });
          throw err;
        });
      building.images = images;
    }

    return res.status(200).send({ ...buildings });
  };

  const getById = async (req, res) => {
    if (!req.originalUrl.startsWith("/buildings")) {
      return res.status(403).send({ msg: "Solicitação invalida." });
    }
    if (!req.params.id) {
      return res
        .status(400)
        .send({ msg: "Verifique os parâmetro da requisição" });
    }

    const building = await app
      .db("buildings")
      .select("*")
      .where({ id: req.params.id })
      .first()
      .then()
      .catch((err) => {
        res.status(500).send({ msg: "Erro inesperado" });
        throw err;
      });

    if (!building)
      return res.status(404).send({ msg: "Empreendimento não localizado" });

    const images = await app
      .db("buildings_images")
      .select("id", "name", "url")
      .where({ building_id: building.id })
      .catch((err) => {
        res.status(500).send({ msg: "Erro inesperado" });
        throw err;
      });
    building.images = images;
    return res.status(200).send({ data: building });
  };

  const del = async (req, res) => {
    if (!req.originalUrl.startsWith("/buildings")) {
      return res.status(403).send({ msg: "Solicitação invalida." });
    }
    if (!req.params.id) {
      return res
        .status(400)
        .send({ msg: "Verifique os parâmetro da requisição" });
    }

    const building = await app
      .db("buildings")
      .select("id")
      .where({ id: req.params.id })
      .whereNot("status", "deleted")
      .first()
      .then()
      .catch((err) => {
        res.status(500).send({ msg: "Erro inesperado" });
        throw err;
      });
    if (!building)
      return res.status(404).send({ msg: "Empreendimento não localizado" });

    await app
      .db("buildings")
      .update({ deleted_at: new Date(), status: "deleted" })
      .where({ id: building.id })
      .then()
      .catch((err) => {
        res.status(500).send({ msg: "Erro inesperado" });
        throw err;
      });

    return res.status(204).send();
  };

  const getCities = async (req, res) => {
    const cities = await app
      .db("buildings")
      .select("city")
      .whereNot("status", "deleted")
      .then()
      .catch((err) => {
        res.status(500).send({ msg: "Erro inesperado" });
        throw err;
      });
    const newCities = cities
      .map((i) => i.city)
      .filter((valor, indice, self) => self.indexOf(valor) === indice);

    return res.status(200).send({ data: newCities });
  };

  const getNeighborhood = async (req, res) => {
    if (!req.params.city) {
      return res
        .status(400)
        .send({ msg: "Verifique os parâmetro da requisição" });
    }

    const neighborhoods = await app
      .db("buildings")
      .select("neighborhood")
      .where({ city: req.params.city })
      .whereNot("status", "deleted")
      .then()
      .catch((err) => {
        res.status(500).send({ msg: "Erro inesperado" });
        throw err;
      });
    const newNeighborhood = neighborhoods
      .map((i) => i.neighborhood)
      .filter((valor, indice, self) => self.indexOf(valor) === indice);

    return res.status(200).send({ data: newNeighborhood });
  };

  return {
    save,
    get,
    getById,
    getCities,
    getNeighborhood,
    del,
  };
};
