const SESSION_KEY = "hanum_finance_session";
const DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 1 minggu

export const saveSession = () => localStorage.setItem(SESSION_KEY, JSON.stringify({ ts: Date.now() }));

export const isSessionValid = () => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return false;
    const { ts } = JSON.parse(raw);
    return Date.now() - ts < DURATION_MS;
  } catch {
    return false;
  }
};

export const clearSession = () => localStorage.removeItem(SESSION_KEY);

export const checkPassword = (password) => password === import.meta.env.VITE_PASSWORD;
