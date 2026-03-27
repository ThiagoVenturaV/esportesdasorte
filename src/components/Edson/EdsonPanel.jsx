/**
 * EdsonPanel.jsx — Painel de chat expandível.
 * Exibe mensagens, scroll automático, loading dots e input integrado no fundo.
 */

import { useEffect, useRef, useCallback } from 'react';
import EdsonMessage from './EdsonMessage';
import EdsonAvatar from './EdsonAvatar';
import './edson.css';

export default function EdsonPanel({
  messages,
  isLoading,
  onClear,
  inputValue = '',
  onInputChange,
  onSend,
}) {
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll automático para a última mensagem
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Foca no input ao abrir o painel
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    onSend(inputValue);
  }, [inputValue, isLoading, onSend]);

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
              Olá! Eu sou o <strong>Edson</strong>, seu assistente de apostas.
              <br />
              Pergunte sobre jogos ao vivo, odds ou peça uma dica de aposta!
            </p>
            {/* Quick prompts */}
            <div className="edson-panel__quick-prompts">
              {QUICK_PROMPTS.map((p) => (
                <button
                  key={p}
                  className="edson-panel__quick-btn"
                  onClick={() => onSend(p)}
                  disabled={isLoading}
                >
                  {p}
                </button>
              ))}
            </div>
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

      {/* Input integrado no fundo do painel */}
      <form className="edson-panel__input-bar" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          className="edson-panel__input"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Pergunte ao Edson…"
          disabled={isLoading}
          autoComplete="off"
          aria-label="Digite sua pergunta"
        />
        <button
          type="submit"
          className="edson-panel__send"
          disabled={isLoading || !inputValue.trim()}
          aria-label="Enviar"
        >
          {isLoading ? <span className="edson-spinner" aria-hidden="true" /> : <SendIcon />}
        </button>
      </form>
    </div>
  );
}

const QUICK_PROMPTS = [
  'Qual jogo devo apostar agora?',
  'Jogos ao vivo com maior chance de gol',
  'Me dê uma dica de aposta segura',
];

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}
