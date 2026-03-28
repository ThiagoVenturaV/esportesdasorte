import styles from './Footer.module.css';
import { ROUTES } from '@/config/routes';
import { Link } from 'react-router-dom';
import logoSvg from '@/logo.svg';

/**
 * Footer — Updated with official social links and logo.
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        
        {/* Top Section: Logo & Socials */}
        <div className={styles.top}>
          <div className={styles.footerLogo}>
            <img src={logoSvg} alt="Esportes da Sorte" className={styles.logoImg} />
          </div>
          <div className={styles.socials}>
            {/* Social Media links (official EDS links) */}
            <a 
              href="https://www.instagram.com/esportesdasorte/" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.socialLink} 
              aria-label="Instagram"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
            
            <a 
              href="https://twitter.com/EsportesDaSorte" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.socialLink} 
              aria-label="X (Twitter)"
            >
              <svg width="20" height="20" viewBox="0 0 512 512" fill="currentColor">
                <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8l164.9-188.5L26.8 48h145.6l100.5 132.9L389.2 48zm-24.8 373.8h39.1L151.1 88h-42l255.3 333.8z"/>
              </svg>
            </a>
            
            <a 
              href="https://www.youtube.com/channel/UChPJ1sa8VV_qduNeO-6wV4A" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.socialLink} 
              aria-label="YouTube"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.11 1 12 1 12s0 3.89.46 5.58a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.89 23 12 23 12s0-3.89-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>
            </a>
          </div>
        </div>

        {/* Partners Section */}
        <div className={styles.partners}>
          <div className={styles.partnerTrack}>
            <span className={styles.partnerItem}>CRUZEIRO</span>
            <span className={styles.partnerItem}>GRÊMIO</span>
            <span className={styles.partnerItem}>BAHIA</span>
            <span className={styles.partnerItem}>SPORT</span>
            <span className={styles.partnerItem}>CEARÁ</span>
            <span className={styles.partnerItem}>AMÉRICA-MG</span>
          </div>
        </div>

        <div className={styles.divider} />

        {/* Middle Section: Navigation Menus */}
        <div className={styles.menus}>
          <div className={styles.column}>
            <h6 className={styles.title}>SOBRE NÓS</h6>
            <ul className={styles.list}>
              <li><Link to="#">Quem Somos</Link></li>
              <li><Link to="#">Blog Oficial</Link></li>
              <li><Link to="#">Trabalhe Conosco</Link></li>
              <li><Link to="#">Regras Gerais</Link></li>
            </ul>
          </div>

          <div className={styles.column}>
            <h6 className={styles.title}>SUPORTE</h6>
            <ul className={styles.list}>
              <li><Link to="#">Central de Ajuda</Link></li>
              <li><Link to="#">Chat ao Vivo</Link></li>
              <li><Link to="#">Email de Suporte</Link></li>
              <li><Link to="#">Denunciar Abuso</Link></li>
            </ul>
          </div>

          <div className={styles.column}>
            <h6 className={styles.title}>EXPLORAR</h6>
            <ul className={styles.list}>
              <li><Link to={ROUTES.HOME}>Campeonatos</Link></li>
              <li><Link to={ROUTES.LIVE}>Análise em Tempo Real</Link></li>
              <li><Link to={ROUTES.APOSTAS}>Calculadora de Odds</Link></li>
              <li><Link to="#">Scripts Exclusivos</Link></li>
            </ul>
          </div>

          <div className={styles.column}>
            <h6 className={styles.title}>LEGAL</h6>
            <ul className={styles.list}>
              <li><Link to="#">Privacidade</Link></li>
              <li><Link to="#">Termos de Uso</Link></li>
              <li><Link to="#">Jogo Responsável</Link></li>
              <li><Link to="#">Cookies</Link></li>
            </ul>
          </div>
        </div>

        {/* Responsible Gaming & Security badges */}
        <div className={styles.trustSection}>
          <div className={styles.badgeGroup}>
            <span className={styles.ageBadge}>18+</span>
            <div className={styles.badge_partner}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span>Jogo Seguro</span>
            </div>
            <div className={styles.badge_partner}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              <span>SSL Advanced</span>
            </div>
          </div>
        </div>

        {/* Bottom Section: Copyright */}
        <div className={styles.bottom}>
          <p className={styles.copy}>
            &copy; {currentYear} EDScript. A gente aposta na sua evolução.
          </p>
          <div className={styles.payments}>
            <div className={styles.payIcon}>PIX</div>
            <div className={styles.payIcon}>VISA</div>
            <div className={styles.payIcon}>MASTER</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
