/**
 * geminiService.js — Serviço de comunicação com a API Google Gemini Flash 1.5.
 * Responsável por montar payload, enviar requisição e tratar erros.
 * Importado por: useEdson.js
 */

// ─── Constantes ─────────────────────────────────────────────────

const GEMINI_STREAM_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:streamGenerateContent';

const SYSTEM_PROMPT =
  'Você é Edson, o assistente virtual oficial da Esportes da Sorte (EDS). ' +
  'Use pesquisa web para resultados e odds. ' +
  'Sempre que sugerir uma aposta, use o formato: [[BET:Seleção|Odd|MatchId|Mercado]]. ' +
  'Exemplo: "Confira essa odd do Flamengo: [[BET:Flamengo|1.95|72737684|Resultado Final]]". ' +
  'Seja conciso, VIP e identifique-se como Edson da EDS.';

const TIMEOUT_MS = 20_000;
const MAX_HISTORY = parseInt(import.meta.env.VITE_EDSON_MAX_HISTORY, 10) || 10;

function getApiKey() {
  return import.meta.env.VITE_GEMINI_KEY;
}

function trimHistory(history) {
  const formatted = history.map(m => ({
    role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
    parts: [{ text: m.content || m.parts?.[0]?.text || '' }]
  }));
  return formatted.slice(-MAX_HISTORY);
}

/**
 * Envia uma mensagem para o Gemini com suporte opcional a streaming.
 */
export async function sendMessage(userMessage, conversationHistory = [], onToken) {
  const apiKey = getApiKey();
  if (!apiKey || apiKey === 'sua_chave_aqui') return 'Edson (Web) indisponível.';

  const contents = [
    ...trimHistory(conversationHistory),
    { role: 'user', parts: [{ text: userMessage }] },
  ];

  const payload = {
    contents,
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    tools: [{ google_search_retrieval: {} }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    }
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const url = `${GEMINI_STREAM_ENDPOINT}?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Gemini API Error:', response.status, errorData);
      if (response.status === 429) return 'Edson (Web) está com muitas requisições. Tente em 1 minuto.';
      return 'Erro na conexão com Edson (Web).';
    }

    // ── Resposta com Streaming (SSE simplificado para Gemini) ─────
    if (onToken) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        // Gemini stream returns a JSON array: [ {...}, {...} ]
        // We'll try to extract text parts safely
        try {
          // Remove the starting '[' and ending ']' or leading commas
          const cleaned = buffer.replace(/^\[/, '').replace(/,$/, '').replace(/\]$/, '');
          // This is a bit simplified, but Gemini usually emits one object per chunk
          const chunks = cleaned.split('},{').map((c, i, a) => {
             if (a.length === 1) return c;
             if (i === 0) return c + '}';
             if (i === a.length - 1) return '{' + c;
             return '{' + c + '}';
          });

          for (const c of chunks) {
            try {
              const data = JSON.parse(c);
              const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
              if (text && !fullText.endsWith(text)) {
                fullText += text;
                onToken(fullText);
              }
            } catch (e) { /* partial JSON, wait for next buffer */ }
          }
        } catch (e) {
          console.warn('Buffer parsing error:', e);
        }
      }
      return fullText || 'Edson não conseguiu processar a pesquisa agora.';
    }

    const data = await response.json();
    return data?.[0]?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sem resposta.';

  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Gemini Fetch Error:', error);
    return 'Edson (Web) está offline no momento.';
  }
}
