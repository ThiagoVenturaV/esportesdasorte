import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getOpenBets, getFinishedBets } from '@/api/bets';
import styles from './ApostasPage.module.css';

/** Tab values */
const TABS = { OPEN: 'open', FINISHED: 'finished' };

const STATUS_MAP = {
  live:     { label: 'AO VIVO',    color: 'live'    },
  pending:  { label: 'AGUARDANDO', color: 'pending' },
  won:      { label: 'GANHOU',     color: 'won'     },
  lost:     { label: 'PERDEU',     color: 'lost'    },
};

/**
 * ApostasPage — Open and finished bets management
 */
export default function ApostasPage() {
  const [tab, setTab] = useState(TABS.OPEN);
  const [openBets, setOpenBets] = useState([]);
  const [finishedBets, setFinishedBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cashoutId, setCashoutId] = useState(null);

  useEffect(() => {
    Promise.all([getOpenBets(), getFinishedBets()]).then(([open, fin]) => {
      setOpenBets(open);
      setFinishedBets(fin);
      setLoading(false);
    });
  }, []);

  const handleConfirmCashout = (betId) => {
    const betInQuestion = openBets.find(b => b.id === betId);
    if (!betInQuestion) return;

    // Remove das apostas em aberto
    setOpenBets(prev => prev.filter(b => b.id !== betId));

    // Adiciona nas finalizadas com status de ganho pelo valor de cashout
    setFinishedBets(prev => [
      { 
        ...betInQuestion, 
        status: 'won', 
        potentialReturn: betInQuestion.cashOutValue, 
        cashOutValue: null 
      }, 
      ...prev
    ]);
    
    setCashoutId(null);
  };

  const bets = tab === TABS.OPEN ? openBets : finishedBets;

  return (
    <div className={styles.page}>
      {/* Tab toggle */}
      <div className={styles.tabToggle} role="tablist" aria-label="Minhas apostas">
        <button
          className={`${styles.toggle} ${tab === TABS.OPEN ? styles.toggleActive : ''}`}
          onClick={() => setTab(TABS.OPEN)}
          role="tab"
          aria-selected={tab === TABS.OPEN}
        >
          Em Aberto
        </button>
        <button
          className={`${styles.toggle} ${tab === TABS.FINISHED ? styles.toggleActive : ''}`}
          onClick={() => setTab(TABS.FINISHED)}
          role="tab"
          aria-selected={tab === TABS.FINISHED}
        >
          Finalizados
        </button>
      </div>

      {/* Bet list */}
      {loading ? (
        <div className={styles.betList}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={`skeleton ${styles.skeletonBet}`} />
          ))}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            className={styles.betList}
            initial={{ opacity: 0, x: tab === TABS.OPEN ? -12 : 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {bets.map((bet) => (
              <BetCard
                key={bet.id}
                bet={bet}
                onCashout={setCashoutId}
                cashoutActive={cashoutId === bet.id}
                onConfirmCashout={() => handleConfirmCashout(bet.id)}
                onCancelCashout={() => setCashoutId(null)}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

/** Individual bet card */
function BetCard({ bet, onCashout, cashoutActive, onConfirmCashout, onCancelCashout }) {
  const status = STATUS_MAP[bet.status] ?? { label: bet.status, color: 'pending' };
  const totalOdd = bet.selections.reduce((acc, s) => acc * s.odd, 1);

  return (
    <div className={styles.betCard}>
      {/* Card header */}
      <div className={styles.betHeader}>
        <div className={styles.betMeta}>
          <span className={styles.betType}>{bet.type.toUpperCase()}</span>
          {bet.typeCount > 1 && (
            <span className={styles.betCount}>{bet.typeCount}</span>
          )}
          <span className={styles.betDate}>SELEÇÕES • {bet.createdAt}</span>
        </div>
        <span className={`${styles.statusBadge} ${styles[status.color]}`}>
          {status.color === 'live' && (
            <span className={styles.statusDot} aria-hidden="true" />
          )}
          {status.label}
        </span>
      </div>

      {/* Selections */}
      <div className={styles.selections}>
        {bet.selections.map((sel, i) => (
          <div key={i} className={`${styles.selItem} ${sel.result ? styles[sel.result] : ''}`}>
            <div className={styles.selBar} />
            <div className={styles.selContent}>
              <span className={styles.selMatch}>{sel.match}</span>
              <span className={styles.selMarket}>{sel.market}: <strong>{sel.pick}</strong></span>
            </div>
            <span className={styles.selOdd}>{sel.odd.toFixed(2)}</span>
          </div>
        ))}
      </div>

      {/* Financial summary */}
      <div className={styles.financial}>
        <div className={styles.finRow}>
          <span className={styles.finLabel}>APOSTA</span>
          <span className={styles.finValue}>R$ {bet.stake.toFixed(2)}</span>
        </div>
        <div className={styles.finRow}>
          <span className={styles.finLabel}>
            {bet.status === 'won' ? 'RETORNO' : 'GANHO POTENCIAL'}
          </span>
          <span className={`${styles.finValue} ${styles.finAccent}`}>
            R$ {bet.potentialReturn.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Cash-out button */}
      {bet.cashOutValue && (
        cashoutActive ? (
          <div className={styles.cashoutConfirm}>
            <span>Confirmar Cash Out de R$ {bet.cashOutValue.toFixed(2)}?</span>
            <div className={styles.cashoutActions}>
              <button className={styles.confirmBtn} onClick={onConfirmCashout}>✓ Confirmar</button>
              <button className={styles.cancelBtn} onClick={onCancelCashout}>✗ Cancelar</button>
            </div>
          </div>
        ) : (
          <button
            className={styles.cashoutBtn}
            onClick={() => onCashout(bet.id)}
            aria-label={`Encerrar aposta com cash out de R$ ${bet.cashOutValue.toFixed(2)}`}
          >
            <span>Encerrar Aposta (Cash Out)</span>
            <span className={styles.cashoutAmount}>R$ {bet.cashOutValue.toFixed(2)}</span>
          </button>
        )
      )}
    </div>
  );
}
