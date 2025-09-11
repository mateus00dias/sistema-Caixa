// Script para testar a integridade dos dados após a migração
require('dotenv').config();
const { Pool } = require('pg');

// Configuração do PostgreSQL
const pgConfig = {
  connectionString: process.env.DATABASE_URL
};

async function testIntegrity() {
  // Conectar ao PostgreSQL
  const pgPool = new Pool(pgConfig);
  console.log('Conectado ao PostgreSQL');

  try {
    // Verificar tabela caixa
    console.log('Verificando tabela caixa...');
    const caixaResult = await pgPool.query('SELECT COUNT(*) FROM caixa');
    console.log(`Total de registros na tabela caixa: ${caixaResult.rows[0].count}`);

    // Verificar tabela os
    console.log('Verificando tabela os...');
    const osResult = await pgPool.query('SELECT COUNT(*) FROM os');
    console.log(`Total de registros na tabela os: ${osResult.rows[0].count}`);

    // Verificar integridade dos dados
    console.log('Verificando integridade dos dados...');
    
    // Verificar se há registros com datas inválidas
    const invalidDatesResult = await pgPool.query(
      "SELECT COUNT(*) FROM caixa WHERE date IS NULL OR date > CURRENT_DATE + INTERVAL '1 year'"
    );
    console.log(`Registros com datas inválidas na tabela caixa: ${invalidDatesResult.rows[0].count}`);

    // Verificar se há registros com valores negativos onde não deveria
    const negativeValuesResult = await pgPool.query(
      "SELECT COUNT(*) FROM caixa WHERE credit < 0 OR debit < 0"
    );
    console.log(`Registros com valores negativos na tabela caixa: ${negativeValuesResult.rows[0].count}`);

    // Verificar se as sequências estão corretas
    const caixaSeqResult = await pgPool.query("SELECT last_value FROM caixa_id_seq");
    const caixaMaxIdResult = await pgPool.query("SELECT MAX(id) FROM caixa");
    console.log(`Último valor da sequência caixa_id_seq: ${caixaSeqResult.rows[0].last_value}`);
    console.log(`Maior ID na tabela caixa: ${caixaMaxIdResult.rows[0].max}`);

    const osSeqResult = await pgPool.query("SELECT last_value FROM os_id_seq");
    const osMaxIdResult = await pgPool.query("SELECT MAX(id) FROM os");
    console.log(`Último valor da sequência os_id_seq: ${osSeqResult.rows[0].last_value}`);
    console.log(`Maior ID na tabela os: ${osMaxIdResult.rows[0].max}`);

    console.log('Verificação de integridade concluída!');
  } catch (error) {
    console.error('Erro durante a verificação de integridade:', error);
  } finally {
    // Fechar conexão
    await pgPool.end();
    console.log('Conexão fechada');
  }
}

testIntegrity();