"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, MessageSquare, Plus, Clock, Tag, User, CheckCircle, AlertCircle, X } from 'lucide-react';

interface Discussion {
  id: number;
  project_id: number;
  author_id: number;
  title: string;
  content: string;
  type: 'general' | 'decision' | 'milestone' | 'issue';
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'closed' | 'archived';
  created_at: string;
  updated_at: string;
  author_name: string;
  author_email: string;
  author_university: string;
  author_role: 'Créateur' | 'Membre';
}

interface Comment {
  id: number;
  discussion_id: number;
  author_id: number;
  content: string;
  created_at: string;
  updated_at: string;
  author_name: string;
  author_email: string;
  author_university: string;
}

export default function ProjectDiscussions() {
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
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingDiscussion, setCreatingDiscussion] = useState(false);
  const [newDiscussion, setNewDiscussion] = useState({
    title: '',
    content: '',
    type: 'general' as 'general' | 'decision' | 'milestone' | 'issue',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });
  const [showDiscussionModal, setShowDiscussionModal] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [postingComment, setPostingComment] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name: string } | null>(null);

  useEffect(() => {
    fetchDiscussions();
    fetchCurrentUser();
  }, [projectId]);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/student/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data?.student) {
          setCurrentUser({
            name: `${data.data.student.first_name} ${data.data.student.last_name}`
          });
        }
      }
    } catch (err) {
      console.error('Erreur lors de la récupération du profil utilisateur:', err);
    }
  };

  const fetchDiscussions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`/api/student/projects/${projectId}/discussions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des discussions');
      }

      const data = await response.json();
      setDiscussions(data.data.discussions || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'general':
        return <MessageSquare className="h-5 w-5 text-blue-600" />;
      case 'decision':
        return <CheckCircle className="h-5 w-5 text-orange-600" />;
      case 'milestone':
        return <Tag className="h-5 w-5 text-green-600" />;
      case 'issue':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <MessageSquare className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-orange-600 bg-orange-50';
      case 'low':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="default" className="bg-green-600">Ouverte</Badge>;
      case 'closed':
        return <Badge variant="secondary">Fermée</Badge>;
      case 'archived':
        return <Badge variant="outline">Archivée</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleCreateDiscussion = async () => {
    if (!newDiscussion.title.trim() || !newDiscussion.content.trim()) {
      setError('Le titre et le contenu sont requis');
      return;
    }

    setCreatingDiscussion(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`/api/student/projects/${projectId}/discussions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newDiscussion)
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la discussion');
      }

      // Réinitialiser le formulaire
      setNewDiscussion({
        title: '',
        content: '',
        type: 'general',
        priority: 'medium'
      });
      setShowCreateModal(false);

      // Rafraîchir la liste des discussions
      await fetchDiscussions();

    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreatingDiscussion(false);
    }
  };

  const handleOpenDiscussion = async (discussion: Discussion) => {
    console.log('🔍 Ouverture de la discussion:', discussion.id, discussion.title);
    setSelectedDiscussion(discussion);
    setShowDiscussionModal(true);
    setLoadingComments(true);
    setComments([]);
    setNewComment('');
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('❌ Token manquant, redirection vers login');
        router.push('/auth/login');
        return;
      }

      console.log('📡 Appel API commentaires pour la discussion:', discussion.id);
      const response = await fetch(`/api/student/projects/${projectId}/discussions/${discussion.id}/comments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log('📊 Réponse API commentaires:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Erreur API commentaires:', errorText);
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Données commentaires reçues:', data);
      setComments(data.data.comments || []);
      console.log('💬 Nombre de commentaires chargés:', data.data.comments?.length || 0);
    } catch (err: any) {
      console.error('❌ Erreur complète lors du chargement des commentaires:', err);
      setError(`Erreur de chargement: ${err.message}`);
      // Ne pas fermer le modal en cas d'erreur
    } finally {
      setLoadingComments(false);
      console.log('🏁 Fin du chargement des commentaires');
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim() || !selectedDiscussion) {
      return;
    }

    setPostingComment(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`/api/student/projects/${projectId}/discussions/${selectedDiscussion.id}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: newComment.trim() })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'ajout du commentaire');
      }

      // Réinitialiser le champ et recharger les commentaires
      setNewComment('');
      
      // Recharger les commentaires
      const commentsResponse = await fetch(`/api/student/projects/${projectId}/discussions/${selectedDiscussion.id}/comments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (commentsResponse.ok) {
        const commentsData = await commentsResponse.json();
        setComments(commentsData.data.comments || []);
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setPostingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des discussions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <Button onClick={fetchDiscussions} className="mt-2">
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
          <Link href={`/student/projects/${projectId}/collaborative`}>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour à l'espace
            </Button>
          </Link>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nouvelle discussion
          </Button>
        </div>
        
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="h-8 w-8 text-blue-600" />
            Discussions du projet
          </h1>
          <p className="text-gray-600 mt-2">
            {discussions.length} discussion{discussions.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Liste des discussions */}
      {discussions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <MessageSquare className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune discussion pour le moment
            </h3>
            <p className="text-gray-600">
              Commencez une discussion pour échanger avec les membres du projet
            </p>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="mt-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Créer la première discussion
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {discussions.map((discussion) => (
            <Card key={discussion.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(discussion.type)}
                      <div>
                        <CardTitle className="text-lg">{discussion.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getPriorityColor(discussion.priority)}>
                            {discussion.priority === 'high' ? 'Haute' : 
                             discussion.priority === 'medium' ? 'Moyenne' : 'Basse'}
                          </Badge>
                          {getStatusBadge(discussion.status)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      Par {discussion.author_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {discussion.author_role}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(discussion.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{discussion.content}</p>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="text-sm text-gray-500">
                    Créé le {new Date(discussion.created_at).toLocaleDateString('fr-FR')}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleOpenDiscussion(discussion)}
                  >
                    Voir la discussion
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de création de discussion - Fond transparent */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white bg-opacity-95 rounded-lg p-6 w-full max-w-2xl mx-4 shadow-2xl border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Nouvelle discussion</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCreateModal(false)}
                className="p-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre de la discussion
                </label>
                <Input
                  value={newDiscussion.title}
                  onChange={(e) => setNewDiscussion(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Entrez un titre clair et concis..."
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type de discussion
                  </label>
                  <Select
                    value={newDiscussion.type}
                    onValueChange={(value: 'general' | 'decision' | 'milestone' | 'issue') => 
                      setNewDiscussion(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">💬 Général</SelectItem>
                      <SelectItem value="decision">✅ Décision</SelectItem>
                      <SelectItem value="milestone">🎯 Jalon</SelectItem>
                      <SelectItem value="issue">⚠️ Problème</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priorité
                  </label>
                  <Select
                    value={newDiscussion.priority}
                    onValueChange={(value: 'low' | 'medium' | 'high') => 
                      setNewDiscussion(prev => ({ ...prev, priority: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">🔵 Basse</SelectItem>
                      <SelectItem value="medium">🟠 Moyenne</SelectItem>
                      <SelectItem value="high">🔴 Haute</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contenu
                </label>
                <Textarea
                  value={newDiscussion.content}
                  onChange={(e) => setNewDiscussion(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Décrivez votre discussion en détail..."
                  rows={6}
                  className="w-full"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  disabled={creatingDiscussion}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleCreateDiscussion}
                  disabled={creatingDiscussion || !newDiscussion.title.trim() || !newDiscussion.content.trim()}
                >
                  {creatingDiscussion ? 'Création...' : 'Créer la discussion'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de discussion détaillée - Fond transparent */}
      {showDiscussionModal && selectedDiscussion && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white bg-opacity-95 rounded-lg w-full max-w-4xl max-h-[90vh] mx-4 flex flex-col shadow-2xl border border-gray-200">
            {/* Header du modal */}
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getTypeIcon(selectedDiscussion.type)}
                    <h2 className="text-xl font-bold text-gray-900">{selectedDiscussion.title}</h2>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getPriorityColor(selectedDiscussion.priority)}>
                      {selectedDiscussion.priority === 'high' ? 'Haute' : 
                       selectedDiscussion.priority === 'medium' ? 'Moyenne' : 'Basse'}
                    </Badge>
                    {getStatusBadge(selectedDiscussion.status)}
                  </div>
                  <div className="text-sm text-gray-500">
                    Par {selectedDiscussion.author_name} • {selectedDiscussion.author_role} • 
                    {new Date(selectedDiscussion.created_at).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDiscussionModal(false)}
                  className="p-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Contenu de la discussion */}
            <div className="p-6 border-b">
              <p className="text-gray-700 whitespace-pre-wrap">{selectedDiscussion.content}</p>
            </div>

            {/* Zone des commentaires */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Commentaires ({comments.length})
                </h3>
                
                {loadingComments ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Chargement des commentaires...</p>
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Aucun commentaire pour le moment</p>
                    <p className="text-sm">Soyez le premier à commenter !</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3 p-4 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 text-sm font-semibold">
                            {comment.author_name?.charAt(0)?.toUpperCase() || 'A'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900">{comment.author_name}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(comment.created_at).toLocaleDateString('fr-FR')} à {new Date(comment.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Zone d'ajout de commentaire */}
            <div className="p-6 border-t bg-white bg-opacity-50 backdrop-blur-sm">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 text-sm font-semibold">
                    {currentUser?.name?.charAt(0)?.toUpperCase() || 'M'}
                  </span>
                </div>
                <div className="flex-1">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Écrivez un commentaire..."
                    rows={3}
                    className="resize-none"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey) {
                        handlePostComment();
                      }
                    }}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">
                      Appuyez sur Ctrl+Entrée pour envoyer
                    </span>
                    <Button
                      onClick={handlePostComment}
                      disabled={postingComment || !newComment.trim()}
                      size="sm"
                    >
                      {postingComment ? 'Envoi...' : 'Envoyer'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}