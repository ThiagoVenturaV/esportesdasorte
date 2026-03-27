/**
 * EdsonAvatar.jsx — Avatar circular do assistente Edson.
 * Exibe as iniciais "ED" com gradiente e animação de pulse durante loading.
 * Importado por: EdsonMessage.jsx, AskAiBar.jsx
 */

import './edson.css';

/**
 * Avatar circular do Edson com iniciais e animação de loading.
 *
 * @param {{ size?: 'sm' | 'md', isLoading?: boolean }} props
 * @param {string} [props.size='sm'] - Tamanho: 'sm' (32px) ou 'md' (40px)
 * @param {boolean} [props.isLoading=false] - Ativa animação de pulse
 * @returns {JSX.Element}
 */
export default function EdsonAvatar({ size = 'sm', isLoading = false }) {
  const className = [
    'edson-avatar',
    `edson-avatar--${size}`,
    isLoading ? 'edson-avatar--loading' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={className} aria-hidden="true">
      <img src="/ed.png" alt="" />
    </div>
  );
}
