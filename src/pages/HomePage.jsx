import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getLiveMatches, getUpcomingMatches } from '@/api/matches';
import { ROUTES } from '@/config/routes';
import { BRAND } from '@/config/brand';
import { SparkleIcon } from '@/components/Icons';
import MatchCard from '@/components/Match/MatchCard';
import OddsChip from '@/components/Match/OddsChip';
import EdsonWidget from '@/components/Edson/EdsonWidget';
import PromoCarousel from '@/components/PromoCarousel/PromoCarousel';
import styles from './HomePage.module.css';

/**
 * HomePage — Landing page (unauthenticated friendly)
 * Hero featured match + AI search + live odds + upcoming games
 * Includes the Edson AI assistant widget above the hero section
 */
export default function HomePage() {
  const [liveMatches, setLiveMatches] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getLiveMatches(), getUpcomingMatches()]).then(([live, up]) => {
      setLiveMatches(live);
      setUpcoming(up);
      setLoading(false);
    });
  }, []);

  // Featured match is the first live match
  const featured = liveMatches.find((m) => m.status === 'live') ?? null;

  return (
    <div className={styles.page}>
      {/* Edson — Assistente Digital (Ask AI Bar + Panel) */}
      <EdsonWidget />

      {/* Promotional Carousel */}
      <PromoCarousel />

      {/* Featured Hero */}
      {featured && !loading && (
        <FeaturedHero match={featured} />
      )}

      {/* Live Odds Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>ODDS ATUALIZANDO…</span>
          <span className={styles.liveCount}>
            <span className={styles.liveWave}>●</span> {liveMatches.length} GAMES
          </span>
        </div>

        <div className={styles.cardGrid}>
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={`skeleton ${styles.skeletonCard}`} />
              ))
            : liveMatches.slice(0, 4).map((match) => (
                <MatchCard key={match.id} match={match} />
              ))
          }
        </div>
      </section>

      {/* Upcoming */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>PRÓXIMOS JOGOS</span>
          <Link to={ROUTES.LIVE} className={styles.seeAll}>VER TODOS</Link>
        </div>

        <div className={styles.cardGrid}>
          {loading
            ? Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className={`skeleton ${styles.skeletonCard}`} />
              ))
            : upcoming.map((match) => (
                <MatchCard key={match.id} match={match} showAnalysis={false} />
              ))
          }
        </div>
      </section>
    </div>
  );
}

/** Featured hero card for the top live match */
function FeaturedHero({ match }) {
  return (
    <Link
      to={ROUTES.ANALYSIS(match.id)}
      className={styles.heroLink}
      aria-label={`Em destaque: ${match.home.name} vs ${match.away.name} — ver análise`}
    >
      <motion.div
        className={styles.hero}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Background gradient */}
        <div className={styles.heroBg} aria-hidden="true" />

        {/* League & Live badge */}
        <div className={styles.heroMeta}>
          <span className={styles.liveBadge}>● LIVE {match.minute}</span>
          <span className={styles.heroLeague}>{match.league.split('—')[1]?.trim()}</span>
        </div>

        {/* Score */}
        <div className={styles.heroScore}>
          <span className={styles.heroTeam}>{match.home.name.toUpperCase()}</span>
          <span className={styles.heroNum}>{match.homeScore}</span>
          <span className={styles.heroVs}>-</span>
          <span className={styles.heroNum}>{match.awayScore}</span>
          <span className={styles.heroTeam}>{match.away.name.toUpperCase()}</span>
        </div>

        <span className={styles.heroCta}>VER ANÁLISE →</span>
      </motion.div>
    </Link>
  );
}
