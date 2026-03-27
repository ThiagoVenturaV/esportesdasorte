/**
 * AskAiBar.jsx — Barra "Pergunte ao Edson" fixa acima do hero.
 * Input com placeholder rotativo, botão de envio e click-outside para fechar.
 * Importado por: EdsonWidget.jsx
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import EdsonAvatar from './EdsonAvatar';
import { rotatePlaceholders } from '@/utils/edsonHelpers';
import './edson.css';

const PLACEHOLDERS = rotatePlaceholders();
const ROTATE_INTERVAL = 4000; // 4s entre rotações

/**
 * Barra horizontal Ask AI do Edson.
 *
 * @param {{
 *   inputValue: string,
 *   isLoading: boolean,
 *   isOpen: boolean,
 *   onInputChange: (value: string) => void,
 *   onSend: (text: string) => void,
 *   onToggle: () => void,
 *   onClickOutside: () => void
 * }} props
 * @returns {JSX.Element}
 */
export default function AskAiBar({
  inputValue,
  isLoading,
  isOpen,
  onInputChange,
  onSend,
  onToggle,
  onClickOutside,
}) {
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const barRef = useRef(null);
  const inputRef = useRef(null);

  // Rotação de placeholder
  useEffect(() => {
    const id = setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, ROTATE_INTERVAL);
    return () => clearInterval(id);
  }, []);

  // Click outside — fecha o painel
  useEffect(() => {
    function handleClick(e) {
      if (
        isOpen &&
        barRef.current &&
        !barRef.current.closest('.edson-widget')?.contains(e.target)
      ) {
        onClickOutside();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen, onClickOutside]);

  /**
   * Lida com envio da mensagem (Enter ou clique no botão).
   */
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!inputValue.trim() || isLoading) return;
      onSend(inputValue);
    },
    [inputValue, isLoading, onSend]
  );

  /**
   * Foca no input e abre o painel ao clicar.
   */
  const handleBarClick = useCallback(() => {
    if (!isOpen) onToggle();
    inputRef.current?.focus();
  }, [isOpen, onToggle]);

  return (
    <form
      className={`edson-bar ${isOpen ? 'edson-bar--active' : ''}`}
      ref={barRef}
      onSubmit={handleSubmit}
      role="search"
      aria-label="Pergunte ao Edson"
    >
      {/* Lado esquerdo — avatar + label */}
      <div className="edson-bar__left" onClick={handleBarClick}>
        <EdsonAvatar size="md" isLoading={isLoading} />
        <span className="edson-bar__label">Pergunte ao Edson</span>
      </div>

      {/* Centro — input */}
      <input
        ref={inputRef}
        className="edson-bar__input"
        type="text"
        value={inputValue}
        onChange={(e) => onInputChange(e.target.value)}
        onFocus={() => { if (!isOpen) onToggle(); }}
        placeholder={PLACEHOLDERS[placeholderIdx]}
        disabled={isLoading}
        autoComplete="off"
        aria-label="Digite sua pergunta para o Edson"
      />

      {/* Lado direito — botão enviar */}
      <button
        className="edson-bar__send"
        type="submit"
        disabled={isLoading || !inputValue.trim()}
        aria-label="Enviar mensagem"
      >
        {isLoading ? (
          <span className="edson-spinner" aria-hidden="true" />
        ) : (
          <SendIcon />
        )}
      </button>
    </form>
  );
}

/** Ícone de seta para envio */
function SendIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}
