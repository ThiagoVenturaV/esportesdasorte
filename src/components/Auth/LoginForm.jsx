import { Link, useLocation } from 'react-router-dom';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { loginUser } from '@/services/authService';
import { saveCurrentUser } from '@/services/userSession';
import styles from './LoginForm.module.css';

/**
 * LoginForm - Improved UX with Enter key navigation.
 */
export default function LoginForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);
  const [formData, setFormData] = useState({
    email_usuario: '',
    senha_usuario: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const handleKeyDown = (e, nextRef) => {
    if (e.key === 'Enter') {
      if (nextRef && nextRef.current) {
        e.preventDefault();
        nextRef.current.focus();
      }
      // If it's the last field (passwordRef), the default form submit will happen
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email_usuario || !formData.senha_usuario) {
      setFeedback({
        type: 'error',
        message: 'Preencha e-mail e senha para continuar.',
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback({ type: '', message: '' });

    try {
      const result = await loginUser(formData);
      const user = result?.usuario || null;
      if (user) {
        saveCurrentUser(user);
      }
      setFeedback({
        type: 'success',
        message: result?.mensagem || 'Login realizado com sucesso.',
      });
      const nextRoute = location.state?.from || ROUTES.ACCOUNT;
      navigate(nextRoute, { replace: true });
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error.message || 'Falha ao realizar login.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logoWrap}>
          <Link to={ROUTES.HOME} aria-label="Voltar para o início">
            <img
              src="/LogoLogin.svg"
              alt="Esportes da Sorte"
              className={styles.logo}
            />
          </Link>
        </div>
        <h1 className={styles.title}>LOGIN</h1>
      </header>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>NOME DE USUÁRIO/E-MAIL:</label>
          <div className={styles.inputWrapper}>
            <input
              ref={usernameRef}
              name="email_usuario"
              type="text"
              placeholder="Usuário/E-mail"
              className={styles.input}
              value={formData.email_usuario}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, passwordRef)}
              autoFocus
            />
            <span className={styles.inputIcon}>@</span>
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>SENHA:</label>
          <div className={styles.inputWrapper}>
            <input
              ref={passwordRef}
              name="senha_usuario"
              type="password"
              placeholder="........"
              className={styles.input}
              value={formData.senha_usuario}
              onChange={handleChange}
              // In the last input, we let the Enter key trigger the form submission (default behavior)
            />
            <span className={styles.inputIcon}>
              <LockIcon />
            </span>
          </div>
        </div>

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'ENTRANDO...' : 'ENTRAR'}
        </button>

        {feedback.message ? (
          <p
            className={`${styles.feedback} ${feedback.type === 'error' ? styles.feedbackError : styles.feedbackSuccess}`}
            role="alert"
          >
            {feedback.message}
          </p>
        ) : null}

        <div className={styles.links}>
          <Link
            to={ROUTES.FORGOT_PASSWORD}
            state={{ backgroundLocation: location }}
            className={styles.link}
          >
            ESQUECEU SUA SENHA?
          </Link>
          <Link
            to={ROUTES.REGISTER}
            state={{ backgroundLocation: location }}
            className={styles.link}
          >
            CADASTRAR-SE
          </Link>
        </div>
      </form>

      <footer className={styles.footer}>{/* Footer content if any */}</footer>
    </div>
  );
}

function LockIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
  );
}
