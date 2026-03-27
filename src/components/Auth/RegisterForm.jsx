import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useRef, useState } from 'react';
import { ROUTES } from '@/config/routes';
import { registerUser } from '@/services/authService';
import styles from './RegisterForm.module.css';

function digitsOnly(value) {
  return String(value || '').replace(/\D/g, '');
}

function formatCpf(value) {
  const digits = digitsOnly(value).slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function formatPhone(value) {
  const digits = digitsOnly(value).slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d{1,4})$/, '$1-$2');
  }
  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
}

/**
 * RegisterForm - Improved UX with Enter key navigation.
 */
export default function RegisterForm() {
  const location = useLocation();
  const inputRefs = useRef([]);
  const [formData, setFormData] = useState({
    nome_usuario: '',
    email_usuario: '',
    cpf_usuario: '',
    dataNac_usuario: '',
    endereco_usuario: '',
    telefone_usuario: '',
    senha_usuario: '',
    confirmar_senha: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const fields = [
    {
      name: 'nome_usuario',
      label: 'NOME COMPLETO',
      placeholder: 'NOME COMPLETO',
      type: 'text',
      Icon: UserIcon,
      maxLength: 80,
      autoComplete: 'name',
    },
    {
      name: 'email_usuario',
      label: 'ENDEREÇO DE E-MAIL',
      placeholder: 'Endereço de E-mail',
      type: 'email',
      Icon: MailIcon,
      maxLength: 120,
      autoComplete: 'email',
    },
    {
      name: 'cpf_usuario',
      label: 'CPF',
      placeholder: '000.000.000-00',
      type: 'text',
      Icon: ShieldIcon,
      maxLength: 14,
      inputMode: 'numeric',
    },
    {
      name: 'dataNac_usuario',
      label: 'DATA DE NASCIMENTO',
      placeholder: '',
      type: 'date',
      Icon: CalendarIcon,
    },
    {
      name: 'endereco_usuario',
      label: 'ENDEREÇO',
      placeholder: 'RUA, NÚMERO, CIDADE',
      type: 'text',
      Icon: HomeIcon,
      maxLength: 120,
      autoComplete: 'street-address',
    },
    {
      name: 'telefone_usuario',
      label: 'NÚMERO DE CELULAR',
      placeholder: 'NÚMERO DE CELULAR',
      type: 'tel',
      Icon: PhoneIcon,
      maxLength: 15,
      inputMode: 'tel',
      autoComplete: 'tel-national',
    },
    {
      name: 'senha_usuario',
      label: 'CRIAR SENHA',
      placeholder: 'Password',
      type: 'password',
      Icon: LockIcon,
      maxLength: 64,
      autoComplete: 'new-password',
    },
    {
      name: 'confirmar_senha',
      label: 'CONFIRME SUA SENHA',
      placeholder: '........',
      type: 'password',
      Icon: ShieldIcon,
      maxLength: 64,
      autoComplete: 'new-password',
    },
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = [
      'nome_usuario',
      'email_usuario',
      'cpf_usuario',
      'dataNac_usuario',
      'telefone_usuario',
      'senha_usuario',
      'confirmar_senha',
    ];

    const hasMissingField = requiredFields.some((field) => !formData[field]);
    if (hasMissingField) {
      setFeedback({
        type: 'error',
        message: 'Preencha todos os campos obrigatórios.',
      });
      return;
    }

    if (formData.senha_usuario !== formData.confirmar_senha) {
      setFeedback({ type: 'error', message: 'As senhas não coincidem.' });
      return;
    }

    const cpfDigits = digitsOnly(formData.cpf_usuario);
    if (cpfDigits.length !== 11) {
      setFeedback({ type: 'error', message: 'CPF deve conter 11 dígitos.' });
      return;
    }

    const phoneDigits = digitsOnly(formData.telefone_usuario);
    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      setFeedback({
        type: 'error',
        message: 'Telefone deve conter 10 ou 11 dígitos.',
      });
      return;
    }

    if (formData.senha_usuario.length < 8) {
      setFeedback({
        type: 'error',
        message: 'A senha deve ter no mínimo 8 caracteres.',
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback({ type: '', message: '' });

    try {
      const payload = {
        nome_usuario: formData.nome_usuario,
        email_usuario: formData.email_usuario,
        cpf_usuario: cpfDigits,
        dataNac_usuario: formData.dataNac_usuario,
        endereco_usuario: formData.endereco_usuario,
        telefone_usuario: phoneDigits,
        senha_usuario: formData.senha_usuario,
      };

      await registerUser(payload);
      setFeedback({
        type: 'success',
        message: 'Cadastro realizado com sucesso.',
      });

      navigate(ROUTES.REGISTER_SUCCESS, {
        state: {
          backgroundLocation: location.state?.backgroundLocation || location,
        },
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error.message || 'Falha ao cadastrar usuário.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    let nextValue = value;

    if (name === 'cpf_usuario') {
      nextValue = formatCpf(value);
    } else if (name === 'telefone_usuario') {
      nextValue = formatPhone(value);
    } else if (name === 'nome_usuario') {
      nextValue = value.slice(0, 80);
    } else if (name === 'email_usuario') {
      nextValue = value.trimStart().slice(0, 120);
    } else if (name === 'endereco_usuario') {
      nextValue = value.slice(0, 120);
    } else if (name === 'senha_usuario' || name === 'confirmar_senha') {
      nextValue = value.slice(0, 64);
    }

    setFormData((prev) => ({ ...prev, [name]: nextValue }));
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
        <h1 className={styles.title}>CADASTRAR-SE</h1>
      </header>

      <form className={styles.form} onSubmit={handleSubmit}>
        {fields.map((field, i) => (
          <div key={i} className={styles.inputGroup}>
            <label className={styles.label}>{field.label}</label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>
                <field.Icon />
              </span>
              <input
                ref={(el) => (inputRefs.current[i] = el)}
                name={field.name}
                type={field.type}
                placeholder={field.placeholder}
                className={styles.input}
                value={formData[field.name]}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, i)}
                autoFocus={i === 0}
                maxLength={field.maxLength}
                inputMode={field.inputMode}
                autoComplete={field.autoComplete}
              />
            </div>
          </div>
        ))}

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'CRIANDO CONTA...' : 'CRIAR CONTA'}
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
            to={ROUTES.LOGIN}
            state={{
              backgroundLocation:
                location.state?.backgroundLocation || location,
            }}
            className={styles.link}
          >
            JÁ TEM CONTA? LOGIN
          </Link>
        </div>
      </form>

      <footer className={styles.footer}>{/* Footer content if any */}</footer>
    </div>
  );
}

function CalendarIcon() {
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
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  );
}

function HomeIcon() {
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
      <path d="M3 10.5L12 3l9 7.5"></path>
      <path d="M5 9.5V21h14V9.5"></path>
    </svg>
  );
}

// Icons
function UserIcon() {
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
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  );
}

function MailIcon() {
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
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
      <polyline points="22,6 12,13 2,6"></polyline>
    </svg>
  );
}

function ShieldIcon() {
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
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    </svg>
  );
}

function PhoneIcon() {
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
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
      <line x1="12" y1="18" x2="12.01" y2="18"></line>
    </svg>
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
