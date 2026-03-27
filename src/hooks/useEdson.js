/**
 * useEdson.js — Hook principal que gerencia todo o estado do assistente Edson.
 * Orquestra mensagens, loading, painel, input e comunicação com geminiService.
 * Importado por: EdsonWidget.jsx
 */

import { useState, useCallback, useRef } from 'react';
import { sendMessage as hybridSendMessage } from '@/services/hybridAiService';
import { generateMessageId, sanitizeInput } from '@/utils/edsonHelpers';

/**
 * Hook central do assistente Edson.
 *
 * @returns {{
 *   messages: Array<{id: string, role: 'user'|'assistant', content: string, timestamp: Date}>,
 *   isLoading: boolean,
 *   isOpen: boolean,
 *   inputValue: string,
 *   sendMessage: (text: string) => Promise<void>,
 *   togglePanel: () => void,
 *   clearHistory: () => void,
 *   setInputValue: (value: string) => void,
 * }}
 */
export function useEdson() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // Histórico no formato Gemini (contents array) — ref para evitar stale closures
  const conversationHistoryRef = useRef([]);

  /**
   * Envia uma mensagem do usuário e obtém a resposta do Edson.
   * Segue o fluxo: addUserMsg → loading → API → addEdsonMsg → done.
   * @param {string} text
   */
  const sendMessage = useCallback(async (text) => {
    const sanitized = sanitizeInput(text);
    if (!sanitized) return;

    // 1. Abre o painel se estiver fechado
    setIsOpen(true);

    // 2. Adiciona mensagem do usuário
    const userMsg = {
      id: generateMessageId(),
      role: 'user',
      content: sanitized,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

    // 3. Limpa o input
    setInputValue('');

    // 4. Seta loading
    setIsLoading(true);

    // 5. Cria ID para a mensagem do Edson
    const assistantMsgId = generateMessageId();

    try {
      let currentResponse = '';

      // 6. Chama a API via hybridAiService com callback de streaming
      const responsePayload = await hybridSendMessage(
        sanitized,
        conversationHistoryRef.current,
        (tokens) => {
          currentResponse = tokens;
          // Atualiza a mensagem do Edson em tempo real
          setMessages((prev) => {
            const index = prev.findIndex((m) => m.id === assistantMsgId);
            if (index === -1) {
              return [
                ...prev,
                {
                  id: assistantMsgId,
                  role: 'assistant',
                  content: tokens,
                  cta: null,
                  timestamp: new Date(),
                },
              ];
            }
            const updated = [...prev];
            updated[index] = { ...updated[index], content: tokens };
            return updated;
          });
        },
      );

      const responseText =
        typeof responsePayload === 'string'
          ? responsePayload
          : responsePayload?.text ||
            'Não consegui processar sua pergunta. Reformule?';
      const responseCta =
        typeof responsePayload === 'string'
          ? null
          : responsePayload?.cta || null;

      // 7. Atualiza o histórico no formato interno (usando a resposta final)
      conversationHistoryRef.current = [
        ...conversationHistoryRef.current,
        { role: 'user', parts: [{ text: sanitized }] },
        { role: 'model', parts: [{ text: responseText }] },
      ];

      // Se por algum motivo o callback não foi chamado ou falhou, garante que a mensagem está lá
      setMessages((prev) => {
        const index = prev.findIndex((m) => m.id === assistantMsgId);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            content: responseText,
            cta: responseCta,
          };
          return updated;
        }
        return [
          ...prev,
          {
            id: assistantMsgId,
            role: 'assistant',
            content: responseText,
            cta: responseCta,
            timestamp: new Date(),
          },
        ];
      });
    } catch (e) {
      console.error('[Edson Hook Error]', e);
      const errorMsg = {
        id: generateMessageId(),
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro inesperado. Tente novamente.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      // 8. Remove loading
      setIsLoading(false);
    }
  }, []);

  /**
   * Abre ou fecha o painel de chat.
   */
  const togglePanel = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  /**
   * Limpa todo o histórico de conversa (visual e API).
   */
  const clearHistory = useCallback(() => {
    setMessages([]);
    conversationHistoryRef.current = [];
  }, []);

  return {
    messages,
    isLoading,
    isOpen,
    inputValue,
    sendMessage,
    togglePanel,
    clearHistory,
    setInputValue,
  };
}
