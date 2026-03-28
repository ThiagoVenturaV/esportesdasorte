import { useNavigate } from 'react-router-dom';
import styles from './RightSidebar.module.css';
import { SoccerIcon, BasketballIcon } from '../Icons';
import { ROUTES } from '@/config/routes';

const POPULAR_LEAGUES = [
  { id: 'bra-a', name: 'Brasileirão Série A', filter: 'Brasileirão Série A', flag: 'br', icon: <SoccerIcon />, type: 'soccer' },
  { id: 'bra-ne', name: 'Copa do Nordeste', filter: 'Copa do Nordeste', flag: 'br', icon: <SoccerIcon />, type: 'soccer' },
  { id: 'uefa-cl', name: 'UEFA Champions League', filter: 'UEFA Champions League', flag: 'eu', icon: <SoccerIcon />, type: 'soccer' },
  { id: 'prem', name: 'Premier League', filter: 'Premier League', flag: 'gb-eng', icon: <SoccerIcon />, type: 'soccer' },
  { id: 'nba', name: 'NBA', filter: 'NBA', flag: 'us', icon: <BasketballIcon />, type: 'basketball' },
  { id: 'esp', name: 'LaLiga Espanha', filter: 'LaLiga Espanha', flag: 'es', icon: <SoccerIcon />, type: 'soccer' },
  { id: 'ger', name: 'Bundesliga Alemanha', filter: 'Bundesliga Alemanha', flag: 'de', icon: <SoccerIcon />, type: 'soccer' },
  { id: 'fra', name: 'Liga 1 França', filter: 'Liga 1 França', flag: 'fr', icon: <SoccerIcon />, type: 'soccer' },
  { id: 'ita', name: 'Serie A Italia', filter: 'Serie A Italia', flag: 'it', icon: <SoccerIcon />, type: 'soccer' },
  { id: 'por', name: '1º Liga Portugal', filter: '1º Liga Portugal', flag: 'pt', icon: <SoccerIcon />, type: 'soccer' },
];

/**
 * RightSidebar — Displays Popular Leagues with functional links and CDN flags.
 */
export default function RightSidebar() {
  const navigate = useNavigate();

  const handleLeagueClick = (league) => {
    // Navigate to LivePage with league filter
    navigate(`${ROUTES.LIVE}?league=${encodeURIComponent(league.filter)}&sport=${league.type}`);
  };

  return (
    <aside className={styles.sidebar} aria-label="Ligas Populares">
      <div className={styles.scrollArea}>
        <div className={styles.section}>
          <div className={styles.header}>
            <span className={styles.headerTitle}>Ligas Populares</span>
            <ChevronDownIcon />
          </div>
          
          <ul className={styles.leagueList}>
            {POPULAR_LEAGUES.map((league) => (
              <li 
                key={league.id} 
                className={styles.leagueItem}
                onClick={() => handleLeagueClick(league)}
              >
                <div className={styles.leagueLeft}>
                  <div className={styles.flagWrap}>
                    {league.flag ? (
                      <img 
                        src={`https://flagcdn.com/w40/${league.flag}.png`} 
                        alt="" 
                        className={styles.flagImg}
                      />
                    ) : (
                      <div className={styles.flagPlaceholder}>
                        <SoccerIcon />
                      </div>
                    )}
                  </div>
                  <span className={styles.leagueName}>{league.name}</span>
                </div>
                <span className={styles.sportIcon}>{league.icon}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}

function StarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  );
}
