import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import styles from './ForgotPasswordForm.module.css';

export default function ForgotPasswordForm() {
  const location = useLocation();
  const [method, setMethod] = useState('email'); // 'email' | 'phone'
  const [sent, setSent] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logoWrap}>
          <Link to={ROUTES.HOME} aria-label="Voltar para o início">
            <img src="/LogoLogin.svg" alt="Esportes da Sorte" className={styles.logo} />
          </Link>
        </div>
        <h1 className={styles.title}>RECUPERAR ACESSO</h1>
        <p className={styles.subtitle}>
          Informe seu e-mail ou telefone para receber as instruções de redefinição de senha.
        </p>
      </header>

      {sent ? (
        <div className={styles.successCard}>
          <span className={styles.successIcon}>✓</span>
          <p className={styles.successText}>
            {method === 'email'
              ? 'Um link de recuperação foi enviado para o seu e-mail.'
              : 'Um código foi enviado para o seu número de celular.'}
          </p>
          <Link to={ROUTES.LOGIN} state={{ backgroundLocation: location.state?.backgroundLocation || location }} className={styles.backLink}>
              Voltar para o login
          </Link>
        </div>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit}>
          {/* Toggle email / phone */}
          <div className={styles.methodToggle} role="group" aria-label="Método de recuperação">
            <button
              type="button"
              className={`${styles.methodBtn} ${method === 'email' ? styles.methodActive : ''}`}
              onClick={() => setMethod('email')}
            >
              <MailIcon /> E-mail
            </button>
            <button
              type="button"
              className={`${styles.methodBtn} ${method === 'phone' ? styles.methodActive : ''}`}
              onClick={() => setMethod('phone')}
            >
              <PhoneIcon /> Celular
            </button>
          </div>

          {method === 'email' ? (
            <div className={styles.inputGroup}>
              <label className={styles.label}>ENDEREÇO DE E-MAIL:</label>
              <div className={styles.inputWrapper}>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  className={styles.input}
                  required
                  autoFocus
                />
                <span className={styles.inputIcon}><MailIcon /></span>
              </div>
            </div>
          ) : (
            <div className={styles.inputGroup}>
              <label className={styles.label}>NÚMERO DE CELULAR:</label>
              <div className={styles.inputWrapper}>
                <input
                  type="tel"
                  placeholder="(00) 00000-0000"
                  className={styles.input}
                  required
                  autoFocus
                />
                <span className={styles.inputIcon}><PhoneIcon /></span>
              </div>
            </div>
          )}

          <button type="submit" className={styles.submitBtn}>
            ENVIAR INSTRUÇÕES
          </button>

          <div className={styles.links}>
            <Link to={ROUTES.LOGIN} state={{ backgroundLocation: location.state?.backgroundLocation || location }} className={styles.link}> VOLTAR PARA O LOGIN</Link>
          </div>
        </form>
      )}
    </div>
  );
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
      <line x1="12" y1="18" x2="12.01" y2="18"/>
    </svg>
  );
}
