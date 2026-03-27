import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useRef } from 'react';
import { ROUTES } from '@/config/routes';
import styles from './RegisterForm.module.css';

/**
 * RegisterForm - Improved UX with Enter key navigation.
 */
export default function RegisterForm() {
  const location = useLocation();
  const inputRefs = useRef([]);

  const fields = [
    { label: 'NOME COMPLETO', placeholder: 'NOME COMPLETO', type: 'text', Icon: UserIcon },
    { label: 'ENDEREÇO DE E-MAIL', placeholder: 'Endereço de E-mail', type: 'email', Icon: MailIcon },
    { label: 'CPF', placeholder: '000.000.000-00', type: 'text', Icon: ShieldIcon },
    { label: 'NÚMERO DE CELULAR', placeholder: 'NÚMERO DE CELULAR', type: 'tel', Icon: PhoneIcon },
    { label: 'CRIAR SENHA', placeholder: 'Password', type: 'password', Icon: LockIcon },
    { label: 'CONFIRME SUA SENHA', placeholder: '........', type: 'password', Icon: ShieldIcon },
  ];

  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      const nextIndex = index + 1;
      if (nextIndex < fields.length) {
        e.preventDefault();
        inputRefs.current[nextIndex].focus();
      }
      // Last field will submit the form automatically via browser default (form onSubmit)
    }
  };
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, logic to save user...
    // Redirect to success page preserving the backgroundLocation if any
    navigate(ROUTES.REGISTER_SUCCESS, { 
      state: { backgroundLocation: location.state?.backgroundLocation || location } 
    });
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logoWrap}>
          <Link to={ROUTES.HOME} aria-label="Voltar para o início">
            <img src="/LogoLogin.svg" alt="Esportes da Sorte" className={styles.logo} />
          </Link>
        </div>
        <h1 className={styles.title}>CADASTRAR-SE</h1>
      </header>

      <form className={styles.form} onSubmit={handleSubmit}>
        {fields.map((field, i) => (
          <div key={i} className={styles.inputGroup}>
            <label className={styles.label}>{field.label}</label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}><field.Icon /></span>
              <input
                ref={(el) => (inputRefs.current[i] = el)}
                type={field.type}
                placeholder={field.placeholder}
                className={styles.input}
                onKeyDown={(e) => handleKeyDown(e, i)}
                autoFocus={i === 0}
              />
            </div>
          </div>
        ))}

        <button type="submit" className={styles.submitBtn}>
          CRIAR CONTA
        </button>

        <div className={styles.links}>
          <Link to={ROUTES.LOGIN} state={{ backgroundLocation: location.state?.backgroundLocation || location }} className={styles.link}>JÁ TEM CONTA? LOGIN</Link>
        </div>
      </form>

      <footer className={styles.footer}>
        {/* Footer content if any */}
      </footer>
    </div>
  );
}

// Icons
function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
      <polyline points="22,6 12,13 2,6"></polyline>
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
      <line x1="12" y1="18" x2="12.01" y2="18"></line>
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
  );
}
