"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { decodeToken } from "@/lib/jwt";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEmployerValidation } from "@/hooks/useEmployerValidation";
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Building,
  User,
  Mail,
  Phone,
  FileText,
  Edit,
  RefreshCw
} from "lucide-react";

export default function ValidationStatusPage() {
  const router = useRouter();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const { validationStatus, rejectionReason, loading, isValidated, isPending, isRejected } = useEmployerValidation(token);

  const getValidToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('token');
    if (!token) return null;
    const decoded = decodeToken(token);
    if (!decoded || decoded.role !== 'EMPLOYER') {
      localStorage.removeItem('token');
      return null;
    }
    return token;
  };

  useEffect(() => {
    const token = getValidToken();
    if (!token) {
      router.push('/login');
      return;
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Statut de Validation du Profil
          </h1>
          <p className="text-gray-600">
            Consultez l'état de validation de votre profil employeur
          </p>
        </div>

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
              {isValidated && (
                <div className="text-center">
                  <CheckCircle className="h-20 w-20 text-green-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-green-700 mb-2">
                    Profil Validé
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Félicitations ! Votre profil employeur a été validé par notre équipe.
                    Vous pouvez maintenant publier des offres d'emploi et gérer vos candidatures.
                  </p>
                  <Button
                    onClick={() => router.push('/employer/jobs')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Accéder à mes offres
                  </Button>
                </div>
              )}

              {isPending && (
                <div className="text-center">
                  <Clock className="h-20 w-20 text-yellow-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-yellow-700 mb-2">
                    Profil en Attente de Validation
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Votre profil employeur est actuellement en cours de validation par notre équipe.
                    Nous examinons attentivement votre demande et vous répondrons dans les plus brefs délais.
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <Button
                      onClick={() => router.push('/employer/profile')}
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

              {isRejected && (
                <div className="text-center">
                  <AlertTriangle className="h-20 w-20 text-red-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-red-700 mb-2">
                    Profil Rejeté
                  </h2>
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
                onClick={() => router.push('/employer/profile')}
                className="w-full justify-start"
                variant="outline"
              >
                <Edit className="h-4 w-4 mr-2" />
                Modifier le profil
              </Button>
              <Button
                onClick={() => router.push('/employer/jobs')}
                className="w-full justify-start"
                variant="outline"
                disabled={!isValidated}
              >
                <Building className="h-4 w-4 mr-2" />
                Mes offres
              </Button>
              <Button
                onClick={() => router.push('/employer/applications')}
                className="w-full justify-start"
                variant="outline"
                disabled={!isValidated}
              >
                <FileText className="h-4 w-4 mr-2" />
                Mes candidatures
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Section du motif de rejet */}
        {isRejected && rejectionReason && (
          <Card className="mt-6 border-red-200">
            <CardHeader className="bg-red-50">
              <CardTitle className="text-red-700 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Motif du Rejet
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="bg-white border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Pourquoi votre profil a été rejeté :
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {rejectionReason}
                </p>
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Comment corriger :
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Prenez en compte chaque remarque mentionnée ci-dessus</li>
                    <li>• Complétez les informations manquantes dans votre profil</li>
                    <li>• Assurez-vous que tous les documents sont valides et lisibles</li>
                    <li>• Soumettez à nouveau votre profil pour validation</li>
                  </ul>
                </div>
                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={() => router.push('/employer/profile')}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier mon profil
                  </Button>
                  <Button
                    onClick={() => router.push('/employer/validation-status')}
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
    </div>
  );
}
