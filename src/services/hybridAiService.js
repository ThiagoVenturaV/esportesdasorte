/**
 * hybridAiService.js — O cérebro do Edson.
 * Estratégia anti-alucinação:
 * - Padrão: sempre usar backend RAG (/api/chat) para ancorar no banco Neon.
 * - Fallback Groq: opcional e desativado por padrão.
 */

import { sendMessage as groqSendMessage } from './groqService';
import { sendMessage as geminiSendMessage } from './geminiService';

const ENABLE_GROQ_FALLBACK =
  String(import.meta.env.VITE_ENABLE_GROQ_FALLBACK || 'false').toLowerCase() ===
  'true';

function seemsBackendUnavailable(responseText = '') {
  const text = String(responseText).toLowerCase();
  return (
    text.includes('temporariamente indisponível') ||
    text.includes('não consigo me conectar ao backend') ||
    text.includes('conexão demorou demais')
  );
}

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

  if (!ENABLE_GROQ_FALLBACK || !seemsBackendUnavailable(backendResponse)) {
    if (onToken) onToken(backendResponse);
    return backendResponse;
  }

  console.warn(
    '[Edson] Backend indisponível. Fallback Groq habilitado por ENV.',
  );
  return groqSendMessage(userMessage, conversationHistory, onToken);
}
