// Execute uma vez para criar o usuário administrativo inicial.
require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const perguntar = texto => new Promise(resolve => rl.question(texto, resolve));

(async () => {
  let connection;
  try {
    const login = (await perguntar('Digite o nome do usuário: ')).trim();
    const senha = await perguntar('Digite a senha: ');
    if (!login || !senha) throw new Error('Usuário e senha não podem ficar vazios.');

    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'crud_funcionarios'
    });

    const hash = await bcrypt.hash(senha, 10);
    await connection.execute(
      'INSERT INTO usuarios (login, senha) VALUES (?, ?)',
      [login, hash]
    );
    console.log('Usuário criado com sucesso!');
  } catch (error) {
    console.error('Não foi possível criar o usuário:', error.message);
  } finally {
    if (connection) await connection.end();
    rl.close();
  }
})();
