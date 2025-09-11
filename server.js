const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const fs = require('fs');
const path = require('path');

// Carrega o arquivo .env padrão
require("dotenv").config();

// Carrega o arquivo .env.local se estiver em ambiente de desenvolvimento e o arquivo existir
const envLocalPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envLocalPath)) {
  console.log('Carregando configurações de ambiente local (.env.local)');
  require("dotenv").config({ path: envLocalPath, override: true });
}

const app = express();
// Configuração CORS para permitir acesso do GitHub Pages e desenvolvimento local
app.use(cors({
  origin: ['https://mateus00dias.github.io', 'http://localhost:3000', 'https://mateus00dias.github.io/sistema-Caixa', 'http://localhost:5501', 'http://127.0.0.1:5501'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Middleware para adicionar cabeçalhos CORS em todas as respostas
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});
app.use(express.json());

// Conexão com banco
console.log(`Configurando conexão com o banco de dados...`);
console.log(`SSL: ${process.env.PGSSL || 'não configurado'}`);

const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  max: 20, // Máximo de conexões no pool
  idleTimeoutMillis: 30000, // Tempo máximo que uma conexão pode ficar inativa
  connectionTimeoutMillis: 5000 // Tempo máximo para estabelecer uma conexão
};

// Configuração de SSL baseada na variável de ambiente
if (process.env.PGSSL === 'require') {
  console.log('Configurando SSL como obrigatório');
  poolConfig.ssl = { rejectUnauthorized: false };
} else if (process.env.PGSSL === 'disable') {
  console.log('SSL desativado para ambiente local');
  poolConfig.ssl = false;
} else {
  console.log('Usando configuração padrão de SSL');
  poolConfig.ssl = false;
}

const pool = new Pool(poolConfig);

// Testar conexão com o banco e verificar estrutura das tabelas
console.log('Testando conexão com o banco de dados...');
pool.connect()
  .then(client => {
    console.log('✅ Conexão com o banco de dados estabelecida com sucesso');
    client.release();
    
    // Verificar estrutura da tabela caixa
    return pool.query('SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = \'caixa\')');
  })
  .then((result) => {
    if (result.rows[0].exists) {
      console.log('✅ Tabela caixa encontrada no banco de dados');
    } else {
      console.log('❌ Tabela caixa NÃO encontrada no banco de dados');
    }
    
    // Verificar estrutura da tabela os
    return pool.query('SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = \'os\')');
  })
  .then((result) => {
    if (result.rows[0].exists) {
      console.log('✅ Tabela os encontrada no banco de dados');
    } else {
      console.log('❌ Tabela os NÃO encontrada no banco de dados');
      console.log('🔧 Criando tabela os...');
      
      // Criar tabela os se não existir
      return pool.query(`
        CREATE TABLE os (
          id SERIAL PRIMARY KEY,
          date DATE NOT NULL,
          numero_os VARCHAR(50) NOT NULL,
          liberou VARCHAR(255),
          levou VARCHAR(255)
        )
      `);
    }
  })
  .then((result) => {
    // Se result existir, significa que a tabela foi criada
    if (result && result.command === 'CREATE') {
      console.log('✅ Tabela os criada com sucesso');
    }
  })
  .catch(err => {
    console.error('❌ Erro ao conectar ao banco de dados ou criar tabela:');
    console.error(err.message);
  });

// Endpoint de diagnóstico para verificar o estado do sistema
app.get("/diagnostico", async (req, res) => {
  try {
    // Verificar conexão com o banco
    const client = await pool.connect();
    
    // Verificar tabelas
    const caixaCheck = await client.query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'caixa')"
    );
    const caixaExists = caixaCheck.rows[0].exists;
    
    const osCheck = await client.query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'os')"
    );
    const osExists = osCheck.rows[0].exists;
    
    // Contar registros
    let caixaCount = 0;
    if (caixaExists) {
      const countResult = await client.query('SELECT COUNT(*) FROM caixa');
      caixaCount = parseInt(countResult.rows[0].count);
    }
    
    let osCount = 0;
    if (osExists) {
      const countResult = await client.query('SELECT COUNT(*) FROM os');
      osCount = parseInt(countResult.rows[0].count);
    }
    
    // Verificar versão do banco
    const versionResult = await client.query('SELECT version()');
    
    client.release();
    
    // Retornar informações de diagnóstico
    res.json({
      status: 'online',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        version: versionResult.rows[0].version,
        tables: {
          caixa: {
            exists: caixaExists,
            records: caixaCount
          },
          os: {
            exists: osExists,
            records: osCount
          }
        }
      },
      environment: {
        node_env: process.env.NODE_ENV || 'production',
        debug: process.env.DEBUG === 'true',
        ssl_enabled: process.env.PGSSL === 'require'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message,
      database: {
        connected: false
      },
      environment: {
        node_env: process.env.NODE_ENV || 'production',
        debug: process.env.DEBUG === 'true',
        ssl_enabled: process.env.PGSSL === 'require'
      }
    });
  }
});

// --- CAIXA ---
// Listar
app.get("/caixa", async (req, res) => {
  const { date } = req.query;
  try {
    // Executando consulta no banco de dados - adaptado para PostgreSQL
    
    const result = await pool.query(
      date ? "SELECT * FROM caixa WHERE date = $1 ORDER BY date" : "SELECT * FROM caixa ORDER BY date",
      date ? [date] : []
    );
    
    // Consulta executada com sucesso
    const data = result.rows.map(r => {
      // Corrigindo o problema de fuso horário na data
      // Ajustando para o fuso horário local (Brasil/São Paulo)
      const dateObj = new Date(r.date);
      
      // Formatando as datas de criação e atualização com o fuso horário correto
      const created_at_date = r.created_at ? new Date(r.created_at) : null;
      const updated_at_date = r.updated_at ? new Date(r.updated_at) : null;
      
      // Exibindo apenas o horário de criação no formato HH:MM:SS sem ajuste de fuso horário
      // O banco de dados já armazena no fuso horário local, então não precisamos ajustar
      const created_at_formatted = created_at_date ? created_at_date.toLocaleTimeString("pt-BR", { timeZone: 'America/Sao_Paulo' }) : null;
      const updated_at_formatted = updated_at_date ? updated_at_date.toLocaleTimeString("pt-BR", { timeZone: 'America/Sao_Paulo' }) : null;
      
      return {
        ...r,
        total: (parseFloat(r.credit) - parseFloat(r.debit)).toFixed(2),
        date_br: dateObj.toLocaleDateString("pt-BR"),
        created_at_formatted,
        updated_at_formatted
      };
    });
    res.json(data);
  } catch (err) {
    // Erro ao consultar banco de dados
    res.status(500).json({ error: err.message });
  }
});

// Criar
app.post("/caixa", async (req, res) => {
  try {
    // Processando requisição POST /caixa
    const { date, os, credit, debit, obs_debito } = req.body;
    
    if (!date) {
      // Erro: campo date é obrigatório
      return res.status(400).json({ error: 'O campo date é obrigatório' });
    }
    
    // Usando o valor completo do campo 'os'
    const osValue = os || '';
    
    // PostgreSQL usa $1, $2 para parâmetros e RETURNING para obter o ID gerado
    // Os campos created_at e updated_at são preenchidos automaticamente pelo valor padrão
    const result = await pool.query(
      "INSERT INTO caixa (date, os, credit, debit, obs_debito) VALUES ($1, $2, $3, $4, $5) RETURNING id, created_at, updated_at",
      [date, osValue, credit || 0, debit || 0, obs_debito || '']
    );
    
    // Registro inserido com sucesso
    // Ajustando o fuso horário para as datas de criação e atualização
    const created_at = new Date(result.rows[0].created_at);
    const updated_at = new Date(result.rows[0].updated_at);
    
    // Não é necessário ajustar o fuso horário manualmente
    
    res.json({ 
      id: result.rows[0].id,
      created_at: created_at.toISOString(),
      updated_at: updated_at.toISOString(),
      created_at_formatted: created_at.toLocaleTimeString("pt-BR", {timeZone: 'America/Sao_Paulo'}),
      updated_at_formatted: updated_at.toLocaleTimeString("pt-BR", {timeZone: 'America/Sao_Paulo'})
    });
  } catch (err) {
    // Erro ao inserir registro no banco de dados
    res.status(500).json({ error: err.message });
  }
});

// Editar
app.put("/caixa/:id", async (req, res) => {
  try {
    // Processando requisição PUT /caixa/:id
    const { id } = req.params;
    const { date, os, credit, debit, obs_debito } = req.body;
    
    // Usando o valor completo do campo 'os'
    const osValue = os || '';
    
    // O campo updated_at será atualizado automaticamente pelo trigger
    const result = await pool.query(
      "UPDATE caixa SET date=$1, os=$2, credit=$3, debit=$4, obs_debito=$5 WHERE id=$6 RETURNING updated_at",
      [date, osValue, credit || 0, debit || 0, obs_debito || '', id]
    );
    
    // Registro atualizado com sucesso
    // Ajustando o fuso horário para a data de atualização
    const updated_at = new Date(result.rows[0].updated_at);
    
    // Não é necessário ajustar o fuso horário manualmente
    
    res.json({ 
      ok: true,
      updated_at: updated_at.toISOString(),
      updated_at_formatted: updated_at.toLocaleTimeString("pt-BR", {timeZone: 'America/Sao_Paulo'})
    });
  } catch (err) {
    // Erro ao atualizar registro no banco de dados
    res.status(500).json({ error: err.message });
  }
});

// Excluir
app.delete("/caixa/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM caixa WHERE id=$1", [id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- OS ---
// Listar
app.get("/os", async (req, res) => {
  const { date } = req.query;
  try {
    const result = await pool.query(
      date ? "SELECT * FROM os WHERE date = $1 ORDER BY date" : "SELECT * FROM os ORDER BY date",
      date ? [date] : []
    );
    const data = result.rows.map(r => {
      // Ajustando para o fuso horário local (Brasil/São Paulo)
      const dateObj = new Date(r.date);
      
      // Formatando as datas de criação e atualização com o fuso horário correto
      const created_at_date = r.created_at ? new Date(r.created_at) : null;
      const updated_at_date = r.updated_at ? new Date(r.updated_at) : null;
      
      // Não é necessário ajustar o fuso horário manualmente
      
      // Exibindo apenas o horário de criação no formato HH:MM:SS
      const created_at_formatted = created_at_date ? created_at_date.toLocaleTimeString("pt-BR", {timeZone: 'America/Sao_Paulo'}) : null;
      const updated_at_formatted = updated_at_date ? updated_at_date.toLocaleTimeString("pt-BR", {timeZone: 'America/Sao_Paulo'}) : null;
      
      return {
        ...r,
        date_br: dateObj.toLocaleDateString("pt-BR"),
        created_at_formatted,
        updated_at_formatted
      };
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Criar
app.post("/os", async (req, res) => {
  try {
    const { date, numero_os, liberou, levou } = req.body;
    // PostgreSQL usa RETURNING para obter o ID gerado
    // Os campos created_at e updated_at são preenchidos automaticamente pelo valor padrão
    const result = await pool.query(
      "INSERT INTO os (date, numero_os, liberou, levou) VALUES ($1, $2, $3, $4) RETURNING id, created_at, updated_at",
      [date, numero_os, liberou, levou]
    );
    // Ajustando o fuso horário para as datas de criação e atualização
    const created_at = new Date(result.rows[0].created_at);
    const updated_at = new Date(result.rows[0].updated_at);
    
    // Não é necessário ajustar o fuso horário manualmente
    
    res.json({ 
      id: result.rows[0].id,
      created_at: created_at.toISOString(),
      updated_at: updated_at.toISOString(),
      created_at_formatted: created_at.toLocaleTimeString("pt-BR", {timeZone: 'America/Sao_Paulo'}),
      updated_at_formatted: updated_at.toLocaleTimeString("pt-BR", {timeZone: 'America/Sao_Paulo'})
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Editar
app.put("/os/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { date, numero_os, liberou, levou } = req.body;
    // O campo updated_at será atualizado automaticamente pelo trigger
    const result = await pool.query(
      "UPDATE os SET date=$1, numero_os=$2, liberou=$3, levou=$4 WHERE id=$5 RETURNING updated_at",
      [date, numero_os, liberou, levou, id]
    );
    // Ajustando o fuso horário para a data de atualização
    const updated_at = new Date(result.rows[0].updated_at);
    
    // Não é necessário ajustar o fuso horário manualmente
    
    res.json({ 
      ok: true,
      updated_at: updated_at.toISOString(),
      updated_at_formatted: updated_at.toLocaleTimeString("pt-BR", {timeZone: 'America/Sao_Paulo'})
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Excluir
app.delete("/os/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM os WHERE id=$1", [id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Porta do Railway ou 3000 local
app.listen(process.env.PORT || 3000, () =>
  // Server iniciado
  console.log("🚀 Server rodando na porta " + (process.env.PORT || 3000))
);