import { useState, useEffect, useCallback } from 'react';

export function usePendingApplications(token: string | null) {
  const [pendingCount, setPendingCount] = useState(0);

  const fetchPendingCount = useCallback(async () => {
    if (!token) return;
    
    try {
      const res = await fetch('/api/employer/applications', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        const pendingApplications = data.data?.filter((app: any) => app.status === 'PENDING') || [];
        setPendingCount(pendingApplications.length);
      }
    } catch (error) {
      console.error('Error fetching pending applications:', error);
    }
  }, [token]);

  useEffect(() => {
    fetchPendingCount();

    // Rafraîchir toutes les 60 secondes
    const interval = setInterval(fetchPendingCount, 60000);

    return () => clearInterval(interval);
  }, [fetchPendingCount]);

  return { pendingCount, refreshPendingCount: fetchPendingCount };
}
