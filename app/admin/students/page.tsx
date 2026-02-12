"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { decodeToken } from "@/lib/jwt";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { ArrowLeft, Search, X, Eye } from "lucide-react";

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

type StudentProfile = {
  id: number;
  user_id: number;
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
  university?: string;
  department?: string;
  year_of_study?: number;
  bio?: string;
  hourly_rate?: number;
  validation_status?: string;
};

const ADMIN_MENU = [
  { label: "Utilisateurs", href: "/admin/users" },
  { label: "Étudiants", href: "/admin/students" },
  { label: "Employeurs", href: "/admin/employers" },
  { label: "Modérateurs", href: "/admin/moderators" },
  { label: "Offres d'emploi", href: "/admin/jobs" },
];

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<StudentProfile | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const router = useRouter();
  const hasCheckedAuth = useRef(false);

  const [studentApplications, setStudentApplications] = useState<any[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationDetailsLoading, setApplicationDetailsLoading] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const decoded = token ? decodeToken(token) : null;

  useEffect(() => {
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;

    if (!decoded || decoded.role !== 'ADMIN') {
      router.push('/login');
      return;
    }
    setIsAdmin(true);
  }, [decoded, router]);

  useEffect(() => {
    if (isAdmin) {
      fetchStudents(1);
    }
  }, [isAdmin]);

  const fetchStudents = async (pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      let url = `/api/admin/students?page=${pageNum}&limit=${limit}`;
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }
      if (filterStatus) {
        url += `&validation_status=${encodeURIComponent(filterStatus)}`;
      }

      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error('Erreur');
      const data = await res.json();
      
      // Trier les étudiants: PENDING en premier
      const sortedStudents = (data.data || []).sort((a: Student, b: Student) => {
        if (a.validation_status === 'PENDING' && b.validation_status !== 'PENDING') return -1;
        if (a.validation_status !== 'PENDING' && b.validation_status === 'PENDING') return 1;
        return 0;
      });
      
      setStudents(sortedStudents);
      setTotal(data.pagination?.total || 0);
      setPage(pageNum);
    } catch (err: any) {
      console.error('fetchStudents error', err);
      setError(err?.message || 'Erreur lors de la récupération');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value);
    setPage(1);
  };

  useEffect(() => {
    if (isAdmin) {
      fetchStudents(1);
    }
  }, [searchQuery, filterStatus, isAdmin]);

  const openDetailModal = (student: Student) => {
    setSelectedStudent(student);
    setProfileLoading(true);
    setShowDetailModal(true);
    
    // Récupérer les infos complètes du profil
    fetch(`/api/admin/students/${student.id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then(res => {
        if (!res.ok) throw new Error('Erreur');
        return res.json();
      })
      .then(data => {
        if (data.success) {
          setSelectedProfile(data.data.profile);
          
          // Charger les candidatures de l'étudiant
          setApplicationsLoading(true);
          fetch(`/api/admin/applications?student_id=${data.data.profile.id}&page=1&limit=50`, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          })
            .then(res => res.json())
            .then(data => {
              if (data.success) {
                setStudentApplications(data.data || []);
              }
            })
            .catch(err => {
              console.error('Erreur chargement candidatures:', err);
              setStudentApplications([]);
            })
            .finally(() => setApplicationsLoading(false));
        }
      })
      .catch(err => {
        console.error('Erreur lors du chargement du profil:', err);
        setSelectedProfile(null);
      })
      .finally(() => setProfileLoading(false));
  };

  const openEditModal = () => {
    if (selectedStudent && selectedProfile) {
      setEditData({
        first_name: selectedProfile.first_name || '',
        last_name: selectedProfile.last_name || '',
        phone: selectedProfile.phone || '',
        university: selectedProfile.university || '',
        department: selectedProfile.department || '',
        year_of_study: selectedProfile.year_of_study || '',
        bio: selectedProfile.bio || '',
        hourly_rate: selectedProfile.hourly_rate || '',
        validation_status: selectedProfile.validation_status || 'PENDING',
      });
      setShowDetailModal(false);
      setShowEditModal(true);
    }
  };

  const toggleBlockStatus = async () => {
    if (!selectedStudent) return;

    setEditLoading(true);
    try {
      const res = await fetch(`/api/admin/students/${selectedStudent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ blocked: !selectedStudent.blocked }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      
      alert(selectedStudent.blocked ? 'Étudiant débloqué' : 'Étudiant bloqué');
      setShowDetailModal(false);
      setSelectedStudent(null);
      setSelectedProfile(null);
      fetchStudents(page);
    } catch (err: any) {
      console.error('toggleBlockStatus error', err);
      alert(err?.message || 'Erreur lors du changement de statut');
    } finally {
      setEditLoading(false);
    }
  };

  const saveStudentChanges = async () => {
    if (!selectedStudent) return;

    setEditLoading(true);
    try {
      const res = await fetch(`/api/admin/students/${selectedStudent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(editData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      
      alert('Étudiant modifié avec succès');
      setShowEditModal(false);
      setSelectedStudent(null);
      setSelectedProfile(null);
      fetchStudents(page);
    } catch (err: any) {
      console.error('saveStudentChanges error', err);
      alert(err?.message || 'Erreur lors de la modification');
    } finally {
      setEditLoading(false);
    }
  };

  const quickValidate = async (studentId: number, status: 'VALIDATED' | 'REJECTED') => {
    try {
      const res = await fetch(`/api/admin/students/${studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ validation_status: status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      
      fetchStudents(page);
    } catch (err: any) {
      console.error('quickValidate error', err);
      alert(err?.message || 'Erreur lors de la validation');
    }
  };

  const openApplicationDetailModal = (application: any) => {
    setSelectedApplication(application);
    setShowApplicationModal(true);
    setApplicationDetailsLoading(true);

    fetch(`/api/admin/applications/${application.id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSelectedApplication(data.data);
        }
      })
      .catch(err => {
        console.error('Erreur chargement détails candidature:', err);
      })
      .finally(() => setApplicationDetailsLoading(false));
  };

  if (!isAdmin) {
    return <div className="p-8">Vérification...</div>;
  }

  const pages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/admin" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Retour au panneau
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Gestion des étudiants</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4 sticky top-4">
              <h3 className="font-bold mb-4 text-slate-900">Menu</h3>
              <nav className="space-y-2">
                {ADMIN_MENU.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block px-3 py-2 rounded transition-colors ${
                      item.href === '/admin/students'
                        ? 'bg-blue-100 text-blue-900 font-semibold'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {/* Section Recherche et Filtres */}
              <div className="p-6 border-b space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Search className="h-5 w-5 text-slate-400" />
                  <h3 className="font-semibold text-slate-900">Recherche et Filtres</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Rechercher (Nom, Prénom, Email)
                    </label>
                    <Input
                      type="text"
                      placeholder="Entrez un nom ou email..."
                      value={searchQuery}
                      onChange={handleSearch}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Filtrer par Statut
                    </label>
                    <select
                      value={filterStatus}
                      onChange={handleStatusFilter}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Tous les statuts</option>
                      <option value="PENDING">En attente</option>
                      <option value="VALIDATED">Validé</option>
                      <option value="REJECTED">Rejeté</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-6 border-b flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total: {total} étudiants</p>
                </div>
                <Button onClick={() => fetchStudents(page)} disabled={loading}>
                  {loading ? 'Rafraîchir...' : 'Rafraîchir'}
                </Button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="text-left p-4 font-semibold text-slate-900">Prénom</th>
                      <th className="text-left p-4 font-semibold text-slate-900">Nom</th>
                      <th className="text-left p-4 font-semibold text-slate-900">Email</th>
                      <th className="text-left p-4 font-semibold text-slate-900">Statut</th>
                      <th className="text-left p-4 font-semibold text-slate-900">Bloqué</th>
                      <th className="text-right p-4 font-semibold text-slate-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.id} className={`border-b hover:bg-slate-50 transition-colors ${student.validation_status === 'PENDING' ? 'bg-yellow-50' : ''}`}>
                        <td className="p-4">{student.first_name || '-'}</td>
                        <td className="p-4">{student.last_name || '-'}</td>
                        <td className="p-4">{student.email}</td>
                        <td className="p-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                            student.validation_status === 'VALIDATED' ? 'bg-green-100 text-green-800' :
                            student.validation_status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {student.validation_status || 'N/A'}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                            student.blocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {student.blocked ? 'Bloqué' : 'Actif'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {student.validation_status === 'PENDING' ? (
                            <div className="flex items-center gap-2 justify-end">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => quickValidate(student.id, 'VALIDATED')}
                              >
                                Valider
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => quickValidate(student.id, 'REJECTED')}
                              >
                                Invalider
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openDetailModal(student)}
                              >
                                Détails
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDetailModal(student)}
                              className="flex items-center gap-1"
                            >
                              <Eye className="h-4 w-4" />
                              Détails
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-4 flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  Page {page} sur {pages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => fetchStudents(page - 1)}
                  >
                    Précédent
                  </Button>
                  <Button
                    variant="outline"
                    disabled={page === pages}
                    onClick={() => fetchStudents(page + 1)}
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Détails */}
      {showDetailModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Détails de l'étudiant</h2>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedStudent(null);
                  setSelectedProfile(null);
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-8">
              {/* Infos Utilisateur */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b-2 pb-2">Informations Compte</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">ID</label>
                    <p className="text-slate-900">{selectedStudent.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <p className="text-slate-900">{selectedStudent.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Statut du Compte</label>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      selectedStudent.blocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {selectedStudent.blocked ? 'Bloqué' : 'Actif'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Créé le</label>
                    <p className="text-slate-900">{new Date(selectedStudent.created_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
              </div>

              {/* Infos Profil */}
              {profileLoading ? (
                <div className="text-center py-8">
                  <p className="text-slate-600">Chargement du profil...</p>
                </div>
              ) : selectedProfile ? (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b-2 pb-2">Profil Étudiant</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {selectedProfile.first_name && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Prénom</label>
                        <p className="text-slate-900">{selectedProfile.first_name}</p>
                      </div>
                    )}
                    {selectedProfile.last_name && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Nom</label>
                        <p className="text-slate-900">{selectedProfile.last_name}</p>
                      </div>
                    )}
                    {selectedProfile.phone && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Téléphone</label>
                        <p className="text-slate-900">{selectedProfile.phone}</p>
                      </div>
                    )}
                    {selectedProfile.university && (
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Université</label>
                        <p className="text-slate-900">{selectedProfile.university}</p>
                      </div>
                    )}
                    {selectedProfile.department && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Département</label>
                        <p className="text-slate-900">{selectedProfile.department}</p>
                      </div>
                    )}
                    {selectedProfile.year_of_study && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Année d'études</label>
                        <p className="text-slate-900">{selectedProfile.year_of_study}</p>
                      </div>
                    )}
                    {selectedProfile.hourly_rate && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Taux horaire</label>
                        <p className="text-slate-900 font-semibold">{selectedProfile.hourly_rate}€/h</p>
                      </div>
                    )}
                    {selectedProfile.bio && (
                      <div className="col-span-3">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Bio</label>
                        <p className="text-slate-900">{selectedProfile.bio}</p>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Statut de Validation</label>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        selectedProfile.validation_status === 'VALIDATED' ? 'bg-green-100 text-green-800' :
                        selectedProfile.validation_status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedProfile.validation_status}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-600">Aucun profil créé</p>
                </div>
              )}

              {/* Historique des Candidatures */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b-2 pb-2">Historique des Candidatures</h3>
                {applicationsLoading ? (
                  <p className="text-slate-600">Chargement des candidatures...</p>
                ) : studentApplications.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="text-left p-3 font-semibold text-slate-900 text-sm">Offre d'emploi</th>
                          <th className="text-left p-3 font-semibold text-slate-900 text-sm">Entreprise</th>
                          <th className="text-left p-3 font-semibold text-slate-900 text-sm">Date Candidature</th>
                          <th className="text-left p-3 font-semibold text-slate-900 text-sm">Statut</th>
                          <th className="text-center p-3 font-semibold text-slate-900 text-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {studentApplications.map((app) => (
                          <tr key={app.id} className="hover:bg-slate-50">
                            <td className="p-3 text-sm text-slate-900">{app.job_title}</td>
                            <td className="p-3 text-sm text-slate-600">{app.employer_company || app.company || '-'}</td>
                            <td className="p-3 text-sm text-slate-600">
                              {new Date(app.applied_at).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="p-3 text-sm">
                              <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                app.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                                app.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                app.status === 'INTERVIEW' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {app.status}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openApplicationDetailModal(app)}
                              >
                                Voir
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-slate-600">Aucune candidature</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedStudent(null);
                  setSelectedProfile(null);
                }}
                className="flex-1"
              >
                Fermer
              </Button>
              <Button
                variant={selectedStudent.blocked ? "default" : "destructive"}
                onClick={toggleBlockStatus}
                disabled={editLoading}
                className="flex-1"
              >
                {editLoading ? 'Traitement...' : selectedStudent.blocked ? 'Débloquer' : 'Bloquer'}
              </Button>
              <Button
                onClick={openEditModal}
                disabled={!selectedProfile}
                className="flex-1"
              >
                Modifier
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Édition */}
      {showEditModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Modifier l'étudiant</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedStudent(null);
                  setSelectedProfile(null);
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-6 border-b-2 pb-2">Profil Étudiant</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Prénom</label>
                    <Input
                      type="text"
                      value={editData.first_name || ''}
                      onChange={(e) => setEditData({ ...editData, first_name: e.target.value })}
                      placeholder="Prénom"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Nom</label>
                    <Input
                      type="text"
                      value={editData.last_name || ''}
                      onChange={(e) => setEditData({ ...editData, last_name: e.target.value })}
                      placeholder="Nom"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Téléphone</label>
                    <Input
                      type="tel"
                      value={editData.phone || ''}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      placeholder="Téléphone"
                      className="w-full"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Université</label>
                    <Input
                      type="text"
                      value={editData.university || ''}
                      onChange={(e) => setEditData({ ...editData, university: e.target.value })}
                      placeholder="Université"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Département</label>
                    <Input
                      type="text"
                      value={editData.department || ''}
                      onChange={(e) => setEditData({ ...editData, department: e.target.value })}
                      placeholder="Département"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Année d'études</label>
                    <Input
                      type="number"
                      value={editData.year_of_study || ''}
                      onChange={(e) => setEditData({ ...editData, year_of_study: e.target.value })}
                      placeholder="Année d'études"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Taux horaire (€/h)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editData.hourly_rate || ''}
                      onChange={(e) => setEditData({ ...editData, hourly_rate: e.target.value })}
                      placeholder="Taux horaire"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Statut de Validation</label>
                    <select
                      value={editData.validation_status || 'PENDING'}
                      onChange={(e) => setEditData({ ...editData, validation_status: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="PENDING">En attente</option>
                      <option value="VALIDATED">Validé</option>
                      <option value="REJECTED">Rejeté</option>
                    </select>
                  </div>
                  <div className="col-span-3">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Bio</label>
                    <textarea
                      value={editData.bio || ''}
                      onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                      placeholder="Bio"
                      rows={4}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedStudent(null);
                  setSelectedProfile(null);
                }}
                className="flex-1"
                disabled={editLoading}
              >
                Annuler
              </Button>
              <Button
                onClick={saveStudentChanges}
                className="flex-1"
                disabled={editLoading}
              >
                {editLoading ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Détails Candidature */}
      {showApplicationModal && selectedApplication && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Détails de la Candidature</h2>
              <button
                onClick={() => {
                  setShowApplicationModal(false);
                  setSelectedApplication(null);
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-8">
              {/* Infos Offre */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b-2 pb-2">Informations de l'Offre</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Titre</label>
                    <p className="text-slate-900 font-semibold">{selectedApplication.job_title}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Entreprise</label>
                    <p className="text-slate-900">{selectedApplication.company}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Lieu</label>
                    <p className="text-slate-900">{selectedApplication.job_location}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Service</label>
                    <p className="text-slate-900">{selectedApplication.service_type}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Salaire</label>
                    <p className="text-slate-900">{selectedApplication.salary || '-'}</p>
                  </div>
                  {selectedApplication.job_description && (
                    <div className="col-span-3">
                      <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                      <p className="text-slate-900">{selectedApplication.job_description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Infos Candidature */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b-2 pb-2">Détails de la Candidature</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Date Candidature</label>
                    <p className="text-slate-900">
                      {new Date(selectedApplication.applied_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Statut</label>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      selectedApplication.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                      selectedApplication.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      selectedApplication.status === 'INTERVIEW' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedApplication.status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Date Début Souhaitée</label>
                    <p className="text-slate-900">
                      {selectedApplication.start_date 
                        ? new Date(selectedApplication.start_date).toLocaleDateString('fr-FR')
                        : '-'
                      }
                    </p>
                  </div>
                  {selectedApplication.message && (
                    <div className="col-span-3">
                      <label className="block text-sm font-medium text-slate-700 mb-2">Message de Candidature</label>
                      <p className="text-slate-900">{selectedApplication.message}</p>
                    </div>
                  )}
                  {selectedApplication.experience && (
                    <div className="col-span-3">
                      <label className="block text-sm font-medium text-slate-700 mb-2">Expérience</label>
                      <p className="text-slate-900">{selectedApplication.experience}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Infos Entretien (si applicable) */}
              {selectedApplication.interview_date && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b-2 pb-2">Détails de l'Entretien</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Date Entretien</label>
                      <p className="text-slate-900">
                        {new Date(selectedApplication.interview_date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    {selectedApplication.interview_time && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Heure</label>
                        <p className="text-slate-900">{selectedApplication.interview_time}</p>
                      </div>
                    )}
                    {selectedApplication.interview_location && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Lieu</label>
                        <p className="text-slate-900">{selectedApplication.interview_location}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Infos Étudiant */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b-2 pb-2">Informations de l'Étudiant</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Prénom</label>
                    <p className="text-slate-900">{selectedApplication.first_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Nom</label>
                    <p className="text-slate-900">{selectedApplication.last_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                    <p className="text-slate-900">{selectedApplication.user_email}</p>
                  </div>
                  {selectedApplication.phone && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Téléphone</label>
                      <p className="text-slate-900">{selectedApplication.phone}</p>
                    </div>
                  )}
                  {selectedApplication.university && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Université</label>
                      <p className="text-slate-900">{selectedApplication.university}</p>
                    </div>
                  )}
                  {selectedApplication.department && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Département</label>
                      <p className="text-slate-900">{selectedApplication.department}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <Button
                variant="outline"
                onClick={() => {
                  setShowApplicationModal(false);
                  setSelectedApplication(null);
                }}
                className="flex-1"
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
