import { BACKEND_URL } from '@/config/backend';

async function parseJsonSafe(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function getApiErrorMessage(data, fallbackMessage) {
  return (
    data?.erro ||
    data?.detail ||
    data?.mensagem ||
    data?.message ||
    fallbackMessage
  );
}

/**
 * Returns stored JWT token.
 */
export function getAccessToken() {
  const token = sessionStorage.getItem('eds_access_token');
  if (token) return token;
  const legacyToken = localStorage.getItem('eds_access_token');
  if (legacyToken) {
    sessionStorage.setItem('eds_access_token', legacyToken);
    localStorage.removeItem('eds_access_token');
  }
  return legacyToken;
}

/**
 * Returns Authorization headers if token exists.
 */
export function getAuthHeaders() {
  const token = getAccessToken();
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

export async function loginUser({ email_usuario, senha_usuario }) {
  const response = await fetch(`${BACKEND_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email_usuario, senha_usuario }),
  });

  const data = await parseJsonSafe(response);
  if (!response.ok) {
    throw new Error(getApiErrorMessage(data, 'Falha ao autenticar usuário.'));
  }

  if (!data?.sucesso) {
    throw new Error(getApiErrorMessage(data, 'Credenciais inválidas.'));
  }

  // Salvar JWT token se retornado pelo backend
  if (data.access_token) {
    sessionStorage.setItem('eds_access_token', data.access_token);
  }

  return data;
}

export async function registerUser(payload) {
  const response = await fetch(`${BACKEND_URL}/api/usuarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await parseJsonSafe(response);
  if (!response.ok) {
    throw new Error(getApiErrorMessage(data, 'Falha ao cadastrar usuário.'));
  }

  if (!data?.sucesso) {
    throw new Error(
      getApiErrorMessage(data, 'Não foi possível concluir o cadastro.'),
    );
  }

  return data;
}

/**
 * Logout: limpa token JWT.
 */
export function logoutUser() {
  localStorage.removeItem('eds_access_token');
  sessionStorage.removeItem('eds_access_token');
}
