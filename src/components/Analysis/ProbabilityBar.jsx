import { useEffect, useRef } from 'react';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import styles from './ProbabilityBar.module.css';

/**
 * ProbabilityBar — Animated 3-way win probability bar
 * @param {{ home: number, draw: number | null, away: number, homeTeam: string, awayTeam: string }} props
 */
export default function ProbabilityBar({ home, draw, away, homeTeam, awayTeam }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div className={styles.wrap} ref={ref} role="img" aria-label={`Probabilidades: ${homeTeam} ${home}%, Empate ${draw ?? 0}%, ${awayTeam} ${away}%`}>
      <div className={styles.labels}>
        <span className={styles.team}>{homeTeam}</span>
        {draw != null && <span className={styles.drawLabel}>Empate</span>}
        <span className={styles.team}>{awayTeam}</span>
      </div>

      {/* Bar */}
      <div className={styles.bar}>
        <motion.div
          className={styles.homeSegment}
          initial={{ width: '0%' }}
          animate={isInView ? { width: `${home}%` } : {}}
          transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
        />
        {draw != null && (
          <motion.div
            className={styles.drawSegment}
            initial={{ width: '0%' }}
            animate={isInView ? { width: `${draw}%` } : {}}
            transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
          />
        )}
        <motion.div
          className={styles.awaySegment}
          initial={{ width: '0%' }}
          animate={isInView ? { width: `${away}%` } : {}}
          transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
        />
      </div>

      {/* Percentages */}
      <div className={styles.percents}>
        <AnimatedNumber value={home} suffix="%" className={styles.homeNum} />
        {draw != null && <AnimatedNumber value={draw} suffix="%" className={styles.drawNum} />}
        <AnimatedNumber value={away} suffix="%" className={styles.awayNum} />
      </div>
    </div>
  );
}

function AnimatedNumber({ value, suffix, className }) {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.3 }}
    >
      {value}{suffix}
    </motion.span>
  );
}
