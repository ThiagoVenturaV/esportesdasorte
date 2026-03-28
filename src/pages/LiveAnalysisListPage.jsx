import { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchWithBackendFallback } from '@/config/backend';
import { ROUTES } from '@/config/routes';
import { SparkleIcon } from '@/components/Icons';
import styles from './LiveAnalysisListPage.module.css';

/**
 * LiveAnalysisListPage — Dedicated page to view all live matches with AI analysis.
 */
export default function LiveAnalysisListPage() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [leagueFilter, setLeagueFilter] = useState('all');

  const fetchAnalyses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchWithBackendFallback(
        '/api/analises-ao-vivo?limit=0',
      );
      const data = await response.json();
      if (data?.sucesso && Array.isArray(data.analises)) {
        setAnalyses(data.analises);
      } else {
        setAnalyses([]);
      }
    } catch (error) {
      console.error('[LiveAnalysisList] Error fetching analyses:', error);
      setAnalyses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalyses();
    const interval = setInterval(fetchAnalyses, 60_000); // 1 min sync
    return () => clearInterval(interval);
  }, [fetchAnalyses]);

  const leagueOptions = useMemo(() => {
    const set = new Set();
    analyses.forEach((match) => {
      const name = String(match?.league_name || '').trim() || 'Outras Ligas';
      set.add(name);
    });
    return [
      'all',
      ...Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR')),
    ];
  }, [analyses]);

  useEffect(() => {
    if (leagueFilter !== 'all' && !leagueOptions.includes(leagueFilter)) {
      setLeagueFilter('all');
    }
  }, [leagueFilter, leagueOptions]);

  const filteredAnalyses = useMemo(() => {
    if (leagueFilter === 'all') {
      return analyses;
    }
    return analyses.filter((match) => {
      const currentLeague =
        String(match?.league_name || '').trim() || 'Outras Ligas';
      return currentLeague === leagueFilter;
    });
  }, [analyses, leagueFilter]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <span className={styles.liveBadge}>LIVE</span>
          <h1>Análises do Edson IA</h1>
        </div>
        <p className={styles.subtitle}>
          Acompanhe probabilidades em tempo real e insights táticos gerados por
          nossa IA.
        </p>
        {!loading && analyses.length > 0 && (
          <p className={styles.resultsMeta}>
            {filteredAnalyses.length} jogos exibidos
          </p>
        )}
      </header>

      {leagueOptions.length > 1 && (
        <div
          className={styles.filters}
          role="tablist"
          aria-label="Filtrar por liga"
        >
          {leagueOptions.map((option) => {
            const active = leagueFilter === option;
            return (
              <button
                key={option}
                type="button"
                className={`${styles.filterChip} ${active ? styles.filterChipActive : ''}`}
                onClick={() => setLeagueFilter(option)}
                aria-pressed={active}
              >
                {option === 'all' ? 'Todas as ligas' : option}
              </button>
            );
          })}
        </div>
      )}

      {loading && filteredAnalyses.length === 0 ? (
        <div className={styles.loadingState}>
          <span className={styles.spinner} />
          <p>Consultando a rede neural do Edson...</p>
        </div>
      ) : filteredAnalyses.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>⚽</div>
          <h2>Sem jogos ao vivo para este filtro</h2>
          <p>
            Não há partidas com análise ativa para a liga selecionada no
            momento. Tente outro filtro ou volte em instantes.
          </p>
          <Link to={ROUTES.HOME} className={styles.homeBtn}>
            Voltar para Início
          </Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredAnalyses.map((match) => (
            <AnalysisCard key={match.match_id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}

function AnalysisCard({ match }) {
  const analysis = match.analysis || {};
  const win = analysis.winProbability || { home: 33, draw: 33, away: 34 };
  const confidence = analysis.confidenceScore ?? 0;
  const leagueName = match.league_name || 'Partida em Andamento';

  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
    >
      <div className={styles.cardHeader}>
        <span className={styles.leagueName}>{leagueName}</span>
        <span className={styles.minuteBadge}>{match.live_data?.minute}'</span>
      </div>

      <div className={styles.teamsRow}>
        <div className={styles.teamInfo}>
          <span className={styles.teamName}>{match.home_team}</span>
        </div>
        <div className={styles.scoreBox}>
          <span className={styles.score}>
            {match.live_data?.home_score ?? 0}
          </span>
          <span className={styles.scoreSep}>-</span>
          <span className={styles.score}>
            {match.live_data?.away_score ?? 0}
          </span>
        </div>
        <div className={styles.teamInfo}>
          <span className={styles.teamName}>{match.away_team}</span>
        </div>
      </div>

      <div className={styles.statsGauges}>
        <div className={styles.gaugeItem}>
          <span className={styles.gaugeLabel}>CASA</span>
          <div className={styles.gaugeBarWrap}>
            <div
              className={styles.gaugeFill}
              style={{ width: `${win.home}%`, background: 'var(--brand-main)' }}
            />
          </div>
          <span className={styles.gaugeVal}>{win.home}%</span>
        </div>
        <div className={styles.gaugeItem}>
          <span className={styles.gaugeLabel}>EMPATE</span>
          <div className={styles.gaugeBarWrap}>
            <div
              className={styles.gaugeFill}
              style={{ width: `${win.draw}%`, background: '#666' }}
            />
          </div>
          <span className={styles.gaugeVal}>{win.draw}%</span>
        </div>
        <div className={styles.gaugeItem}>
          <span className={styles.gaugeLabel}>FORA</span>
          <div className={styles.gaugeBarWrap}>
            <div
              className={styles.gaugeFill}
              style={{ width: `${win.away}%`, background: 'var(--brand-sec)' }}
            />
          </div>
          <span className={styles.gaugeVal}>{win.away}%</span>
        </div>
      </div>

      {analysis.commentary?.[0] && (
        <div className={styles.aiTip}>
          <SparkleIcon />
          <p>{analysis.commentary[0]}</p>
        </div>
      )}

      <div className={styles.cardFooter}>
        <div className={styles.confidence}>
          Confiança: <span>{confidence}%</span>
        </div>
        <Link
          to={ROUTES.ANALYSIS(match.match_id)}
          state={{
            preloadedLiveMatch: match,
            preloadedAnalysis: analysis,
          }}
          className={styles.detailBtn}
        >
          VER ANÁLISE COMPLETA →
        </Link>
      </div>
    </motion.div>
  );
}
