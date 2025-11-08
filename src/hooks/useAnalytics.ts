'use client';

import { useQuery } from '@tanstack/react-query';
import type { DashboardData, DateRange } from '@/types/analytics';

export function useAnalytics(dateRange?: DateRange) {
  return useQuery({
    queryKey: ['analytics', 'dashboard', dateRange],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();

        if (dateRange?.start) {
          params.append('startDate', dateRange.start.toISOString().split('T')[0]);
        }
        if (dateRange?.end) {
          params.append('endDate', dateRange.end.toISOString().split('T')[0]);
        }

        const response = await fetch(`/api/analytics/dashboard?${params}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `Error al obtener analytics: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        return data as DashboardData;
      } catch (error) {
        console.error('Error en useAnalytics:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 1,
  });
}

