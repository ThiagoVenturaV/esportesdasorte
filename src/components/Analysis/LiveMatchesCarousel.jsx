import { useEffect, useState } from 'react';
import { BACKEND_URL } from '@/config/backend';
import styles from './LiveMatchesCarousel.module.css';

export default function LiveMatchesCarousel() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchLiveAnalyses = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BACKEND_URL}/api/analises-ao-vivo`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        if (mounted && data?.sucesso && Array.isArray(data.analises)) {
          setAnalyses(data.analises);
        }
      } catch (error) {
        console.error('Erro ao buscar analises ao vivo:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchLiveAnalyses();
    const intervalId = setInterval(fetchLiveAnalyses, 120000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, []);

  if (loading && analyses.length === 0) {
    return (
      <section className={styles.stateBox}>Carregando jogos ao vivo...</section>
    );
  }

  if (analyses.length === 0) {
    return (
      <section className={styles.stateBox}>
        Nenhum jogo ao vivo disponivel.
      </section>
    );
  }

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Jogos Ao Vivo</h2>
      </div>
      <div className={styles.carousel}>
        {analyses.map((match) => {
          const analysis = match.analysis || {};
          const win = analysis.winProbability || {};
          const comments = Array.isArray(analysis.commentary)
            ? analysis.commentary
            : [];

          return (
            <article key={match.match_id} className={styles.card}>
              <div className={styles.teams}>
                <span>{match.home_team}</span>
                <strong>
                  {match.live_data?.home_score ?? 0}-
                  {match.live_data?.away_score ?? 0}
                </strong>
                <span>{match.away_team}</span>
              </div>

              <div className={styles.minute}>
                Minuto: {match.live_data?.minute ?? 0}
              </div>

              <div className={styles.probabilities}>
                <span>Casa: {win.home ?? 0}%</span>
                <span>Empate: {win.draw ?? 0}%</span>
                <span>Fora: {win.away ?? 0}%</span>
              </div>

              <p className={styles.comment}>
                {comments[0] || 'Analise em atualizacao para esta partida.'}
              </p>

              <div className={styles.confidence}>
                Confianca: {analysis.confidenceScore ?? 0}%
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
