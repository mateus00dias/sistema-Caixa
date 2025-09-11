-- Script de migração do MySQL para PostgreSQL

-- Tabela caixa
CREATE TABLE IF NOT EXISTS caixa (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  os VARCHAR(255),
  credit DECIMAL(10,2) DEFAULT 0,
  debit DECIMAL(10,2) DEFAULT 0,
  obs_debito VARCHAR(255)
);

-- Tabela os
CREATE TABLE IF NOT EXISTS os (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  numero_os VARCHAR(255),
  liberou VARCHAR(255),
  levou VARCHAR(255)
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_caixa_date ON caixa(date);
CREATE INDEX IF NOT EXISTS idx_os_date ON os(date);
CREATE INDEX IF NOT EXISTS idx_os_numero ON os(numero_os);