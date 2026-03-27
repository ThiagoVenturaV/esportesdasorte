/**
 * hybridAiService.js — O cérebro do Edson.
 * Decide qual motor de IA usar baseado na intenção do usuário:
 * - Groq: Respostas instantâneas para lógica e chat geral.
 * - Gemini: Consultas que exigem dados da web ou conhecimento atualizado.
 */

import { sendMessage as groqSendMessage } from './groqService';
import { sendMessage as geminiSendMessage } from './geminiService';

// Palavras-chave que sugerem necessidade de pesquisa web ou dados em tempo real
const WEB_KEYWORDS = [
  'pesquise', 'internet', 'google', 'web', 'notícias', 'hoje', 'agora', 'atualmente',
  'search', 'online', 'clima', 'tempo', 'resultado de hoje', 'brasileirão', 'tabela',
  'quem ganhou', 'placar', 'escalação', 'odds agora'
];

export async function sendMessage(userMessage, conversationHistory = [], onToken) {
  console.info('[Edson] Usando Groq (Llama-3 Speed / Lógica)');
  return groqSendMessage(userMessage, conversationHistory, onToken);
}
