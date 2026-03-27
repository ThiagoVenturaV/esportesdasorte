import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ROUTES } from '@/config/routes';
import styles from './LoginForm.module.css';

/**
 * RegisterSuccessForm - Celebration and directions after a successful registration.
 */
export default function RegisterSuccessForm() {
  const location = useLocation();

  return (
    <motion.div 
      className={styles.container}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <header className={styles.header}>
        <div className={styles.logoWrap}>
          <Link to={ROUTES.HOME} aria-label="Voltar para o início">
            <img src="/LogoLogin.svg" alt="Esportes da Sorte" className={styles.logo} />
          </Link>
        </div>
        <motion.h1 
          className={styles.title} 
          style={{ color: 'var(--color-accent)', letterSpacing: '2px' }}
          initial={{ y: -10 }}
          animate={{ y: 0 }}
        >
          SUCESSO!
        </motion.h1>
      </header>

      <div className={styles.successContent} style={{ textAlign: 'center', padding: 'var(--space-8) 0' }}>
        <motion.div 
          style={{ 
            fontSize: '80px', 
            marginBottom: 'var(--space-6)', 
            filter: 'drop-shadow(0 0 20px var(--color-accent-60))'
          }}
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
        >
          ✅
        </motion.div>
        
        <h2 style={{ 
          fontSize: 'var(--font-size-xl)', 
          fontWeight: '700',
          marginBottom: 'var(--space-3)',
          background: 'linear-gradient(to right, #fff, var(--color-accent))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          CONTA CRIADA COM ÊXITO!
        </h2>
        
        <p style={{ 
          color: 'var(--color-text-secondary)', 
          fontSize: 'var(--font-size-md)', 
          lineHeight: '1.6',
          maxWidth: '300px',
          margin: '0 auto'
        }}>
          Seja bem-vindo à elite dos scripts esportivos. 
          Sua jornada para o <strong>green</strong> começa agora!
        </p>
      </div>

      <div className={styles.actions} style={{ marginTop: 'var(--space-4)' }}>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Link 
            to={ROUTES.LOGIN} 
            state={{ backgroundLocation: location.state?.backgroundLocation || location }}
            className={styles.submitBtn} 
            style={{ 
              textDecoration: 'none', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontWeight: '700',
              boxShadow: '0 8px 30px var(--color-accent-40)'
            }}
          >
            IR PARA O LOGIN
          </Link>
        </motion.div>
        
        <div className={styles.links} style={{ justifyContent: 'center', marginTop: 'var(--space-6)' }}>
          <Link to={ROUTES.HOME} className={styles.link} style={{ opacity: 0.7 }}>
            VOLTAR PARA A HOME
          </Link>
        </div>
      </div>
      
      <footer className={styles.footer} style={{ marginTop: 'var(--space-10)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 'var(--space-4)' }}>
        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'flex', gap: '12px', justifyContent: 'center', textTransform: 'uppercase', letterSpacing: '1px' }}>
          <span>Jogo Seguro</span>
          <span>•</span>
          <span>18+</span>
        </div>
      </footer>
    </motion.div>
  );
}
