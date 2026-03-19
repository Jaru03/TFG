import { useEffect, useState } from 'react';
import axios from 'axios';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get('/api/auth/me');
        setUser(res.data);
      } catch {
        setUser(null);
      } finally {
        setChecking(false);
      }
    })();
  }, [user]);

  function login() {
    window.location.href = '/auth/google';
  }

  async function logout() {
    await axios.get('/auth/logout');
    setUser(null);
  }

  return { user, checking, login, logout };
}
