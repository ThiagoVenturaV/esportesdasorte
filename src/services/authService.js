import { BACKEND_URL } from '@/config/backend';

async function parseJsonSafe(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Returns stored JWT token.
 */
export function getAccessToken() {
  return localStorage.getItem('eds_access_token');
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
    throw new Error(data?.erro || 'Falha ao autenticar usuário.');
  }

  if (!data?.sucesso) {
    throw new Error(data?.erro || 'Credenciais inválidas.');
  }

  // Salvar JWT token se retornado pelo backend
  if (data.access_token) {
    localStorage.setItem('eds_access_token', data.access_token);
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
    throw new Error(data?.erro || 'Falha ao cadastrar usuário.');
  }

  if (!data?.sucesso) {
    throw new Error(data?.erro || 'Não foi possível concluir o cadastro.');
  }

  return data;
}

/**
 * Logout: limpa token JWT.
 */
export function logoutUser() {
  localStorage.removeItem('eds_access_token');
}
