import { motion } from 'framer-motion';
import { useBetSlip } from '@/components/BetSlip/BetSlipContext';
import styles from './OddsChip.module.css';

/**
 * OddsChip — Clickable odds button connecting to global BetSlip
 * @param {{ label: string, selection: { id, matchName, market, pick, odd } }} props
 */
export default function OddsChip({ label, selection }) {
  const { selections, toggleSelection } = useBetSlip();

  if (!selection || !selection.odd) return null;

  const isSelected = selections.some((s) => s.id === selection.id);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Previne o redirecionamento se houver um <Link> envolta
    toggleSelection(selection);
  };

  return (
    <motion.button
      className={`${styles.chip} ${isSelected ? styles.selected : ''}`}
      onClick={handleClick}
      whileTap={{ scale: 0.92 }}
      aria-pressed={isSelected}
      aria-label={`${label}: ${selection.odd}`}
    >
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{selection.odd.toFixed(2)}</span>
    </motion.button>
  );
}
