/**
 * EdsonWidget.jsx — Componente raiz do sistema Edson.
 * Agrupa AskAiBar + EdsonPanel e gerencia o hook useEdson.
 * Quando o painel está aberto, passa inputValue/sendMessage/setInputValue para o
 * EdsonPanel renderizar o input no fundo do chat (experiência mobile-first).
 */

import { useEdson } from '@/hooks/useEdson';
import AskAiBar from './AskAiBar';
import EdsonPanel from './EdsonPanel';
import './edson.css';

export default function EdsonWidget() {
  const {
    messages,
    isLoading,
    isOpen,
    inputValue,
    sendMessage,
    togglePanel,
    clearHistory,
    setInputValue,
  } = useEdson();

  return (
    <div className={`edson-widget ${isOpen ? 'edson-widget--open' : ''}`}>
      {/* Barra de entrada (sempre visível — abre o painel ao focar/cliclar) */}
      <AskAiBar
        inputValue={inputValue}
        isLoading={isLoading}
        isOpen={isOpen}
        onInputChange={setInputValue}
        onSend={sendMessage}
        onToggle={togglePanel}
        onClickOutside={() => { if (isOpen) togglePanel(); }}
      />

      {/* Painel de chat expandível (com input integrado no fundo) */}
      {isOpen && (
        <EdsonPanel
          messages={messages}
          isLoading={isLoading}
          onClear={clearHistory}
          inputValue={inputValue}
          onInputChange={setInputValue}
          onSend={sendMessage}
        />
      )}
    </div>
  );
}
