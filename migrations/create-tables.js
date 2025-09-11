// Script para criar as tabelas no PostgreSQL
require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuração do PostgreSQL
const pgConfig = {
  connectionString: process.env.DATABASE_URL
};

async function createTables() {
  // Criar pool de conexões
  const pool = new Pool(pgConfig);
  
  try {
    // Ler o arquivo SQL
    console.log('Lendo o arquivo SQL...');
    const sqlFilePath = path.join(__dirname, 'migrate-to-postgres.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Executar o script SQL
    console.log('Executando o script SQL...');
    await pool.query(sqlContent);
    
    console.log('Tabelas criadas com sucesso!');
    
    // Verificar as tabelas criadas
    console.log('\nVerificando tabelas criadas:');
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
    console.error('Erro ao criar tabelas:', error.message);
    console.error('Detalhes do erro:', error);
  } finally {
    // Fechar conexão
    await pool.end();
    console.log('\nConexão fechada.');
  }
}

createTables();