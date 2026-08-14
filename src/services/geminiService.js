import { BACKEND_URL, fetchWithBackendFallback } from '@/config/backend';
import { getAuthHeaders } from '@/services/authService';

/**
 * geminiService.js — Backend Connected Chat Service.
 * Agora utiliza o nosso Backend em Python (/api/chat) que tem acesso ao Banco Neon,
 * ao invés de bater diretamente na API do Google Gemini, permitindo injetar contexto RAG.
 */

const TIMEOUT_MS = 20_000; // reduz latência percebida sem cortar agressivamente

const MAX_HISTORY = parseInt(import.meta.env.VITE_EDSON_MAX_HISTORY, 10) || 8;
const FAST_CACHE_TTL_MS = 120_000;
const fastResponseCache = new Map();

/**
 * Limita o histórico de conversa às últimas N mensagens (pares user/model).
 */
function trimHistory(history) {
  if (history.length <= MAX_HISTORY) return history;
  return history.slice(-MAX_HISTORY);
}

function buildFastCacheKey(userMessage, history) {
  const msg = String(userMessage || '')
    .trim()
    .toLowerCase();
  const recent = Array.isArray(history) ? history.slice(-4) : [];
  const context = recent
    .map((item) => {
      const role = String(item?.role || '').toLowerCase();
      const parts = Array.isArray(item?.parts) ? item.parts : [];
      const text = parts
        .map((p) => String(p?.text || ''))
        .join(' ')
        .trim()
        .toLowerCase();
      return `${role}:${text.slice(0, 180)}`;
    })
    .join('||');
  return `${msg}||${context}`;
}

function getFastCachedResponse(cacheKey) {
  const cached = fastResponseCache.get(cacheKey);
  if (!cached) return null;
  if (Date.now() > cached.expiresAt) {
    fastResponseCache.delete(cacheKey);
    return null;
  }
  return cached.payload;
}

function setFastCachedResponse(cacheKey, payload) {
  fastResponseCache.set(cacheKey, {
    expiresAt: Date.now() + FAST_CACHE_TTL_MS,
    payload,
  });

  if (fastResponseCache.size > 120) {
    const now = Date.now();
    for (const [key, value] of fastResponseCache.entries()) {
      if (value.expiresAt <= now) {
        fastResponseCache.delete(key);
      }
    }
    while (fastResponseCache.size > 120) {
      const oldestKey = fastResponseCache.keys().next().value;
      if (oldestKey === undefined) break;
      fastResponseCache.delete(oldestKey);
    }
  }
}

function sanitizeCta(value) {
  if (!value || typeof value !== 'object') return null;
  const href = typeof value.href === 'string' ? value.href.trim() : '';
  const label = typeof value.label === 'string' ? value.label.trim().slice(0, 80) : '';
  if (!label || !href.startsWith('/') || href.startsWith('//') || href.length > 300) return null;
  return { label, href, variant: String(value.variant || '').slice(0, 40) };
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
  const cacheKey = buildFastCacheKey(userMessage, trimmedHistory);
  const cached = getFastCachedResponse(cacheKey);
  if (cached) {
    return cached;
  }

  const payload = {
    message: userMessage,
    // Send both keys for backward compatibility with different backend contracts.
    history: trimmedHistory,
    conversation_history: trimmedHistory,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetchWithBackendFallback('/api/chat', {
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

      let backendMessage = '';
      try {
        const errorData = await response.json();
        backendMessage =
          errorData?.detail || errorData?.response || errorData?.message || '';
      } catch {
        // Ignore JSON parse errors and keep a generic fallback message.
      }

      if (response.status === 429) {
        return {
          text: 'Você atingiu o limite de mensagens por minuto. Aguarde um pouco e tente novamente.',
          cta: null,
        };
      }

      if (response.status >= 500) {
        return {
          text:
            backendMessage ||
            'O backend está com erro interno no momento. Tente novamente em instantes.',
          cta: null,
        };
      }

      if (response.status === 401 || response.status === 403) {
        return {
          text: 'Sua sessão expirou ou não tem permissão. Faça login novamente.',
          cta: null,
        };
      }

      return {
        text:
          backendMessage ||
          'Desculpe, não foi possível concluir sua solicitação agora.',
        cta: null,
      };
    }

    const data = await response.json();

    if (typeof data.response === 'string' && data.response.trim()) {
      const result = {
        text: data.response.trim().slice(0, 10_000),
        cta: sanitizeCta(data.cta),
      };
      setFastCachedResponse(cacheKey, result);
      return result;
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

    if (
      window.location.protocol === 'https:' &&
      BACKEND_URL.startsWith('http://')
    ) {
      return {
        text: 'Conexão bloqueada pelo navegador: frontend HTTPS não pode chamar backend HTTP. Configure VITE_BACKEND_URL com HTTPS.',
        cta: null,
      };
    }

    if (error instanceof TypeError) {
      return {
        text: 'Falha de rede/CORS ao acessar o backend. Verifique VITE_BACKEND_URL e as regras de CORS do servidor.',
        cta: null,
      };
    }

    return {
      text: 'Desculpe, não consigo me conectar ao backend. Verifique se o servidor Python está rodando.',
      cta: null,
    };
  }
}
