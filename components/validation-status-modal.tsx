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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 modal-backdrop">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col modal-content modal-entrance">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900 animate-fade-in">
            Statut de Validation du Profil
          </h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="h-10 w-10 p-0 hover:bg-slate-100 rounded-xl transition-all duration-300 hover:scale-110 group"
          >
            <span className="text-2xl group-hover:rotate-90 transition-transform duration-300">×</span>
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Carte de statut principal */}
            <Card className="lg:col-span-2 rounded-3xl border-2 border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 card-hover card-entrance">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200/50">
                <CardTitle className="flex items-center gap-4 text-xl">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center animate-glow ${
                    isValidated ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' :
                    isPending ? 'bg-gradient-to-br from-amber-500 to-amber-600' :
                    'bg-gradient-to-br from-red-500 to-red-600'
                  }`}>
                    {isValidated && <CheckCircle className="h-6 w-6 text-white" />}
                    {isPending && <Clock className="h-6 w-6 text-white" />}
                    {isRejected && <AlertTriangle className="h-6 w-6 text-white" />}
                  </div>
                  <span>Statut actuel</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {loading && (
                  <div className="text-center py-12 animate-fade-in">
                    <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-6"></div>
                    <p className="text-slate-600 font-medium">Vérification du statut...</p>
                  </div>
                )}

                {!loading && isValidated && (
                  <div className="text-center animate-scale-in">
                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-glow shadow-lg shadow-emerald-600/25">
                      <CheckCircle className="h-12 w-12 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-emerald-700 mb-4 animate-fade-in">
                      Profil Validé
                    </h3>
                    <p className="text-slate-600 mb-8 leading-relaxed animate-slide-in">
                      Félicitations ! Votre profil employeur a été validé par notre équipe.
                      Vous pouvez maintenant publier des offres d'emploi et gérer vos candidatures.
                    </p>
                    <Button
                      onClick={() => {
                        onClose();
                        router.push('/employer/jobs');
                      }}
                      className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 px-8 py-3 rounded-2xl shadow-lg shadow-emerald-600/25 hover:shadow-xl hover:shadow-emerald-600/30 transition-all duration-300 hover:-translate-y-1 btn-hover-lift"
                    >
                      Accéder à mes offres
                    </Button>
                  </div>
                )}

                {!loading && isPending && (
                  <div className="text-center animate-scale-in">
                    <div className="w-24 h-24 bg-gradient-to-br from-amber-500 to-amber-600 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-glow shadow-lg shadow-amber-600/25">
                      <Clock className="h-12 w-12 text-white animate-pulse" />
                    </div>
                    <h3 className="text-3xl font-bold text-amber-700 mb-4 animate-fade-in">
                      Profil en Attente de Validation
                    </h3>
                    <p className="text-slate-600 mb-8 leading-relaxed animate-slide-in">
                      Votre profil employeur est actuellement en cours de validation par notre équipe.
                      Nous examinons attentivement votre demande et vous répondrons dans les plus brefs délais.
                    </p>
                    <div className="flex items-center justify-center gap-4">
                      <Button
                        onClick={() => {
                          onClose();
                          router.push('/employer/profile');
                        }}
                        variant="outline"
                        className="px-6 py-3 rounded-2xl border-2 border-amber-300 hover:bg-amber-50 hover:border-amber-400 transition-all duration-300 hover:-translate-y-1 btn-hover-lift"
                      >
                        <Edit className="h-5 w-5 mr-2" />
                        Modifier mon profil
                      </Button>
                      <Button
                        onClick={() => window.location.reload()}
                        variant="outline"
                        className="px-6 py-3 rounded-2xl border-2 border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-all duration-300 hover:-translate-y-1 btn-hover-lift"
                      >
                        <RefreshCw className="h-5 w-5 mr-2" />
                        Actualiser
                      </Button>
                    </div>
                  </div>
                )}

                {!loading && isRejected && (
                  <div className="text-center animate-scale-in">
                    <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-glow shadow-lg shadow-red-600/25">
                      <AlertTriangle className="h-12 w-12 text-white animate-pulse" />
                    </div>
                    <h3 className="text-3xl font-bold text-red-700 mb-4 animate-fade-in">
                      Profil Rejeté
                    </h3>
                    <p className="text-slate-600 mb-8 leading-relaxed animate-slide-in">
                      Votre profil employeur n'a pas pu être validé par notre équipe.
                      Veuillez consulter le motif de rejet ci-dessous pour améliorer votre demande.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Carte d'actions rapides */}
            <Card className="rounded-3xl border-2 border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 card-hover card-entrance" style={{animationDelay: "0.1s"}}>
              <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200/50">
                <CardTitle className="text-xl font-bold flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center animate-glow">
                    <RefreshCw className="h-4 w-4 text-white" />
                  </div>
                  Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <Button
                  onClick={() => {
                    onClose();
                    router.push('/employer/profile');
                  }}
                  className="w-full justify-start px-4 py-3 rounded-2xl border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 hover:-translate-y-1 btn-hover-lift animate-scale-in"
                  variant="outline"
                  style={{animationDelay: "0.2s"}}
                >
                  <Edit className="h-5 w-5 mr-3" />
                  Modifier le profil
                </Button>
                <Button
                  onClick={() => {
                    onClose();
                    router.push('/employer/jobs');
                  }}
                  className="w-full justify-start px-4 py-3 rounded-2xl border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 hover:-translate-y-1 btn-hover-lift animate-scale-in disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
                  variant="outline"
                  disabled={!isValidated}
                  style={{animationDelay: "0.3s"}}
                >
                  <Building className="h-5 w-5 mr-3" />
                  Mes offres
                </Button>
                <Button
                  onClick={() => {
                    onClose();
                    router.push('/employer/applications');
                  }}
                  className="w-full justify-start px-4 py-3 rounded-2xl border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 hover:-translate-y-1 btn-hover-lift animate-scale-in disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
                  variant="outline"
                  disabled={!isValidated}
                  style={{animationDelay: "0.4s"}}
                >
                  <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Mes candidatures
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Section du motif de rejet */}
          {!loading && isRejected && rejectionReason && (
            <Card className="mt-8 border-2 border-red-200/50 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 card-hover card-entrance animate-fade-in" style={{animationDelay: "0.5s"}}>
              <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 border-b border-red-200/50">
                <CardTitle className="text-red-700 flex items-center gap-4 text-xl font-bold">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center animate-glow">
                    <AlertTriangle className="h-5 w-5 text-white" />
                  </div>
                  Motif du Rejet
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="bg-white border-2 border-red-200/50 rounded-2xl p-6 shadow-sm">
                  <h4 className="font-bold text-slate-900 mb-4 text-lg">
                    Pourquoi votre profil a été rejeté :
                  </h4>
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed bg-red-50 p-4 rounded-xl border border-red-200/30">
                    {rejectionReason}
                  </p>
                  <div className="mt-6 p-5 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200/50 rounded-2xl">
                    <h5 className="font-bold text-blue-900 mb-3 flex items-center gap-3 text-lg">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center animate-glow">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                      Comment corriger :
                    </h5>
                    <ul className="text-sm text-blue-800 space-y-2 font-medium">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>Prenez en compte chaque remarque mentionnée ci-dessus</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>Complétez les informations manquantes dans votre profil</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>Assurez-vous que tous les documents sont valides et lisibles</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>Soumettez à nouveau votre profil pour validation</span>
                      </li>
                    </ul>
                  </div>
                  <div className="flex gap-4 mt-8">
                    <Button
                      onClick={() => {
                        onClose();
                        router.push('/employer/profile');
                      }}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-1 btn-hover-lift"
                    >
                      <Edit className="h-5 w-5 mr-2" />
                      Modifier mon profil
                    </Button>
                    <Button
                      onClick={() => {
                        onClose();
                        window.location.reload();
                      }}
                      variant="outline"
                      className="flex-1 px-6 py-3 border-2 border-slate-300 hover:bg-slate-50 hover:border-slate-400 rounded-2xl transition-all duration-300 hover:-translate-y-1 btn-hover-lift"
                    >
                      <RefreshCw className="h-5 w-5 mr-2" />
                      Vérifier le statut
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-slate-200/50 bg-gradient-to-r from-slate-50 to-white flex justify-end">
          <Button 
            onClick={onClose} 
            variant="outline"
            className="px-8 py-3 border-2 border-slate-300 hover:bg-slate-50 hover:border-slate-400 rounded-2xl transition-all duration-300 hover:-translate-y-1 btn-hover-lift"
          >
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
}
