# Golden Raspberry Awards API

API RESTful para ler a lista de indicados e vencedores da categoria Pior Filme do Golden Raspberry Awards.

## Tecnologias Utilizadas

- Node.js
- Express
- TypeScript
- Prisma ORM
- SQLite (banco de dados em memória)
- Jest (para testes de integração)
- Pnpm (para gerenciamento de dependências)

## Estrutura do Projeto

- `src/`: Código fonte do projeto
- `src/api/`: Endpoints da API
- `src/utils/`: Utilitários e configurações
- `resources/`: Contém o arquivo `movies.csv` com os dados dos filmes

## Instruções para Rodar o Projeto

### Pré-requisitos

- Node.js instalado
- Pnpm instalado

### Instalação

1. Clone o repositório:

   ```sh
   git clone https://github.com/lrcampos97/golden-raspberry-awards.git
   cd golden-raspberry-awards
   ```

2. Instale as dependências:

   ```sh
   pnpm install
   ```

3. Gere os arquivos do Prisma:

   ```sh
   pnpm prisma:generate
   ```

4. Execute as migrações do banco de dados:

   ```sh
   pnpm prisma:migrate
   ```

### Executando o Servidor

1. Para iniciar o servidor, execute:

   ```sh
   pnpm start
   ```

   Isso irá ler o arquivo `movies.csv` localizado na pasta `resources` e popular o banco de dados sempre que o servidor for iniciado.

### Executando os Testes

1. Para executar os testes de integração, use:

   ```sh
   pnpm test
   ```

## Banco de dados em memória

O banco de dados é populado automaticamente ao iniciar o servidor a partir do arquivo `resources/movies.csv`. Esse processo garante que o banco de dados sempre estará atualizado com os dados dos filmes fornecidos.
