const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
// Configuração CORS para permitir acesso do GitHub Pages
app.use(cors({
  origin: ['https://mateus00dias.github.io', 'http://localhost:3000', 'https://mateus00dias.github.io/sistema-Caixa'],
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
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Máximo de conexões no pool
  idleTimeoutMillis: 30000, // Tempo máximo que uma conexão pode ficar inativa
  ssl: process.env.PGSSL === 'require' ? { rejectUnauthorized: false } : false
  connectionTimeoutMillis: 2000 // Tempo máximo para estabelecer uma conexão
});

// Testar conexão com o banco e verificar estrutura da tabela
pool.query('SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = \'caixa\')').then((result) => {
  // Estrutura da tabela caixa verificada
}).catch(err => {
  // Erro ao verificar estrutura da tabela
});
pool.connect().then(client => {
  // Conexão com o banco de dados estabelecida com sucesso
  client.release();
}).catch(err => {
  // Erro ao conectar ao banco de dados
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
      const dateParts = r.date.toISOString().split('T')[0].split('-');
      const dateObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
      return {
        ...r,
        total: (parseFloat(r.credit) - parseFloat(r.debit)).toFixed(2),
        date_br: dateObj.toLocaleDateString("pt-BR")
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
    
    const result = await pool.query(
      "INSERT INTO caixa (date, os, credit, debit, obs_debito) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [date, osValue, credit || 0, debit || 0, obs_debito || '']
    );
    
    // Registro inserido com sucesso
    res.json({ id: result.rows[0].id });
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
    
    await pool.query(
      "UPDATE caixa SET date=$1, os=$2, credit=$3, debit=$4, obs_debito=$5 WHERE id=$6",
      [date, osValue, credit || 0, debit || 0, obs_debito || '', id]
    );
    
    // Registro atualizado com sucesso
    res.json({ ok: true });
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
    const data = result.rows.map(r => ({
      ...r,
      date_br: new Date(r.date).toLocaleDateString("pt-BR")
    }));
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
    const result = await pool.query(
      "INSERT INTO os (date, numero_os, liberou, levou) VALUES ($1, $2, $3, $4) RETURNING id",
      [date, numero_os, liberou, levou]
    );
    res.json({ id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Editar
app.put("/os/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { date, numero_os, liberou, levou } = req.body;
    await pool.query(
      "UPDATE os SET date=$1, numero_os=$2, liberou=$3, levou=$4 WHERE id=$5",
      [date, numero_os, liberou, levou, id]
    );
    res.json({ ok: true });
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