/**
 * useTypewriter.js — Hook React para efeito typewriter caractere por caractere.
 * Anima a exibição de texto com velocidade configurável e cursor piscante.
 * Importado por: EdsonMessage.jsx
 */

import { useState, useEffect, useRef } from 'react';

const DEFAULT_SPEED = parseInt(import.meta.env.VITE_TYPEWRITER_SPEED, 10) || 18;

/**
 * Hook que anima a exibição de um texto caractere por caractere.
 *
 * @param {string} text - Texto completo a ser exibido
 * @param {number} [speed=18] - Intervalo em ms entre cada caractere
 * @returns {{ displayedText: string, isTyping: boolean }}
 */
export function useTypewriter(text, speed = DEFAULT_SPEED) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const timeoutRef = useRef(null);
  const indexRef = useRef(0);

  useEffect(() => {
    // Reinicia ao receber novo texto
    setDisplayedText('');
    setIsTyping(true);
    indexRef.current = 0;

    if (!text || text.length === 0) {
      setIsTyping(false);
      return;
    }

    function tick() {
      if (indexRef.current < text.length) {
        indexRef.current += 1;
        setDisplayedText(text.slice(0, indexRef.current));
        timeoutRef.current = setTimeout(tick, speed);
      } else {
        setIsTyping(false);
      }
    }

    timeoutRef.current = setTimeout(tick, speed);

    // Cleanup — evita memory leak
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, speed]);

  return { displayedText, isTyping };
}
