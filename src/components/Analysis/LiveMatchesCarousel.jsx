import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { BACKEND_URL } from '@/config/backend';
import { useBetSlip } from '@/components/BetSlip/BetSlipContext';
import { ROUTES } from '@/config/routes';
import styles from './LiveMatchesCarousel.module.css';

/**
 * LiveMatchesCarousel — Exibe análises ao vivo do backend (compartilhadas entre todos os usuários).
 * Usa /api/analises-salvas (rápido, do DB) com fallback para /api/analises-ao-vivo.
 */
export default function LiveMatchesCarousel() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toggleSelection, selections } = useBetSlip();

  const fetchAnalyses = useCallback(async () => {
    try {
      setLoading(true);
      // Tenta primeiro o endpoint rápido (do banco)
      let response = await fetch(`${BACKEND_URL}/api/analises-salvas`);
      if (!response.ok) {
        // Fallback para o endpoint que processa ao vivo
        response = await fetch(`${BACKEND_URL}/api/analises-ao-vivo`);
      }
      const data = await response.json();
      if (data?.sucesso && Array.isArray(data.analises) && data.analises.length > 0) {
        setAnalyses(data.analises);
      }
    } catch (error) {
      console.error('[LiveCarousel] Erro ao buscar análises:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalyses();
    const interval = setInterval(fetchAnalyses, 120_000); // Atualiza a cada 2 min
    return () => clearInterval(interval);
  }, [fetchAnalyses]);

  if (loading && analyses.length === 0) {
    return (
      <section className={styles.stateBox}>
        <span className={styles.spinner} /> Carregando jogos ao vivo...
      </section>
    );
  }

  if (!loading && analyses.length === 0) {
    return (
      <section className={styles.stateBox}>
        Nenhum jogo ao vivo disponível no momento.
      </section>
    );
  }

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <span className={styles.liveDot} aria-hidden="true" /> Jogos Ao Vivo — Análise IA
        </h2>
        <span className={styles.powered}>Edson AI</span>
      </div>

      <div className={styles.carousel}>
        {analyses.map((match) => {
          const analysis = match.analysis || {};
          const win = analysis.winProbability || {};
          const comments = Array.isArray(analysis.commentary) ? analysis.commentary : [];
          const confidence = analysis.confidenceScore ?? 0;
          const predicted = analysis.predictedWinner || '';

          // Verifica se essa sugestão já está no slip
          const betId = `live-${match.match_id}-${predicted}`;
          const isSelected = selections.some(s => s.id === betId);

          const handleBet = (e) => {
            e.preventDefault();
            e.stopPropagation();

            // Calcula odds aproximadas com base na probabilidade vencedora
            const probs = [win.home ?? 33, win.draw ?? 33, win.away ?? 34];
            const maxProb = Math.max(...probs);
            const impliedOdds = maxProb > 0 ? +(100 / maxProb).toFixed(2) : 1.95;

            toggleSelection({
              id: betId,
              matchName: `${match.home_team} vs ${match.away_team}`,
              market: 'Resultado Final',
              pick: predicted,
              odd: impliedOdds,
            });
          };

          return (
            <Link
              key={match.match_id}
              to={ROUTES.ANALYSIS(match.match_id)}
              className={styles.card}
              aria-label={`Ver análise de ${match.home_team} vs ${match.away_team}`}
            >
              {/* Score Header */}
              <div className={styles.teams}>
                <span className={styles.teamName}>{match.home_team}</span>
                <strong className={styles.score}>
                  {match.live_data?.home_score ?? 0}
                  <span className={styles.scoreSep}>-</span>
                  {match.live_data?.away_score ?? 0}
                </strong>
                <span className={styles.teamName}>{match.away_team}</span>
              </div>

              <div className={styles.minute}>
                ⏱ {match.live_data?.minute ?? 0}'
              </div>

              {/* Probabilidades */}
              <div className={styles.probabilities}>
                <div className={styles.prob}>
                  <span className={styles.probLabel}>Casa</span>
                  <span className={styles.probValue}>{win.home ?? 0}%</span>
                </div>
                <div className={styles.prob}>
                  <span className={styles.probLabel}>Empate</span>
                  <span className={styles.probValue}>{win.draw ?? 0}%</span>
                </div>
                <div className={styles.prob}>
                  <span className={styles.probLabel}>Fora</span>
                  <span className={styles.probValue}>{win.away ?? 0}%</span>
                </div>
              </div>

              {/* Comentário IA */}
              {comments[0] && (
                <p className={styles.comment}>{comments[0]}</p>
              )}

              {/* Rodapé: confiança + CTA */}
              <div className={styles.footer}>
                <span className={styles.confidence}>
                  🎯 Confiança: <strong>{confidence}%</strong>
                </span>

                {predicted && predicted !== 'Empate' ? (
                  <button
                    className={`${styles.betBtn} ${isSelected ? styles.betBtnActive : ''}`}
                    onClick={handleBet}
                    aria-label={`Apostar em ${predicted}`}
                  >
                    {isSelected ? '✓ ADICIONADO' : `APOSTAR — ${predicted}`}
                  </button>
                ) : (
                  <span className={styles.viewAnalysis}>Ver Análise →</span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
