import { NavLink } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import styles from './BottomNav.module.css';

const NAV_ITEMS = [
  { to: ROUTES.HOME,    label: 'HOME',    Icon: HomeIcon    },
  { to: ROUTES.LIVE,    label: 'LIVE',    Icon: LiveIcon    },
  { to: ROUTES.LIVE_ANALYSIS, label: 'IA', Icon: AIAnalysisIcon },
  { to: ROUTES.APOSTAS, label: 'APOSTAS', Icon: BetIcon     },
];

/**
 * BottomNav — Fixed bottom navigation
 * Uses NavLink for automatic active state styling.
 */
export default function BottomNav() {
  return (
    <nav className={styles.nav} aria-label="Navegação principal">
      {NAV_ITEMS.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === ROUTES.HOME}
          className={({ isActive }) =>
            `${styles.item} ${isActive ? styles.active : ''}`
          }
          aria-label={label}
        >
          {({ isActive }) => (
            <>
              <span className={styles.iconWrap}>
                {label === 'LIVE' && isActive && (
                  <span className={styles.livePulse} aria-hidden="true" />
                )}
                <Icon active={isActive} />
              </span>
              <span className={styles.label}>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

function HomeIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path
        d="M3 10.5L11 3l8 7.5V20a1 1 0 01-1 1H14v-5H8v5H4a1 1 0 01-1-1v-9.5z"
        fill={active ? '#38E67D' : 'none'}
        stroke={active ? '#38E67D' : 'currentColor'}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LiveIcon({ active }) {
  const color = active ? '#38E67D' : 'currentColor';
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="2" fill={color} />
      <path d="M16 8a5 5 0 010 8" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M8 16a5 5 0 010-8" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M19.5 5.5a9 9 0 010 13" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <path d="M4.5 18.5a9 9 0 010-13" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

function BetIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="16" height="13" rx="2"
        fill={active ? '#38E67D' : 'none'}
        stroke={active ? '#38E67D' : 'currentColor'}
        strokeWidth="1.5"/>
      <path d="M7 5V4a4 4 0 018 0v1" stroke={active ? '#38E67D' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
function AIAnalysisIcon({ active }) {
  const color = active ? '#38E67D' : 'currentColor';
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}
