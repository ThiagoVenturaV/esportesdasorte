import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getMatchById } from '@/api/matches';
import { getMatchAnalysis, getSavedMatchAnalysis } from '@/api/analysis';
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
  const fallbackTeams = location.state?.teams ?? null;

  function toMatchContext(matchData) {
    if (!matchData?.home?.name || !matchData?.away?.name) return null;
    return {
      home: { name: matchData.home.name },
      away: { name: matchData.away.name },
    };
  }

  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoading(true);
      try {
        const hasLivePreload =
          preloadedLiveMatch?.match_id &&
          String(preloadedLiveMatch.match_id) === String(matchId);

        const preloadedMatch = hasLivePreload
          ? mapLiveAnalysisToMatch(preloadedLiveMatch)
          : null;

        const contextFromState =
          toMatchContext(preloadedMatch) ||
          (fallbackTeams
            ? {
                home: { name: fallbackTeams?.home?.name || 'Time Casa' },
                away: { name: fallbackTeams?.away?.name || 'Time Fora' },
              }
            : null);

        const matchPromise = preloadedMatch
          ? Promise.resolve(preloadedMatch)
          : getMatchById(matchId);

        const savedAnalysisPromise = preloadedAnalysis
          ? Promise.resolve(preloadedAnalysis)
          : getSavedMatchAnalysis(matchId, contextFromState);

        const [m, savedAnalysis] = await Promise.all([
          matchPromise,
          savedAnalysisPromise,
        ]);

        if (!active) return;

        const safeMatch = m || buildFallbackMatch(matchId, fallbackTeams);
        const effectiveContext = toMatchContext(safeMatch);

        let a = savedAnalysis;
        if (!a) {
          a = await getSavedMatchAnalysis(matchId, effectiveContext);
        }
        if (!a) {
          a = await getMatchAnalysis(matchId, effectiveContext);
        }
        if (!active) return;

        setMatch(safeMatch);
        setAnalysis(a);
      } catch (error) {
        console.error('[AnalysisPage] Erro ao carregar análise:', error);
        if (!active) return;
        setMatch(buildFallbackMatch(matchId, fallbackTeams));
        setAnalysis(null);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [matchId, preloadedLiveMatch, preloadedAnalysis, fallbackTeams]);

  if (loading) return <AnalysisSkeleton />;

  if (!match && !analysis) {
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

  const safeAnalysis = normalizeAnalysisForUi(analysis, match);

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
            <span className={styles.predValue}>
              {safeAnalysis.predictedWinner}
            </span>
            <span className={styles.predConf}>
              {safeAnalysis.confidenceScore}% confiança
            </span>
          </div>

          <p className={styles.aiDisclaimer}>
            Edson é uma IA e pode cometer erros. Por favor, verifique as
            respostas.
          </p>

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
            {safeAnalysis.commentary.map((line, i) => (
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
            home={safeAnalysis.winProbability.home}
            draw={safeAnalysis.winProbability.draw}
            away={safeAnalysis.winProbability.away}
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
              value={safeAnalysis.goalProbabilityNextMinute}
              description="Baseado em pressão, finalizações e posse de bola recente."
              invertRisk
            />
          )}
          <InsightCard
            icon={<YellowCardIcon />}
            title={`Risco de Cartão — ${match.home.shortName}`}
            value={safeAnalysis.cardRiskHome}
            description={`Nível de agressividade e faltas táticas de ${match.home.name}.`}
          />
          <InsightCard
            icon={<YellowCardIcon />}
            title={`Risco de Cartão — ${match.away.shortName}`}
            value={safeAnalysis.cardRiskAway}
            description={`Padrão de falta e pressão recente de ${match.away.name}.`}
          />
          {isSoccer && safeAnalysis.penaltyRisk != null && (
            <InsightCard
              icon={<RedCardIcon />}
              title="Risco de Pênalti"
              value={safeAnalysis.penaltyRisk}
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
            momentumHome={safeAnalysis.momentumHome}
            momentumAway={safeAnalysis.momentumAway}
            homeTeam={match.home.shortName}
            awayTeam={match.away.shortName}
          />
        </div>
      </section>
    </div>
  );
}

function toSafeInt(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n) : fallback;
}

function normalizeAnalysisForUi(raw, match) {
  const homeTeamName = match?.home?.name || 'Time Casa';
  const awayTeamName = match?.away?.name || 'Time Fora';

  if (!raw || typeof raw !== 'object') {
    return {
      winProbability: { home: 34, draw: 32, away: 34 },
      confidenceScore: 52,
      predictedWinner: homeTeamName,
      commentary: [
        `Análise de ${homeTeamName} x ${awayTeamName} indisponível no momento.`,
      ],
      goalProbabilityNextMinute: 42,
      cardRiskHome: 38,
      cardRiskAway: 36,
      penaltyRisk: 18,
      momentumHome: 51,
      momentumAway: 49,
    };
  }

  const win = raw.winProbability || raw.win_probability || {};
  const commentary = Array.isArray(raw.commentary)
    ? raw.commentary
    : typeof raw.commentary === 'string'
      ? [raw.commentary]
      : [];

  return {
    winProbability: {
      home: toSafeInt(win.home, 34),
      draw: toSafeInt(win.draw, 32),
      away: toSafeInt(win.away, 34),
    },
    confidenceScore: toSafeInt(raw.confidenceScore ?? raw.confidence, 52),
    predictedWinner: String(
      raw.predictedWinner || raw.prediction || homeTeamName,
    ),
    commentary:
      commentary.length > 0
        ? commentary.map((line) => String(line))
        : [
            `Análise de ${homeTeamName} x ${awayTeamName} indisponível no momento.`,
          ],
    goalProbabilityNextMinute: toSafeInt(raw.goalProbabilityNextMinute, 42),
    cardRiskHome: toSafeInt(raw.cardRiskHome, 38),
    cardRiskAway: toSafeInt(raw.cardRiskAway ?? raw.cardRisskAway, 36),
    penaltyRisk: toSafeInt(raw.penaltyRisk, 18),
    momentumHome: toSafeInt(raw.momentumHome, 51),
    momentumAway: toSafeInt(raw.momentumAway, 49),
  };
}

function buildFallbackMatch(matchId, teams) {
  const homeName = teams?.home?.name || 'Time Casa';
  const awayName = teams?.away?.name || 'Time Fora';

  return {
    id: String(matchId || ''),
    status: 'live',
    sport: 'soccer',
    league: 'Análise de Partida',
    home: {
      name: homeName,
      shortName: String(homeName).slice(0, 3).toUpperCase(),
      logo: (
        <TeamShield name={homeName} externalId={`${matchId}-home-fallback`} />
      ),
    },
    away: {
      name: awayName,
      shortName: String(awayName).slice(0, 3).toUpperCase(),
      logo: (
        <TeamShield name={awayName} externalId={`${matchId}-away-fallback`} />
      ),
    },
    homeScore: 0,
    awayScore: 0,
    minute: '',
    period: 'Pré-jogo',
    odds: { home: 0, draw: 0, away: 0 },
  };
}

function mapLiveAnalysisToMatch(liveMatch) {
  const minuteRaw = liveMatch?.live_data?.minute;
  const minute =
    minuteRaw == null
      ? ''
      : String(minuteRaw).includes("'")
        ? String(minuteRaw)
        : `${minuteRaw}'`;

  return {
    id: String(liveMatch?.match_id || ''),
    status: 'live',
    sport: 'soccer',
    league: liveMatch?.league_name || 'Partida em Andamento',
    home: {
      name: liveMatch?.home_team || 'Casa',
      shortName: String(liveMatch?.home_team || 'CAS')
        .slice(0, 3)
        .toUpperCase(),
      logo: (
        <TeamShield
          name={liveMatch?.home_team || 'Casa'}
          externalId={String(liveMatch?.match_id || '')}
        />
      ),
    },
    away: {
      name: liveMatch?.away_team || 'Fora',
      shortName: String(liveMatch?.away_team || 'FOR')
        .slice(0, 3)
        .toUpperCase(),
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
