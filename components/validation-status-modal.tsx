"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Building,
  Edit,
  RefreshCw
} from "lucide-react";

type ValidationStatusModalProps = {
  open: boolean;
  onClose: () => void;
  validationStatus: 'PENDING' | 'VALIDATED' | 'REJECTED' | null;
  rejectionReason: string | null;
  loading: boolean;
};

export function ValidationStatusModal({
  open,
  onClose,
  validationStatus,
  rejectionReason,
  loading,
}: ValidationStatusModalProps) {
  const router = useRouter();

  const isValidated = validationStatus === 'VALIDATED';
  const isPending = validationStatus === 'PENDING';
  const isRejected = validationStatus === 'REJECTED';

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Statut de Validation du Profil
          </h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-gray-100"
          >
            ×
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Carte de statut principal */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  {isValidated && <CheckCircle className="h-6 w-6 text-green-600" />}
                  {isPending && <Clock className="h-6 w-6 text-yellow-600" />}
                  {isRejected && <AlertTriangle className="h-6 w-6 text-red-600" />}
                  Statut actuel
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {loading && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Vérification du statut...</p>
                  </div>
                )}

                {!loading && isValidated && (
                  <div className="text-center">
                    <CheckCircle className="h-20 w-20 text-green-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-green-700 mb-2">
                      Profil Validé
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Félicitations ! Votre profil employeur a été validé par notre équipe.
                      Vous pouvez maintenant publier des offres d'emploi et gérer vos candidatures.
                    </p>
                    <Button
                      onClick={() => {
                        onClose();
                        router.push('/employer/jobs');
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Accéder à mes offres
                    </Button>
                  </div>
                )}

                {!loading && isPending && (
                  <div className="text-center">
                    <Clock className="h-20 w-20 text-yellow-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-yellow-700 mb-2">
                      Profil en Attente de Validation
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Votre profil employeur est actuellement en cours de validation par notre équipe.
                      Nous examinons attentivement votre demande et vous répondrons dans les plus brefs délais.
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <Button
                        onClick={() => {
                          onClose();
                          router.push('/employer/profile');
                        }}
                        variant="outline"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier mon profil
                      </Button>
                      <Button
                        onClick={() => window.location.reload()}
                        variant="outline"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Actualiser
                      </Button>
                    </div>
                  </div>
                )}

                {!loading && isRejected && (
                  <div className="text-center">
                    <AlertTriangle className="h-20 w-20 text-red-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-red-700 mb-2">
                      Profil Rejeté
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Votre profil employeur n'a pas pu être validé par notre équipe.
                      Veuillez consulter le motif de rejet ci-dessous pour améliorer votre demande.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Carte d'actions rapides */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                <Button
                  onClick={() => {
                    onClose();
                    router.push('/employer/profile');
                  }}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier le profil
                </Button>
                <Button
                  onClick={() => {
                    onClose();
                    router.push('/employer/jobs');
                  }}
                  className="w-full justify-start"
                  variant="outline"
                  disabled={!isValidated}
                >
                  <Building className="h-4 w-4 mr-2" />
                  Mes offres
                </Button>
                <Button
                  onClick={() => {
                    onClose();
                    router.push('/employer/applications');
                  }}
                  className="w-full justify-start"
                  variant="outline"
                  disabled={!isValidated}
                >
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Mes candidatures
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Section du motif de rejet */}
          {!loading && isRejected && rejectionReason && (
            <Card className="mt-6 border-red-200">
              <CardHeader className="bg-red-50">
                <CardTitle className="text-red-700 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Motif du Rejet
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="bg-white border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Pourquoi votre profil a été rejeté :
                  </h4>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {rejectionReason}
                  </p>
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h5 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Comment corriger :
                    </h5>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Prenez en compte chaque remarque mentionnée ci-dessus</li>
                      <li>• Complétez les informations manquantes dans votre profil</li>
                      <li>• Assurez-vous que tous les documents sont valides et lisibles</li>
                      <li>• Soumettez à nouveau votre profil pour validation</li>
                    </ul>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <Button
                      onClick={() => {
                        onClose();
                        router.push('/employer/profile');
                      }}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Modifier mon profil
                    </Button>
                    <Button
                      onClick={() => {
                        onClose();
                        window.location.reload();
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Vérifier le statut
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <Button onClick={onClose} variant="outline">
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
}
