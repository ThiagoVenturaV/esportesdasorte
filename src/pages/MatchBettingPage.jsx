import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getMatchById } from '@/api/matches';
import { useBetSlip } from '@/components/BetSlip/BetSlipContext';
import styles from './MatchBettingPage.module.css';
import { SoccerIcon, ChevronLeftIcon } from '@/components/Icons';

/**
 * MatchBettingPage — Detailed betting options for a specific match.
 * Replicates the experience of a sportsbook "fixture detail" page.
 */
export default function MatchBettingPage() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { toggleSelection, selections } = useBetSlip();
  
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('PRINCIPAIS');

  useEffect(() => {
    setLoading(true);
    getMatchById(matchId).then((data) => {
      setMatch(data);
      setLoading(false);
    });
  }, [matchId]);

  if (loading) return <div className={styles.loading}>Carregando opções...</div>;
  if (!match) return <div className={styles.error}>Partida não encontrada.</div>;

  const handleSelection = (market, pick) => {
    const selection = {
      id: `${match.id}-${market.id}-${pick.label}`,
      matchName: `${match.home.name} vs ${match.away.name}`,
      market: market.name,
      pick: pick.label,
      odd: pick.odd
    };
    toggleSelection(selection);
  };

  const isSelected = (market, pick) => {
    const selectionId = `${match.id}-${market.id}-${pick.label}`;
    return selections.some(s => s.id === selectionId);
  };

  // Filter markets by active tab
  const filteredMarkets = match.markets?.filter(m => m.category === activeTab) || [];

  const TABS = [
    { id: 'PRINCIPAIS', label: 'PRINCIPAIS' },
    { id: 'GOLS', label: 'GOLS' },
    { id: 'HANDICAP', label: 'HANDICAP' },
    { id: 'ESCANTEIOS', label: 'ESCANTEIOS' },
    { id: 'COMBOS', label: 'COMBOS' },
  ];

  return (
    <div className={styles.page}>
      {/* Header with Back Button and Match Info */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <ChevronLeftIcon /> Voltar
        </button>
        
        <div className={styles.matchHero}>
          <div className={styles.leagueName}>{match.league}</div>
          <div className={styles.teamsRow}>
            <div className={styles.team}>
              <div className={styles.shield}>{match.home.logo}</div>
              <span className={styles.name}>{match.home.name}</span>
            </div>
            <div className={styles.scoreArea}>
              <div className={styles.score}>
                {match.status === 'live' ? `${match.homeScore} - ${match.awayScore}` : 'vs'}
              </div>
              <div className={styles.time}>{match.minute}</div>
            </div>
            <div className={styles.team}>
              <div className={styles.shield}>{match.away.logo}</div>
              <span className={styles.name}>{match.away.name}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Market Menu Tabs */}
      <nav className={styles.marketTabs}>
        {TABS.map((tab) => (
          <button 
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Markets List */}
      <div className={styles.marketsList}>
        {filteredMarkets.length > 0 ? (
          filteredMarkets.map((market) => (
            <MarketSection 
              key={market.id} 
              market={market} 
              onSelect={handleSelection}
              isSelected={isSelected}
            />
          ))
        ) : (
          <div className={styles.noMarkets}>
            Não há mercados de {activeTab.toLowerCase()} disponíveis no momento para este evento.
          </div>
        )}
      </div>
    </div>
  );
}

function MarketSection({ market, onSelect, isSelected }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <section className={styles.market}>
      <div className={styles.marketHeader} onClick={() => setIsOpen(!isOpen)}>
        <h3 className={styles.marketTitle}>{market.name}</h3>
        <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </span>
      </div>
      
      {isOpen && (
        <div className={styles.selectionsGrid} style={{ gridTemplateColumns: `repeat(${Math.min(market.selections.length, 3)}, 1fr)` }}>
          {market.selections.map((pick, i) => (
            <button 
              key={i} 
              className={`${styles.oddBtn} ${isSelected(market, pick) ? styles.selected : ''}`}
              onClick={() => onSelect(market, pick)}
            >
              <span className={styles.label}>{pick.label}</span>
              <span className={styles.odd}>{pick.odd.toFixed(2)}</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
