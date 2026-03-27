/**
 * hybridAiService.js — O cérebro do Edson.
 * Estratégia anti-alucinação:
 * - Padrão: sempre usar backend RAG (/api/chat) para ancorar no banco Neon.
 */

import { sendMessage as geminiSendMessage } from './geminiService';

export async function sendMessage(
  userMessage,
  conversationHistory = [],
  onToken,
) {
  console.info('[Edson] Usando Backend RAG (Neon + regras anti-alucinação)');
  const backendResponse = await geminiSendMessage(
    userMessage,
    conversationHistory,
  );
  if (onToken) onToken(backendResponse);
  return backendResponse;
}
