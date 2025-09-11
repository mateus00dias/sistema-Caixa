// Script para migrar dados do MySQL para PostgreSQL
require('dotenv').config();
const mysql = require('mysql2/promise');
const { Pool } = require('pg');

// Configuração do MySQL (origem)
const mysqlConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  // Adicionar configurações para lidar com problemas de conexão
  connectTimeout: 60000, // 60 segundos
  ssl: {
    rejectUnauthorized: false
  }
};

// Configuração do PostgreSQL (destino)
const pgConfig = {
  connectionString: process.env.DATABASE_URL
};

async function migrateData() {
  // Conectar ao MySQL
  const mysqlPool = mysql.createPool(mysqlConfig);
  console.log('Conectado ao MySQL');

  // Conectar ao PostgreSQL
  const pgPool = new Pool(pgConfig);
  console.log('Conectado ao PostgreSQL');

  try {
    // Migrar tabela caixa
    console.log('Migrando tabela caixa...');
    const [caixaRows] = await mysqlPool.query('SELECT * FROM caixa');
    
    for (const row of caixaRows) {
      await pgPool.query(
        'INSERT INTO caixa (id, date, os, credit, debit, obs_debito) VALUES ($1, $2, $3, $4, $5, $6)',
        [row.id, row.date, row.os, row.credit, row.debit, row.obs_debito]
      );
    }
    console.log(`Migrados ${caixaRows.length} registros da tabela caixa`);

    // Migrar tabela os
    console.log('Migrando tabela os...');
    const [osRows] = await mysqlPool.query('SELECT * FROM os');
    
    for (const row of osRows) {
      await pgPool.query(
        'INSERT INTO os (id, date, numero_os, liberou, levou) VALUES ($1, $2, $3, $4, $5)',
        [row.id, row.date, row.numero_os, row.liberou, row.levou]
      );
    }
    console.log(`Migrados ${osRows.length} registros da tabela os`);

    // Atualizar as sequências do PostgreSQL
    await pgPool.query("SELECT setval('caixa_id_seq', (SELECT MAX(id) FROM caixa))");
    await pgPool.query("SELECT setval('os_id_seq', (SELECT MAX(id) FROM os))");
    console.log('Sequências atualizadas');

    console.log('Migração concluída com sucesso!');
  } catch (error) {
    console.error('Erro durante a migração:', error);
  } finally {
    // Fechar conexões
    await mysqlPool.end();
    await pgPool.end();
    console.log('Conexões fechadas');
  }
}

migrateData();