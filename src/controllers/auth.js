const authSecret = process.env.AUTH_SECRET;
const jwt = require('jwt-simple');

module.exports = (app) => {
  // const { justNumbers } = app.src.tools.validation;
  // eslint-disable-next-line no-unused-vars
  const { encryptPassword, comparePassword } = app.src.tools.encrypt;

  const signin = async (req, res) => {
    if (!req.body.email || !req.body.password) {
      return res.status(400).send({ msg: 'Informe E-mail e senha!' });
    }

    const user = await app.db('users')
      .where({ email: req.body.email })
      .first()
      .catch((err) => {
        res.status(500).send({ msg: 'Erro inesperado' });
        throw err;
      });

    if (!user) return res.status(400).send({ msg: 'E-mail ou Senha Inválidos' });
    // eslint-disable-next-line eqeqeq
    if (user.status == 'blocked') return res.status(401).send({ msg: 'Usuário bloqueado! Entre em contato com o administrador' });
    // eslint-disable-next-line eqeqeq
    if (user.status == 'deleted') return res.status(401).send({ msg: 'Usuário desativado! Entre em contato com o administrador' });

    const isMatch = await comparePassword(req.body.password, user.password);
    if (!isMatch) return res.status(401).send({ msg: 'E-mail ou Senha Inválidos' });

    // const permissions = await app.db('user_permissions as up')
    //   .select('up.user_id', 'p.name as permission', 'p.alias as permission_alias')
    //   .leftJoin('permissions as p', 'p.id', 'up.permission_id')
    //   .where('up.user_id', user.id)
    //   .catch((err) => {
    //     res.status(500).send({ msg: 'Erro inesperado' });
    //     throw err;
    //   });

    const role = await app.db('user_role as ur')
      .select('r.name as name', 'r.alias as role_alias')
      .leftJoin('roles as r', 'r.id', 'ur.role_id')
      .where('ur.user_id', user.id)
      .first()
      .catch((err) => {
        res.status(500).send({ msg: 'Erro inesperado' });
        throw err;
      });

    let company = null;
    let plan = null;
    if (role.name === 'user') {
      company = await app.db('user_company as us')
        .select('co.name as name', 'co.email as email', 'co.phone as phone', 'co.created_at as created_at', 'co.updated_at as updated_at')
        .leftJoin('companies as co', 'co.id', 'us.company_id')
        .where('us.user_id', user.id)
        .first()
        .catch((err) => {
          res.status(500).send({ msg: 'Erro inesperado' });
          throw err;
        });

      if (!company?.id) return res.status(500).send({ msg: 'Encontramos um erro em seu cadastro, entre em contato conosco' });
      plan = await app.db('companies_plans')
        .select('*')
        .where('company_id', company.id)
        .first()
        .catch((err) => {
          res.status(500).send({ msg: 'Erro inesperado' });
          throw err;
        });
      console.log(company);
      console.log(plan);
      if (!plan) return res.status(500).send({ msg: 'Encontramos um erro em seu cadastro, entre em contato conosco' });
      if (plan?.status !== 'active') return res.status(402).send({ msg: 'Realize o Pagamento para acessar a plataforma' });
    }

    const now = Math.floor(Date.now() / 1000);
    const days = Number(process.env.DAYS_TOKEN) || 3;

    const payload = {
      id: user.id,
      name: user.name,
      role: role.name,
      role_infos: role,
      company,
      plan,
      iat: now,
      exp: now + (60 * 60 * 24 * days),
    };

    return res.status(200).send({
      ...payload,
      token: jwt.encode(payload, authSecret),
    });
  };

  const validateToken = async (req, res) => {
    const userToken = req.body.token;
    if (!userToken) return res.status(400).send({ msg: 'Token não informado' });

    try {
      const token = await jwt.decode(userToken, authSecret);
      if (new Date(token.exp * 1000) > new Date()) {
        return res.send(true);
      }
    } catch (e) {
      // problema com o token
      return res.status(500).send({ msg: 'Porfavor faça o login novamente.' });
    }

    return res.status(500).send({ msg: 'Porfavor faça o login novamente.' });
  };

  return { signin, validateToken };
};
