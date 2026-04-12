"use client";

import { useState, useEffect } from "react";
import { X, Mail, Phone, Calendar, User, Building, BookOpen, Award, Shield, Ban, CheckCircle, Trash2, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type UserDetailsModalProps = {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (userId: number, action: string) => void;
};

export function UserDetailsModal({ user, isOpen, onClose, onStatusChange }: UserDetailsModalProps) {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user && user.id) {
      fetchUserApplications();
    }
  }, [isOpen, user]);

  const fetchUserApplications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      console.log('Fetching applications for user:', user.id);
      const response = await fetch(`/api/admin/users/${user.id}/applications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Applications response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Applications data:', data);
        setApplications(data.data || []);
      } else {
        const errorData = await response.json();
        console.error('Applications API error:', errorData);
      }
    } catch (error) {
      console.error('Error fetching user applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800';
      case 'EMPLOYER': return 'bg-blue-100 text-blue-800';
      case 'STUDENT': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Administrateur';
      case 'EMPLOYER': return 'Employeur';
      case 'STUDENT': return 'Étudiant';
      default: return role;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VALIDATED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'VALIDATED': return 'Validé';
      case 'PENDING': return 'En attente';
      case 'REJECTED': return 'Rejeté';
      default: return status;
    }
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Détails de l'utilisateur</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Informations principales */}
            <div className="lg:col-span-2 space-y-6">
              {/* Informations générales */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Informations générales
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">Nom complet</span>
                      <p className="font-medium text-gray-900">
                        {user.first_name} {user.last_name}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Email</span>
                      <p className="text-gray-900">{user.email}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Téléphone</span>
                      <p className="text-gray-900">{user.phone || 'Non spécifié'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Rôle</span>
                      <div className="mt-1">
                        <Badge className={getRoleColor(user.role)}>
                          {getRoleLabel(user.role)}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Date d'inscription</span>
                      <p className="text-gray-900">
                        {new Date(user.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Statut</span>
                      <div className="mt-1">
                        <Badge className={getStatusColor(user.status)}>
                          {getStatusLabel(user.status)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Informations spécifiques selon le rôle */}
              {user.role === 'STUDENT' && user.student_profile && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Profil étudiant
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-500">Université</span>
                        <p className="text-gray-900">{user.student_profile.university || 'Non spécifié'}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Département</span>
                        <p className="text-gray-900">{user.student_profile.department || 'Non spécifié'}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Année d'étude</span>
                        <p className="text-gray-900">{user.student_profile.year_of_study || 'Non spécifié'}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Carte étudiante</span>
                        <p className="text-gray-900">
                          {user.student_profile.student_card_pdf ? '✅ Disponible' : '❌ Non fournie'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {user.role === 'EMPLOYER' && user.employer_profile && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Profil employeur
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-500">Nom de l'entreprise</span>
                        <p className="text-gray-900">{user.employer_profile.company_name || 'Non spécifié'}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Personne à contacter</span>
                        <p className="text-gray-900">{user.employer_profile.contact_person || 'Non spécifié'}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Email</span>
                        <p className="text-gray-900">{user.employer_profile.email || 'Non spécifié'}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Téléphone</span>
                        <p className="text-gray-900">{user.employer_profile.phone || 'Non spécifié'}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Adresse</span>
                        <p className="text-gray-900">{user.employer_profile.address || 'Non spécifié'}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Description</span>
                        <p className="text-gray-900">{user.employer_profile.description || 'Non spécifié'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Candidatures (pour les étudiants) */}
              {user.role === 'STUDENT' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Candidatures ({applications.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : applications.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">Aucune candidature trouvée</p>
                    ) : (
                      <div className="space-y-3">
                        {applications.map((app) => (
                          <div key={app.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-gray-900">{app.job_title}</h4>
                                <p className="text-sm text-gray-600">{app.company_name}</p>
                                <p className="text-xs text-gray-500">
                                  Candidaté le {new Date(app.applied_at).toLocaleDateString('fr-FR')}
                                </p>
                              </div>
                              <Badge className={
                                app.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                                app.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                app.status === 'INTERVIEW' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                              }>
                                {app.status === 'ACCEPTED' ? 'Accepté' :
                                 app.status === 'REJECTED' ? 'Rejeté' :
                                 app.status === 'INTERVIEW' ? 'Entretien' :
                                 'En attente'}
                              </Badge>
                            </div>
                            {app.message && (
                              <p className="mt-2 text-sm text-gray-600">{app.message}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-6">
              {/* Actions rapides */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {user.role === 'STUDENT' && (
                    <>
                      {user.student_profile?.validation_status === 'PENDING' && (
                        <Button 
                          className="w-full" 
                          onClick={() => onStatusChange?.(user.id, 'validate_student')}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Valider l'étudiant
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={() => onStatusChange?.(user.id, 'reject_student')}
                      >
                        <Ban className="h-4 w-4 mr-2" />
                        Rejeter l'étudiant
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={() => onStatusChange?.(user.id, 'toggle_active')}
                      >
                        {user.is_active ? (
                          <>
                            <Lock className="h-4 w-4 mr-2" />
                            Bloquer le compte
                          </>
                        ) : (
                          <>
                            <Unlock className="h-4 w-4 mr-2" />
                            Débloquer le compte
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="destructive" 
                        className="w-full" 
                        onClick={() => onStatusChange?.(user.id, 'delete_user')}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer le compte
                      </Button>
                    </>
                  )}
                  
                  {user.role === 'EMPLOYER' && (
                    <>
                      {user.employer_profile?.validation_status === 'PENDING' && (
                        <Button 
                          className="w-full" 
                          onClick={() => onStatusChange?.(user.id, 'validate_employer')}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Valider l'employeur
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={() => onStatusChange?.(user.id, 'reject_employer')}
                      >
                        <Ban className="h-4 w-4 mr-2" />
                        Rejeter l'employeur
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={() => onStatusChange?.(user.id, 'toggle_active')}
                      >
                        {user.is_active ? (
                          <>
                            <Lock className="h-4 w-4 mr-2" />
                            Bloquer le compte
                          </>
                        ) : (
                          <>
                            <Unlock className="h-4 w-4 mr-2" />
                            Débloquer le compte
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="destructive" 
                        className="w-full" 
                        onClick={() => onStatusChange?.(user.id, 'delete_user')}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer le compte
                      </Button>
                    </>
                  )}

                  {/* Actions pour les autres rôles (admin, etc.) */}
                  {user.role === 'ADMIN' && (
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => onStatusChange?.(user.id, 'toggle_active')}
                    >
                      {user.is_active ? (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          Bloquer le compte
                        </>
                      ) : (
                        <>
                          <Unlock className="h-4 w-4 mr-2" />
                          Débloquer le compte
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Statistiques */}
              <Card>
                <CardHeader>
                  <CardTitle>Statistiques</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {user.role === 'STUDENT' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Candidatures totales</span>
                        <span className="font-medium">{applications.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Candidatures acceptées</span>
                        <span className="font-medium text-green-600">
                          {applications.filter(app => app.status === 'ACCEPTED').length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">En attente</span>
                        <span className="font-medium text-yellow-600">
                          {applications.filter(app => app.status === 'PENDING').length}
                        </span>
                      </div>
                    </>
                  )}
                  
                  {user.role === 'EMPLOYER' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Offres publiées</span>
                        <span className="font-medium">{user.job_count || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Offres actives</span>
                        <span className="font-medium text-green-600">{user.active_jobs || 0}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
