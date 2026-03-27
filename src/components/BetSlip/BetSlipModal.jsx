import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBetSlip } from './BetSlipContext';
import styles from './BetSlipModal.module.css';

export default function BetSlipModal() {
  const { selections, isOpen, setIsOpen, removeSelection, clearSlip } = useBetSlip();
  const [stake, setStake] = useState('10');
  const [placed, setPlaced] = useState(false);

  if (!isOpen) return null;

  const totalOdds = selections.reduce((acc, s) => acc * s.odd, 1);
  const potentialReturn = (parseFloat(stake || '0') * totalOdds).toFixed(2);

  const handlePlaceBet = () => {
    setPlaced(true);
    setTimeout(() => {
      clearSlip();
      setPlaced(false);
    }, 2000);
  };

  return (
    <AnimatePresence>
      <div className={styles.overlay} onClick={() => setIsOpen(false)}>
        <motion.div
          className={styles.modal}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.header}>
            <h2 className={styles.title}>
              BOLETIM DE APOSTAS <span className={styles.badge}>{selections.length}</span>
            </h2>
            <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>✕</button>
          </div>

          <div className={styles.content}>
            {placed ? (
              <div className={styles.success}>
                <div className={styles.successIcon}>✓</div>
                Aposta Realizada com Sucesso!
              </div>
            ) : selections.length === 0 ? (
              <div className={styles.empty}>Seu boletim está vazio.</div>
            ) : (
              <>
                <div className={styles.selectionsList}>
                  {selections.map((sel) => (
                    <div key={sel.id} className={styles.selCard}>
                      <button className={styles.removeSel} onClick={() => removeSelection(sel.id)}>✕</button>
                      <span className={styles.selPick}>{sel.pick}</span>
                      <span className={styles.selMatch}>{sel.matchName}</span>
                      <div className={styles.selBottom}>
                        <span className={styles.selMarket}>{sel.market}</span>
                        <span className={styles.selOdd}>{sel.odd.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className={styles.summary}>
                  <div className={styles.row}>
                    <span>Odds Totais</span>
                    <span className={styles.oddsTotais}>{totalOdds.toFixed(2)}</span>
                  </div>
                  
                  <div className={styles.stakeRow}>
                    <label>Valor (R$)</label>
                    <input
                      type="number"
                      value={stake}
                      onChange={(e) => setStake(e.target.value)}
                      className={styles.stakeInput}
                      min="1"
                    />
                  </div>

                  <div className={styles.row}>
                    <span>Retorno Potencial</span>
                    <span className={styles.returnVal}>R$ {potentialReturn}</span>
                  </div>

                  <button className={styles.placeBtn} onClick={handlePlaceBet}>
                    FAZER APOSTA
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
