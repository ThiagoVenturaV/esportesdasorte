import { useNavigate } from 'react-router-dom';
import RegisterForm from '@/components/Auth/RegisterForm';
import styles from './AuthPage.module.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  return (
    <div className={styles.overlay} onClick={() => navigate(-1)}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={() => navigate(-1)} aria-label="Fechar">
          ✕
        </button>
        <RegisterForm />
      </div>
    </div>
  );
}
