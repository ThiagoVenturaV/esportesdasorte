const USER_STORAGE_KEY = 'eds_user';
const AUTH_EVENT_NAME = 'eds-auth-changed';

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw);
    return user && typeof user === 'object' ? user : null;
  } catch {
    return null;
  }
}

export function saveCurrentUser(user) {
  if (!user || typeof user !== 'object') return;
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event(AUTH_EVENT_NAME));
}

export function clearCurrentUser() {
  localStorage.removeItem(USER_STORAGE_KEY);
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
