import { useState, useEffect } from 'react';

export function useEmployerValidation(token: string | null) {
  const [validationStatus, setValidationStatus] = useState<'PENDING' | 'VALIDATED' | 'REJECTED' | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setValidationStatus(null);
      setRejectionReason(null);
      setLoading(false);
      return;
    }

    const fetchValidationStatus = async () => {
      try {
        const res = await fetch('/api/employer/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error('Erreur lors de la récupération du profil');
        }

        const data = await res.json();
        if (data.success && data.data) {
          setValidationStatus(data.data.validation_status || 'PENDING');
          setRejectionReason(data.data.rejection_reason || null);
        } else {
          throw new Error(data.error || 'Profil non trouvé');
        }
      } catch (err: any) {
        const message = err instanceof Error ? err.message : 'Erreur inconnue';
        console.error('Error fetching validation status:', message);
        setError(message);
        setValidationStatus('REJECTED'); // En cas d'erreur, considérer comme rejeté pour sécurité
        setRejectionReason('Erreur lors de la vérification du statut');
      } finally {
        setLoading(false);
      }
    };

    fetchValidationStatus();
  }, [token]);

  return {
    validationStatus,
    rejectionReason,
    loading,
    error,
    isValidated: validationStatus === 'VALIDATED',
    isPending: validationStatus === 'PENDING',
    isRejected: validationStatus === 'REJECTED',
    canPostJobs: validationStatus === 'VALIDATED',
  };
}
