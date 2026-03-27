import { createContext, useContext, useState } from 'react';

const BetSlipContext = createContext(null);

export function BetSlipProvider({ children }) {
  const [selections, setSelections] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // selection = { id, matchName, market, pick, odd }
  const toggleSelection = (selection) => {
    setSelections((current) => {
      const exists = current.find((s) => s.id === selection.id);
      if (exists) {
        return current.filter((s) => s.id !== selection.id);
      } else {
        setIsOpen(true); // Open modal automatically when adding
        return [...current, selection];
      }
    });
  };

  const removeSelection = (id) => {
    setSelections((current) => {
      const remaining = current.filter((s) => s.id !== id);
      if (remaining.length === 0) setIsOpen(false);
      return remaining;
    });
  };

  const clearSlip = () => {
    setSelections([]);
    setIsOpen(false);
  };

  return (
    <BetSlipContext.Provider value={{ selections, toggleSelection, removeSelection, clearSlip, isOpen, setIsOpen }}>
      {children}
    </BetSlipContext.Provider>
  );
}

export function useBetSlip() {
  const context = useContext(BetSlipContext);
  if (!context) throw new Error('useBetSlip must be used within BetSlipProvider');
  return context;
}
