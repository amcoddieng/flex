"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { decodeToken } from "@/lib/jwt";
import { AdminLayout } from "@/components/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, User, Mail, Calendar, GraduationCap, Phone, CheckCircle, Clock, AlertTriangle, Eye, Shield, ShieldOff, Trash2 } from "lucide-react";
import { StudentManagementModal } from "@/components/admin/student-management-modal";

type Student = {
  id: number;
  email: string;
  role: string;
  blocked: boolean;
  created_at: string;
  profile_id?: number;
  first_name?: string;
  last_name?: string;
  phone?: string;
  university?: string;
  department?: string;
  year_of_study?: number;
  validation_status?: string;
};

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [isAuthed, setIsAuthed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    fetchStudents(token);
  }, [router]);

  const fetchStudents = async (token: string) => {
    setLoading(true);
    setError(null);
    
    try {
      let url = `/api/admin/students?page=${page}&limit=${limit}`;
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
        throw new Error('Erreur lors de la récupération des étudiants');
      }

      const data = await res.json();
      if (data.success) {
        // Trier les étudiants: PENDING en premier
        const sortedStudents = (data.data || []).sort((a: Student, b: Student) => {
          if (a.validation_status === 'PENDING' && b.validation_status !== 'PENDING') return -1;
          if (a.validation_status !== 'PENDING' && b.validation_status === 'PENDING') return 1;
          return 0;
        });
        
        setStudents(sortedStudents);
        setTotal(data.pagination?.total || 0);
      } else {
        throw new Error(data.error || 'Données invalides');
      }
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('fetchStudents error:', message);
      setError(message);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentUpdate = async (studentId: number, updates: any) => {
    try {
      const token = getValidToken();
      if (!token) return;

      console.log('Updating student:', studentId, updates);

      const response = await fetch(`/api/admin/students/${studentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      });

      const responseText = await response.text();
      console.log('Response:', response.status, responseText);

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (e) {
          errorData = { error: responseText };
        }
        alert(errorData.error || 'Erreur lors de la mise à jour');
        return;
      }

      await fetchStudents(token);
      setIsModalOpen(false);
      alert('Étudiant mis à jour avec succès');
    } catch (error: any) {
      console.error('handleStudentUpdate error:', error);
      alert(error.message || 'Erreur lors de la mise à jour');
    }
  };

  const handleStudentDelete = async (studentId: number) => {
    try {
      const token = getValidToken();
      if (!token) return;

      const response = await fetch(`/api/admin/students/${studentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || 'Erreur lors de la suppression');
        return;
      }

      await fetchStudents(token);
      setIsModalOpen(false);
      alert('Étudiant supprimé avec succès');
    } catch (error: any) {
      console.error('handleStudentDelete error:', error);
      alert(error.message || 'Erreur lors de la suppression');
    }
  };

  useEffect(() => {
    if (isAuthed) {
      const token = getValidToken();
      if (token) {
        fetchStudents(token);
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
            Gestion des Étudiants
          </h1>
          <p className="text-gray-600">
            Consultez et gérez tous les comptes étudiants de la plateforme
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
                    placeholder="Rechercher par nom, email, université..."
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

        {/* Students List */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement des étudiants...</p>
              </div>
            ) : students.length === 0 ? (
              <div className="p-8 text-center">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Aucun étudiant trouvé
                </h3>
                <p className="text-gray-600">
                  {searchQuery || filterStatus
                    ? "Aucun étudiant ne correspond à vos critères de recherche."
                    : "Aucun étudiant n'est enregistré sur la plateforme."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Étudiant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Université
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
                    {students.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {student.first_name && student.last_name
                                ? `${student.first_name} ${student.last_name}`
                                : "Nom non défini"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {student.email}
                            </div>
                            {student.phone && (
                              <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                <Phone className="h-3 w-3" />
                                {student.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {student.university || "Non spécifiée"}
                          </div>
                          {student.department && (
                            <div className="text-xs text-gray-500">
                              {student.department}
                              {student.year_of_study && ` - ${student.year_of_study}e année`}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            className={
                              student.validation_status === 'VALIDATED'
                                ? 'bg-green-100 text-green-800'
                                : student.validation_status === 'REJECTED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }
                          >
                            {student.validation_status === 'VALIDATED' && (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Validé
                              </>
                            )}
                            {student.validation_status === 'REJECTED' && (
                              <>
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Rejeté
                              </>
                            )}
                            {student.validation_status === 'PENDING' && (
                              <>
                                <Clock className="h-3 w-3 mr-1" />
                                En attente
                              </>
                            )}
                            {!student.validation_status && (
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
                            {new Date(student.created_at).toLocaleDateString('fr-FR')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedStudent(student);
                                setIsModalOpen(true);
                              }}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Gérer
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
        {students.length > 0 && pages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Affichage de {(page - 1) * limit + 1} à {Math.min(page * limit, total)} sur {total} étudiants
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

      {/* Modal de gestion des étudiants */}
      <StudentManagementModal
        student={selectedStudent}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedStudent(null);
        }}
        onUpdate={handleStudentUpdate}
        onDelete={handleStudentDelete}
      />
    </AdminLayout>
  );
}
