"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Users, MapPin, Clock, Calendar, Send, UserCheck } from 'lucide-react';

interface Member {
  id: number;
  member_name: string;
  member_role?: string;
}

interface Project {
  id: number;
  title: string;
  description: string;
  category: string;
  objective?: string;
  location?: string;
  duration?: string;
  max_participants: number;
  current_participants: number;
  profiles_sought?: string;
  requirements?: string;
  status: string;
  created_at: string;
  creator_name: string;
  creator_id?: number;
  creator_university?: string;
  creator_email?: string;
  members: Member[];
  applications_count: number;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isCreator, setIsCreator] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [existingApplication, setExistingApplication] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);

  // Log pour déboguer isCreator
  useEffect(() => {
    console.log('DEBUG useEffect - isCreator:', isCreator, 'project.status:', project?.status);
  }, [isCreator, project?.status]);

  // Récupérer les candidatures quand l'utilisateur est le créateur
  useEffect(() => {
    const currentToken = localStorage.getItem('token');
    if (isCreator && project && currentToken) {
      console.log('isCreator:', isCreator, 'applications.length:', applications.length);
      console.log('Récupération des candidatures car utilisateur est créateur');
      fetchApplications(project.id, currentToken);
    } else {
      console.log('Utilisateur n\'est pas créateur ou pas de token/project, pas de récupération des candidatures');
    }
  }, [isCreator, project]);

  // Rafraîchir le statut de la candidature côté candidat toutes les 10 secondes
  useEffect(() => {
    if (!hasApplied || !project) return;

    const interval = setInterval(async () => {
      const token = localStorage.getItem('token');
      if (token) {
        console.log('Rafraîchissement automatique du statut...');
        await checkApplicationStatus(project.id, token);
      }
    }, 10000); // 10 secondes

    return () => clearInterval(interval);
  }, [hasApplied, project]);

  // Forcer une vérification immédiate au chargement
  useEffect(() => {
    if (hasApplied && project) {
      const token = localStorage.getItem('token');
      if (token) {
        console.log('Vérification immédiate du statut au chargement...');
        setTimeout(() => {
          checkApplicationStatus(project.id, token);
        }, 1000); // 1 seconde après le chargement
      }
    }
  }, [hasApplied, project]);

  // Formulaire de candidature
  const [applicationForm, setApplicationForm] = useState({
    message: '',
    skills: '',
    availability: ''
  });
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [submittingApplication, setSubmittingApplication] = useState(false);

  useEffect(() => {
    if (params?.id) {
      fetchProject(parseInt(params.id as string));
    }
  }, [params?.id]);

  const fetchProject = async (projectId: number) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/student/projects/${projectId}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      if (response.ok) {
        const data = await response.json();
        setProject(data.data.project);
        
        // Vérifier si l'utilisateur est le créateur en utilisant le token JWT
        if (token) {
          try {
            // Décoder le token pour récupérer l'ID utilisateur
            const tokenParts = token.split('.');
            const payload = JSON.parse(atob(tokenParts[1]));
            const currentUserId = parseInt(payload.userId);
            console.log('Current user ID from token:', currentUserId);
            console.log('Project creator_id:', data.data.project.creator_id);
            
            // Récupérer le profile_id de l'utilisateur courant
            const profileResponse = await fetch('/api/student/profile', {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (profileResponse.ok) {
              const profileData = await profileResponse.json();
              console.log('📋 Profile response data:', profileData);
              
              // Vérifier la structure de la réponse
              let currentProfileId = null;
              if (profileData && profileData.data && profileData.data.student) {
                currentProfileId = profileData.data.student.id;
                console.log('✅ Structure trouvée: data.student.id');
              } else if (profileData && profileData.student && profileData.student.id) {
                currentProfileId = profileData.student.id;
                console.log('✅ Structure trouvée: student.id');
              } else if (profileData && profileData.data && profileData.data.id) {
                currentProfileId = profileData.data.id;
                console.log('✅ Structure trouvée: data.id');
              } else if (profileData && profileData.id) {
                currentProfileId = profileData.id;
                console.log('✅ Structure trouvée: id');
              } else if (profileData && typeof profileData === 'object') {
                // Chercher l'ID dans différentes structures possibles
                currentProfileId = profileData.id || profileData.profile_id || profileData.student_id;
                console.log('✅ Structure trouvée: recherche générique');
              }
              
              console.log('👤 Current profile ID:', currentProfileId);
              console.log('👑 Project creator_id:', data.data.project.creator_id);
              
              if (currentProfileId) {
                const isUserCreator = currentProfileId === data.data.project.creator_id;
                console.log('🔍 Est créateur?', isUserCreator);
                console.log('🔍 Comparaison:', currentProfileId, '===', data.data.project.creator_id);
                setIsCreator(isUserCreator);
                console.log('✅ setIsCreator appelé avec:', isUserCreator);
              } else {
                console.log('Impossible de récupérer l\'ID du profil');
                setIsCreator(false);
              }
            } else {
              console.log('Erreur lors de la récupération du profil - Status:', profileResponse.status);
              setIsCreator(false);
            }
          } catch (error) {
            console.error('Erreur lors du décodage du token:', error);
            setIsCreator(false);
          }
        } else {
          console.log('Pas de token disponible');
          setIsCreator(false);
        }
        
        // Vérifier si l'utilisateur a déjà postulé
        if (token) {
          await checkApplicationStatus(projectId, token);
        }
        
        setLoading(false);
      } else {
        setError('Erreur lors du chargement du projet');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching project:', err);
      setError('Erreur lors du chargement du projet');
      setLoading(false);
    }
  };

  const checkApplicationStatus = async (projectId: number, token: string) => {
    try {
      console.log('Vérification du statut de candidature pour le projet:', projectId);
      const response = await fetch(`/api/student/projects/${projectId}/my-application`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Réponse API my-application:', data);
        console.log('Statut de la candidature:', data.data.application?.status);
        
        setHasApplied(data.data.hasApplied);
        if (data.data.hasApplied) {
          setExistingApplication(data.data.application);
          setApplicationForm({
            message: data.data.application.message,
            skills: data.data.application.skills,
            availability: data.data.application.availability
          });
        }
      } else {
        console.error('Erreur API my-application:', response.status);
      }
    } catch (err) {
      console.error('Error checking application status:', err);
    }
  };

  const fetchApplications = async (projectId: number, token: string) => {
    try {
      console.log('Récupération des candidatures pour le projet:', projectId);
      const response = await fetch(`/api/student/projects/${projectId}/applications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Candidatures récupérées:', data.data.applications);
        setApplications(data.data.applications || []);
      } else {
        console.error('Erreur lors de la récupération des candidatures:', response.status);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
    }
  };

  const handleApplicationStatus = async (applicationId: number, status: 'accepted' | 'rejected') => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/student/projects/${project.id}/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(data.data.message);
        
        // Recharger les candidatures et le projet
        await fetchApplications(project.id, token);
        await fetchProject(project.id);
        
        // Effacer le message de succès après 3 secondes
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erreur lors de la mise à jour');
      }
    } catch (err) {
      console.error('Error updating application status:', err);
      setError('Erreur lors de la mise à jour du statut');
    }
  };

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingApplication(true);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Vous devez être connecté pour postuler');
        return;
      }

      let response;
      
      if (hasApplied && existingApplication) {
        // Mise à jour de la candidature existante
        response = await fetch(`/api/student/projects/${project.id}/applications/${existingApplication.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(applicationForm)
        });
      } else {
        // Création d'une nouvelle candidature
        response = await fetch(`/api/student/projects/${project.id}/applications`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(applicationForm)
        });
      }

      if (response.ok) {
        const data = await response.json();
        setSuccess(hasApplied ? 'Candidature mise à jour avec succès !' : 'Candidature envoyée avec succès !');
        setShowApplicationForm(false);
        
        // Mettre à jour le statut de candidature
        if (!hasApplied) {
          setHasApplied(true);
          // Récupérer la nouvelle candidature
          await checkApplicationStatus(project.id, token);
        }
        
        // Recharger les données du projet pour mettre à jour le compteur
        await fetchProject(project.id);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erreur lors de l\'envoi de la candidature');
      }
    } catch (err) {
      console.error('Error submitting application:', err);
      setError('Erreur lors de l\'envoi de la candidature');
    } finally {
      setSubmittingApplication(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      business: 'bg-blue-100 text-blue-800',
      social: 'bg-green-100 text-green-800',
      event: 'bg-amber-100 text-amber-800',
      academic: 'bg-purple-100 text-purple-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.other;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: 'bg-green-100 text-green-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.open;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Chargement du projet...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error || 'Projet non trouvé'}</p>
          <Link href="/student/projects">
            <Button className="mt-4">Retour aux projets</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link href="/student/projects">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={getCategoryColor(project.category)}>
                  {project.category}
                </Badge>
                <Badge className={getStatusColor(project.status)}>
                  {project.status === 'open' ? 'Ouvert' : project.status === 'in_progress' ? 'En cours' : project.status}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Contenu principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{project.description}</p>
                </div>
                
                {project.objective && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Objectif principal</h4>
                    <p className="text-gray-600">{project.objective}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Informations pratiques */}
            <Card>
              <CardHeader>
                <CardTitle>Informations pratiques</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.location && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Localisation</p>
                        <p className="font-medium">{project.location}</p>
                      </div>
                    </div>
                  )}
                  
                  {project.duration && (
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Durée</p>
                        <p className="font-medium">{project.duration}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Participants</p>
                      <p className="font-medium">{project.current_participants}/{project.max_participants}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Créé le</p>
                      <p className="font-medium">{formatDate(project.created_at)}</p>
                    </div>
                  </div>
                </div>

                {/* Progression participants */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Progression</span>
                    <span className="font-medium">
                      {project.current_participants}/{project.max_participants}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all"
                      style={{ width: `${(project.current_participants / project.max_participants) * 100}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profils recherchés */}
            {project.profiles_sought && (
              <Card>
                <CardHeader>
                  <CardTitle>Profils recherchés</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {project.profiles_sought.split(',').map((skill: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Prérequis */}
            {project.requirements && (
              <Card>
                <CardHeader>
                  <CardTitle>Prérequis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{project.requirements}</p>
                </CardContent>
              </Card>
            )}

            {/* Membres actuels */}
            {project.members.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Membres ({project.members.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {project.members.map((member: Member) => (
                      <div key={member.id} className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {member.member_name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{member.member_name}</p>
                          <p className="text-sm text-gray-500">{member.member_role || 'Membre'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Gestion des candidatures - seulement pour le créateur */}
            {isCreator && (
              <Card>
                <CardHeader>
                  <CardTitle>Candidatures ({applications.length})</CardTitle>
                  <CardDescription>
                    Gérez les candidatures reçues pour ce projet
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {applications.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>Aucune candidature reçue pour le moment</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {applications.map((application) => (
                      <div key={application.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">
                                {application.applicant_name?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium">{application.applicant_name}</p>
                                <p className="text-sm text-gray-500">{application.applicant_university}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {application.status === 'pending' && (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                  En attente
                                </span>
                              )}
                              {application.status === 'accepted' && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                  Accepté
                                </span>
                              )}
                              {application.status === 'rejected' && (
                                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                  Refusé
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Message:</p>
                            <p className="text-sm text-gray-600">{application.message}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Compétences:</p>
                            <p className="text-sm text-gray-600">{application.skills}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Disponibilité:</p>
                            <p className="text-sm text-gray-600">{application.availability}</p>
                          </div>
                        </div>
                        
                        {application.status === 'pending' && (
                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              onClick={() => handleApplicationStatus(application.id, 'accepted')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Accepter
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApplicationStatus(application.id, 'rejected')}
                              className="border-red-600 text-red-600 hover:bg-red-50"
                            >
                              Refuser
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* Bouton "voir plus" pour le créateur */}
            {(() => {
              console.log('🎯 Vérification affichage bouton - isCreator:', isCreator);
              console.log('🎯 Project existe:', !!project);
              console.log('🎯 Project ID:', project?.id);
              return isCreator;
            })() && (
              <Card className="mt-6">
                <CardContent className="p-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Espace de gestion du projet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Accédez à l'espace collaboratif pour gérer les candidatures, les discussions et les membres
                    </p>
                    <Link href={`/student/projects/${project.id}/collaborative`}>
                      <Button className="w-full">
                        <Users className="h-4 w-4 mr-2" />
                        Voir plus → Espace collaboratif
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Créateur */}
            <Card>
              <CardHeader>
                <CardTitle>Créateur du projet</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {project.creator_name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{project.creator_name}</p>
                    <p className="text-sm text-gray-500">{project.creator_university}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isCreator ? (
                  <>
                    <Link href={`/student/projects/${project.id}/applications`}>
                      <Button className="w-full flex items-center gap-2">
                        <UserCheck className="h-4 w-4" />
                        Voir les candidatures ({project.applications_count})
                      </Button>
                    </Link>
                    <Link href={`/student/projects/${project.id}/edit`}>
                      <Button variant="outline" className="w-full">
                        Éditer le projet
                      </Button>
                    </Link>
                  </>
                ) : isMember ? (
                  <div className="text-center">
                    <p className="text-green-600 font-medium mb-2">Vous êtes membre de ce projet</p>
                    <Button variant="outline" className="w-full">
                      Accéder à l'espace collaboratif
                    </Button>
                  </div>
                ) : hasApplied ? (
                  <div className="text-center">
                    {existingApplication?.status === 'ACCEPTED' || existingApplication?.status === 'accepted' ? (
                      <>
                        <p className="text-green-600 font-medium mb-2">🎉 Candidature acceptée !</p>
                        <p className="text-sm text-gray-500 mb-4">Félicitations, vous faites maintenant partie de ce projet</p>
                        <Link href={`/student/projects/${project.id}/collaborative`}>
                          <Button className="w-full">
                            <Users className="h-4 w-4 mr-2" />
                            Espace collaboratif
                          </Button>
                        </Link>
                      </>
                    ) : existingApplication?.status === 'REJECTED' || existingApplication?.status === 'rejected' ? (
                      <>
                        <p className="text-red-600 font-medium mb-2">Candidature refusée</p>
                        <p className="text-sm text-gray-500 mb-4">Votre candidature n'a pas été retenue pour ce projet</p>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => {
                            setHasApplied(false);
                            setExistingApplication(null);
                            setApplicationForm({ message: '', skills: '', availability: '' });
                          }}
                        >
                          Postuler à nouveau
                        </Button>
                      </>
                    ) : (
                      <>
                        <p className="text-blue-600 font-medium">Candidature envoyée</p>
                        <p className="text-sm text-gray-500 mt-1">En attente de réponse</p>
                      </>
                    )}
                  </div>
                ) : (project.status === 'open' && !isCreator) ? (
                  !showApplicationForm ? (
                    <Button 
                      className="w-full" 
                      onClick={() => setShowApplicationForm(true)}
                    >
                      Postuler à ce projet
                    </Button>
                  ) : (
                    <form onSubmit={handleApplicationSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Message de motivation *
                          </label>
                          <textarea
                            value={applicationForm.message}
                            onChange={(e) => setApplicationForm(prev => ({ ...prev, message: e.target.value }))}
                            placeholder="Pourquoi voulez-vous rejoindre ce projet ?"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Compétences *
                          </label>
                          <input
                            type="text"
                            value={applicationForm.skills}
                            onChange={(e) => setApplicationForm(prev => ({ ...prev, skills: e.target.value }))}
                            placeholder="marketing, design, communication..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Disponibilité *
                          </label>
                          <input
                            type="text"
                            value={applicationForm.availability}
                            onChange={(e) => setApplicationForm(prev => ({ ...prev, availability: e.target.value }))}
                            placeholder="Week-ends, soirs..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            type="submit" 
                            className="flex-1"
                            disabled={submittingApplication}
                          >
                            {submittingApplication ? 'Envoi...' : 'Envoyer ma candidature'}
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => setShowApplicationForm(false)}
                          >
                            Annuler
                          </Button>
                        </div>
                      </form>
                    )
                  ) : (
                  <p className="text-center text-gray-500">
                    {isCreator ? (
                      <>
                        <p className="font-medium">Vous êtes le créateur de ce projet</p>
                        <p className="text-sm mt-1">Vous ne pouvez pas postuler à votre propre projet</p>
                      </>
                    ) : (
                      "Ce projet n'accepte plus de candidatures"
                    )}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Statistiques */}
            <Card>
              <CardHeader>
                <CardTitle>Statistiques</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Candidatures</span>
                  <span className="font-medium">{project.applications_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Membres actuels</span>
                  <span className="font-medium">{project.current_participants}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Places restantes</span>
                  <span className="font-medium">{project.max_participants - project.current_participants}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
