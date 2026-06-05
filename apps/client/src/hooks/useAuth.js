import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api';

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading: checking } = useQuery({
    queryKey: ['auth', 'me'],
    // Un 401 significa "no logueado": lo tratamos como user=null, no como error.
    queryFn: async () => {
      try {
        return await authApi.me();
      } catch {
        return null;
      }
    },
    staleTime: Infinity, // la sesión no cambia por sí sola
  });

  function login() {
    window.location.href = authApi.loginUrl;
  }

  function logout() {
    queryClient.clear();
    window.location.href = authApi.logoutUrl;
  }

  return { user: user ?? null, checking, login, logout };
}
