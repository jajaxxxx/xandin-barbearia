# Barbearia – Sistema de Gestão com Agendamento Online

Aplicação web para gestão de barbearia, que permite aos clientes agendar horários online e à barbearia organizar barbeiros, serviços e agenda.

> 🚧 Projeto em desenvolvimento.

## Tecnologias

- [Next.js](https://nextjs.org/) e [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) (PostgreSQL)
- [Vercel](https://vercel.com/) (deploy)

## Banco de dados

O esquema do banco está em `schema_barbearia.sql` e inclui tabelas para:

- barbeiros
- serviços
- horários de trabalho
- clientes
- agendamentos

Também conta com:

- **Prevenção de agendamentos duplicados** no mesmo horário
- **Políticas de segurança por linha (RLS)** no Supabase

## Funcionalidades

- [x] Modelagem do banco de dados
- [x] Página de serviços
- [x] Agendamento online de horários
- [x] Painel de gestão para a barbearia
- [ ] Sistema de cadastro e login

## Como rodar o projeto

### Pré-requisitos

- Node.js instalado
- Uma conta e um projeto no [Supabase](https://supabase.com/)

### Passo a passo

1. Clone o repositório:

   ```bash
   git clone https://github.com/jajaxxxx/site-0.1.git
   cd site-0.1
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. No painel do Supabase, abra o **SQL Editor** e execute o conteúdo de `schema_barbearia.sql` para criar as tabelas.

4. Crie um arquivo `.env.local` na raiz do projeto com as chaves do seu projeto Supabase:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   ```

5. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

6. Acesse [http://localhost:3000](http://localhost:3000).

## Estrutura do projeto

```
app/          páginas e rotas (Next.js)
components/   componentes reutilizáveis
lib/          configuração e funções auxiliares (ex.: cliente Supabase)
public/       arquivos estáticos
```

## Autora

**Jamilly de Souza**, estudante de Engenharia de Software na UVV.

- GitHub: [jajaxxxx](https://github.com/jajaxxxx)
- LinkedIn: [adicionar link]
