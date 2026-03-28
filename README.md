# Esportes da Sorte — Sports Analysis Assistant

> Experiência digital de **análise esportiva inteligente**: probabilidades, insights e predições em tempo real — não apenas dados brutos.

---

## Stack & Dependências

| Lib                  | Uso                       |
| -------------------- | ------------------------- |
| **Vite + React**     | Build tool + UI framework |
| **react-router-dom** | Roteamento SPA            |
| **framer-motion**    | Animações e gestos.       |
| **recharts**         | Gráfico de momentum       |

---

## Setup

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # bundle de produção
npm run preview    # preview do bundle
```

## Variáveis de Ambiente (Edson)

O chat do Edson usa o backend FastAPI no Railway, com RAG no Neon e Gemini Lite.

Crie um arquivo `.env` a partir de `.env.example`:

```bash
cp .env.example .env
```

Defina as variáveis:

```env
VITE_EDSON_MAX_HISTORY=10
VITE_TYPEWRITER_SPEED=18
EDSON_MAX_HISTORY=10
VITE_BACKEND_URL=https://esportesdasorte-production.up.railway.app
GEMINI_API_KEY=sua_chave_gemini
GEMINI_MODEL=gemini-2.0-flash-lite
NEON_URL=postgresql://...
```

Para produção integrada com backend FastAPI no Railway, configure também no backend:

```env
NEON_URL=postgresql://...
GEMINI_API_KEY=sua_chave_gemini
CORS_ORIGINS=https://esportesdasorte.bet.br,https://esportesdasorte-production.up.railway.app,http://localhost:5173
```

Observação: a porta `8080` é interna do Railway; no frontend utilize apenas a URL HTTPS pública.

---

## Estrutura de Pastas

```
src/
├── api/                  # Camada de dados — swap para API real aqui
│   ├── matches.js        # getLiveMatches, getUpcomingMatches, getMatchById
│   ├── analysis.js       # getMatchAnalysis
│   └── bets.js           # getOpenBets, getFinishedBets
│
├── config/               # Configuração central — ÚNICA fonte da verdade
│   ├── brand.js          # Cores, fontes, logo, lista de esportes
│   ├── routes.js         # Todas as rotas (sem strings hardcoded nos componentes)
│   └── mocks.js          # Todos os dados mock com JSDoc types
│
├── styles/
│   ├── tokens.css        # Variáveis CSS de design (cores, espaçamento, radii…)
│   └── global.css        # Reset + utilitários + animações globais
│
├── components/
│   ├── Layout/
│   │   ├── Layout.jsx        # Shell: TopBar + Outlet + BottomNav
│   │   ├── TopBar.jsx        # Logo inline SVG + menu + usuário
│   │   ├── BottomNav.jsx     # Home / Live / Apostas
│   │   └── SideMenu.jsx      # Drawer animado (framer-motion spring)
│   │
│   ├── Match/
│   │   ├── MatchCard.jsx     # Card de partida (live + upcoming)
│   │   └── OddsChip.jsx      # Botão de odds com estado selecionado
│   │
│   └── Analysis/
│       ├── ProbabilityBar.jsx   # Barra 3-way animada (casa/empate/fora)
│       ├── InsightCard.jsx      # Card de insight com nível de risco
│       └── MomentumChart.jsx    # Recharts AreaChart de momentum
│
├── pages/
│   ├── HomePage.jsx        # Hero, busca IA, odds ao vivo, próximos jogos
│   ├── LivePage.jsx        # Filtro por esporte + partidas ao vivo
│   ├── AnalysisPage.jsx    # Análise profunda de uma partida
│   └── ApostasPage.jsx     # Apostas abertas e finalizadas

public/
└── favicon.svg             # Favicon SVG com cores da marca
```

---

## Como Trocar Assets (Guia)

### 🎨 Cores da marca

Edite **apenas** `src/config/brand.js` e `src/styles/tokens.css`.
Componentes usam `var(--color-primary)` etc — **nunca** hex hardcoded.

```js
// src/config/brand.js
colors: {
  primary: '#023397',   // ← mude aqui
  accent:  '#38E67D',   // ← mude aqui
}
```

```css
/* src/styles/tokens.css */
--color-primary: #023397; /* ← mude aqui */
--color-accent: #38e67d; /* ← mude aqui */
```

### 🏷️ Logo / Wordmark

O logo é um SVG inline em `src/components/Layout/TopBar.jsx` (sem dependência de arquivo externo).
Para usar um arquivo de imagem:

```jsx
// TopBar.jsx — substitua <LogoMark /> por:
<img src="/logo.svg" alt="Esportes da Sorte" height={32} />
```

### ⚽ Adicionar um novo esporte

Edite o array em `src/config/brand.js`:

```js
sports: [
  { id: 'volleyball', label: 'Vôlei', emoji: '🏐' }, // ← adicione aqui
];
```

BottomNav, SideMenu e filtros da LivePage consomem esse array automaticamente.

### 🔄 Conectar API real

Substitua a função correspondente em `src/api/*.js`.
Retorne os mesmos campos que o mock — nenhum componente precisa mudar.

```js
// src/api/matches.js
export async function getLiveMatches() {
  const res = await fetch('https://api.esportesdasorte.com/v1/matches/live');
  return res.json(); // deve retornar Match[]
}
```

### 📊 Dados mock

Todos os dados estão em `src/config/mocks.js`.
Cada entidade tem JSDoc documentando seus campos.

---

## Acessibilidade

- Fontes definidas com valores relativos (mínimo 11px / `--font-size-xs`)
- Contraste: textos principais em branco sobre fundo escuro (ratio > 7:1)
- Navegação por teclado: todos os botões interativos têm `focus-visible` com outline verde
- `aria-label` em todos os botões e links icônicos
- `role="tablist"` / `role="tab"` / `aria-selected` nos filtros
- `role="meter"` nos medidores de probabilidade

---

## Decisões de Design

| Decisão                                        | Razão                                                                           |
| ---------------------------------------------- | ------------------------------------------------------------------------------- |
| Layout responsivo com breakpoints 768px/1024px | Experiência otimizada tanto para mobile quanto desktop, com CSS Grid adaptativo |
| Framer Motion para animações                   | Gestos nativos (`whileTap`), spring physics, `AnimatePresence`                  |
| CSS Modules                                    | Escopo local, zero conflito, fácil de encontrar por componente                  |
| Tokens CSS separados                           | Troca de tema sem tocar em nenhum componente                                    |
| Mock data com delay real                       | Permite skeleton loaders e simula UX real sem backend                           |

---

## Responsividade

A aplicação é totalmente responsiva, adaptando-se de mobile a desktop com **duas breakpoints principais**:

| Breakpoint                 | Comportamento                                                                                                       |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `< 768px` (Mobile)         | BottomNav visível, TopBar com hamburger, layout single-column, BetSlip como bottom-sheet                            |
| `≥ 768px` (Tablet/Desktop) | BottomNav oculto, TopBar com links inline (Home/Live/Apostas), grids 2 colunas, BetSlip como painel lateral direito |
| `≥ 1024px` (Desktop largo) | Grids 3 colunas na LivePage e InsightGrid, conteúdo com max-width central                                           |

### Como funciona

- **Navegação**: No mobile, a navegação principal é o `BottomNav` fixo na parte inferior. No desktop (≥768px), o `BottomNav` é ocultado via `display: none` e os mesmos links aparecem inline no `TopBar` através do componente `desktopNav`.
- **Layouts de páginas**: As listas de MatchCards e BetCards usam `flex-direction: column` no mobile. A partir de 768px, aplicam-se `CSS Grid` com `repeat(2, 1fr)` para exibir cards lado a lado. Na LivePage, a partir de 1024px, usa-se `repeat(3, 1fr)`.
- **BetSlip**: No mobile, sobe como bottom-sheet. No desktop, transforma-se em painel lateral fixo à direita com 420px de largura e altura total.
- **SideMenu**: O drawer lateral aumenta de `max-width: 300px` para `380px` em telas maiores.
- **Auth Modal**: Amplia `max-width` de 440px para 480px no desktop, com shadow mais proeminente.
- **Conteúdo geral**: `--max-width: 1400px` no `#root` centraliza o conteúdo em monitores ultrawide sem restringir em telas normais.
