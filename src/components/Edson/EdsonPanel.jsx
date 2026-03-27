/**
 * EdsonPanel.jsx — Painel de chat que expande abaixo da Ask AI Bar.
 * Exibe mensagens, scroll automático, loading dots e estado vazio.
 * Importado por: EdsonWidget.jsx
 */

import { useEffect, useRef } from 'react';
import EdsonMessage from './EdsonMessage';
import EdsonAvatar from './EdsonAvatar';
import './edson.css';

/**
 * Painel de chat expandível do Edson.
 *
 * @param {{
 *   messages: Array<{id: string, role: string, content: string, timestamp: Date}>,
 *   isLoading: boolean,
 *   onClear: () => void
 * }} props
 * @returns {JSX.Element}
 */
export default function EdsonPanel({ messages, isLoading, onClear }) {
  const scrollRef = useRef(null);

  // Scroll automático para a última mensagem
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div className="edson-panel">
      {/* Header */}
      <div className="edson-panel__header">
        <span className="edson-panel__title">
          <EdsonAvatar size="sm" />
          Chat com Edson
        </span>
        {messages.length > 0 && (
          <button
            className="edson-panel__clear"
            onClick={onClear}
            aria-label="Limpar histórico de chat"
          >
            <TrashIcon />
          </button>
        )}
      </div>

      {/* Área de mensagens */}
      <div className="edson-panel__messages" ref={scrollRef}>
        {messages.length === 0 && !isLoading ? (
          <div className="edson-panel__empty">
            <EdsonAvatar size="md" />
            <p className="edson-panel__welcome">
              Olá! Eu sou o <strong>Edson</strong>, seu assistente digital.
              <br />
              Como posso te ajudar hoje?
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <EdsonMessage
                key={msg.id}
                message={msg}
                isLatest={i === messages.length - 1}
              />
            ))}

            {/* Loading dots */}
            {isLoading && (
              <div className="edson-message edson-message--assistant">
                <EdsonAvatar size="sm" isLoading />
                <div className="edson-message__bubble">
                  <div className="edson-dots" aria-label="Edson está digitando">
                    <span className="edson-dots__dot" />
                    <span className="edson-dots__dot" />
                    <span className="edson-dots__dot" />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/** Ícone de lixeira para limpar histórico */
function TrashIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}
