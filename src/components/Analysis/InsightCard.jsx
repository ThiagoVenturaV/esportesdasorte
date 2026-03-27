import { motion } from 'framer-motion';
import styles from './InsightCard.module.css';

const RISK_LEVELS = [
  { max: 30, label: 'Baixo',  color: 'success' },
  { max: 60, label: 'Médio',  color: 'warning' },
  { max: 100, label: 'Alto',  color: 'danger'  },
];

function getRiskLevel(value) {
  return RISK_LEVELS.find((r) => value <= r.max) ?? RISK_LEVELS[2];
}

/**
 * InsightCard — AI insight panel with probability and interpretation
 * @param {{ icon: React.ReactNode, title: string, value: number, unit?: string, description: string, invertRisk?: boolean }} props
 * - invertRisk: if true, higher = better (e.g. win probability)
 */
export default function InsightCard({ icon, title, value, unit = '%', description, invertRisk = false }) {
  const displayValue = Math.round(value);
  const risk = invertRisk
    ? getRiskLevel(100 - displayValue)  // flip risk for "higher is better" values
    : getRiskLevel(displayValue);

  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className={styles.header}>
        <span className={styles.icon}>{icon}</span>
        <div className={styles.titleWrap}>
          <span className={styles.title}>{title}</span>
          <span className={`${styles.riskBadge} ${styles[risk.color]}`}>
            {risk.label}
          </span>
        </div>
        <span className={`${styles.value} ${styles[risk.color]}`}>
          {displayValue}{unit}
        </span>
      </div>

      {/* Progress ring meter */}
      <div className={styles.meter}>
        <div
          className={`${styles.meterFill} ${styles[risk.color]}`}
          style={{ width: `${displayValue}%` }}
          role="meter"
          aria-valuenow={displayValue}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={title}
        />
      </div>

      <p className={styles.description}>{description}</p>
    </motion.div>
  );
}
