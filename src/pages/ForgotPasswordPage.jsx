import { useNavigate } from 'react-router-dom';
import ForgotPasswordForm from '@/components/Auth/ForgotPasswordForm';
import styles from './AuthPage.module.css';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  return (
    <div className={styles.overlay} onClick={() => navigate(-1)}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={() => navigate(-1)} aria-label="Fechar">
          ✕
        </button>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
