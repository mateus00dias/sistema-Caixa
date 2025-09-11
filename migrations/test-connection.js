// Script para testar a conexão com o PostgreSQL
require('dotenv').config();
const { Pool } = require('pg');

// Configuração do PostgreSQL
const pgConfig = {
  connectionString: process.env.DATABASE_URL
};

async function testConnection() {
  // Criar pool de conexões
  const pool = new Pool(pgConfig);
  
  try {
    // Testar conexão
    console.log('Tentando conectar ao PostgreSQL...');
    const result = await pool.query('SELECT NOW()');
    console.log('Conexão com PostgreSQL estabelecida com sucesso!');
    console.log('Data e hora do servidor:', result.rows[0].now);
    
    // Verificar se as tabelas existem
    console.log('\nVerificando tabelas existentes...');
    const tablesResult = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    
    if (tablesResult.rows.length === 0) {
      console.log('Nenhuma tabela encontrada no banco de dados.');
    } else {
      console.log('Tabelas encontradas:');
      tablesResult.rows.forEach(row => {
        console.log(`- ${row.table_name}`);
      });
    }
  } catch (error) {
    console.error('Erro ao conectar ao PostgreSQL:', error.message);
    console.error('Detalhes do erro:', error);
  } finally {
    // Fechar conexão
    await pool.end();
    console.log('\nConexão fechada.');
  }
}

testConnection();