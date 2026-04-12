"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { decodeToken } from "@/lib/jwt";
import { AdminLayout } from "@/components/admin-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Briefcase,
  CheckCircle,
  Clock,
  AlertTriangle,
  Building,
  FileText,
  XCircle,
  User,
  Mail,
  Calendar,
  Phone,
} from "lucide-react";

type EmployerProfile = {
  id: number;
  company_name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  description: string;
  img: string;
  identity: string;
  validation_status: string;
  rejection_reason?: string;
  created_at: string;
  updated_at?: string;
  user_email: string;
};

export default function EmployerValidationPage() {
  const [employers, setEmployers] = useState<EmployerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<number | null>(null);
  const [rejectionReasons, setRejectionReasons] = useState<{ [key: number]: string }>({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const router = useRouter();

  const getValidToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('token');
    if (!token) return null;
    const decoded = decodeToken(token);
    if (!decoded || decoded.role !== 'ADMIN') {
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

    fetchPendingEmployers(token);
  }, [router]);

  useEffect(() => {
    const token = getValidToken();
    if (token) {
      fetchPendingEmployers(token);
    }
  }, [pagination.page]);

  const fetchPendingEmployers = async (token: string) => {
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });

      const res = await fetch(`/api/admin/employer-validation?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error('Erreur lors de la récupération des profils');
      }

      const data = await res.json();
      if (data.success) {
        setEmployers(data.data || []);
        setPagination(prev => ({
          ...prev,
          total: data.total || 0,
          totalPages: data.totalPages || 0
        }));
      } else {
        throw new Error(data.error || 'Données invalides');
      }
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('fetchPendingEmployers error:', message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour déterminer si un profil rejeté a été modifié
  const isModifiedRejected = (employer: EmployerProfile) => {
    return employer.validation_status === 'REJECTED' && 
           employer.updated_at && 
           new Date(employer.updated_at) > new Date(employer.created_at);
  };

  const handleValidation = async (employerId: number, status: 'VALIDATED' | 'REJECTED') => {
    if (status === 'REJECTED' && !rejectionReasons[employerId]?.trim()) {
      alert('Veuillez saisir un motif de rejet');
      return;
    }

    setProcessing(employerId);
    try {
      const token = getValidToken();
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await fetch('/api/admin/employer-validation', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          employerId, 
          status, 
          rejectionReason: status === 'REJECTED' ? rejectionReasons[employerId] : null 
        }),
      });

      if (!res.ok) {
        throw new Error('Erreur lors de la validation');
      }

      const data = await res.json();
      if (data.success) {
        // Retirer l'employeur de la liste
        setEmployers(prev => prev.filter(emp => emp.id !== employerId));
        // Nettoyer le motif de rejet
        setRejectionReasons(prev => {
          const newReasons = { ...prev };
          delete newReasons[employerId];
          return newReasons;
        });
        alert(data.message);
      } else {
        throw new Error(data.error || 'Validation échouée');
      }
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('handleValidation error:', message);
      alert(`Erreur : ${message}`);
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur</h2>
              <p className="text-gray-600">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="mt-4"
              >
                Réessayer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Validation des Profils Employeurs
          </h1>
          <p className="text-xl text-gray-600">
            Validez ou rejetez les demandes de création de profils employeurs en attente
          </p>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Nouvelles demandes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Modifications après rejet</span>
            </div>
          </div>
        </div>

        {employers.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Aucune demande en attente
              </h3>
              <p className="text-gray-600">
                Tous les profils employeurs sont à jour
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {employers.map((employer) => {
              const isModified = isModifiedRejected(employer);
              return (
                <Card key={employer.id} className="overflow-hidden">
                  <CardHeader className="bg-white border-b">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl font-semibold text-gray-900 mb-2">
                          {employer.company_name}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{employer.contact_person}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            <span>{employer.user_email}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(employer.created_at).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {employer.validation_status === 'PENDING' && (
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                            <Clock className="h-3 w-3 mr-1" />
                            En attente
                          </Badge>
                        )}
                        {isModified && (
                          <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Modifié après rejet
                          </Badge>
                        )}
                        {employer.validation_status === 'REJECTED' && !isModified && (
                          <Badge className="bg-red-100 text-red-800 border-red-200">
                            <XCircle className="h-3 w-3 mr-1" />
                            Rejeté
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Informations de l'entreprise */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                          <Building className="h-5 w-5" />
                          Informations de l'entreprise
                        </h3>
                        
                        <div className="space-y-3">
                          {employer.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span>{employer.phone}</span>
                            </div>
                          )}
                          
                          {employer.address && (
                            <div className="text-sm">
                              <p className="font-medium text-gray-700 mb-1">Adresse</p>
                              <p className="text-gray-600">{employer.address}</p>
                            </div>
                          )}
                          
                          {employer.description && (
                            <div className="text-sm">
                              <p className="font-medium text-gray-700 mb-1">Description</p>
                              <p className="text-gray-600 whitespace-pre-wrap">
                                {employer.description}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Documents */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Documents
                        </h3>
                        
                        <div className="space-y-3">
                          {employer.img && (
                            <div className="text-sm">
                              <p className="font-medium text-gray-700 mb-2">Logo de l'entreprise</p>
                              <img
                                src={employer.img}
                                alt="Logo de l'entreprise"
                                className="h-20 w-20 object-cover rounded-lg border border-gray-200"
                              />
                            </div>
                          )}
                          
                          {employer.identity && (
                            <div className="text-sm">
                              <p className="font-medium text-gray-700 mb-2">Document d'identité</p>
                              <a
                                href={employer.identity}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline"
                              >
                                Voir le document
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="space-y-4">
                        {isModified && (
                          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                            <p className="text-sm text-orange-800">
                              <strong>Modification détectée :</strong> L'employeur a modifié son profil après un rejet précédent.
                            </p>
                          </div>
                        )}
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Motif de rejet (si applicable)
                          </label>
                          <textarea
                            value={rejectionReasons[employer.id] || ''}
                            onChange={(e) => setRejectionReasons(prev => ({
                              ...prev,
                              [employer.id]: e.target.value
                            }))}
                            placeholder="Expliquez pourquoi ce profil est rejeté. L'employeur pourra voir ce motif pour améliorer sa demande."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows={3}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600">
                            Que souhaitez-vous faire avec cette demande ?
                          </p>
                          <div className="flex items-center gap-3">
                            <Button
                              onClick={() => handleValidation(employer.id, 'REJECTED')}
                              variant="outline"
                              className="border-red-200 text-red-700 hover:bg-red-50"
                              disabled={processing === employer.id}
                            >
                              {processing === employer.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                              ) : (
                                <XCircle className="h-4 w-4 mr-2" />
                              )}
                              Rejeter
                            </Button>
                            <Button
                              onClick={() => handleValidation(employer.id, 'VALIDATED')}
                              className="bg-green-600 hover:bg-green-700"
                              disabled={processing === employer.id}
                            >
                              {processing === employer.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              ) : (
                                <CheckCircle className="h-4 w-4 mr-2" />
                              )}
                              Valider
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            disabled={pagination.page === 1}
          >
            Précédent
          </Button>
          
          <span className="text-sm text-gray-600">
            Page {pagination.page} sur {pagination.totalPages}
          </span>
          
          <Button
            variant="outline"
            onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
            disabled={pagination.page === pagination.totalPages}
          >
            Suivant
          </Button>
        </div>
      )}
    </AdminLayout>
  );
}
