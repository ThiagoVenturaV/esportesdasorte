/**
 * groqService.js — Serviço de comunicação com a API Groq Cloud (Llama-3).
 * Responsável por montar payload compatível com OpenAI e enviar para o Groq.
 * Importado por: useEdson.js
 */

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT =
  'Você é Edson, o assistente virtual oficial da Esportes da Sorte (EDS). ' +
  'Seu objetivo é ser o guia definitivo para os apostadores. ' +
  'Sobre a EDS: "É muito mais que a sorte". Seu tom: VIP, ágil, confiável. ' +
  'FUNCIONALIDADE CRÍTICA: Sempre que sugerir uma aposta ou responder sobre um jogo, ofereça opções clicáveis no formato exato: ' +
  '[[BET:NomeDaSeleção|Odd|MatchId|NomeDoMercado]]. ' +
  'Exemplo: "Sugiro apostar no Real Madrid [[BET:Real Madrid|1.50|72525949|Resultado Final]]". ' +
  'Nunca se identifique como IA. Responda em Português.';

const TIMEOUT_MS = 10_000;
const MAX_HISTORY = parseInt(import.meta.env.VITE_EDSON_MAX_HISTORY, 10) || 10;
const INTERNAL_CHAT_ENDPOINT = '/api/edson/chat';

function getApiKey() {
  return import.meta.env.VITE_GROQ_KEY;
}

/**
 * Converte o histórico do formato interno/Gemini para o padrão OpenAI/Groq.
 */
function formatHistory(history) {
  return history.map(item => ({
    role: item.role === 'model' ? 'assistant' : 'user',
    content: item.parts?.[0]?.text || item.content || ''
  })).slice(-MAX_HISTORY);
}

export async function sendMessage(userMessage, conversationHistory = [], onToken) {
  try {
    const proxyResponse = await fetch(INTERNAL_CHAT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userMessage,
        conversationHistory,
      }),
    });

    if (proxyResponse.ok) {
      const proxyData = await proxyResponse.json();
      const text = proxyData?.text || 'Sem resposta.';
      if (onToken) onToken(text);
      return text;
    }

    const proxyError = await proxyResponse.text().catch(() => '');
    console.warn(`[Edson] Proxy interno indisponível (${proxyResponse.status}). Fallback local ativado.`, proxyError);
  } catch (proxyError) {
    console.warn('[Edson] Proxy interno indisponível. Fallback local ativado.', proxyError);
  }

  const apiKey = getApiKey();
  if (!apiKey || apiKey === 'sua_chave_aqui') {
    console.error('[Edson] Chave da API Groq não configurada em GROQ_API_KEY (backend) ou VITE_GROQ_KEY (fallback local).');
    return 'Desculpe, estou temporariamente indisponível.';
  }

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...formatHistory(conversationHistory),
    { role: 'user', content: userMessage }
  ];

  const payload = {
    model: 'llama-3.3-70b-versatile',
    messages,
    temperature: 0.7,
    max_tokens: 1024,
    top_p: 0.9,
    stream: !!onToken
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[Edson] Groq API Error ${response.status}: ${errorBody}`);
      return 'Não consegui processar sua pergunta. Reformule?';
    }

    // ── Resposta com Streaming ──────────────────────────────────
    if (payload.stream) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          
          const data = trimmed.slice(6);
          if (data === '[DONE]') break;

          try {
            const json = JSON.parse(data);
            const content = json.choices[0]?.delta?.content || '';
            fullText += content;
            if (onToken) onToken(fullText);
          } catch (e) {
            // Ignorar chunks parciais de JSON invállidos
          }
        }
      }
      return fullText;
    }

    // ── Resposta sem Streaming ───────────────────────────────────
    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;
    return text?.trim() || 'Sem resposta.';

  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') return 'O Edson demorou demais para responder.';
    console.error('[Edson] Erro Groq:', error.message);
    return 'Desculpe, estou em manutenção técnica no momento.';
  }
}
