import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api';

export function useAdminAuth() {
  const queryClient = useQueryClient();

  const { data: admin, isLoading: checking } = useQuery({
    queryKey: ['admin', 'me'],
    queryFn: async () => {
      try {
        return await adminApi.me();
      } catch {
        return null;
      }
    },
    staleTime: Infinity,
  });

  async function login(username, password) {
    const data = await adminApi.login({ username, password });
    if (data.ok) {
      queryClient.setQueryData(['admin', 'me'], { username });
    }
  }

  async function logout() {
    await adminApi.logout();
    queryClient.setQueryData(['admin', 'me'], null);
  }

  return { admin: admin ?? null, checking, login, logout };
}
