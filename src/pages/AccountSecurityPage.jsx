import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import styles from './AccountSecurityPage.module.css';

export default function AccountSecurityPage() {
  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <p className={styles.badge}>SEGURANCA</p>
        <h1 className={styles.title}>Proteção da conta</h1>
        <p className={styles.subtitle}>
          Sua senha já é armazenada com hash no backend e nunca em texto puro.
        </p>
      </header>

      <article className={styles.card}>
        <h2>Boas práticas</h2>
        <ul className={styles.list}>
          <li>Use senha com pelo menos 8 caracteres.</li>
          <li>Evite repetir a mesma senha de outros serviços.</li>
          <li>Não compartilhe seu login com terceiros.</li>
        </ul>
      </article>

      <div className={styles.actions}>
        <Link to={ROUTES.ACCOUNT} className={styles.backBtn}>
          Voltar para minha conta
        </Link>
      </div>
    </section>
  );
}
