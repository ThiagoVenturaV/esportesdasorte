const USER_STORAGE_KEY = 'eds_user';
const AUTH_EVENT_NAME = 'eds-auth-changed';

export function getCurrentUser() {
  try {
    const raw = sessionStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw);
    return user && typeof user === 'object' ? user : null;
  } catch {
    return null;
  }
}

export function saveCurrentUser(user) {
  if (!user || typeof user !== 'object') return;
  const safeUser = {
    id: String(user.id ?? user.id_usuario ?? '').slice(0, 100),
    nome_usuario: String(user.nome_usuario ?? user.nome ?? '').slice(0, 120),
    email_usuario: String(user.email_usuario ?? user.email ?? '').slice(0, 254),
    role: String(user.role ?? user.tipo_usuario ?? '').slice(0, 40),
  };
  sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(safeUser));
  localStorage.removeItem(USER_STORAGE_KEY);
  window.dispatchEvent(new Event(AUTH_EVENT_NAME));
}

export function clearCurrentUser() {
  localStorage.removeItem(USER_STORAGE_KEY);
  localStorage.removeItem('eds_access_token');
  sessionStorage.removeItem(USER_STORAGE_KEY);
  sessionStorage.removeItem('eds_access_token');
  window.dispatchEvent(new Event(AUTH_EVENT_NAME));
}

export function onAuthChange(listener) {
  window.addEventListener(AUTH_EVENT_NAME, listener);
  window.addEventListener('storage', listener);
  return () => {
    window.removeEventListener(AUTH_EVENT_NAME, listener);
    window.removeEventListener('storage', listener);
  };
}
