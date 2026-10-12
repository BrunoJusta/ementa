# Ementa

Os nossos sítios para comer, e um sorteio para quando não sabemos onde ir.

PWA em React + Vite + TypeScript + Tailwind, com Supabase (base de dados, fotos e tempo real) e deploy na Vercel.

## O que faz

- **Ementa**: a lista de sítios, agrupada por cozinha, momento ou estado ("Os do costume" / "Por estrear"), com pesquisa e filtros (momento, preço, cozinha, já fomos).
- **Ficha de cada sítio**: nome, morada, link do Maps, foto opcional (sem foto aparece uma ilustração), cozinhas (lista fixa mais as que criarem), preço por pessoa, momentos, já fomos / nunca fomos, o que pedir, notas e tags.
- **Sem ideias?**: escolhem os filtros e saem 3 cartas. Cada um risca uma e a que sobra é a escolhida. "Escolhe tu" tira só uma carta.
- **Vamos!**: abre o Maps. Na abertura seguinte da app pergunta se foram, e se sim passa o sítio para "Os do costume".
- **Mesa partilhada**: entra-se com o código da mesa, sem login. O que um adiciona aparece logo no telemóvel do outro.

## Escala de preço (por pessoa)

| | |
|---|---|
| € | até 15 € |
| €€ | 15 a 25 € |
| €€€ | 25 a 35 € |
| €€€€ | mais de 35 € |

## Configurar o Supabase (uma vez)

1. Em **Authentication > Sign In / Providers**, ligar **Allow anonymous sign-ins**.
2. No **SQL Editor**, colar e correr `supabase/migrations/0001_ementa.sql`. Cria as tabelas, as regras RLS, o bucket `fotos`, o tempo real e a mesa `amoras-10`.

O URL e a chave **publishable** já estão em `src/lib/supabase.ts` (são públicos por natureza, os dados estão protegidos pelas regras RLS). Para os trocar sem mexer no código, usar `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`. **Nunca** pôr a chave `sb_secret_...` no frontend.

## Correr localmente

```bash
npm install
npm run dev
```

## Deploy na Vercel

Importar o repositório na Vercel (framework Vite, build `npm run build`, output `dist`). O `vercel.json` já trata das rotas da SPA. Não é preciso configurar variáveis de ambiente.

## Instalar no telemóvel

- **iPhone (Safari)**: Partilhar > Adicionar ao ecrã principal.
- **Android (Chrome)**: menu > Instalar app.

Para a Rita entrar diretamente, partilhar o link `https://<o-vosso-dominio>/?mesa=amoras-10`.

## Estrutura

```
src/
  lib/          supabase, tipos, constantes, filtros, fotos, estado da mesa
  components/   Chip, Botao, Folha (bottom sheet), Ilustracao, Miniatura, Navegacao…
  paginas/      Entrar, Ementa, Sitio, Formulario, SemIdeias
public/illus/   ilustrações a traço vermelho (PNG transparente)
supabase/       migration SQL
```
