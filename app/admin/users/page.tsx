"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { decodeToken } from "@/lib/jwt";
import { AdminLayout } from "@/components/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, User, Mail, Calendar, Users, Building, GraduationCap, Shield, Eye } from "lucide-react";
import { UserDetailsModal } from "@/components/admin/user-details-modal";

type User = {
  id: number;
  email: string;
  role: string;
  created_at: string;
  is_active?: boolean;
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
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  description?: string;
  validation_status?: string;
};

type UserProfile = StudentProfile | EmployerProfile | null;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [profiles, setProfiles] = useState<{ [key: number]: UserProfile }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [isAuthed, setIsAuthed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
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
    fetchUsers(token);
  }, [router]);

  const fetchUsers = async (token: string) => {
    setLoading(true);
    setError(null);
    
    try {
      let url = `/api/admin/users?page=${page}&limit=${limit}`;
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }
      if (filterRole) {
        url += `&role=${filterRole}`;
      }

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error('Erreur lors de la récupération des utilisateurs');
      }

      const data = await res.json();
      if (data.success) {
        setUsers(data.data || []);
        setTotal(data.pagination?.total || 0);
        
        // Récupérer les profils associés
        await fetchProfiles(token, data.data || []);
      } else {
        throw new Error(data.error || 'Données invalides');
      }
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('fetchUsers error:', message);
      setError(message);
      setUsers([]);
      setProfiles({});
    } finally {
      setLoading(false);
    }
  };

  const fetchProfiles = async (token: string, users: User[]) => {
    try {
      const profilesData: { [key: number]: UserProfile } = {};
      
      for (const user of users) {
        try {
          let profileUrl = '';
          if (user.role === 'STUDENT') {
            profileUrl = `/api/admin/students/${user.id}/profile`;
          } else if (user.role === 'EMPLOYER') {
            profileUrl = `/api/admin/employers/${user.id}/profile`;
          }

          if (profileUrl) {
            const profileRes = await fetch(profileUrl, {
              headers: { Authorization: `Bearer ${token}` },
            });
            
            if (profileRes.ok) {
              const profileData = await profileRes.json();
              if (profileData.success) {
                profilesData[user.id] = profileData.data;
              }
            }
          }
        } catch (err) {
          console.warn(`Failed to fetch profile for user ${user.id}:`, err);
        }
      }
      
      setProfiles(profilesData);
    } catch (err) {
      console.error('fetchProfiles error:', err);
    }
  };

  useEffect(() => {
    if (isAuthed) {
      const token = getValidToken();
      if (token) {
        fetchUsers(token);
      }
    }
  }, [page, searchQuery, filterRole, isAuthed]);

  const handleViewUser = (user: any) => {
    // Fusionner les données utilisateur avec le profil
    const userWithProfile = {
      ...user,
      ...profiles[user.id],
      first_name: profiles[user.id]?.first_name || user.email.split('@')[0],
      last_name: profiles[user.id]?.last_name || '',
      phone: profiles[user.id]?.phone || '',
      is_active: user.is_active !== false // Par défaut, considérer comme actif
    };
    setSelectedUser(userWithProfile);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
  };

  const handleUserAction = async (userId: number, action: string) => {
    try {
      console.log('User action triggered:', { userId, action });
      const token = getValidToken();
      if (!token) {
        console.error('No token found');
        return;
      }

      let endpoint = '';
      let body = {};
      let newStatus: boolean | undefined;

      switch (action) {
        case 'validate_student':
          endpoint = `/api/admin/students/${userId}`;
          body = { validation_status: 'VALIDATED' };
          break;
        case 'reject_student':
          endpoint = `/api/admin/students/${userId}`;
          body = { validation_status: 'REJECTED' };
          break;
        case 'validate_employer':
          endpoint = `/api/admin/employers/${userId}`;
          body = { validation_status: 'VALIDATED' };
          break;
        case 'reject_employer':
          endpoint = `/api/admin/employers/${userId}`;
          body = { validation_status: 'REJECTED' };
          break;
        case 'toggle_active':
          endpoint = `/api/admin/users/${userId}`;
          // Récupérer le statut actuel et l'inverser
          const currentUser = users.find((u: User) => u.id === userId);
          newStatus = !currentUser?.is_active;
          body = { is_active: newStatus };
          console.log('Toggle active for user:', userId, 'from', currentUser?.is_active, 'to', newStatus);
          break;
        case 'delete_user':
          endpoint = `/api/admin/users/${userId}`;
          // La suppression sera gérée par une méthode DELETE
          break;
        default:
          console.error('Unknown action:', action);
          return;
      }

      const method = action === 'delete_user' ? 'DELETE' : 'PUT';
      console.log('Making request:', { method, endpoint, body });

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: method === 'PUT' ? JSON.stringify(body) : undefined,
      });

      console.log('Response status:', res.status);

      if (res.ok) {
        console.log('Action successful:', action);
        // Mettre à jour localement
        if (action.includes('student') || action.includes('employer')) {
          // Mettre à jour le profil
          setProfiles((prev: { [key: number]: UserProfile }) => ({
            ...prev,
            [userId]: prev[userId] ? {
              ...prev[userId],
              validation_status: action.includes('validate') ? 'VALIDATED' : 'REJECTED'
            } : null
          }));
        } else if (action === 'toggle_active') {
          // Mettre à jour le statut actif
          setUsers((prev: User[]) => prev.map(user => 
            user.id === userId ? { ...user, is_active: !user.is_active } : user
          ));
        } else if (action === 'delete_user') {
          // Supprimer l'utilisateur de la liste
          setUsers((prev: User[]) => prev.filter(user => user.id !== userId));
          // Fermer le modal si l'utilisateur supprimé était sélectionné
          if (selectedUser && selectedUser.id === userId) {
            handleCloseModal();
          }
        }
        
        // Mettre à jour l'utilisateur sélectionné si le modal est ouvert
        if (selectedUser && selectedUser.id === userId) {
          setSelectedUser((prev: any) => {
            if (!prev) return null;
            if (action.includes('student') || action.includes('employer')) {
              return {
                ...prev,
                student_profile: action.includes('student') && prev.student_profile ? {
                  ...prev.student_profile,
                  validation_status: action.includes('validate') ? 'VALIDATED' : 'REJECTED'
                } : prev.student_profile,
                employer_profile: action.includes('employer') && prev.employer_profile ? {
                  ...prev.employer_profile,
                  validation_status: action.includes('validate') ? 'VALIDATED' : 'REJECTED'
                } : prev.employer_profile
              };
            } else if (action === 'toggle_active') {
              return { ...prev, is_active: newStatus };
            }
            return prev;
          });
        }
      } else {
        console.error('Action failed:', action, 'Status:', res.status);
        const errorData = await res.json();
        console.error('Error details:', errorData);
        alert(`Erreur lors de l'action: ${errorData.error || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('Error in handleUserAction:', error);
      alert('Une erreur est survenue lors de l\'action');
    }
  };

  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const pages = Math.ceil(total / limit);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'STUDENT':
        return <GraduationCap className="h-4 w-4" />;
      case 'EMPLOYER':
        return <Building className="h-4 w-4" />;
      case 'ADMIN':
        return <Shield className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'STUDENT':
        return 'bg-blue-100 text-blue-800';
      case 'EMPLOYER':
        return 'bg-purple-100 text-purple-800';
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProfileName = (user: User) => {
    const profile = profiles[user.id];
    if (!profile) return 'Profil non défini';
    
    if ('first_name' in profile) {
      // Student profile
      return `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Nom non défini';
    } else if ('company_name' in profile) {
      // Employer profile
      return profile.company_name || 'Entreprise non définie';
    }
    
    return 'Profil non défini';
  };

  const getProfileDetails = (user: User) => {
    const profile = profiles[user.id];
    if (!profile) return null;
    
    if ('university' in profile) {
      // Student profile
      return (
        <div className="text-xs text-gray-500">
          {profile.university && (
            <div className="flex items-center gap-1">
              <GraduationCap className="h-3 w-3" />
              {profile.university}
            </div>
          )}
          {profile.department && (
            <div>{profile.department}</div>
          )}
        </div>
      );
    } else if ('contact_person' in profile) {
      // Employer profile
      return (
        <div className="text-xs text-gray-500">
          {profile.contact_person && (
            <div>Contact: {profile.contact_person}</div>
          )}
          {profile.address && (
            <div>{profile.address}</div>
          )}
        </div>
      );
    }
    
    return null;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestion des Utilisateurs
          </h1>
          <p className="text-gray-600">
            Consultez et gérez tous les comptes utilisateurs de la plateforme
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
                    placeholder="Rechercher par email, nom, entreprise..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterRole === "" ? "default" : "outline"}
                  onClick={() => setFilterRole("")}
                  size="sm"
                >
                  Tous
                </Button>
                <Button
                  variant={filterRole === "STUDENT" ? "default" : "outline"}
                  onClick={() => setFilterRole("STUDENT")}
                  size="sm"
                >
                  Étudiants
                </Button>
                <Button
                  variant={filterRole === "EMPLOYER" ? "default" : "outline"}
                  onClick={() => setFilterRole("EMPLOYER")}
                  size="sm"
                >
                  Employeurs
                </Button>
                <Button
                  variant={filterRole === "ADMIN" ? "default" : "outline"}
                  onClick={() => setFilterRole("ADMIN")}
                  size="sm"
                >
                  Admins
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

        {/* Users List */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement des utilisateurs...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Aucun utilisateur trouvé
                </h3>
                <p className="text-gray-600">
                  {searchQuery || filterRole
                    ? "Aucun utilisateur ne correspond à vos critères de recherche."
                    : "Aucun utilisateur n'est enregistré sur la plateforme."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Utilisateur
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Profil
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rôle
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
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {getProfileName(user)}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getProfileDetails(user)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={getRoleBadgeColor(user.role)}>
                            <div className="flex items-center gap-1">
                              {getRoleIcon(user.role)}
                              <span>
                                {user.role === 'STUDENT' && 'Étudiant'}
                                {user.role === 'EMPLOYER' && 'Employeur'}
                                {user.role === 'ADMIN' && 'Admin'}
                                {user.role !== 'STUDENT' && user.role !== 'EMPLOYER' && user.role !== 'ADMIN' && user.role}
                              </span>
                            </div>
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(user.created_at).toLocaleDateString('fr-FR')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewUser(user)}
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
        {users.length > 0 && pages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Affichage de {(page - 1) * limit + 1} à {Math.min(page * limit, total)} sur {total} utilisateurs
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
      
      {/* User Details Modal */}
      <UserDetailsModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onStatusChange={handleUserAction}
      />
    </AdminLayout>
  );
}
