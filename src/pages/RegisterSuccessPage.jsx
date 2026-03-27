import { useNavigate, useLocation } from 'react-router-dom';
import RegisterSuccessForm from '@/components/Auth/RegisterSuccessForm';
import { ROUTES } from '@/config/routes';
import styles from './AuthPage.module.css';

/**
 * RegisterSuccessPage - Modal/Page for successful registration.
 */
export default function RegisterSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isModal = !!location.state?.backgroundLocation;

  const content = (
    <div className={`${styles.card} ${styles.successCard}`} onClick={(e) => e.stopPropagation()}>
      <button className={styles.closeBtn} onClick={() => navigate(isModal ? -1 : ROUTES.HOME)} aria-label="Fechar">
        ✕
      </button>
      <RegisterSuccessForm />
    </div>
  );

  if (!isModal) {
    return (
      <div className={styles.pageWrapper} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
        {content}
      </div>
    );
  }

  return (
    <div className={styles.overlay} onClick={() => navigate(-1)}>
      {content}
    </div>
  );
}
