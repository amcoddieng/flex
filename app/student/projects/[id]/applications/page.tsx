"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, UserCheck, UserX, Clock, MessageSquare, Mail, User, X, Calendar, MapPin, BookOpen, Award, Briefcase, Languages, GraduationCap } from 'lucide-react';

interface Application {
  id: number;
  project_id: number;
  applicant_id: number;
  applicant_name: string;
  applicant_email: string;
  applicant_university: string;
  message: string;
  skills: string;
  availability: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'INTERVIEW';
  applied_at: string;
}

interface Project {
  id: number;
  title: string;
  creator_id: number;
}

interface StudentProfile {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  university: string;
  field_of_study: string;
  bio: string;
  skills: string;
  experience: string;
  education: string;
  languages: string;
  location: string;
  portfolio_url?: string;
  linkedin_url?: string;
  github_url?: string;
  availability: string;
  created_at: string;
  updated_at: string;
}

export default function ProjectApplicationsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;

  const [applications, setApplications] = useState<Application[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<StudentProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, [projectId]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/auth/login');
        return;
      }

      // Récupérer les détails du projet
      const projectResponse = await fetch(`/api/student/projects/${projectId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!projectResponse.ok) {
        throw new Error('Projet non trouvé');
      }

      const projectData = await projectResponse.json();
      setProject(projectData.data.project);

      // Récupérer les candidatures
      const applicationsResponse = await fetch(`/api/student/projects/${projectId}/applications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!applicationsResponse.ok) {
        throw new Error('Erreur lors de la récupération des candidatures');
      }

      const applicationsData = await applicationsResponse.json();
      setApplications(applicationsData.data.applications || []);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationAction = async (applicationId: number, action: 'accept' | 'reject') => {
    try {
      setProcessingId(applicationId);
      const token = localStorage.getItem('token');

      const response = await fetch(`/api/student/projects/${projectId}/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: action === 'accept' ? 'accepted' : 'rejected' })
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de l'${action === 'accept' ? 'acceptation' : 'rejet'} de la candidature`);
      }

      // Mettre à jour la liste des candidatures
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: action === 'accept' ? 'ACCEPTED' : 'REJECTED' }
            : app
        )
      );

    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleResignMember = async (memberId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir résilier ce membre du projet ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/student/projects/${projectId}/members/${memberId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la résiliation du membre');
      }

      // Mettre à jour la candidature pour la marquer comme résiliée
      setApplications(prev => 
        prev.map(app => 
          app.applicant_id === memberId 
            ? { ...app, status: 'REJECTED' }
            : app
        )
      );

      alert('Membre résilié avec succès');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchStudentProfile = async (studentId: number) => {
    try {
      console.log('🚀 Début fetchStudentProfile pour studentId:', studentId);
      setLoadingProfile(true);
      setProfileError(null);
      const token = localStorage.getItem('token');
      
      console.log('🔑 Token présent:', !!token);
      if (!token) {
        console.log('❌ Token manquant, redirection vers login');
        router.push('/auth/login');
        return;
      }

      console.log('📡 Appel API: /api/student/profile/', studentId);
      const response = await fetch(`/api/student/profile/${studentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log('📊 Réponse API status:', response.status, response.statusText);
      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Erreur API:', errorText);
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Données reçues:', data);
      setSelectedProfile(data.data.student);
      setShowProfileModal(true);
      console.log('🔓 Modal ouvert');
    } catch (err: any) {
      console.error('❌ Erreur complète:', err);
      setProfileError(err.message);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleViewProfile = (studentId: number) => {
    console.log('🔍 handleViewProfile appelé avec studentId:', studentId);
    fetchStudentProfile(studentId);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="h-3 w-3" /> En attente</Badge>;
      case 'ACCEPTED':
        return <Badge variant="default" className="bg-green-600 flex items-center gap-1"><UserCheck className="h-3 w-3" /> Accepté</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive" className="flex items-center gap-1"><UserX className="h-3 w-3" /> Refusé</Badge>;
      case 'INTERVIEW':
        return <Badge variant="outline" className="border-blue-600 text-blue-600 flex items-center gap-1"><MessageSquare className="h-3 w-3" /> Entretien</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <Button onClick={fetchApplications} className="mt-2">
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href={`/student/projects/${projectId}`}>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour au projet
            </Button>
          </Link>
        </div>
        
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Candidatures pour {project?.title}
          </h1>
          <p className="text-gray-600 mt-2">
            {applications.length} candidature{applications.length > 1 ? 's' : ''} reçue{applications.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Liste des candidatures */}
      {applications.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <UserCheck className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune candidature pour le moment
            </h3>
            <p className="text-gray-600">
              Les étudiants pourront postuler à votre projet depuis la page du projet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <Card key={application.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{application.applicant_name}</CardTitle>
                    <p className="text-sm text-gray-600">{application.applicant_email}</p>
                    <p className="text-sm text-gray-500">{application.applicant_university}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(application.status)}
                    <p className="text-xs text-gray-500">
                      Postulé le {new Date(application.applied_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Message de motivation */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Message de motivation</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {application.message}
                  </p>
                </div>

                {/* Compétences */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Compétences</h4>
                  <div className="flex flex-wrap gap-2">
                    {application.skills.split(',').map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Disponibilité */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Disponibilité</h4>
                  <p className="text-gray-700">{application.availability}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  {application.status === 'PENDING' && (
                    <>
                      <Button
                        onClick={() => handleApplicationAction(application.id, 'accept')}
                        disabled={processingId === application.id}
                        className="flex-1"
                        size="sm"
                      >
                        {processingId === application.id ? 'Traitement...' : 'Accepter'}
                      </Button>
                      <Button
                        onClick={() => handleApplicationAction(application.id, 'reject')}
                        variant="outline"
                        disabled={processingId === application.id}
                        className="flex-1"
                        size="sm"
                      >
                        {processingId === application.id ? 'Traitement...' : 'Refuser'}
                      </Button>
                    </>
                  )}
                  
                  {/* Actions supplémentaires */}
                  <div className="flex gap-2 ml-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`mailto:${application.applicant_email}`, '_blank')}
                      className="flex items-center gap-1"
                    >
                      <Mail className="h-3 w-3" />
                      Contacter
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewProfile(application.applicant_id)}
                      className="flex items-center gap-1"
                    >
                      <User className="h-3 w-3" />
                      Profil
                    </Button>
                    
                    {application.status === 'ACCEPTED' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleResignMember(application.applicant_id)}
                        className="flex items-center gap-1"
                      >
                        <UserX className="h-3 w-3" />
                        Résilier
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de profil complet - Fond transparent */}
      {showProfileModal && selectedProfile && ( 
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white bg-opacity-95 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-gray-200">
            {/* Header du modal */}
            <div className="bg-black bg-opacity-95  text-white p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold">
                      {selectedProfile.first_name?.charAt(0)?.toUpperCase()}{selectedProfile.last_name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {selectedProfile.first_name} {selectedProfile.last_name}
                    </h2>
                    <p className="text-blue-100">{selectedProfile.email}</p>
                    <p className="text-blue-100 text-sm">{selectedProfile.field_of_study}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowProfileModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Contenu du profil */}
            <div className="flex-1 overflow-y-auto p-6">
              {loadingProfile ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-4">Chargement du profil...</p>
                </div>
              ) : profileError ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600">{profileError}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Informations de base */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <GraduationCap className="h-5 w-5 text-blue-600" />
                          Éducation
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500">Université</p>
                          <p className="font-medium">{selectedProfile.university || 'Non spécifié'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Domaine d'études</p>
                          <p className="font-medium">{selectedProfile.field_of_study || 'Non spécifié'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Formation</p>
                          <p className="text-gray-700 whitespace-pre-wrap">{selectedProfile.education || 'Non spécifié'}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-blue-600" />
                          Localisation
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500">Ville/Région</p>
                          <p className="font-medium">{selectedProfile.location || 'Non spécifié'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Disponibilité</p>
                          <p className="font-medium">{selectedProfile.availability || 'Non spécifié'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Langues</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedProfile.languages ? selectedProfile.languages.split(',').map((lang, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {lang.trim()}
                              </Badge>
                            )) : <span className="text-gray-500">Non spécifié</span>}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Biographie */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                        Biographie
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {selectedProfile.bio || 'Aucune biographie fournie'}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Compétences */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Award className="h-5 w-5 text-blue-600" />
                        Compétences
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {selectedProfile.skills ? selectedProfile.skills.split(',').map((skill, index) => (
                          <Badge key={index} className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                            {skill.trim()}
                          </Badge>
                        )) : <span className="text-gray-500">Aucune compétence spécifiée</span>}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Expérience */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-blue-600" />
                        Expérience
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {selectedProfile.experience || 'Aucune expérience spécifiée'}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Liens externes */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Languages className="h-5 w-5 text-blue-600" />
                        Liens et Réseaux
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedProfile.portfolio_url && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(selectedProfile.portfolio_url, '_blank')}
                              className="flex items-center gap-2"
                            >
                              <Briefcase className="h-4 w-4" />
                              Portfolio
                            </Button>
                          </div>
                        )}
                        {selectedProfile.linkedin_url && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(selectedProfile.linkedin_url, '_blank')}
                              className="flex items-center gap-2"
                            >
                              <Award className="h-4 w-4" />
                              LinkedIn
                            </Button>
                          </div>
                        )}
                        {selectedProfile.github_url && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(selectedProfile.github_url, '_blank')}
                              className="flex items-center gap-2"
                            >
                              <Briefcase className="h-4 w-4" />
                              GitHub
                            </Button>
                          </div>
                        )}
                        {!selectedProfile.portfolio_url && !selectedProfile.linkedin_url && !selectedProfile.github_url && (
                          <p className="text-gray-500">Aucun lien externe spécifié</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => window.open(`mailto:${selectedProfile.email}`, '_blank')}
                      className="flex items-center gap-2"
                    >
                      <Mail className="h-4 w-4" />
                      Contacter par email
                    </Button>
                    <Button
                      onClick={() => setShowProfileModal(false)}
                      className="flex-1"
                    >
                      Fermer
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}