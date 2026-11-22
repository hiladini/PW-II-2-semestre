CREATE DATABASE IF NOT EXISTS crud_funcionarios
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE crud_funcionarios;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  login VARCHAR(50) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS departamentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL UNIQUE,
  localizacao VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS funcionarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  funcao VARCHAR(100) NOT NULL,
  salario DECIMAL(10,2) NOT NULL,
  email VARCHAR(150),
  data_admissao DATE,
  status ENUM('Ativo','Inativo') NOT NULL DEFAULT 'Ativo',
  departamento_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_funcionarios_departamentos
    FOREIGN KEY (departamento_id) REFERENCES departamentos(id)
    ON UPDATE CASCADE ON DELETE SET NULL
);

INSERT IGNORE INTO departamentos (nome, localizacao) VALUES
('Administrativo', 'Escritório'),
('Tecnologia', 'Sala de TI'),
('Financeiro', 'Escritório');
