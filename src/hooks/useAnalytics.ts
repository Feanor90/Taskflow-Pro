'use client';

import { useQuery } from '@tanstack/react-query';
import type { DashboardData, DateRange } from '@/types/analytics';

export function useAnalytics(dateRange?: DateRange) {
  return useQuery({
    queryKey: ['analytics', 'dashboard', dateRange],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (dateRange?.start) {
        params.append('startDate', dateRange.start.toISOString().split('T')[0]);
      }
      if (dateRange?.end) {
        params.append('endDate', dateRange.end.toISOString().split('T')[0]);
      }

      const response = await fetch(`/api/analytics/dashboard?${params}`);

      if (!response.ok) {
        throw new Error('Error al obtener analytics');
      }

      return response.json() as Promise<DashboardData>;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

