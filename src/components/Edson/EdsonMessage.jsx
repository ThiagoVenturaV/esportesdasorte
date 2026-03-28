/**
 * EdsonMessage.jsx — Componente de uma única mensagem no chat.
 * Mensagens do usuário à direita, do Edson à esquerda com avatar e typewriter.
 * Importado por: EdsonPanel.jsx
 */

import EdsonAvatar from './EdsonAvatar';
import BetOptionChip from './BetOptionChip';
import { Link } from 'react-router-dom';
import { useTypewriter } from '@/hooks/useTypewriter';
import { formatTimestamp } from '@/utils/edsonHelpers';
import './edson.css';

/**
 * Renderiza uma mensagem individual do chat.
 */
export default function EdsonMessage({ message, isLatest = false }) {
  const isAssistant = message.role === 'assistant';
  const shouldAnimate = isAssistant && isLatest;

  // Regex para capturar [[BET:Seleção|Odd|MatchId|Mercado]]
  const betRegex = /\[\[BET:(.*?)\|(.*?)\|(.*?)\|(.*?)\]\]/g;

  /**
   * Renderiza o conteúdo da mensagem tratando os markers de aposta.
   */
  const renderContent = (text) => {
    const parts = text.split(betRegex);
    const result = [];

    // O split com grupos de captura retorna: [texto, sel, odd, id, mkt, texto, ...]
    for (let i = 0; i < parts.length; i += 5) {
      // Adiciona o texto antes do marker
      result.push(<span key={`text-${i}`}>{parts[i]}</span>);

      // Adiciona o chip se houver dados capturados
      if (parts[i + 1]) {
        result.push(
          <BetOptionChip
            key={`bet-${i}`}
            selection={{
              name: parts[i + 1],
              odd: parts[i + 2],
              matchId: parts[i + 3],
              market: parts[i + 4],
            }}
          />,
        );
      }
    }
    return result;
  };

  return (
    <div
      className={`edson-message ${isAssistant ? 'edson-message--assistant' : 'edson-message--user'}`}
    >
      {isAssistant && <EdsonAvatar size="sm" />}

      <div className="edson-message__bubble">
        <div className="edson-message__text">
          {shouldAnimate ? (
            <TypewriterContent text={message.content} parser={renderContent} />
          ) : (
            renderContent(message.content)
          )}
        </div>
        {isAssistant && message.cta?.href && message.cta?.label && (
          <Link
            to={message.cta.href}
            className="edson-message__cta"
            aria-label={message.cta.label}
          >
            {message.cta.label}
          </Link>
        )}
        <span className="edson-message__time">
          {formatTimestamp(message.timestamp)}
        </span>
      </div>
    </div>
  );
}

function TypewriterContent({ text, parser }) {
  const { displayedText, isTyping } = useTypewriter(text);
  return (
    <>
      {parser(displayedText)}
      {isTyping && <span className="edson-cursor">|</span>}
    </>
  );
}
