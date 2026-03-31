// Definição da variável jwt (token da web do json)
const jwt = require('jsonwebtoken');

// Utilização de uma função para autenticação
function autenticar(req, res, next) { //recebe os parâmetros
  const authHeader = req.headers['authorization']; // Variável que recebrá uma requisição de autorização
  const token      = authHeader && authHeader.split(' ')[1]; // Variável que vai adquirir o authHeader (variável acima) e a segunda parte do mesmo separada por um espaço

  if (!token) { // Caso o token seja falso
    return res.status(401).json({ erro: 'Token não fornecido. Faça login.' }); // Retornará uma resposta de status 401 junto de um json com a informação do erro
  }

  try { // Tentará
    const payload  = jwt.verify(token, process.env.JWT_SECRET); // A variável receberá uma verificação do token e do processo do arquivo .env (JWT_SECRET)
    req.usuario    = payload; // A requisição de usuario vai receber a variável criada acima
    next(); // Libera a função seguinte
  } catch (erro) { // Coleta o erro
    return res.status(401).json({ erro: 'Token inválido ou expirado.' }); // Retornará uma resposta de status 401 junto de um json com a informação do erro
  }
}

module.exports = autenticar; // A exportação de modulos receberá a função autenticar
