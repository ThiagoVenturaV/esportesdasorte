# Documentação Técnica da Aplicação

Este documento descreve de forma unificada o design system, a arquitetura e os fluxos de negócio da aplicação Esportes da Sorte, cobrindo frontend, backend e banco de dados.

Objetivo deste documento:

- Explicar o que cada camada faz.
- Explicar por que cada decisão foi tomada.
- Facilitar manutenção, onboarding e evolução do produto.

## 1. Visão Geral

A aplicação é uma plataforma de apoio a apostas esportivas com foco em:

- Listagem de jogos ao vivo e futuros.
- Análise de partidas com IA (Edson).
- Recomendações de aposta com CTA acionável.
- Fluxo de autenticação de usuários.

Arquitetura de alto nível:

- Frontend SPA em React/Vite.
- Backend API em FastAPI/Python.
- Persistência em PostgreSQL (Neon).
- Fontes externas de dados (Sportingtech, BetsAPI, FBref, fallback web).

## 2. Arquitetura Frontend

### 2.1 Stack e papel

- React + Vite: UI e bundling.
- react-router-dom: roteamento SPA.
- framer-motion: animações de interação.
- recharts: visualização de momentum.

Para que existe:

- Entregar experiência rápida e responsiva de consumo de odds, análises e apostas.

### 2.2 Organização por camadas (src)

- api/: acesso a dados (partidas, análises, apostas).
- components/: componentes visuais e comportamentais.
- pages/: páginas de rota.
- config/: contrato de rotas, marca e URLs-base.
- services/: integração com backend/IA e sessão de usuário.
- styles/: design system global (tokens + reset/utilitários).

Para que existe:

- Isolar responsabilidades e reduzir acoplamento entre UI, navegação e dados.

### 2.3 Rotas e navegação

Rotas centrais:

- Públicas: home, ao-vivo, apostas, análise de partida, login, registro, recuperar senha.
- Protegidas: minha conta e segurança da conta.

Proteção:

- RequireAuth valida sessão local e redireciona para login quando necessário.

Para que existe:

- Separar áreas públicas da área autenticada sem duplicar lógica em cada página.

### 2.4 Camada de dados do frontend

Partidas ao vivo:

- Tentativa 1: endpoint live-fixture (Sportingtech).
- Tentativa 2: endpoint popular odds (Sportingtech generic).
- Tentativa 3: fallback backend DB-first (/api/analises-ao-vivo).

Cache no navegador:

- sessionStorage com TTL de 45s para jogos ao vivo.
- Evita recarregar toda troca de página.

Análise:

- /api/analisar/{match_id} para análise completa.
- /api/analises-salvas/{match_id} para first paint mais rápido.

Apostas:

- bets.js ainda usa mock local (camada pronta para troca por API real).

Para que existe:

- Garantir disponibilidade da tela ao vivo mesmo com falha de fornecedor externo e reduzir latência percebida.

### 2.5 Fluxo de autenticação no frontend

- Login salva usuário em storage e publica evento de auth.
- Menus (TopBar, SideMenu, DesktopSidebar) reagem ao estado logado/deslogado.
- Logout limpa sessão e atualiza UI imediatamente.

Cadastro:

- Máscaras e limites de entrada:
  - CPF: 11 dígitos (com máscara visual).
  - Telefone: 10 ou 11 dígitos (com máscara visual).
  - Senha mínima: 8 caracteres.

Para que existe:

- Melhorar UX de cadastro e reduzir erros de dados antes de chegar ao backend.

## 3. Design System (Frontend)

### 3.1 Fonte de verdade

Tokens centrais em styles/tokens.css:

- Cores de marca (primary, accent, semânticas).
- Tipografia (fontes e escalas).
- Espaçamento, radius, sombras, z-index e transições.

Reset e utilitários em styles/global.css:

- Reset global, scrollbar, classes utilitárias e animações base.

Configuração de marca em config/brand.jsx:

- Identidade textual, paleta, tipografia e catálogo de esportes.

Para que existe:

- Padronizar visual e comportamento da interface com governança única.

### 3.2 Princípios de UI aplicados

- Mobile-first com breakpoints principais em 768px e 1024px.
- Layout shell com topbar fixa, sidebars e bottom nav adaptativo.
- Componentização com CSS Modules para escopo local.
- Estados visuais consistentes: hover/focus/active/loading/skeleton.

Para que existe:

- Garantir consistência visual, acessibilidade e manutenção simples.

### 3.3 Design system do Edson

Edson tem tokens próprios em components/Edson/edson.css:

- Tema escuro/claro por variáveis.
- Estrutura BEM para barra/painel/mensagem/avatar.
- Animações: digitação, pulse, loading dots, fade.

Para que existe:

- Permitir evolução do assistente sem quebrar o restante do sistema visual.

## 4. Arquitetura Backend

### 4.1 Stack e papel

- FastAPI para APIs REST.
- psycopg2 + RealDictCursor para acesso ao PostgreSQL.
- requests para integrações externas.
- Groq SDK para geração com LLM.

Para que existe:

- Centralizar segurança, contexto e regras de negócio fora do navegador.

### 4.2 Módulos principais

main.py:

- Exposição de rotas públicas de saúde, auth, análises e chat.
- Worker de atualização contínua de análises ao vivo.
- Orquestração de contexto e construção de CTA de aposta.

rag_service.py:

- Coleta de dados ao vivo/futuros.
- Consulta de histórico no banco.
- Geração de análise com LLM e fallback determinístico DB-only.
- Persistência e leitura de cache de análises.

db_neon.py:

- Conexão Neon e inicialização de tabelas-base.

create_schema.py / ingest_parquet_to_neon.py / import_fbref_csv_to_neon.py / cron_refresh_data.py:

- Setup de schema, ingestão histórica, carga FBref e rotinas de manutenção.

Para que existe:

- Separar API pública, IA/RAG e pipeline de dados para manutenção independente.

### 4.3 Rotas e finalidade

- GET /health:
  - Liveness check para deploy e monitoramento.

- POST /api/login:
  - Login por email/senha com verificação de hash.
  - Migração automática de senha legada em texto para hash PBKDF2 no primeiro login válido.

- POST /api/usuarios:
  - Registro de usuário com validações de payload e persistência segura.

- GET /api/usuarios:
  - Listagem administrativa simplificada (sem senha).

- GET /api/analises-salvas/{match_id}:
  - Leitura de análise já persistida para resposta rápida.

- GET /api/analises-ao-vivo:
  - Lista de análises ao vivo DB-first para alimentar home/live sem depender diretamente do provedor externo.

- GET /api/analisar/{match_id}:
  - Geração/retorno de análise completa de partida.

- POST /api/chat:
  - Chat do Edson com contexto multi-fonte e CTA de aposta.

Para que existe:

- Tornar o backend a única porta de decisão e contexto da IA, reduzindo alucinação e fragilidade no frontend.

### 4.4 Estratégia de robustez

- Worker background em startup para atualizar cache/análises live.
- Cache no banco para partidas ao vivo (tb_live_match_cache).
- Fallbacks em cascata para dados externos indisponíveis.
- Sanitização e limitação de saída textual do chat.
- Modo DB-only configurável por ambiente.

Para que existe:

- Manter respostas estáveis mesmo em falhas de rede/API de terceiros.

### 4.5 Modelo LLM atual

Padrão atual via variável GROQ_MODEL:

- openai/gpt-oss-120b

Uso:

- Chat em main.py
- Análise em rag_service.py

Para que existe:

- Garantir consistência de comportamento da IA em todos os fluxos.

## 5. Arquitetura de Banco de Dados (Neon / PostgreSQL)

### 5.1 Tabelas principais

tb_usuario:

- Cadastro/autenticação.
- email e cpf únicos.
- senha armazenada em hash PBKDF2 (campo senha_usuario).

tb_analise:

- Cache e histórico de análises por match_id em JSONB.

tb_partida_historico:

- Base histórica de partidas (StatsBomb/parquet ingest).

tb_fbref_player_stats:

- Estatísticas de jogadores/equipes por temporada (carga CSV FBref).

tb_live_match_cache:

- Cache operacional de partidas ao vivo com score/minuto e payload bruto.

tb_chat_historico (opcional em schema):

- Histórico de perguntas/respostas por usuário/partida.

### 5.2 Índices e performance

- Índices por campos de busca e ordenação frequentes:
  - email de usuário.
  - match_id de análise.
  - updated_at e league_name no cache live.
  - chaves de temporada/jogador/equipe em FBref.

Para que existe:

- Reduzir latência de leitura em rotas de alto tráfego (live/chat/análise).

### 5.3 Ingestão e manutenção

- ingest_parquet_to_neon.py:
  - carrega matches\_\*.parquet para tb_partida_historico com ON CONFLICT DO NOTHING.

- import_fbref_csv_to_neon.py:
  - carrega CSV de jogadores para tb_fbref_player_stats com upsert por chave composta.

- cron_refresh_data.py:
  - garante schema, roda ingest incremental e limpa cache antigo de tb_analise.

Para que existe:

- Manter base histórica sempre pronta para contexto de IA sem impacto no runtime do frontend.

## 6. Fluxos End-to-End

### 6.1 Tela Ao Vivo

1. Front tenta Sportingtech live-fixture.
2. Se falhar/vazio, tenta popular odds.
3. Se ainda vazio, consome /api/analises-ao-vivo no backend.
4. Resultado é cacheado no navegador por 45s.

Objetivo:

- Evitar tela vazia e reduzir recarregamentos desnecessários.

### 6.2 Análise de Partida

1. Front consulta análise salva para resposta rápida.
2. Back usa cache DB quando possível.
3. Se necessário, gera nova análise com RAG/LLM.
4. Salva em tb_analise para reuso.

Objetivo:

- Entregar análise robusta com baixa latência.

### 6.3 Chat Edson

1. Front envia mensagem/histórico para /api/chat.
2. Back monta contexto combinando:
   - histórico de partidas,
   - FBref,
   - jogos ao vivo,
   - jogos futuros,
   - fallback web (quando permitido).
3. Back chama LLM e aplica pós-processamento/guardrails.
4. Retorna texto curto + CTA de aposta.

Objetivo:

- Recomendação acionável com ancoragem em dados reais.

### 6.4 Cadastro e Login

Cadastro:

- Front valida formato e limites.
- Back valida novamente, normaliza e persiste hash.

Login:

- Back verifica hash e retorna payload seguro do usuário.
- Front persiste sessão local e libera rotas protegidas.

Objetivo:

- Segurança por defesa em profundidade (cliente + servidor).

## 7. Segurança e Governança

Medidas atuais:

- Senha hasheada com PBKDF2 no backend.
- Validação de entrada no frontend e backend.
- CORS configurável por ambiente.
- Fallbacks controlados para indisponibilidade externa.

Pontos de atenção:

- Sessão atual no frontend é baseada em storage local (não JWT/refresh token).
- Recomenda-se evoluir para autenticação com token e expiração no servidor.

## 8. Variáveis de Ambiente Relevantes

Frontend:

- VITE_BACKEND_URL

Backend:

- NEON_URL
- GROQ_API_KEY
- GROQ_MODEL
- BETS_API_TOKEN
- CORS_ORIGINS
- EDSON_DB_ONLY_MODE
- CHAT_DB_ONLY_MODE
- RAG_DISABLE_WEB_FETCH
- LIVE_ANALYSIS_REFRESH_SECONDS
- LIVE_MATCHES_DB_MAX_AGE_SECONDS
- LIVE_ANALYSIS_BACKGROUND_REFRESH
- PARQUET_DIR
- INGEST_LIMIT_FILES
- ANALYSIS_CACHE_RETENTION_DAYS

## 9. Diretrizes de Evolução

Quando alterar a arquitetura:

- Atualizar este documento no mesmo PR.
- Registrar impactos de schema, rotas e contratos de payload.
- Garantir fallback para não regressão de UX.

Quando adicionar novo fornecedor de dados:

- Declarar prioridade da fonte.
- Definir TTL/cache e política de fallback.
- Documentar impacto em custo, latência e confiabilidade.

---

Documento atualizado para refletir o estado atual da aplicação (frontend, backend e banco), com foco em clareza de propósito, funcionamento e manutenção.
