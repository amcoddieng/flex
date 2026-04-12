"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { decodeToken } from "@/lib/jwt";
import { AdminLayout } from "@/components/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Building, User, Mail, Calendar, Phone, CheckCircle, Clock, AlertTriangle, Eye, Briefcase } from "lucide-react";

type Employer = {
  id: number;
  email: string;
  role: string;
  blocked: boolean;
  created_at: string;
  profile_id?: number;
  company_name?: string;
  contact_person?: string;
  phone?: string;
  address?: string;
  description?: string;
  img?: string;
  identity?: string;
  validation_status?: string;
};

export default function AdminEmployersPage() {
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [isAuthed, setIsAuthed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
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
    setIsAuthed(true);
    fetchEmployers(token);
  }, [router]);

  const fetchEmployers = async (token: string) => {
    setLoading(true);
    setError(null);
    
    try {
      let url = `/api/admin/employers?page=${page}&limit=${limit}`;
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }
      if (filterStatus) {
        url += `&status=${filterStatus}`;
      }

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error('Erreur lors de la récupération des employeurs');
      }

      const data = await res.json();
      if (data.success) {
        // Trier les employeurs: PENDING en premier
        const sortedEmployers = (data.data || []).sort((a: Employer, b: Employer) => {
          if (a.validation_status === 'PENDING' && b.validation_status !== 'PENDING') return -1;
          if (a.validation_status !== 'PENDING' && b.validation_status === 'PENDING') return 1;
          return 0;
        });
        
        setEmployers(sortedEmployers);
        setTotal(data.pagination?.total || 0);
      } else {
        throw new Error(data.error || 'Données invalides');
      }
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('fetchEmployers error:', message);
      setError(message);
      setEmployers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthed) {
      const token = getValidToken();
      if (token) {
        fetchEmployers(token);
      }
    }
  }, [page, searchQuery, filterStatus, isAuthed]);

  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const pages = Math.ceil(total / limit);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestion des Employeurs
          </h1>
          <p className="text-gray-600">
            Consultez et gérez tous les comptes employeurs de la plateforme
          </p>
        </div>

        {/* Section Recherche et Filtres */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Rechercher par nom, email, entreprise..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === "" ? "default" : "outline"}
                  onClick={() => setFilterStatus("")}
                  size="sm"
                >
                  Tous
                </Button>
                <Button
                  variant={filterStatus === "PENDING" ? "default" : "outline"}
                  onClick={() => setFilterStatus("PENDING")}
                  size="sm"
                >
                  En attente
                </Button>
                <Button
                  variant={filterStatus === "VALIDATED" ? "default" : "outline"}
                  onClick={() => setFilterStatus("VALIDATED")}
                  size="sm"
                >
                  Validés
                </Button>
                <Button
                  variant={filterStatus === "REJECTED" ? "default" : "outline"}
                  onClick={() => setFilterStatus("REJECTED")}
                  size="sm"
                >
                  Rejetés
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Employers List */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement des employeurs...</p>
              </div>
            ) : employers.length === 0 ? (
              <div className="p-8 text-center">
                <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Aucun employeur trouvé
                </h3>
                <p className="text-gray-600">
                  {searchQuery || filterStatus
                    ? "Aucun employeur ne correspond à vos critères de recherche."
                    : "Aucun employeur n'est enregistré sur la plateforme."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Entreprise
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date d'inscription
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {employers.map((employer) => (
                      <tr key={employer.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            {employer.img && (
                              <img
                                src={employer.img}
                                alt="Logo"
                                className="h-10 w-10 rounded-full object-cover border border-gray-200"
                              />
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {employer.company_name || "Nom non défini"}
                              </div>
                              {employer.address && (
                                <div className="text-xs text-gray-500">
                                  {employer.address}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {employer.contact_person || "Contact non défini"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {employer.email}
                            </div>
                            {employer.phone && (
                              <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                <Phone className="h-3 w-3" />
                                {employer.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            className={
                              employer.validation_status === 'VALIDATED'
                                ? 'bg-green-100 text-green-800'
                                : employer.validation_status === 'REJECTED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }
                          >
                            {employer.validation_status === 'VALIDATED' && (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Validé
                              </>
                            )}
                            {employer.validation_status === 'REJECTED' && (
                              <>
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Rejeté
                              </>
                            )}
                            {employer.validation_status === 'PENDING' && (
                              <>
                                <Clock className="h-3 w-3 mr-1" />
                                En attente
                              </>
                            )}
                            {!employer.validation_status && (
                              <>
                                <Clock className="h-3 w-3 mr-1" />
                                Non défini
                              </>
                            )}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(employer.created_at).toLocaleDateString('fr-FR')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // TODO: Implémenter le modal de détails
                                console.log('Voir détails employeur:', employer);
                              }}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Voir
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {employers.length > 0 && pages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Affichage de {(page - 1) * limit + 1} à {Math.min(page * limit, total)} sur {total} employeurs
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Précédent
              </Button>
              <span className="px-3 py-1 text-sm text-gray-700">
                Page {page} sur {pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === pages}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
