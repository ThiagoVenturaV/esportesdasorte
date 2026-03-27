const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT =
  'Você é Edson, o assistente virtual oficial da Esportes da Sorte (EDS). ' +
  'Seu objetivo é ser o guia definitivo para os apostadores. ' +
  'Sobre a EDS: "É muito mais que a sorte". Seu tom: VIP, ágil, confiável. ' +
  'FUNCIONALIDADE CRÍTICA: Sempre que sugerir uma aposta ou responder sobre um jogo, ofereça opções clicáveis no formato exato: ' +
  '[[BET:NomeDaSeleção|Odd|MatchId|NomeDoMercado]]. ' +
  'Exemplo: "Sugiro apostar no Real Madrid [[BET:Real Madrid|1.50|72525949|Resultado Final]]". ' +
  'Nunca se identifique como IA. Responda em Português.';

const TIMEOUT_MS = 10000;
const DEFAULT_MAX_HISTORY = 10;

function formatHistory(history, maxHistory) {
  return (Array.isArray(history) ? history : [])
    .map((item) => ({
      role: item?.role === 'model' ? 'assistant' : 'user',
      content: item?.parts?.[0]?.text || item?.content || '',
    }))
    .slice(-maxHistory)
    .filter((msg) => msg.content);
}

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return sendJson(res, 500, {
      error: 'Missing GROQ_API_KEY in server environment',
    });
  }

  const { userMessage, conversationHistory = [] } = req.body || {};
  if (!userMessage || typeof userMessage !== 'string') {
    return sendJson(res, 400, { error: 'Invalid userMessage' });
  }

  const maxHistory = parseInt(process.env.EDSON_MAX_HISTORY || '', 10) || DEFAULT_MAX_HISTORY;

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...formatHistory(conversationHistory, maxHistory),
    { role: 'user', content: userMessage },
  ];

  const payload = {
    model: 'llama-3.3-70b-versatile',
    messages,
    temperature: 0.7,
    max_tokens: 1024,
    top_p: 0.9,
    stream: false,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.text();
      return sendJson(res, response.status, {
        error: 'Groq request failed',
        details: errorBody,
      });
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content?.trim();

    return sendJson(res, 200, {
      text: text || 'Sem resposta.',
    });
  } catch (error) {
    clearTimeout(timeoutId);
    const isTimeout = error?.name === 'AbortError';
    return sendJson(res, isTimeout ? 504 : 500, {
      error: isTimeout ? 'Upstream timeout' : 'Internal server error',
    });
  }
};