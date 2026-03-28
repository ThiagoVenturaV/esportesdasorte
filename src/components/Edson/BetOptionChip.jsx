import React from 'react';
import { useBetSlip } from '@/components/BetSlip/BetSlipContext';
import './edson.css';

/**
 * BetOptionChip — Um chip clicável dentro da mensagem do Edson para adicionar apostas.
 * 
 * @param {{ 
 *   selection: { name: string, odd: string, matchId: string, market: string } 
 * }} props
 */
export default function BetOptionChip({ selection }) {
  const { toggleSelection, selections } = useBetSlip();
  
  const isSelected = selections.some(s => s.id === selection.matchId + '-' + selection.name);

  const handleClick = () => {
    // Mapeia o formato do Edson para o formato do BetSlip
    toggleSelection({
      id: selection.matchId + '-' + selection.name,
      matchName: selection.name + ' (Sugerido)',
      market: selection.market || 'Resultado Final',
      pick: selection.name,
      odd: parseFloat(selection.odd)
    });
  };

  return (
    <button 
      className={`edson-bet-chip ${isSelected ? 'edson-bet-chip--active' : ''}`}
      onClick={handleClick}
    >
      <span className="edson-bet-chip__name">{selection.name}</span>
      <span className="edson-bet-chip__odd">{parseFloat(selection.odd).toFixed(2)}</span>
    </button>
  );
}
