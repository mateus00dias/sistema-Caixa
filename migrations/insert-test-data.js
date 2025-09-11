// Script para inserir dados de teste no PostgreSQL
require('dotenv').config();
const { Pool } = require('pg');

// Configuração do PostgreSQL
const pgConfig = {
  connectionString: process.env.DATABASE_URL
};

async function insertTestData() {
  // Criar pool de conexões
  const pool = new Pool(pgConfig);
  
  try {
    console.log('Conectado ao PostgreSQL');
    
    // Inserir dados de teste na tabela caixa
    console.log('Inserindo dados de teste na tabela caixa...');
    
    // Limpar dados existentes
    await pool.query('TRUNCATE TABLE caixa RESTART IDENTITY CASCADE');
    
    // Inserir novos dados
    const caixaData = [
      { date: '2025-09-10', os: '1111', credit: 100.00, debit: 0.00, obs_debito: '' },
      { date: '2025-09-10', os: '1112', credit: 0.00, debit: 0.00, obs_debito: '' },
      { date: '2025-09-09', os: '1110', credit: 200.00, debit: 50.00, obs_debito: 'Material' }
    ];
    
    for (const item of caixaData) {
      await pool.query(
        'INSERT INTO caixa (date, os, credit, debit, obs_debito) VALUES ($1, $2, $3, $4, $5)',
        [item.date, item.os, item.credit, item.debit, item.obs_debito]
      );
    }
    
    console.log(`Inseridos ${caixaData.length} registros na tabela caixa`);
    
    // Inserir dados de teste na tabela os
    console.log('Inserindo dados de teste na tabela os...');
    
    // Limpar dados existentes
    await pool.query('TRUNCATE TABLE os RESTART IDENTITY CASCADE');
    
    // Inserir novos dados
    const osData = [
      { date: '2025-09-10', numero_os: '1111', liberou: 'João', levou: 'Maria' },
      { date: '2025-09-10', numero_os: '1112', liberou: 'Pedro', levou: 'Ana' }
    ];
    
    for (const item of osData) {
      await pool.query(
        'INSERT INTO os (date, numero_os, liberou, levou) VALUES ($1, $2, $3, $4)',
        [item.date, item.numero_os, item.liberou, item.levou]
      );
    }
    
    console.log(`Inseridos ${osData.length} registros na tabela os`);
    
    // Atualizar as sequências
    await pool.query("SELECT setval('caixa_id_seq', (SELECT MAX(id) FROM caixa))");
    await pool.query("SELECT setval('os_id_seq', (SELECT MAX(id) FROM os))");
    console.log('Sequências atualizadas');
    
    console.log('Dados de teste inseridos com sucesso!');
  } catch (error) {
    console.error('Erro ao inserir dados de teste:', error.message);
    console.error('Detalhes do erro:', error);
  } finally {
    // Fechar conexão
    await pool.end();
    console.log('Conexão fechada');
  }
}

insertTestData();