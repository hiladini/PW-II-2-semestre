PROJETO FINAL - PROGRAMA DE COMPUTADORES
Sistema de gestão de funcionários com login, departamentos e CRUD.

ESTRUTURA
- login.html / login.js: tela e validação do login.
- index.html / script.js: sistema principal.
- style.css: aparência das telas.
- backend/server.js: API Node.js + Express.
- backend/criar-usuario.js: criação do primeiro usuário.
- backend/.env.example: modelo das configurações.
- database/crud_funcionarios.sql: criação do banco e tabelas.

COMO EXECUTAR

1. Abra o MySQL Workbench e execute todo o arquivo:
   database/crud_funcionarios.sql

2. Abra a pasta backend no VS Code/terminal:
   cd backend

3. Instale as dependências:
   npm install

4. Copie o arquivo .env.example para um arquivo chamado .env.
   Preencha DB_USER e DB_PASSWORD conforme seu MySQL.
   Troque JWT_SECRET por uma frase longa e particular.

5. Crie o primeiro usuário:
   node criar-usuario.js
   Digite um login e uma senha quando o terminal pedir.
   A senha será armazenada com hash bcrypt.

6. Inicie o servidor:
   npm start

7. Em outro terminal, na pasta principal do projeto, execute:
   npx serve .
   Se não tiver o serve, instale com: npm install -g serve
   Abra o endereço mostrado no terminal e entre em login.html.
   Alternativamente, use a extensão Live Server do VS Code e abra login.html.

OBSERVAÇÕES
- O servidor precisa continuar aberto enquanto o sistema estiver em uso.
- O backend valida um token JWT nas rotas de funcionários e departamentos.
- O navegador guarda o token no localStorage e redireciona para o login quando ele não existe.
- Para um sistema real em produção, o ideal é servir o frontend por HTTPS e usar cookies
  seguros HttpOnly para a sessão, além de controles adicionais de segurança.
