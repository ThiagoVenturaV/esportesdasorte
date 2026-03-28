import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import {
  clearCurrentUser,
  getCurrentUser,
  onAuthChange,
} from '@/services/userSession';
import styles from './TopBar.module.css';
import logoSvg from '@/logo.svg';

/**
 * TopBar — Fixed top navigation bar
 * Mobile: hamburger + logo + account
 * Desktop (≥768px): logo + inline nav links + account
 * @param {{ onMenuClick: () => void }} props
 */
export default function TopBar({ onMenuClick }) {
  const [accountOpen, setAccountOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const accountRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(e) {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthChange(() => {
      setCurrentUser(getCurrentUser());
    });
    return unsubscribe;
  }, []);

  const handleLogout = () => {
    clearCurrentUser();
    setAccountOpen(false);
    navigate(ROUTES.HOME);
  };

  const displayName =
    currentUser?.nome_usuario || currentUser?.nome || currentUser?.name || '';

  const initials = displayName
    ? displayName
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() || '')
        .join('')
    : 'U';

  return (
    <header className={styles.bar} role="banner">
      {/* Hamburger — mobile only */}
      <button
        className={`${styles.iconBtn} ${styles.menuBtn}`}
        onClick={onMenuClick}
        aria-label="Abrir menu"
        aria-haspopup="dialog"
      >
        <MenuIcon />
      </button>

      <Link
        to={ROUTES.HOME}
        className={styles.logo}
        aria-label="Esportes da Sorte — Início"
      >
        <img src={logoSvg} alt="Esportes da Sorte" height={32} />
      </Link>

      {/* Desktop inline navigation — hidden on mobile, shown ≥768px */}
      <nav
        className={styles.desktopNav}
        aria-label="Navegação principal desktop"
      >
        <NavLink
          to={ROUTES.HOME}
          end
          className={({ isActive }) =>
            `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
          }
        >
          HOME
        </NavLink>
        <NavLink
          to={ROUTES.LIVE}
          className={({ isActive }) =>
            `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
          }
        >
          LIVE
        </NavLink>
        <NavLink
          to={ROUTES.APOSTAS}
          className={({ isActive }) =>
            `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
          }
        >
          APOSTAS
        </NavLink>
      </nav>

      {/* Account dropdown */}
      <div className={styles.accountWrap} ref={accountRef}>
        <button
          className={`${styles.iconBtn} ${displayName ? styles.accountBtnLogged : ''}`}
          onClick={() => setAccountOpen((v) => !v)}
          aria-label="Minha conta"
          aria-haspopup="true"
          aria-expanded={accountOpen}
        >
          {displayName ? (
            <span className={styles.profileBadge}>
              <span className={styles.profileAvatar}>{initials}</span>
              <span className={styles.profileName}>{displayName}</span>
            </span>
          ) : (
            <UserIcon />
          )}
        </button>

        {accountOpen && (
          <div className={styles.dropdown} role="menu">
            {currentUser ? (
              <>
                <Link
                  to={ROUTES.ACCOUNT}
                  className={styles.dropdownItem}
                  role="menuitem"
                  onClick={() => setAccountOpen(false)}
                >
                  <RegisterIcon />
                  Minha Conta
                </Link>
                <Link
                  to={ROUTES.ACCOUNT_SECURITY}
                  className={styles.dropdownItem}
                  role="menuitem"
                  onClick={() => setAccountOpen(false)}
                >
                  <LoginIcon />
                  Segurança
                </Link>
                <button
                  type="button"
                  className={styles.dropdownItem}
                  role="menuitem"
                  onClick={handleLogout}
                >
                  <LogoutIcon />
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link
                  to={ROUTES.LOGIN}
                  state={{ backgroundLocation: location }}
                  className={styles.dropdownItem}
                  role="menuitem"
                  onClick={() => setAccountOpen(false)}
                >
                  <LoginIcon />
                  Entrar
                </Link>
                <Link
                  to={ROUTES.REGISTER}
                  state={{ backgroundLocation: location }}
                  className={styles.dropdownItem}
                  role="menuitem"
                  onClick={() => setAccountOpen(false)}
                >
                  <RegisterIcon />
                  Cadastrar-se
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

function MenuIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      aria-hidden="true"
    >
      <rect x="2" y="5" width="18" height="2" rx="1" fill="currentColor" />
      <rect x="2" y="10" width="18" height="2" rx="1" fill="currentColor" />
      <rect x="2" y="15" width="18" height="2" rx="1" fill="currentColor" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="11" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
      <path
        d="M3 20c0-4 3.6-7 8-7s8 3 8 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LoginIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" y1="12" x2="3" y2="12" />
    </svg>
  );
}

function RegisterIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
