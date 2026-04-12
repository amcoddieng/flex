"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useEmployerValidation } from "@/hooks/useEmployerValidation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Building,
  Edit,
  RefreshCw
} from "lucide-react";

type EmployerProtectionProps = {
  children: React.ReactNode;
  requireValidation?: boolean;
};

export function EmployerProtection({ 
  children, 
  requireValidation = true 
}: EmployerProtectionProps) {
  const router = useRouter();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const { validationStatus, rejectionReason, loading, isValidated, isPending, isRejected } = useEmployerValidation(token);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Si la validation n'est pas requise, afficher les enfants
  if (!requireValidation) {
    return <>{children}</>;
  }

  // Si le profil est validé, afficher les enfants
  if (isValidated) {
    return <>{children}</>;
  }

  // Profil en attente de validation
  if (isPending) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto p-6">
          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Profil en attente de validation
              </h2>
              <p className="text-gray-600 mb-6">
                Votre profil employeur est actuellement en cours de validation par notre équipe.
                Vous ne pouvez pas accéder à cette fonctionnalité tant que votre profil n'aura pas été validé.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Vous serez notifié par email dès que votre profil sera validé.
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => router.push('/employer/profile')}
                  variant="outline"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier mon profil
                </Button>
                <Button
                  onClick={() => router.push('/employer/jobs')}
                >
                  <Building className="h-4 w-4 mr-2" />
                  Retour aux offres
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Profil rejeté
  if (isRejected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto p-6">
          <Card>
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Profil rejeté
              </h2>
              <p className="text-gray-600 mb-6">
                Votre profil employeur a été rejeté par notre équipe.
                Vous ne pouvez pas accéder à cette fonctionnalité avec ce profil.
              </p>
              
              {/* Afficher le motif de rejet si disponible */}
              {rejectionReason && (
                <div className="mb-6 p-4 bg-white border border-red-200 rounded-lg text-left">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    Motif du rejet :
                  </h3>
                  <p className="text-gray-700 whitespace-pre-wrap text-sm">
                    {rejectionReason}
                  </p>
                  <p className="text-sm text-gray-600 mt-3">
                    Veuillez prendre en compte ces remarques pour améliorer votre profil et soumettre une nouvelle demande.
                  </p>
                </div>
              )}
              
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => router.push('/employer/profile')}
                  variant="outline"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier mon profil
                </Button>
                <Button
                  onClick={() => router.push('/logout')}
                >
                  Déconnexion
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Par défaut, afficher les enfants (au cas où le statut est null)
  return <>{children}</>;
}
