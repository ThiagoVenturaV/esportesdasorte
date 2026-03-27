import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ROUTES } from '@/config/routes';
import styles from './MatchCard.module.css';
import OddsChip from './OddsChip';

/**
 * MatchCard — Live or upcoming match row
 * Tapping navigates to AnalysisPage when analysis is available (live).
 *
 * @param {{ match: import('@/config/mocks').Match, showAnalysis?: boolean }} props
 */
export default function MatchCard({ match, showAnalysis = true }) {
  const isLive = match.status === 'live';
  const cardContent = (
    <motion.div
      className={styles.card}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.1 }}
    >
      {/* Match info */}
      <div className={styles.info}>
        <div className={styles.teams}>
          <div className={styles.team}>
            <span className={styles.teamLogo}>{match.home.logo}</span>
            <span className={styles.teamName}>{match.home.name}</span>
            {match.homeScore !== null && (
              <span className={`${styles.score} ${match.homeScore > match.awayScore ? styles.scoreWin : ''}`}>
                {match.homeScore}
              </span>
            )}
          </div>
          <div className={styles.team}>
            <span className={styles.teamLogo}>{match.away.logo}</span>
            <span className={styles.teamName}>{match.away.name}</span>
            {match.awayScore !== null && (
              <span className={`${styles.score} ${match.awayScore > match.homeScore ? styles.scoreWin : ''}`}>
                {match.awayScore}
              </span>
            )}
          </div>
        </div>

        <div className={styles.meta}>
          {isLive ? (
            <>
              <span className={styles.liveDot} aria-label="Ao vivo" />
              <span className={styles.minute}>{match.minute}</span>
              <span className={styles.period}>• {match.period}</span>
            </>
          ) : (
            <span className={styles.time}>{match.minute}</span>
          )}
        </div>
      </div>

      {/* Odds */}
      <div className={styles.odds}>
        <OddsChip 
          label="HOME" 
          selection={{ id: `${match.id}-home`, matchName: `${match.home.name} vs ${match.away.name}`, market: 'Resultado Final', pick: match.home.name, odd: match.odds.home }} 
        />
        {match.odds.draw && (
          <OddsChip 
            label="DRAW" 
            selection={{ id: `${match.id}-draw`, matchName: `${match.home.name} vs ${match.away.name}`, market: 'Resultado Final', pick: 'Empate', odd: match.odds.draw }} 
          />
        )}
        <OddsChip 
          label="AWAY" 
          selection={{ id: `${match.id}-away`, matchName: `${match.home.name} vs ${match.away.name}`, market: 'Resultado Final', pick: match.away.name, odd: match.odds.away }} 
        />
      </div>

      {/* Analysis CTA arrow */}
      {isLive && showAnalysis && (
        <div className={styles.arrow} aria-hidden="true">›</div>
      )}
    </motion.div>
  );

  // Only live matches have an analysis page
  if (isLive && showAnalysis) {
    return (
      <Link
        to={ROUTES.ANALYSIS(match.id)}
        className={styles.link}
        aria-label={`Ver análise: ${match.home.name} vs ${match.away.name}`}
      >
        {cardContent}
      </Link>
    );
  }

  return <div className={styles.link}>{cardContent}</div>;
}
