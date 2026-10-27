import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../lib/api';
const AppContext = createContext();
export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [toast, setToast] = useState('');
  const notify = useCallback(message => setToast(message), []);
  useEffect(() => {
    api('/auth/me').then(setUser).catch(error => { if (error.status !== 401) setAuthError(error.message); }).finally(() => setAuthLoading(false));
  }, []);
  useEffect(() => { if (toast) { const timer = setTimeout(() => setToast(''), 5000); return () => clearTimeout(timer); } }, [toast]);
  const logout = async () => { try { await api('/auth/logout', { method: 'POST', body: {} }); setUser(null); notify('Logged out'); } catch (error) { notify(error.message); } };
  return <AppContext.Provider value={{ user, setUser, authLoading, authError, notify, logout }}>
    {children}
    {toast && <div role="status" className="fixed bottom-6 right-6 z-[100] max-w-sm bg-white border border-[#B0C4DE] rounded-xl shadow-xl p-4">{toast}<button aria-label="Dismiss notification" onClick={() => setToast('')} className="ml-4">×</button></div>}
  </AppContext.Provider>;
};
// Context and its hook share a module to keep imports together.
// eslint-disable-next-line react-refresh/only-export-components
export const useAppContext = () => useContext(AppContext);
