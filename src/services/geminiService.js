import { BACKEND_URL } from '@/config/backend';
import { getAuthHeaders } from '@/services/authService';

/**
 * geminiService.js — Backend Connected Chat Service.
 * Agora utiliza o nosso Backend em Python (/api/chat) que tem acesso ao Banco Neon,
 * ao invés de bater diretamente na API do Google Gemini, permitindo injetar contexto RAG.
 */

const TIMEOUT_MS = 30_000; // 30s para o backend consultar Neon DB + Gemini

const MAX_HISTORY = parseInt(import.meta.env.VITE_EDSON_MAX_HISTORY, 10) || 10;

/**
 * Limita o histórico de conversa às últimas N mensagens (pares user/model).
 */
function trimHistory(history) {
  if (history.length <= MAX_HISTORY) return history;
  return history.slice(-MAX_HISTORY);
}

/**
 * Envia uma mensagem do usuário para o Backend (que gerencia o Gemini e RAG).
 *
 * @param {string} userMessage - Mensagem digitada pelo usuário
 * @param {Array} conversationHistory - Histórico no formato Gemini
 * @returns {Promise<{ text: string, cta: { label?: string, href?: string, variant?: string } | null }>}
 */
export async function sendMessage(userMessage, conversationHistory = []) {
  const trimmedHistory = trimHistory(conversationHistory);

  const payload = {
    message: userMessage,
    history: trimmedHistory,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${BACKEND_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`[Edson] Backend retornou status ${response.status}`);
      return {
        text: 'Desculpe, estou temporariamente indisponível. Meu banco de dados (Neon) pode estar fora do ar.',
        cta: null,
      };
    }

    const data = await response.json();

    if (data.response) {
      return {
        text: data.response.trim(),
        cta: data.cta || null,
      };
    }

    return {
      text: 'Não consegui processar sua pergunta. Reformule?',
      cta: null,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      console.error(
        '[Edson] Timeout: backend demorou para consultar o Neon/Gemini.',
      );
      return {
        text: 'A conexão demorou demais. Tente novamente.',
        cta: null,
      };
    }

    console.error('[Edson] Erro de rede:', error.message);
    return {
      text: 'Desculpe, não consigo me conectar ao backend. Verifique se o servidor Python está rodando.',
      cta: null,
    };
  }
}
