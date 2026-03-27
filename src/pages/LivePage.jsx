import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getLiveMatches } from '@/api/matches';
import { BRAND } from '@/config/brand';
import MatchCard from '@/components/Match/MatchCard';
import styles from './LivePage.module.css';

/**
 * LivePage — Real-time live matches with country filter tabs
 */
export default function LivePage() {
  const [searchParams] = useSearchParams();
  const sportParam = searchParams.get('sport');
  const leagueParam = searchParams.get('league');

  const [allMatches, setAllMatches] = useState([]);
  const [countryFilter, setCountryFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setCountryFilter('all');
    
    const filters = sportParam ? { sport: sportParam } : {};
    
    getLiveMatches(filters).then((matches) => {
      // Se houver leagueParam, filtramos manualmente aqui ou na API
      let filteredMatches = matches;
      if (leagueParam) {
        filteredMatches = matches.filter(m => 
          m.league.toLowerCase().includes(leagueParam.toLowerCase())
        );
      }
      setAllMatches(filteredMatches);
      setLoading(false);
    });
  }, [sportParam, leagueParam]);

  // Extrair países únicos das partidas carregadas
  const countries = useMemo(() => {
    const unique = new Set();
    allMatches.forEach((m) => {
      const parts = m.league.split(' — ');
      unique.add(parts.length > 1 ? parts[0] : m.league);
    });
    return Array.from(unique).sort();
  }, [allMatches]);

  const tabs = [
    { id: 'all', label: 'Todos' },
    ...countries.map((c) => ({ id: c, label: c })),
  ];

  const filtered = countryFilter === 'all'
    ? allMatches
    : allMatches.filter((m) => {
        const country = m.league.split(' — ').length > 1 ? m.league.split(' — ')[0] : m.league;
        return country === countryFilter;
      });

  // Agrupar por divisão (ou nome completo da liga)
  const grouped = filtered.reduce((acc, match) => {
    const parts = match.league.split(' — ');
    const division = parts.length > 1 ? parts[1] : match.league;
    const key = countryFilter === 'all' ? match.league : division;
    
    if (!acc[key]) acc[key] = [];
    acc[key].push(match);
    return acc;
  }, {});

  const currentSportLabel = sportParam 
    ? BRAND.sports.find(s => s.id === sportParam)?.label?.toUpperCase() || sportParam.toUpperCase()
    : 'AGORA';

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.liveDot} aria-hidden="true" />
        <h1 className={styles.title}>AO VIVO {currentSportLabel}</h1>
        {!loading && (
          <span className={styles.count}>{allMatches.length} JOGOS</span>
        )}
      </div>

      {/* Country filter tabs */}
      <div className={styles.tabs} role="tablist" aria-label="Filtrar por país">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            className={`${styles.tab} ${countryFilter === tab.id ? styles.activeTab : ''}`}
            onClick={() => setCountryFilter(tab.id)}
            whileTap={{ scale: 0.94 }}
            role="tab"
            aria-selected={countryFilter === tab.id}
            aria-label={tab.label}
          >
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* Match list grouped */}
      {loading ? (
        <div className={styles.matchList}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={`skeleton ${styles.skeletonCard}`} />
          ))}
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className={styles.empty}>
          <span>Nenhuma partida ao vivo</span>
        </div>
      ) : (
        Object.entries(grouped).map(([league, matches]) => (
          <div key={league} className={styles.leagueGroup}>
            <h2 className={styles.leagueLabel}>{league}</h2>
            <div className={styles.matchList}>
              {matches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
