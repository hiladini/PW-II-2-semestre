require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'crud_funcionarios',
  waitForConnections: true,
  connectionLimit: 10
});

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('Configure JWT_SECRET no arquivo .env antes de iniciar.');
  process.exit(1);
}

function autenticar(req, res, next) {
  const authorization = req.headers.authorization || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Faça login para continuar.' });
  try {
    req.usuario = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Sessão inválida ou expirada.' });
  }
}

app.post('/api/login', async (req, res) => {
  try {
    const { login, senha } = req.body;
    if (!login || !senha) return res.status(400).json({ error: 'Informe usuário e senha.' });
    const [rows] = await db.execute('SELECT id, login, senha FROM usuarios WHERE login = ?', [login]);
    if (!rows.length) return res.status(401).json({ error: 'Usuário ou senha incorretos.' });
    const valido = await bcrypt.compare(senha, rows[0].senha);
    if (!valido) return res.status(401).json({ error: 'Usuário ou senha incorretos.' });

    const token = jwt.sign(
      { id: rows[0].id, login: rows[0].login },
      JWT_SECRET,
      { expiresIn: '2h' }
    );
    res.json({ token, usuario: { login: rows[0].login } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao realizar login.' });
  }
});

// As rotas abaixo exigem token válido.
app.use('/api/funcionarios', autenticar);
app.use('/api/departamentos', autenticar);

app.get('/api/funcionarios', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT f.*, d.nome AS departamento_nome
      FROM funcionarios f
      LEFT JOIN departamentos d ON d.id = f.departamento_id
      ORDER BY f.id DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error(error); res.status(500).json({ error: 'Erro ao listar funcionários.' });
  }
});

app.post('/api/funcionarios', async (req, res) => {
  try {
    const { nome, funcao, salario, email, data_admissao, status, departamento_id } = req.body;
    if (!nome || !funcao || salario === undefined || salario === '') {
      return res.status(400).json({ error: 'Nome, função e salário são obrigatórios.' });
    }
    const [result] = await db.execute(
      `INSERT INTO funcionarios
       (nome, funcao, salario, email, data_admissao, status, departamento_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nome, funcao, Number(salario), email || null, data_admissao || null,
       status || 'Ativo', departamento_id || null]
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (error) {
    console.error(error); res.status(500).json({ error: 'Erro ao cadastrar funcionário.' });
  }
});

app.put('/api/funcionarios/:id', async (req, res) => {
  try {
    const { nome, funcao, salario, email, data_admissao, status, departamento_id } = req.body;
    if (!nome || !funcao || salario === undefined || salario === '') {
      return res.status(400).json({ error: 'Nome, função e salário são obrigatórios.' });
    }
    const [result] = await db.execute(
      `UPDATE funcionarios SET nome=?, funcao=?, salario=?, email=?,
       data_admissao=?, status=?, departamento_id=? WHERE id=?`,
      [nome, funcao, Number(salario), email || null, data_admissao || null,
       status || 'Ativo', departamento_id || null, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ error: 'Funcionário não encontrado.' });
    res.json({ success: true });
  } catch (error) {
    console.error(error); res.status(500).json({ error: 'Erro ao atualizar funcionário.' });
  }
});

app.delete('/api/funcionarios/:id', async (req, res) => {
  try {
    const [result] = await db.execute('DELETE FROM funcionarios WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Funcionário não encontrado.' });
    res.json({ success: true });
  } catch (error) {
    console.error(error); res.status(500).json({ error: 'Erro ao excluir funcionário.' });
  }
});

app.get('/api/departamentos', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM departamentos ORDER BY nome');
    res.json(rows);
  } catch (error) {
    console.error(error); res.status(500).json({ error: 'Erro ao listar departamentos.' });
  }
});

app.post('/api/departamentos', async (req, res) => {
  try {
    const { nome, localizacao } = req.body;
    if (!nome) return res.status(400).json({ error: 'O nome do departamento é obrigatório.' });
    const [result] = await db.execute(
      'INSERT INTO departamentos (nome, localizacao) VALUES (?, ?)',
      [nome, localizacao || null]
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Esse departamento já existe.' });
    console.error(error); res.status(500).json({ error: 'Erro ao cadastrar departamento.' });
  }
});

app.delete('/api/departamentos/:id', async (req, res) => {
  try {
    const [result] = await db.execute('DELETE FROM departamentos WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Departamento não encontrado.' });
    res.json({ success: true });
  } catch (error) {
    console.error(error); res.status(500).json({ error: 'Não foi possível excluir. Verifique se há funcionários vinculados.' });
  }
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
