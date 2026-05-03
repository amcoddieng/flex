"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, UserCheck, UserX, Clock, MessageSquare, Mail, User } from 'lucide-react';

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

export default function ProjectApplicationsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;

  const [applications, setApplications] = useState<Application[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

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
                      onClick={() => window.open(`/student/profile/${application.applicant_id}`, '_blank')}
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
    </div>
  );
}
