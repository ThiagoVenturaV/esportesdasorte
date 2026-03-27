import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { BRAND } from '@/config/brand';
import styles from './SideMenu.module.css';
import logoSvg from '@/logo.svg';

/**
 * SideMenu — Slide-in navigation drawer
 * @param {{ isOpen: boolean, onClose: () => void }} props
 */
export default function SideMenu({ isOpen, onClose }) {
  // Trap focus and block scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />
          {/* Drawer */}
          <motion.aside
            className={styles.drawer}
            role="dialog"
            aria-label="Menu de navegação"
            aria-modal="true"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          >
            {/* Header */}
            <div className={styles.header}>
              <img src={logoSvg} alt="EDScript Logo" height={32} />
              <button
                className={styles.closeBtn}
                onClick={onClose}
                aria-label="Fechar menu"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Search */}
            <div className={styles.searchWrap}>
              <SearchIcon />
              <input
                type="search"
                placeholder="Buscar..."
                className={styles.searchInput}
                aria-label="Buscar partidas e esportes"
              />
            </div>

            {/* Navigation */}
            <nav className={styles.navList} aria-label="Esportes">
              <MenuLink to={ROUTES.HOME} label="Home" icon={<HomeIcon />} onClick={onClose} />
              {BRAND.sports.map((sport) => (
                <MenuLink
                  key={sport.id}
                  to={`${ROUTES.LIVE}?sport=${sport.id}`}
                  label={sport.label}
                  icon={<span className={styles.emoji}>{sport.emoji}</span>}
                  onClick={onClose}
                />
              ))}
              <MenuLink 
                to="#promocoes" 
                label="Promoções (Em breve)" 
                icon={<PromoIcon />} 
                onClick={(e) => {
                  e.preventDefault();
                  alert('Promoções serão adicionadas em breve!');
                  onClose();
                }} 
              />
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function MenuLink({ to, label, icon, onClick }) {
  return (
    <Link to={to} className={styles.navItem} onClick={onClick}>
      <span className={styles.navIcon}>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
function HomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path d="M3 10.5L11 3l8 7.5V20a1 1 0 01-1 1H14v-5H8v5H4a1 1 0 01-1-1v-9.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
}
function PromoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <rect x="2" y="7" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M15 7V6a4 4 0 00-8 0v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
