import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { getMatchById } from '@/api/matches';
import { getMatchAnalysis, getSavedMatchAnalysis } from '@/api/analysis';
import { ROUTES } from '@/config/routes';
import TeamShield from '@/components/TeamShield';
import styles from './AnalysisPage.module.css';

export default function AnalysisPage() {
  const { matchId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [match, setMatch] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  const preloadedLiveMatch = location.state?.preloadedLiveMatch ?? null;
  const preloadedAnalysis = location.state?.preloadedAnalysis ?? null;
  const fallbackTeams = location.state?.teams ?? null;

  const stateKey = useMemo(() => {
    return JSON.stringify({
      preloadedMatchId: preloadedLiveMatch?.match_id || null,
      hasPreloadedAnalysis: Boolean(preloadedAnalysis),
      fallbackHome: fallbackTeams?.home?.name || '',
      fallbackAway: fallbackTeams?.away?.name || '',
    });
  }, [preloadedLiveMatch, preloadedAnalysis, fallbackTeams]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');

      try {
        const sameLivePreload =
          preloadedLiveMatch?.match_id &&
          String(preloadedLiveMatch.match_id) === String(matchId);

        const preloadedMatch = sameLivePreload
          ? mapLiveAnalysisToMatch(preloadedLiveMatch)
          : null;

        const initialMatch =
          preloadedMatch ||
          (await getMatchById(matchId)) ||
          buildFallbackMatch(matchId, fallbackTeams);

        const context = toMatchContext(initialMatch);
        let nextAnalysis =
          preloadedAnalysis || (await getSavedMatchAnalysis(matchId, context));

        if (!nextAnalysis) {
          nextAnalysis = await getMatchAnalysis(matchId, context);
        }

        if (cancelled) return;
        setMatch(initialMatch);
        setAnalysis(nextAnalysis);
      } catch (e) {
        console.error('[AnalysisPage] erro ao carregar:', e);
        if (cancelled) return;
        setMatch(buildFallbackMatch(matchId, fallbackTeams));
        setAnalysis(null);
        setError('Nao foi possivel carregar a analise desta partida agora.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [matchId, stateKey]);

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate(ROUTES.HOME);
  }

  const safeMatch = normalizeMatchForUi(match, matchId, fallbackTeams);
  const safeAnalysis = normalizeAnalysisForUi(analysis, safeMatch);

  if (loading) {
    return (
      <div className={styles.page}>
        <AnalysisSkeleton />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <button type="button" onClick={handleBack} className={styles.backLink}>
        ← Voltar
      </button>

      <section className={styles.matchHeader}>
        <div className={styles.headerTop}>
          <span className={styles.league}>{safeMatch.league}</span>
          <span className={styles.liveChip}>
            <span className={styles.liveDot} aria-hidden="true" />
            {safeMatch.minute ? `AO VIVO ${safeMatch.minute}` : 'PRE-JOGO'}
          </span>
        </div>

        <div className={styles.scoreboard}>
          <div className={styles.sbTeam}>
            <span className={styles.sbLogo}>{safeMatch.home.logo}</span>
            <span className={styles.sbName}>{safeMatch.home.name}</span>
          </div>
          <div className={styles.sbScore}>
            <span className={styles.sbNum}>{safeMatch.homeScore}</span>
            <span className={styles.sbSep}>-</span>
            <span className={styles.sbNum}>{safeMatch.awayScore}</span>
          </div>
          <div className={styles.sbTeam}>
            <span className={styles.sbLogo}>{safeMatch.away.logo}</span>
            <span className={styles.sbName}>{safeMatch.away.name}</span>
          </div>
        </div>

        <div className={styles.predContainer}>
          <div className={styles.predBadge}>
            <span className={styles.predLabel}>PREVISAO IA</span>
            <span className={styles.predValue}>
              {safeAnalysis.predictedWinner}
            </span>
            <span className={styles.predConf}>
              {safeAnalysis.confidenceScore}% confianca
            </span>
          </div>

          <div className={styles.betCTAWrapper}>
            <Link to={ROUTES.BETTING(safeMatch.id)} className={styles.betCTA}>
              APOSTAR AGORA
            </Link>
          </div>
        </div>
      </section>

      {error ? <p className={styles.error}>{error}</p> : null}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Leitura da Partida</h2>
        <div className={styles.card}>
          <ul className={styles.commentary}>
            {safeAnalysis.commentary.slice(0, 5).map((line, idx) => (
              <li key={`${idx}-${line}`} className={styles.commentLine}>
                {line}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Probabilidade</h2>
        <div className={styles.card}>
          <SimpleProbability
            label={safeMatch.home.shortName}
            value={safeAnalysis.winProbability.home}
          />
          <SimpleProbability
            label="EMP"
            value={safeAnalysis.winProbability.draw}
          />
          <SimpleProbability
            label={safeMatch.away.shortName}
            value={safeAnalysis.winProbability.away}
          />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Indicadores Rapidos</h2>
        <div className={styles.insightGrid}>
          <MetricCard
            title="Gol proximos 10 min"
            value={safeAnalysis.goalProbabilityNextMinute}
          />
          <MetricCard
            title={`Cartao ${safeMatch.home.shortName}`}
            value={safeAnalysis.cardRiskHome}
          />
          <MetricCard
            title={`Cartao ${safeMatch.away.shortName}`}
            value={safeAnalysis.cardRiskAway}
          />
          <MetricCard title="Penalti" value={safeAnalysis.penaltyRisk} />
          <MetricCard
            title={`Momentum ${safeMatch.home.shortName}`}
            value={safeAnalysis.momentumHome}
          />
          <MetricCard
            title={`Momentum ${safeMatch.away.shortName}`}
            value={safeAnalysis.momentumAway}
          />
        </div>
      </section>
    </div>
  );
}

function SimpleProbability({ label, value }) {
  const safe = clampPct(value);
  return (
    <div className={styles.probRow}>
      <span className={styles.probLabel}>{label}</span>
      <div className={styles.probTrack}>
        <div className={styles.probFill} style={{ width: `${safe}%` }} />
      </div>
      <span className={styles.probValue}>{safe}%</span>
    </div>
  );
}

function MetricCard({ title, value }) {
  const safe = clampPct(value);
  return (
    <div className={styles.metricCard}>
      <span className={styles.metricTitle}>{title}</span>
      <span className={styles.metricValue}>{safe}%</span>
    </div>
  );
}

function toMatchContext(matchData) {
  if (!matchData?.home?.name || !matchData?.away?.name) return null;
  return {
    home: { name: matchData.home.name },
    away: { name: matchData.away.name },
  };
}

function toSafeInt(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n) : fallback;
}

function clampPct(value) {
  const n = toSafeInt(value, 0);
  if (n < 0) return 0;
  if (n > 100) return 100;
  return n;
}

function normalizeMatchForUi(match, matchId, teams) {
  if (!match?.home?.name || !match?.away?.name) {
    return buildFallbackMatch(matchId, teams);
  }

  const homeName = String(match.home.name || 'Time Casa');
  const awayName = String(match.away.name || 'Time Fora');

  return {
    ...match,
    id: String(match.id || matchId || ''),
    league: String(match.league || 'Analise de Partida'),
    minute: String(match.minute || ''),
    homeScore: toSafeInt(match.homeScore, 0),
    awayScore: toSafeInt(match.awayScore, 0),
    home: {
      ...match.home,
      name: homeName,
      shortName: String(match.home.shortName || homeName)
        .slice(0, 3)
        .toUpperCase(),
      logo: match.home.logo || (
        <TeamShield
          name={homeName}
          externalId={`${match.id || matchId || ''}-home`}
        />
      ),
    },
    away: {
      ...match.away,
      name: awayName,
      shortName: String(match.away.shortName || awayName)
        .slice(0, 3)
        .toUpperCase(),
      logo: match.away.logo || (
        <TeamShield
          name={awayName}
          externalId={`${match.id || matchId || ''}-away`}
        />
      ),
    },
  };
}

function normalizeAnalysisForUi(raw, match) {
  const homeTeamName = match?.home?.name || 'Time Casa';

  if (!raw || typeof raw !== 'object') {
    return buildFallbackAnalysis(
      homeTeamName,
      match?.away?.name || 'Time Fora',
    );
  }

  const win = raw.winProbability || raw.win_probability || {};
  const commentary = Array.isArray(raw.commentary)
    ? raw.commentary
    : typeof raw.commentary === 'string'
      ? [raw.commentary]
      : [];

  return {
    winProbability: {
      home: clampPct(win.home ?? 34),
      draw: clampPct(win.draw ?? 32),
      away: clampPct(win.away ?? 34),
    },
    confidenceScore: clampPct(raw.confidenceScore ?? raw.confidence ?? 52),
    predictedWinner: String(
      raw.predictedWinner || raw.prediction || homeTeamName,
    ),
    commentary:
      commentary.length > 0
        ? commentary.map((line) => String(line)).filter(Boolean)
        : [
            `${homeTeamName} tem leve vantagem no cenario atual, mas a entrada pede controle de risco.`,
            'Mercado principal depende do ritmo de finalizacao e do momento da partida.',
          ],
    goalProbabilityNextMinute: clampPct(raw.goalProbabilityNextMinute ?? 42),
    cardRiskHome: clampPct(raw.cardRiskHome ?? 38),
    cardRiskAway: clampPct(raw.cardRiskAway ?? raw.cardRisskAway ?? 36),
    penaltyRisk: clampPct(raw.penaltyRisk ?? 18),
    momentumHome: clampPct(raw.momentumHome ?? 51),
    momentumAway: clampPct(raw.momentumAway ?? 49),
  };
}

function buildFallbackAnalysis(homeName, awayName) {
  return {
    winProbability: { home: 34, draw: 32, away: 34 },
    confidenceScore: 52,
    predictedWinner: homeName,
    commentary: [
      `Analise de ${homeName} x ${awayName} em modo simplificado.`,
      'Use stake controlada e priorize mercados com linha de protecao.',
    ],
    goalProbabilityNextMinute: 42,
    cardRiskHome: 38,
    cardRiskAway: 36,
    penaltyRisk: 18,
    momentumHome: 51,
    momentumAway: 49,
  };
}

function buildFallbackMatch(matchId, teams) {
  const homeName = teams?.home?.name || 'Time Casa';
  const awayName = teams?.away?.name || 'Time Fora';
  const safeId = String(matchId || 'fallback-match');

  return {
    id: safeId,
    league: 'Analise de Partida',
    minute: '',
    homeScore: 0,
    awayScore: 0,
    home: {
      name: homeName,
      shortName: String(homeName).slice(0, 3).toUpperCase(),
      logo: (
        <TeamShield name={homeName} externalId={`${safeId}-home-fallback`} />
      ),
    },
    away: {
      name: awayName,
      shortName: String(awayName).slice(0, 3).toUpperCase(),
      logo: (
        <TeamShield name={awayName} externalId={`${safeId}-away-fallback`} />
      ),
    },
  };
}

function mapLiveAnalysisToMatch(liveMatch) {
  const matchId = String(liveMatch?.match_id || '');
  const homeName = liveMatch?.home_team || 'Casa';
  const awayName = liveMatch?.away_team || 'Fora';
  const minuteRaw = liveMatch?.live_data?.minute;
  const minute = minuteRaw == null ? '' : String(minuteRaw).replace(/\s+/g, '');

  return {
    id: matchId,
    league: String(liveMatch?.league_name || 'Partida em andamento'),
    minute: minute ? `${minute}'` : '',
    homeScore: toSafeInt(liveMatch?.live_data?.home_score, 0),
    awayScore: toSafeInt(liveMatch?.live_data?.away_score, 0),
    home: {
      name: homeName,
      shortName: String(homeName).slice(0, 3).toUpperCase(),
      logo: <TeamShield name={homeName} externalId={`${matchId}-home`} />,
    },
    away: {
      name: awayName,
      shortName: String(awayName).slice(0, 3).toUpperCase(),
      logo: <TeamShield name={awayName} externalId={`${matchId}-away`} />,
    },
  };
}

function AnalysisSkeleton() {
  return (
    <>
      <div
        className={`skeleton ${styles.skH}`}
        style={{ height: 170, borderRadius: 16 }}
      />
      <div
        className={`skeleton ${styles.skH}`}
        style={{ height: 120, borderRadius: 12 }}
      />
      <div
        className={`skeleton ${styles.skH}`}
        style={{ height: 120, borderRadius: 12 }}
      />
      <div
        className={`skeleton ${styles.skH}`}
        style={{ height: 160, borderRadius: 12 }}
      />
    </>
  );
}
