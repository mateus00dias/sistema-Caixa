# Sistema de Caixa

Sistema para controle de fluxo financeiro e ordens de serviço.

## Migração para PostgreSQL

O sistema foi migrado do MySQL para o PostgreSQL. As seguintes alterações foram realizadas:

1. Atualização do arquivo `server.js` para usar o driver PostgreSQL
2. Criação de scripts de migração na pasta `migrations/`
3. Configuração do arquivo `.env` para conexão com o PostgreSQL

## Scripts de Migração

- `migrations/migrate-to-postgres.sql`: Script SQL para criação das tabelas no PostgreSQL
- `migrations/test-connection.js`: Script para testar a conexão com o PostgreSQL
- `migrations/create-tables.js`: Script para criar as tabelas no PostgreSQL
- `migrations/migrate-data.js`: Script para migrar dados do MySQL para o PostgreSQL
- `migrations/insert-test-data.js`: Script para inserir dados de teste no PostgreSQL
- `migrations/test-integrity.js`: Script para verificar a integridade dos dados
- `migrations/test-system.js`: Script para testar o funcionamento do sistema

## Como Iniciar o Sistema

Para iniciar o sistema, execute o arquivo `start-system.bat` ou use o comando `node server.js` no diretório raiz do projeto.

## Configuração

O sistema utiliza um arquivo `.env` para configuração. Exemplo de configuração:

```
DB_HOST=localhost
DB_USER=postgres
DB_PASS=postgres
DB_NAME=sistema_caixa
DB_PORT=5432
DATABASE_URL=postgres://postgres:postgres@localhost:5432/sistema_caixa
```

## Tecnologias Utilizadas

- Node.js
- Express
- PostgreSQL
- HTML/CSS/JavaScript