import { useEffect, useState } from 'react';
import axios from 'axios';

export function useAdminAuth() {
  const [admin, setAdmin] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get('/api/admin/me');
        setAdmin(res.data);
      } catch {
        setAdmin(null);
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  async function login(username, password) {
    const res = await axios.post('/api/admin/login', { username, password });
    if (res.data.ok) {
      setAdmin({ username });
    }
  }

  async function logout() {
    await axios.post('/api/admin/logout');
    setAdmin(null);
  }

  return { admin, checking, login, logout };
}
