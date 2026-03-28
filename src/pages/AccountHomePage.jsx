import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { getCurrentUser } from '@/services/userSession';
import styles from './AccountHomePage.module.css';

function formatCpf(cpf) {
  const digits = String(cpf || '')
    .replace(/\D/g, '')
    .slice(0, 11);
  if (digits.length !== 11) return 'Não informado';
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function formatPhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return 'Não informado';
}

export default function AccountHomePage() {
  const user = getCurrentUser() || {};
  const displayName = user.nome_usuario || user.nome || user.name || 'apostador';
  const displayEmail = user.email_usuario || user.email || 'Não informado';

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <p className={styles.badge}>CONTA LOGADA</p>
        <h1 className={styles.title}>Olá, {displayName}!</h1>
        <p className={styles.subtitle}>
          Aqui está o resumo da sua conta após o login.
        </p>
      </header>

      <div className={styles.grid}>
        <article className={styles.card}>
          <h2>Dados cadastrais</h2>
          <ul>
            <li>
              <strong>Nome:</strong> {displayName}
            </li>
            <li>
              <strong>E-mail:</strong> {displayEmail}
            </li>
            <li>
              <strong>CPF:</strong> {formatCpf(user.cpf_usuario)}
            </li>
            <li>
              <strong>Telefone:</strong> {formatPhone(user.telefone_usuario)}
            </li>
          </ul>
        </article>

        <article className={styles.card}>
          <h2>Ações rápidas</h2>
          <div className={styles.actions}>
            <Link to={ROUTES.APOSTAS} className={styles.actionBtn}>
              Ver minhas apostas
            </Link>
            <Link
              to={ROUTES.ACCOUNT_SECURITY}
              className={styles.actionBtnSecondary}
            >
              Segurança da conta
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
