// Requisições inseridas nas variáveis
const express  = require('express');
const jwt      = require('jsonwebtoken');
const router   = express.Router();
const auth     = require('../middlewares/auth');

// Variáveis que vão receber os caminhos para os respectivos arquivos
const Usuario  = require('../models/Usuario');
const Pizza    = require('../models/Pizza');
const Cliente  = require('../models/Cliente');
const Pedido   = require('../models/Pedido');

// Adquire de forma assíncrona 
router.post('/auth/login', async (req, res) => {
  try { // Tentativa
    const { email, senha } = req.body; // Recebem a requisição do body
    if (!email || !senha) return res.status(400).json({ erro: 'E-mail e senha são obrigatórios' }); // Se o email e a senha forem falsos, há o retorno de um status e um json informando a situação

    const usuario = await Usuario.findByEmail(email); // A variável vai esperar com que o usuário seja achado pelo email e depois inserido na mesma
    if (!usuario) return res.status(401).json({ erro: 'Credenciais inválidas' }); // Se o usuário for falso, há o retorno de um status e um json informando a situação

    const ok = await Usuario.verificarSenha(senha, usuario.senha); // A variável espera a verificação da senha e do usuário e depois recebe ambos
    if (!ok) return res.status(401).json({ erro: 'Credenciais inválidas' }); // Se a variável for falsa, há o retorno de um status e um json informando a situação

    const token = jwt.sign( // Recebe as informações do token e do login
      { id: usuario.id, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token, usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil } }); // Respota do json
  } catch (e) { res.status(500).json({ erro: e.message }); } // Captura o erro e retorna a mensagem de erro
});

router.get('/pizzas', auth, async (req, res) => { // Rota que coleta e mostra todas as pizzas
  try { res.json(await Pizza.findAll()); }
  catch (e) { res.status(500).json({ erro: e.message }); }
});

router.get('/pizzas/:id', auth, async (req, res) => { // Rota que pesquisa pizzas pelo id, com um try para captar erros
  try {
    const p = await Pizza.findById(req.params.id);
    if (!p) return res.status(404).json({ erro: 'Pizza não encontrada' });
    res.json(p);
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

router.post('/pizzas', auth, async (req, res) => { // Rota para a criação de uma pizza, com um try para captar erros
  try {
    if (!req.body.nome || !req.body.ingredientes)
      return res.status(400).json({ erro: 'Nome e ingredientes são obrigatórios' });
    res.status(201).json(await Pizza.create(req.body));
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

router.put('/pizzas/:id', auth, async (req, res) => { // Rota que que atualiza uma pizza já existente
  try {
    const p = await Pizza.update(req.params.id, req.body);
    if (!p) return res.status(404).json({ erro: 'Pizza não encontrada' });
    res.json(p);
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

router.delete('/pizzas/:id', auth, async (req, res) => { // Rota que deleta uma pizza já existente
  try {
    const ok = await Pizza.delete(req.params.id);
    if (!ok) return res.status(404).json({ erro: 'Pizza não encontrada' });
    res.json({ mensagem: 'Pizza deletada' });
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

router.get('/clientes', auth, async (req, res) => { // Rota que coleta e mostra todos os clientes
  try { res.json(await Cliente.findAll(req.query.busca)); }
  catch (e) { res.status(500).json({ erro: e.message }); }
});

router.get('/clientes/:id', auth, async (req, res) => { // Rota que pesquisa clientes pelo id, com um try para captar erros
  try {
    const c = await Cliente.findById(req.params.id);
    if (!c) return res.status(404).json({ erro: 'Cliente não encontrado' });
    res.json(c);
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

router.post('/clientes', auth, async (req, res) => { // Rota para a criação de um cliente, com um try para captar erros
  try {
    if (!req.body.nome || !req.body.telefone)
      return res.status(400).json({ erro: 'Nome e telefone são obrigatórios' });
    res.status(201).json(await Cliente.create(req.body));
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

router.put('/clientes/:id', auth, async (req, res) => { // // Rota que que atualiza um cliente já existente
  try {
    const c = await Cliente.update(req.params.id, req.body);
    if (!c) return res.status(404).json({ erro: 'Cliente não encontrado' });
    res.json(c);
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

router.delete('/clientes/:id', auth, async (req, res) => { // Rota que deleta um cliente já existente
  try {
    const ok = await Cliente.delete(req.params.id);
    if (!ok) return res.status(404).json({ erro: 'Cliente não encontrado' });
    res.json({ mensagem: 'Cliente deletado' });
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

router.get('/pedidos', auth, async (req, res) => { // Rota que coleta e mostra todos os pedidos
  try {
    const filtros = {};
    if (req.query.garcom) filtros.garcomId = req.query.garcom;
    res.json(await Pedido.findAll(filtros));
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

router.get('/pedidos/:id', auth, async (req, res) => { // Rota que pesquisa pedidos pelo id, com um try para captar erros
  try {
    const p = await Pedido.findById(req.params.id);
    if (!p) return res.status(404).json({ erro: 'Pedido não encontrado' });
    res.json(p);
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

router.post('/pedidos', auth, async (req, res) => { // Rota para a criação de um novo pedido, com um try para captar erros
  try {
    const { cliente, itens, formaPagamento } = req.body;
    if (!cliente || !itens?.length || !formaPagamento)
      return res.status(400).json({ erro: 'cliente, itens e formaPagamento são obrigatórios' });

    const novo = await Pedido.create({
      clienteId:      cliente,
      itens,
      taxaEntrega:    req.body.taxaEntrega,
      formaPagamento,
      troco:          req.body.troco,
      observacoes:    req.body.observacoes,
      mesa:           req.body.mesa,
      origem:         req.body.origem,
      garcomId:       req.body.garcom || req.usuario?.id,
    });
    res.status(201).json(novo);
  } catch (e) { res.status(400).json({ erro: e.message }); }
});

router.patch('/pedidos/:id/status', auth, async (req, res) => { // Rota que altera o status do pedido (recebido, em preparo, saiu para entrega, entregue, cancelado), com um try para a coleta de erros
  try {
    const validos = ['recebido','em_preparo','saiu_entrega','entregue','cancelado'];
    if (!validos.includes(req.body.status))
      return res.status(400).json({ erro: 'Status inválido' });
    const p = await Pedido.updateStatus(req.params.id, req.body.status);
    if (!p) return res.status(404).json({ erro: 'Pedido não encontrado' });
    res.json(p);
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

router.delete('/pedidos/:id', auth, async (req, res) => { // Rota que deleta um cliente já existente
  try {
    const ok = await Pedido.delete(req.params.id);
    if (!ok) return res.status(404).json({ erro: 'Pedido não encontrado' });
    res.json({ mensagem: 'Pedido deletado' });
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

router.get('/usuarios', auth, async (req, res) => { // Rota que coleta e mostra todos os usuário (acesso apenas para administradores)
  try {
    if (req.usuario.perfil !== 'Administrador')
      return res.status(403).json({ erro: 'Acesso restrito a Administradores' });
    res.json(await Usuario.findAll());
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

router.post('/usuarios', auth, async (req, res) => { // Rota para a criação de um usuário
  try {
    if (req.usuario.perfil !== 'Administrador')
      return res.status(403).json({ erro: 'Acesso restrito a Administradores' });
    const { nome, email, senha, perfil } = req.body;
    if (!nome || !email || !senha)
      return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios' });
    res.status(201).json(await Usuario.create({ nome, email, senha, perfil }));
  } catch (e) {
    if (e.message?.includes('UNIQUE')) return res.status(400).json({ erro: 'E-mail já cadastrado' });
    res.status(500).json({ erro: e.message });
  }
});

router.put('/usuarios/:id', auth, async (req, res) => { // Rota que pesquisa usuarios pelo id (acesso apenas para administradores)
  try {
    if (req.usuario.perfil !== 'Administrador')
      return res.status(403).json({ erro: 'Acesso restrito a Administradores' });
    const u = await Usuario.update(req.params.id, req.body);
    if (!u) return res.status(404).json({ erro: 'Usuário não encontrado' });
    res.json(u);
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

router.delete('/usuarios/:id', auth, async (req, res) => { // Rota que deleta um usuário já existente (acesso apenas para administradores)
  try {
    if (req.usuario.perfil !== 'Administrador')
      return res.status(403).json({ erro: 'Acesso restrito a Administradores' });
    const ok = await Usuario.delete(req.params.id);
    if (!ok) return res.status(404).json({ erro: 'Usuário não encontrado' });
    res.json({ mensagem: 'Usuário deletado' });
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

module.exports = router; // Módulo que exportará as rotas
