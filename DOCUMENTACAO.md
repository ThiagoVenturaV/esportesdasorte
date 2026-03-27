# Edson — Assistente Digital

> Assistente de IA integrado ao projeto Esportes da Sorte, alimentado pelo Google Gemini Flash 1.5.

---

## Visão Geral do Sistema

O Edson é um assistente digital inteligente embutido na interface do projeto **Esportes da Sorte**. Ele aparece como uma barra "Ask AI" acima do hero da HomePage, permitindo que o usuário faça perguntas em linguagem natural e receba respostas em tempo real com efeito de digitação (typewriter).

**Características principais:**
- 🤖 Alimentado pela API Google Gemini Flash 1.5
- ✍️ Efeito typewriter caractere por caractere
- 💬 Histórico de conversa persistente na sessão
- 🌗 Suporte a dark e light mode.
- 📱 Responsivo — mobile-first com breakpoint em 768px
- ⚡ Zero dependências adicionais — usa apenas as libs já instaladas no projeto.

---

## Pré-requisitos e Instalação

O sistema Edson não requer nenhuma instalação adicional. Ele usa apenas:
- React 19 (já instalado)
- Vite 8 (já instalado)

**Nenhum `npm install` adicional é necessário.**

---

## Configuração do .env

1. Copie o arquivo `.env.example` para `.env` na raiz do projeto:
   ```bash
   cp .env.example .env
   ```

2. Preencha a chave da API Gemini:
   ```env
   VITE_GEMINI_KEY=sua_chave_da_api_gemini_aqui
   VITE_EDSON_MAX_HISTORY=10
   VITE_TYPEWRITER_SPEED=18
   ```

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `VITE_GEMINI_KEY` | Chave de API do Google Gemini | (obrigatório) |
| `VITE_EDSON_MAX_HISTORY` | Máximo de mensagens enviadas à API | `10` |
| `VITE_TYPEWRITER_SPEED` | Velocidade do typewriter em ms | `18` |

---

## Como Obter a Chave da API Gemini

1. Acesse [Google AI Studio](https://aistudio.google.com/apikey)
2. Faça login com sua conta Google
3. Clique em **"Create API Key"**
4. Copie a chave gerada
5. Cole no arquivo `.env` como valor de `VITE_GEMINI_KEY`

> ⚠️ **Importante:** Nunca commite o arquivo `.env` no repositório. Ele já está no `.gitignore`.

---

## Estrutura de Arquivos Criados

```
raiz/
├── .env.example                          # Template de variáveis de ambiente
├── DOCUMENTACAO.md                       # Esta documentação
│
└── src/
    ├── utils/
    │   └── edsonHelpers.js               # Funções utilitárias puras
    │
    ├── services/
    │   └── geminiService.js              # Comunicação com API Gemini
    │
    ├── hooks/
    │   ├── useTypewriter.js              # Hook de animação typewriter
    │   └── useEdson.js                   # Hook principal do assistente
    │
    └── components/
        └── Edson/
            ├── EdsonAvatar.jsx           # Avatar circular com iniciais "ED"
            ├── EdsonMessage.jsx          # Mensagem individual no chat
            ├── EdsonPanel.jsx            # Painel de chat expandível
            ├── AskAiBar.jsx              # Barra Ask AI horizontal
            ├── EdsonWidget.jsx           # Componente raiz (ponto de entrada)
            └── edson.css                 # Todos os estilos do sistema
```

---

## Descrição Detalhada de Cada Arquivo

### 1. `.env.example`
Template com as variáveis de ambiente necessárias. O desenvolvedor copia para `.env` e preenche com suas credenciais.

### 2. `src/utils/edsonHelpers.js`
Funções utilitárias puras sem side effects:
- **`generateMessageId()`** — gera ID único `msg-<timestamp>-<counter>` para cada mensagem
- **`formatTimestamp(date)`** — formata Date para `HH:MM`
- **`detectUserLevel(text)`** — analisa vocabulário e comprimento da pergunta para retornar `"iniciante"`, `"intermediario"` ou `"avancado"`
- **`rotatePlaceholders()`** — retorna array de sugestões de perguntas para rotação no placeholder do input
- **`sanitizeInput(text)`** — remove tags HTML e limita a 500 caracteres

### 3. `src/services/geminiService.js`
Serviço de comunicação com a API Google Gemini Flash 1.5:
- Exporta `sendMessage(userMessage, conversationHistory)` → `Promise<string>`
- Envia o system prompt do Edson em toda requisição via `system_instruction`
- Limita o histórico às últimas N mensagens (`VITE_EDSON_MAX_HISTORY`)
- Usa `AbortController` com timeout de 10 segundos
- Trata erros: chave ausente, timeout, resposta vazia, erro HTTP

### 4. `src/hooks/useTypewriter.js`
Hook React para efeito typewriter:
- `useTypewriter(text, speed)` → `{ displayedText, isTyping }`
- Velocidade padrão: 18ms por caractere
- Reinicia animação quando recebe novo texto
- Limpa timeouts no unmount

### 5. `src/hooks/useEdson.js`
Hook principal que orquestra todo o estado:
- `messages` — array de mensagens `{id, role, content, timestamp}`
- `isLoading` — boolean durante chamada à API
- `isOpen` — boolean do painel de chat
- `inputValue` — valor do campo de texto
- `sendMessage(text)` — fluxo completo: adiciona msg → loading → API → resposta
- `togglePanel()` — abre/fecha o painel
- `clearHistory()` — limpa tudo (visual + API)
- `setInputValue(value)` — atualiza o campo

### 6. `src/components/Edson/EdsonAvatar.jsx`
Avatar circular do Edson:
- Iniciais "ED" com gradiente azul → verde
- Tamanho: `sm` (32px) ou `md` (40px)
- Animação de pulse durante loading

### 7. `src/components/Edson/EdsonMessage.jsx`
Mensagem individual no chat:
- Usuário: alinhada à direita, sem avatar
- Edson: alinhada à esquerda, com EdsonAvatar
- Texto do Edson usa `useTypewriter` quando `isLatest=true`
- Cursor piscante `|` durante digitação
- Timestamp `HH:MM` abaixo de cada mensagem

### 8. `src/components/Edson/EdsonPanel.jsx`
Painel de chat expandível:
- Animação slide-down ao abrir
- Scroll automático para a última mensagem
- Altura máxima: 420px com overflow-y
- Botão de limpar histórico (ícone de lixeira)
- Estado vazio: mensagem de boas-vindas
- Loading: três pontos animados (dots bounce)

### 9. `src/components/Edson/AskAiBar.jsx`
Barra Ask AI horizontal:
- Avatar (40px) + label "Pergunte ao Edson" + input + botão enviar
- Placeholder rotativo a cada 4 segundos
- Click-outside fecha o painel
- Form submit via Enter ou clique no botão
- Spinner no botão durante loading
- Backdrop blur + borda translúcida

### 10. `src/components/Edson/EdsonWidget.jsx`
Componente raiz que agrupa tudo:
- Usa `useEdson()` internamente
- Distribui props para `AskAiBar` e `EdsonPanel`
- Único componente que o desenvolvedor precisa importar
- Uso: `<EdsonWidget />` no topo da página

### 11. `src/components/Edson/edson.css`
Arquivo de estilos completo:
- Variáveis CSS com fallback para dark e light mode (`data-theme`)
- Keyframes: cursor-blink, slide-down, pulse-avatar, dots-bounce, spin, fade-in
- Classes BEM: `.edson-bar`, `.edson-panel`, `.edson-message`, `.edson-avatar`
- Responsivo: mobile-first com breakpoint em 768px

---

## Fluxo Completo de Uma Mensagem

```
1.  Usuário digita no input da AskAiBar
2.  AskAiBar chama useEdson.sendMessage(text)
3.  useEdson sanitiza o input via sanitizeInput()
4.  useEdson adiciona mensagem do usuário no array messages
5.  useEdson seta isLoading = true
6.  useEdson chama geminiService.sendMessage(text, conversationHistory)
7.  geminiService monta payload com system_instruction + contents + generationConfig
8.  geminiService faz POST para a API Gemini Flash 1.5 com AbortController (10s timeout)
9.  geminiService extrai response.candidates[0].content.parts[0].text
10. geminiService retorna o texto da resposta
11. useEdson atualiza conversationHistory (formato Gemini)
12. useEdson adiciona mensagem do Edson no array messages
13. useEdson seta isLoading = false
14. EdsonMessage recebe isLatest=true na última mensagem
15. useTypewriter inicia animação caractere por caractere (18ms/char)
16. Cursor piscante "|" aparece até isTyping virar false
17. EdsonPanel faz scroll automático para a última mensagem
```

---

## Como Usar o EdsonWidget no Projeto

O EdsonWidget já está integrado na `HomePage.jsx`. Para usar em outras páginas:

```jsx
import EdsonWidget from '@/components/Edson/EdsonWidget';

export default function SuaPagina() {
  return (
    <div>
      {/* Coloque acima do conteúdo principal */}
      <EdsonWidget />

      {/* Resto da página */}
      <h1>Conteúdo da Página</h1>
    </div>
  );
}
```

---

## Como Personalizar

### Mudar o nome do assistente
Edite o system prompt em `src/services/geminiService.js`:
```js
const SYSTEM_PROMPT = 'Você é NomeDoAssistente, um assistente digital...';
```
E as iniciais do avatar em `src/components/Edson/EdsonAvatar.jsx`:
```jsx
<span className="edson-avatar__initials">NA</span>
```

### Mudar o tom / personalidade
Edite o `SYSTEM_PROMPT` em `src/services/geminiService.js`.

### Mudar a velocidade do typewriter
Edite `VITE_TYPEWRITER_SPEED` no `.env` (valor em ms).

### Mudar as cores
Edite as variáveis CSS em `src/components/Edson/edson.css`:
```css
.edson-widget {
  --edson-accent: #38E67D;    /* cor de destaque */
  --edson-primary: #023397;   /* cor primária */
}
```

---

## Tratamento de Erros

| Cenário | Comportamento | Resposta do Edson |
|---------|---------------|-------------------|
| Chave API ausente / inválida | `console.error` com instruções | "Desculpe, estou temporariamente indisponível." |
| Timeout (>10s) | Cancela com AbortController | "A conexão demorou demais. Tente novamente." |
| Resposta vazia da API | Log de erro silencioso | "Não consegui processar sua pergunta. Reformule?" |
| Input vazio / só espaços | Ignora silenciosamente | (nenhuma ação) |
| Histórico muito longo | Limita últimas N mensagens para API | (transparente para o usuário) |
| Erro HTTP 400/403 | `console.error` com detalhes | "Desculpe, estou temporariamente indisponível." |
| Erro de rede genérico | `console.error` | "Desculpe, estou temporariamente indisponível." |

---

## Perguntas Frequentes

**P: Preciso instalar alguma dependência?**
R: Não, o sistema usa apenas React, que já está no projeto.

**P: As mensagens são salvas no servidor?**
R: Não, o histórico existe apenas na sessão do navegador (state React). Ao recarregar a página, o histórico é perdido.

**P: Posso usar em produção?**
R: Sim, mas certifique-se de proteger sua chave API (use um proxy/backend em produção para não expor a chave no frontend).

**P: O Edson funciona sem internet?**
R: Não, ele requer conexão com a API do Google Gemini.

**P: Posso trocar o modelo de IA?**
R: Sim, basta alterar o endpoint e o formato do payload em `geminiService.js`.

---

## Próximos Passos Sugeridos

1. **Proxy backend** — Criar uma rota de API no backend para não expor a chave Gemini no frontend
2. **Persistência** — Salvar histórico no localStorage ou em banco de dados
3. **Streaming** — Implementar a API de streaming do Gemini para respostas em tempo real
4. **Contexto esportivo** — Enriquecer o system prompt com dados da partida sendo visualizada
5. **Voice input** — Adicionar entrada por voz usando Web Speech API
6. **Feedback** — Botões de 👍/👎 nas respostas para treinar melhor o assistente
7. **Markdown** — Renderizar respostas com formatação Markdown (negrito, listas, etc.)
8. **Testes** — Implementar testes unitários para `edsonHelpers.js` e `geminiService.js`
