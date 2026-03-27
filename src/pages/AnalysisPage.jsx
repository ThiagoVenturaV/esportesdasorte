import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getMatchById } from '@/api/matches';
import { getMatchAnalysis } from '@/api/analysis';
import { ROUTES } from '@/config/routes';
import TeamShield from '@/components/TeamShield';
import {
  GoalIcon,
  YellowCardIcon,
  RedCardIcon,
  SparkleIcon,
} from '@/components/Icons';
import ProbabilityBar from '@/components/Analysis/ProbabilityBar';
import InsightCard from '@/components/Analysis/InsightCard';
import MomentumChart from '@/components/Analysis/MomentumChart';
import styles from './AnalysisPage.module.css';

/**
 * AnalysisPage — Core innovation: AI sports analysis
 * Probability, insights, momentum, commentary — interpretation over raw data
 */
export default function AnalysisPage() {
  const { matchId } = useParams();
  const location = useLocation();
  const [match, setMatch] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  const preloadedLiveMatch = location.state?.preloadedLiveMatch ?? null;
  const preloadedAnalysis = location.state?.preloadedAnalysis ?? null;

  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoading(true);

      let m = null;
      if (preloadedLiveMatch?.match_id && String(preloadedLiveMatch.match_id) === String(matchId)) {
        m = mapLiveAnalysisToMatch(preloadedLiveMatch);
      }

      if (!m) {
        m = await getMatchById(matchId);
      }

      if (!active) return;

      setMatch(m);

      let a = preloadedAnalysis;
      if (!a) {
        a = await getMatchAnalysis(matchId, m);
      }
      if (!active) return;

      setAnalysis(a);
      setLoading(false);
    }

    loadData();

    return () => {
      active = false;
    };
  }, [matchId, preloadedLiveMatch, preloadedAnalysis]);

  if (loading) return <AnalysisSkeleton />;

  if (!match) {
    return (
      <div className={styles.page}>
        <div className={styles.errorCard}>
          <h2>Partida não encontrada</h2>
          <p>
            Não foi possível carregar os dados desta partida. Ela pode ter sido
            encerrada ou removida.
          </p>
          <Link to={ROUTES.HOME} className={styles.backLink}>
            ← Ir para a Home
          </Link>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className={styles.page}>
        <div className={styles.errorCard}>
          <h2>Análise Indisponível</h2>
          <p>
            Nossos algoritmos de IA ainda não processaram os dados para{' '}
            {match.home.name} vs {match.away.name}.
          </p>
          <Link to={-1} className={styles.backLink}>
            ← Voltar
          </Link>
        </div>
      </div>
    );
  }

  const isSoccer = match.sport === 'soccer';

  return (
    <div className={styles.page}>
      {/* Back navigation */}
      <Link to={-1} className={styles.backLink}>
        ← Voltar
      </Link>

      {/* Match Header */}
      <motion.div
        className={styles.matchHeader}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className={styles.headerTop}>
          <span className={styles.league}>{match.league}</span>
          <span className={styles.liveChip}>
            <span className={styles.liveDot} aria-hidden="true" /> AO VIVO{' '}
            {match.minute}
          </span>
        </div>

        <div className={styles.scoreboard}>
          <div className={styles.sbTeam}>
            <span className={styles.sbLogo}>{match.home.logo}</span>
            <span className={styles.sbName}>{match.home.name}</span>
          </div>
          <div className={styles.sbScore}>
            <span className={styles.sbNum}>{match.homeScore}</span>
            <span className={styles.sbSep}>–</span>
            <span className={styles.sbNum}>{match.awayScore}</span>
          </div>
          <div className={`${styles.sbTeam} ${styles.sbTeamAway}`}>
            <span className={styles.sbLogo}>{match.away.logo}</span>
            <span className={styles.sbName}>{match.away.name}</span>
          </div>
        </div>

        {/* AI Prediction badge */}
        <div className={styles.predContainer}>
          <div className={styles.predBadge}>
            <span className={styles.predLabel}>PREVISÃO IA</span>
            <span className={styles.predValue}>{analysis.predictedWinner}</span>
            <span className={styles.predConf}>
              {analysis.confidenceScore}% confiança
            </span>
          </div>

          <div className={styles.betCTAWrapper}>
            <Link to={ROUTES.BETTING(match.id)} className={styles.betCTA}>
              APOSTAR AGORA
            </Link>
          </div>
        </div>
      </motion.div>

      {/* AI Commentary */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Análise da IA</h2>
        <div className={styles.card}>
          <ul className={styles.commentary}>
            {analysis.commentary.map((line, i) => (
              <motion.li
                key={i}
                className={styles.commentLine}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 1.5 }}
              >
                <span className={styles.commentIcon}>
                  <SparkleIcon />
                </span>
                <span className={styles.commentText}>
                  <TypewriterText
                    text={line}
                    startDelay={i * 1500 + 400}
                    speed={20}
                  />
                </span>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      {/* Win Probability */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Probabilidade de Vitória</h2>
        <div className={styles.card}>
          <ProbabilityBar
            home={analysis.winProbability.home}
            draw={analysis.winProbability.draw}
            away={analysis.winProbability.away}
            homeTeam={match.home.shortName}
            awayTeam={match.away.shortName}
          />
        </div>
      </section>

      {/* Insights Grid */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Insights em Tempo Real</h2>
        <div className={styles.insightGrid}>
          {isSoccer && (
            <InsightCard
              icon={<GoalIcon />}
              title="Prob. de Gol (próx. 10 min)"
              value={analysis.goalProbabilityNextMinute}
              description="Baseado em pressão, finalizações e posse de bola recente."
              invertRisk
            />
          )}
          <InsightCard
            icon={<YellowCardIcon />}
            title={`Risco de Cartão — ${match.home.shortName}`}
            value={analysis.cardRiskHome}
            description={`Nível de agressividade e faltas táticas de ${match.home.name}.`}
          />
          <InsightCard
            icon={<YellowCardIcon />}
            title={`Risco de Cartão — ${match.away.shortName}`}
            value={analysis.cardRiskAway}
            description={`Padrão de falta e pressão recente de ${match.away.name}.`}
          />
          {isSoccer && analysis.penaltyRisk != null && (
            <InsightCard
              icon={<RedCardIcon />}
              title="Risco de Pênalti"
              value={analysis.penaltyRisk}
              description="Baseado em entradas na área, faltas e histórico de árbitro."
            />
          )}
        </div>
      </section>

      {/* Momentum Chart */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Momentum da Partida</h2>
        <div className={styles.card}>
          <MomentumChart
            momentumHome={analysis.momentumHome}
            momentumAway={analysis.momentumAway}
            homeTeam={match.home.shortName}
            awayTeam={match.away.shortName}
          />
        </div>
      </section>
    </div>
  );
}

function mapLiveAnalysisToMatch(liveMatch) {
  const minuteRaw = liveMatch?.live_data?.minute;
  const minute =
    minuteRaw == null
      ? ""
      : String(minuteRaw).includes("'")
        ? String(minuteRaw)
        : `${minuteRaw}'`;

  return {
    id: String(liveMatch?.match_id || ''),
    status: 'live',
    sport: 'soccer',
    league: 'Partida em Andamento',
    home: {
      name: liveMatch?.home_team || 'Casa',
      shortName: String(liveMatch?.home_team || 'CAS').slice(0, 3).toUpperCase(),
      logo: (
        <TeamShield
          name={liveMatch?.home_team || 'Casa'}
          externalId={String(liveMatch?.match_id || '')}
        />
      ),
    },
    away: {
      name: liveMatch?.away_team || 'Fora',
      shortName: String(liveMatch?.away_team || 'FOR').slice(0, 3).toUpperCase(),
      logo: (
        <TeamShield
          name={liveMatch?.away_team || 'Fora'}
          externalId={String(liveMatch?.match_id || '')}
        />
      ),
    },
    homeScore: Number(liveMatch?.live_data?.home_score ?? 0),
    awayScore: Number(liveMatch?.live_data?.away_score ?? 0),
    minute,
    period: 'Ao Vivo',
    odds: { home: 0, draw: 0, away: 0 },
  };
}

function TypewriterText({ text, startDelay = 0, speed = 25 }) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    let timeout;
    let i = 0;

    function type() {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
        timeout = setTimeout(type, speed);
      }
    }

    timeout = setTimeout(type, startDelay);
    return () => clearTimeout(timeout);
  }, [text, startDelay, speed]);

  return <>{displayed}</>;
}

function AnalysisSkeleton() {
  return (
    <div className={styles.page}>
      <div
        className={`skeleton ${styles.skH}`}
        style={{ height: 160, borderRadius: 16 }}
      />
      <div
        className={`skeleton ${styles.skH}`}
        style={{ height: 80, borderRadius: 12 }}
      />
      <div
        className={`skeleton ${styles.skH}`}
        style={{ height: 120, borderRadius: 12 }}
      />
      <div
        className={`skeleton ${styles.skH}`}
        style={{ height: 160, borderRadius: 12 }}
      />
    </div>
  );
}
