"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { decodeToken } from "@/lib/jwt";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { ArrowLeft, Search, X, Eye } from "lucide-react";

type User = {
  id: number;
  email: string;
  role: string;
  created_at: string;
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

type EmployerProfile = {
  id: number;
  user_id: number;
  company_name?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  description?: string;
  validation_status?: string;
};

type UserProfile = StudentProfile | EmployerProfile | null;

const ADMIN_MENU = [
  { label: "Utilisateurs", href: "/admin/users" },
  { label: "Étudiants", href: "/admin/students" },
  { label: "Employeurs", href: "/admin/employers" },
  { label: "Modérateurs", href: "/admin/moderators" },
  { label: "Offres d'emploi", href: "/admin/jobs" },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string>("");
  const [availableRoles, setAvailableRoles] = useState<string[]>(["STUDENT", "EMPLOYER", "ADMIN"]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({ email: "", role: "" });
  const [editLoading, setEditLoading] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<UserProfile>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [employerJobs, setEmployerJobs] = useState<any[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [jobDetailsLoading, setJobDetailsLoading] = useState(false);
  const [jobApplicants, setJobApplicants] = useState<any[]>([]);
  const router = useRouter();
  const hasCheckedAuth = useRef(false);

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
      fetchUsers(1);
    }
  }, [isAdmin]);

  const fetchUsers = async (pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      let url = `/api/user?page=${pageNum}&limit=${limit}`;
      if (filterRole) {
        url += `&role=${encodeURIComponent(filterRole)}`;
      }
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }

      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      setUsers(data.data || []);
      setTotal(data.pagination?.total || 0);
      setPage(pageNum);
    } catch (err: any) {
      console.error('fetchUsers error', err);
      setError(err?.message || 'Erreur lors de la récupération');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleRoleFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterRole(e.target.value);
    setPage(1);
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers(1);
    }
  }, [searchQuery, filterRole, isAdmin]);

  const changeRole = async (id: number, newRole: string) => {
    if (!confirm(`Changer le rôle de l'utilisateur ${id} en ${newRole} ?`)) return;
    try {
      const res = await fetch(`/api/user/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      alert('Rôle modifié');
      fetchUsers(page);
    } catch (err: any) {
      console.error('changeRole error', err);
      alert(err?.message || 'Erreur lors de la modification');
    }
  };

  const deleteUser = async (id: number) => {
    if (!confirm(`Supprimer l'utilisateur ${id} ? Cette action est irréversible.`)) return;
    try {
      const res = await fetch(`/api/user/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      alert('Utilisateur supprimé');
      fetchUsers(page);
    } catch (err: any) {
      console.error('deleteUser error', err);
      alert(err?.message || 'Erreur lors de la suppression');
    }
  };

  const openDetailModal = (user: User) => {
    setSelectedUser(user);
    setProfileLoading(true);
    setShowDetailModal(true);
    
    // Récupérer les infos du profil
    fetch(`/api/user/${user.id}/profile`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then(res => {
        if (!res.ok) {
          console.error('Erreur API:', res.status);
          return res.json().then(data => { throw new Error(data.error || 'Erreur'); });
        }
        return res.json();
      })
      .then(data => {
        console.log('Profil reçu:', data);
        if (data.success) {
          setSelectedProfile(data.data.profile);
          
          // Si c'est un employeur, récupérer ses jobs
          if (user.role === 'EMPLOYER') {
            setJobsLoading(true);
            fetch(`/api/admin/jobs?employer_id=${user.id}&page=1&limit=50`, {
              headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            })
              .then(res => res.json())
              .then(data => {
                if (data.success) {
                  setEmployerJobs(data.data || []);
                }
              })
              .catch(err => {
                console.error('Erreur chargement jobs:', err);
                setEmployerJobs([]);
              })
              .finally(() => setJobsLoading(false));
          }
        }
      })
      .catch(err => {
        console.error('Erreur lors du chargement du profil:', err);
        setSelectedProfile(null);
      })
      .finally(() => setProfileLoading(false));
  };

  const openEditModal = () => {
    if (selectedUser) {
      const newEditData: any = { email: selectedUser.email, role: selectedUser.role };
      
      // Ajouter les champs du profil si disponibles
      if (selectedProfile) {
        if (selectedUser.role === 'STUDENT') {
          const student = selectedProfile as StudentProfile;
          newEditData.first_name = student.first_name || '';
          newEditData.last_name = student.last_name || '';
          newEditData.phone = student.phone || '';
          newEditData.university = student.university || '';
          newEditData.department = student.department || '';
          newEditData.year_of_study = student.year_of_study || '';
          newEditData.hourly_rate = student.hourly_rate || '';
          newEditData.bio = student.bio || '';
        } else if (selectedUser.role === 'EMPLOYER') {
          const employer = selectedProfile as EmployerProfile;
          newEditData.company_name = employer.company_name || '';
          newEditData.contact_person = employer.contact_person || '';
          newEditData.phone = employer.phone || '';
          newEditData.address = employer.address || '';
          newEditData.description = employer.description || '';
        }
      }
      
      setEditData(newEditData);
      setShowDetailModal(false);
      setShowEditModal(true);
    }
  };

  const saveUserChanges = async () => {
    if (!selectedUser) return;
    if (!editData.email.trim()) {
      alert('L\'email ne peut pas être vide');
      return;
    }

    setEditLoading(true);
    try {
      const res = await fetch(`/api/user/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ email: editData.email, role: editData.role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');

      // Mettre à jour le profil si des données de profil sont présentes
      if (Object.keys(editData).some(key => !['email', 'role'].includes(key))) {
        const profileData = Object.keys(editData).reduce((acc: any, key) => {
          if (!['email', 'role'].includes(key)) {
            acc[key] = (editData as any)[key];
          }
          return acc;
        }, {});

        if (Object.keys(profileData).length > 0) {
          const profileRes = await fetch(`/api/user/${selectedUser.id}/profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            body: JSON.stringify(profileData),
          });
          const profileResult = await profileRes.json();
          if (!profileRes.ok) throw new Error(profileResult.error || 'Erreur profil');
        }
      }

      alert('Utilisateur modifié avec succès');
      setShowEditModal(false);
      setSelectedUser(null);
      setSelectedProfile(null);
      fetchUsers(page);
    } catch (err: any) {
      console.error('saveUserChanges error', err);
      alert(err?.message || 'Erreur lors de la modification');
    } finally {
      setEditLoading(false);
    }
  };

  const openJobDetailModal = (job: any) => {
    setSelectedJob(job);
    setShowJobModal(true);
    setJobDetailsLoading(true);

    fetch(`/api/admin/jobs/${job.id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setJobApplicants(data.data.applicants || []);
        }
      })
      .catch(err => {
        console.error('Erreur chargement détails job:', err);
        setJobApplicants([]);
      })
      .finally(() => setJobDetailsLoading(false));
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
          <h1 className="text-3xl font-bold text-slate-900">Gestion des utilisateurs</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Menu latéral */}
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
                      item.href === '/admin/users'
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

          {/* Contenu principal */}
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
                      Rechercher (Email)
                    </label>
                    <Input
                      type="text"
                      placeholder="Entrez un email..."
                      value={searchQuery}
                      onChange={handleSearch}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Filtrer par Rôle
                    </label>
                    <select
                      value={filterRole}
                      onChange={handleRoleFilter}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Tous les rôles</option>
                      {availableRoles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-6 border-b flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total: {total} utilisateurs</p>
                </div>
                <Button onClick={() => fetchUsers(page)} disabled={loading}>
                  {loading ? 'Rafraîchir...' : 'Rafraîchir'}
                </Button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="text-left p-4 font-semibold text-slate-900">ID</th>
                      <th className="text-left p-4 font-semibold text-slate-900">Email</th>
                      <th className="text-left p-4 font-semibold text-slate-900">Rôle</th>
                      <th className="text-left p-4 font-semibold text-slate-900">Créé le</th>
                      <th className="text-right p-4 font-semibold text-slate-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-medium">{u.id}</td>
                        <td className="p-4">{u.email}</td>
                        <td className="p-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                            u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                            u.role === 'EMPLOYER' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-slate-600">
                          {new Date(u.created_at).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="p-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDetailModal(u)}
                            className="flex items-center gap-1"
                          >
                            <Eye className="h-4 w-4" />
                            Détails
                          </Button>
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
                    onClick={() => fetchUsers(page - 1)}
                  >
                    Précédent
                  </Button>
                  <Button
                    variant="outline"
                    disabled={page === pages}
                    onClick={() => fetchUsers(page + 1)}
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
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900">Détails de l'utilisateur</h2>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedProfile(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Infos Utilisateur */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">Informations Compte</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">ID</label>
                    <p className="text-slate-900">{selectedUser.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <p className="text-slate-900">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Rôle</label>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      selectedUser.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                      selectedUser.role === 'EMPLOYER' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {selectedUser.role}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Créé le</label>
                    <p className="text-slate-900">{new Date(selectedUser.created_at).toLocaleDateString('fr-FR')} à {new Date(selectedUser.created_at).toLocaleTimeString('fr-FR')}</p>
                  </div>
                </div>
              </div>

              {/* Infos Profil */}
              {profileLoading ? (
                <div className="text-center py-4">
                  <p className="text-slate-600">Chargement du profil...</p>
                </div>
              ) : selectedProfile ? (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">
                    {selectedUser.role === 'STUDENT' ? 'Profil Étudiant' : 'Profil Employeur'}
                  </h3>
                  <div className="space-y-4">
                    {selectedUser.role === 'STUDENT' ? (
                      <>
                        {(selectedProfile as StudentProfile).first_name && (
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Prénom</label>
                            <p className="text-slate-900">{(selectedProfile as StudentProfile).first_name}</p>
                          </div>
                        )}
                        {(selectedProfile as StudentProfile).last_name && (
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nom</label>
                            <p className="text-slate-900">{(selectedProfile as StudentProfile).last_name}</p>
                          </div>
                        )}
                        {(selectedProfile as StudentProfile).phone && (
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone</label>
                            <p className="text-slate-900">{(selectedProfile as StudentProfile).phone}</p>
                          </div>
                        )}
                        {(selectedProfile as StudentProfile).university && (
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Université</label>
                            <p className="text-slate-900">{(selectedProfile as StudentProfile).university}</p>
                          </div>
                        )}
                        {(selectedProfile as StudentProfile).department && (
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Département</label>
                            <p className="text-slate-900">{(selectedProfile as StudentProfile).department}</p>
                          </div>
                        )}
                        {(selectedProfile as StudentProfile).year_of_study && (
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Année d'études</label>
                            <p className="text-slate-900">{(selectedProfile as StudentProfile).year_of_study}</p>
                          </div>
                        )}
                        {(selectedProfile as StudentProfile).hourly_rate && (
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Taux horaire</label>
                            <p className="text-slate-900">{(selectedProfile as StudentProfile).hourly_rate}€/h</p>
                          </div>
                        )}
                        {(selectedProfile as StudentProfile).bio && (
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
                            <p className="text-slate-900">{(selectedProfile as StudentProfile).bio}</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        {(selectedProfile as EmployerProfile).company_name && (
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nom Entreprise</label>
                            <p className="text-slate-900">{(selectedProfile as EmployerProfile).company_name}</p>
                          </div>
                        )}
                        {(selectedProfile as EmployerProfile).contact_person && (
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Personne de Contact</label>
                            <p className="text-slate-900">{(selectedProfile as EmployerProfile).contact_person}</p>
                          </div>
                        )}
                        {(selectedProfile as EmployerProfile).phone && (
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone</label>
                            <p className="text-slate-900">{(selectedProfile as EmployerProfile).phone}</p>
                          </div>
                        )}
                        {(selectedProfile as EmployerProfile).address && (
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Adresse</label>
                            <p className="text-slate-900">{(selectedProfile as EmployerProfile).address}</p>
                          </div>
                        )}
                        {(selectedProfile as EmployerProfile).description && (
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                            <p className="text-slate-900">{(selectedProfile as EmployerProfile).description}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-slate-600">Aucun profil créé</p>
                </div>
              )}

              {/* Historique des Jobs (si employeur) */}
              {selectedUser.role === 'EMPLOYER' && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">Historique des Offres d'Emploi</h3>
                  {jobsLoading ? (
                    <p className="text-slate-600">Chargement des jobs...</p>
                  ) : employerJobs.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="text-left p-3 font-semibold text-slate-900 text-sm">Titre</th>
                            <th className="text-left p-3 font-semibold text-slate-900 text-sm">Lieu</th>
                            <th className="text-left p-3 font-semibold text-slate-900 text-sm">Candidatures</th>
                            <th className="text-left p-3 font-semibold text-slate-900 text-sm">Statut</th>
                            <th className="text-left p-3 font-semibold text-slate-900 text-sm">Date</th>
                            <th className="text-center p-3 font-semibold text-slate-900 text-sm">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {employerJobs.map((job) => (
                            <tr key={job.id} className="hover:bg-slate-50">
                              <td className="p-3 text-sm text-slate-900">{job.title}</td>
                              <td className="p-3 text-sm text-slate-600">{job.location || '-'}</td>
                              <td className="p-3 text-sm text-slate-900 font-medium">{job.applicants || 0}</td>
                              <td className="p-3 text-sm">
                                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                  job.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {job.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="p-3 text-sm text-slate-600">{new Date(job.posted_at).toLocaleDateString('fr-FR')}</td>
                              <td className="p-3 text-center">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openJobDetailModal(job)}
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
                    <p className="text-slate-600">Aucune offre d'emploi</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedProfile(null);
                }}
                className="flex-1"
              >
                Fermer
              </Button>
              <Button
                onClick={openEditModal}
                className="flex-1"
              >
                Modifier
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Édition */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900">Modifier l'utilisateur</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedUser(null);
                  setSelectedProfile(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Infos Compte */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">Informations Compte</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                    <Input
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Rôle</label>
                    <select
                      value={editData.role}
                      onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {availableRoles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Infos Profil */}
              {selectedProfile && selectedUser.role === 'STUDENT' && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">Profil Étudiant</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Prénom</label>
                      <Input
                        type="text"
                        value={(editData as any).first_name || ''}
                        onChange={(e) => setEditData({ ...editData, first_name: e.target.value } as any)}
                        placeholder="Prénom"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Nom</label>
                      <Input
                        type="text"
                        value={(editData as any).last_name || ''}
                        onChange={(e) => setEditData({ ...editData, last_name: e.target.value } as any)}
                        placeholder="Nom"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Téléphone</label>
                      <Input
                        type="tel"
                        value={(editData as any).phone || ''}
                        onChange={(e) => setEditData({ ...editData, phone: e.target.value } as any)}
                        placeholder="Téléphone"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Université</label>
                      <Input
                        type="text"
                        value={(editData as any).university || ''}
                        onChange={(e) => setEditData({ ...editData, university: e.target.value } as any)}
                        placeholder="Université"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Département</label>
                      <Input
                        type="text"
                        value={(editData as any).department || ''}
                        onChange={(e) => setEditData({ ...editData, department: e.target.value } as any)}
                        placeholder="Département"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Année d'études</label>
                      <Input
                        type="number"
                        value={(editData as any).year_of_study || ''}
                        onChange={(e) => setEditData({ ...editData, year_of_study: e.target.value } as any)}
                        placeholder="Année d'études"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Taux horaire (€/h)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={(editData as any).hourly_rate || ''}
                        onChange={(e) => setEditData({ ...editData, hourly_rate: e.target.value } as any)}
                        placeholder="Taux horaire"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Bio</label>
                      <textarea
                        value={(editData as any).bio || ''}
                        onChange={(e) => setEditData({ ...editData, bio: e.target.value } as any)}
                        placeholder="Bio"
                        rows={4}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedProfile && selectedUser.role === 'EMPLOYER' && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">Profil Employeur</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Nom Entreprise</label>
                      <Input
                        type="text"
                        value={(editData as any).company_name || ''}
                        onChange={(e) => setEditData({ ...editData, company_name: e.target.value } as any)}
                        placeholder="Nom Entreprise"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Personne de Contact</label>
                      <Input
                        type="text"
                        value={(editData as any).contact_person || ''}
                        onChange={(e) => setEditData({ ...editData, contact_person: e.target.value } as any)}
                        placeholder="Personne de Contact"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Téléphone</label>
                      <Input
                        type="tel"
                        value={(editData as any).phone || ''}
                        onChange={(e) => setEditData({ ...editData, phone: e.target.value } as any)}
                        placeholder="Téléphone"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Adresse</label>
                      <Input
                        type="text"
                        value={(editData as any).address || ''}
                        onChange={(e) => setEditData({ ...editData, address: e.target.value } as any)}
                        placeholder="Adresse"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                      <textarea
                        value={(editData as any).description || ''}
                        onChange={(e) => setEditData({ ...editData, description: e.target.value } as any)}
                        placeholder="Description"
                        rows={4}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedUser(null);
                  setSelectedProfile(null);
                }}
                className="flex-1"
                disabled={editLoading}
              >
                Annuler
              </Button>
              <Button
                onClick={saveUserChanges}
                className="flex-1"
                disabled={editLoading}
              >
                {editLoading ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Détails Job */}
      {showJobModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900">Détails de l'offre d'emploi</h2>
              <button
                onClick={() => {
                  setShowJobModal(false);
                  setSelectedJob(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Infos Job */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">Informations de l'offre</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Titre</label>
                    <p className="text-slate-900">{selectedJob.title}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Entreprise</label>
                    <p className="text-slate-900">{selectedJob.company}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Lieu</label>
                    <p className="text-slate-900">{selectedJob.location}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Type de Service</label>
                    <p className="text-slate-900">{selectedJob.service_type}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Salaire</label>
                    <p className="text-slate-900">{selectedJob.salary || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Statut</label>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      selectedJob.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedJob.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                    <p className="text-slate-900">{selectedJob.description}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Exigences</label>
                    <p className="text-slate-900">{selectedJob.requirements || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Candidatures */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">Candidatures ({jobApplicants.length})</h3>
                {jobDetailsLoading ? (
                  <p className="text-slate-600">Chargement des candidatures...</p>
                ) : jobApplicants.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="text-left p-3 font-semibold text-slate-900 text-sm">Étudiant</th>
                          <th className="text-left p-3 font-semibold text-slate-900 text-sm">Email</th>
                          <th className="text-left p-3 font-semibold text-slate-900 text-sm">Date Candidature</th>
                          <th className="text-left p-3 font-semibold text-slate-900 text-sm">Statut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {jobApplicants.map((applicant) => (
                          <tr key={applicant.id} className="hover:bg-slate-50">
                            <td className="p-3 text-sm text-slate-900">
                              {applicant.first_name} {applicant.last_name}
                            </td>
                            <td className="p-3 text-sm text-slate-600">{applicant.user_email || applicant.email}</td>
                            <td className="p-3 text-sm text-slate-600">
                              {new Date(applicant.applied_at).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="p-3 text-sm">
                              <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                applicant.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                                applicant.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                applicant.status === 'INTERVIEW' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {applicant.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-slate-600">Aucune candidature pour cette offre</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowJobModal(false);
                  setSelectedJob(null);
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

