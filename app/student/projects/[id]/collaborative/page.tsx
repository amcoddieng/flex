"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, MessageSquare, Calendar, Target, UserPlus, Settings, FileText, Video } from 'lucide-react';

interface ProjectMember {
  id: number;
  project_id: number;
  member_id: number;
  role: string;
  joined_at: string;
  member_name: string;
  member_email: string;
  member_university: string;
}

interface Project {
  id: number;
  title: string;
  description: string;
  objective: string;
  status: string;
  current_participants: number;
  max_participants: number;
  creator_id: number;
  created_at: string;
}

export default function CollaborativeSpace() {
  const params = useParams();
  const router = useRouter();
  
  if (!params.id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600">ID de projet non spécifié</p>
        </div>
      </div>
    );
  }
  
  const projectId = parseInt(params.id as string);
  
  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreator, setIsCreator] = useState(false);

  useEffect(() => {
    fetchProjectAndMembers();
  }, [projectId]);

  const fetchProjectAndMembers = async () => {
    try {
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
        throw new Error('Erreur lors du chargement du projet');
      }

      const projectData = await projectResponse.json();
      setProject(projectData.data.project);

      // Vérifier si l'utilisateur est le créateur
      const profileResponse = await fetch('/api/student/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        const isUserCreator = profileData.data.student.id === projectData.data.project.creator_id;
        setIsCreator(isUserCreator);
      }

      // Récupérer les membres du projet
      const membersResponse = await fetch(`/api/student/projects/${projectId}/members`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (membersResponse.ok) {
        const membersData = await membersResponse.json();
        setMembers(membersData.data.members || []);
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de l'espace collaboratif...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <Button onClick={fetchProjectAndMembers} className="mt-2">
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600">Projet non trouvé</p>
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
          {isCreator && (
            <Link href={`/student/projects/${projectId}/edit`}>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Paramètres
              </Button>
            </Link>
          )}
        </div>
        
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-8 w-8 text-blue-600" />
            Espace Collaboratif - {project.title}
          </h1>
          <p className="text-gray-600 mt-2">
            {members.length} membre{members.length > 1 ? 's' : ''} actif{members.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale - Informations et membres */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations du projet */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Objectif du projet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{project.objective || project.description}</p>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Participants</p>
                    <p className="font-medium">{project.current_participants}/{project.max_participants}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Créé le</p>
                    <p className="font-medium">{new Date(project.created_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liste des membres */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-green-600" />
                Membres du projet ({members.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {members.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Aucun membre pour le moment</p>
                  <p className="text-sm text-gray-500 mt-2">Les membres acceptés apparaîtront ici</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {member.member_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{member.member_name}</p>
                          <p className="text-sm text-gray-500">{member.member_email}</p>
                          <p className="text-sm text-gray-400">{member.member_university}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={member.role === 'creator' ? 'default' : 'secondary'}>
                          {member.role === 'creator' ? 'Créateur' : 'Membre'}
                        </Badge>
                        <p className="text-xs text-gray-500">
                          Rejoint le {new Date(member.joined_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Colonne latérale - Actions rapides */}
        <div className="space-y-6">
          {/* Actions rapides */}
          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* <Button className="w-full" variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" />
                Discussion d'équipe
              </Button> */}
              {/* <Button className="w-full" variant="outline">
                <Video className="h-4 w-4 mr-2" />
                Visioconférence
              </Button> */}
              <Button className="w-full" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Documents partagés
              </Button>
              <Link href={`/student/projects/${projectId}/discussions`}>
                <Button className="w-full" variant="default">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Voir toutes les discussions
                </Button>
              </Link>
              {isCreator && (
                <Link href={`/student/projects/${projectId}/applications`}>
                  <Button className="w-full" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Gérer les candidatures
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Statut du projet */}
          <Card>
            <CardHeader>
              <CardTitle>Statut du projet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Statut</span>
                  <Badge variant={project.status === 'open' ? 'default' : 'secondary'}>
                    {project.status === 'open' ? 'Ouvert' : 'Fermé'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Places restantes</span>
                  <span className="font-medium">
                    {project.max_participants - project.current_participants}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
