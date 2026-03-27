/**
 * EdsonWidget.jsx — Componente raiz do sistema Edson.
 * Agrupa AskAiBar + EdsonPanel e gerencia o hook useEdson.
 * Importado por: HomePage.jsx (ou qualquer página que queira o assistente)
 */

import { useEdson } from '@/hooks/useEdson';
import AskAiBar from './AskAiBar';
import EdsonPanel from './EdsonPanel';
import './edson.css';

/**
 * Widget completo do assistente Edson.
 * Basta inserir <EdsonWidget /> no topo do layout, acima do hero.
 *
 * @returns {JSX.Element}
 */
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
      {/* AskAiBar (Input) */}
      <AskAiBar
        inputValue={inputValue}
        isLoading={isLoading}
        isOpen={isOpen}
        onInputChange={setInputValue}
        onSend={sendMessage}
        onToggle={togglePanel}
        onClickOutside={() => { if (isOpen) togglePanel(); }}
      />

      {/* Panel (Messages) */}
      {isOpen && (
        <EdsonPanel
          messages={messages}
          isLoading={isLoading}
          onClear={clearHistory}
        />
      )}
    </div>
  );
}
