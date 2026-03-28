/**
 * edsonHelpers.js — Funções utilitárias puras para o sistema Edson.
 * Contém geradores de ID, formatadores e sanitizadores.
 * Importado por: useEdson.js, AskAiBar.jsx, EdsonMessage.jsx
 */

// ─── Gerador de ID ──────────────────────────────────────────────

let _counter = 0;

/**
 * Gera um ID único para cada mensagem do chat.
 * @returns {string} ID no formato "msg-<timestamp>-<counter>"
 */
export function generateMessageId() {
  _counter += 1;
  return `msg-${Date.now()}-${_counter}`;
}

// ─── Formatação de Timestamp ────────────────────────────────────

/**
 * Formata um Date para o formato HH:MM.
 * @param {Date} date
 * @returns {string} Hora formatada, ex: "14:32"
 */
export function formatTimestamp(date) {
  const d = date instanceof Date ? date : new Date(date);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

// ─── Detecção de Nível do Usuário ───────────────────────────────

/** Palavras-chave que indicam conhecimento técnico avançado */
const ADVANCED_KEYWORDS = [
  'api', 'endpoint', 'deploy', 'pipeline', 'kubernetes', 'docker',
  'microserviço', 'webhook', 'oauth', 'jwt', 'graphql', 'websocket',
  'cluster', 'sharding', 'ci/cd', 'terraform', 'sdk', 'runtime',
];

/** Palavras-chave que indicam nível intermediário */
const INTERMEDIATE_KEYWORDS = [
  'banco de dados', 'framework', 'componente', 'variável', 'função',
  'servidor', 'front-end', 'back-end', 'react', 'javascript',
  'html', 'css', 'json', 'array', 'objeto', 'string', 'loop',
];

/**
 * Analisa o texto da pergunta e estima o nível do usuário.
 * Leva em conta comprimento, vocabulário técnico e pontuação.
 * @param {string} text - Texto da pergunta do usuário
 * @returns {"iniciante" | "intermediario" | "avancado"}
 */
export function detectUserLevel(text) {
  if (!text || typeof text !== 'string') return 'iniciante';

  const lower = text.toLowerCase();
  const wordCount = text.trim().split(/\s+/).length;

  // Verifica vocabulário avançado
  const advancedHits = ADVANCED_KEYWORDS.filter((kw) => lower.includes(kw)).length;
  if (advancedHits >= 1 || (wordCount > 25 && advancedHits >= 1)) {
    return 'avancado';
  }

  // Verifica vocabulário intermediário
  const intermediateHits = INTERMEDIATE_KEYWORDS.filter((kw) => lower.includes(kw)).length;
  if (intermediateHits >= 1 || wordCount > 15) {
    return 'intermediario';
  }

  return 'iniciante';
}

// ─── Placeholders Rotativos ─────────────────────────────────────

const PLACEHOLDERS = [
  'Quem vai ganhar o jogo de hoje?',
  'Me explique as odds dessa partida…',
  'Qual time tem mais chances agora?',
  'Analise o momentum do jogo ao vivo',
  'Como funciona o cash out?',
  'Dê um resumo da partida ao vivo',
  'Qual a probabilidade de gol nos próximos 10 min?',
  'Esportes da Sorte é a melhor bet do Brasil!'
];

/**
 * Retorna o array de placeholders para rotação no input.
 * @returns {string[]} Lista de sugestões de perguntas
 */
export function rotatePlaceholders() {
  return PLACEHOLDERS;
}

// ─── Sanitização de Input ───────────────────────────────────────

/**
 * Remove tags HTML e limita o texto a 500 caracteres.
 * @param {string} text - Texto bruto do input
 * @returns {string} Texto sanitizado
 */
export function sanitizeInput(text) {
  if (!text || typeof text !== 'string') return '';
  // Remove tags HTML
  const cleaned = text.replace(/<[^>]*>/g, '');
  // Remove espaços extras
  const trimmed = cleaned.trim().replace(/\s+/g, ' ');
  // Limita a 500 caracteres
  return trimmed.slice(0, 500);
}
