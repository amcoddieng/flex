'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { 
  MessageSquare, 
  ArrowLeft,
  Heart,
  Pin,
  User,
  Calendar,
  Reply,
  ThumbsUp,
  Send
} from 'lucide-react';

interface ForumTopic {
  id: number;
  author_id: number;
  author_name: string;
  author_university: string;
  author_department: string;
  category: string;
  title: string;
  content: string;
  tags: string[];
  likes: number;
  is_pinned: boolean;
  created_at: string;
}

interface ForumReply {
  id: number;
  topic_id: number;
  author_id: number;
  author_name: string;
  author_university: string;
  content: string;
  likes: number;
  is_helpful: boolean;
  created_at: string;
}

const categoryColors = {
  'Carrière': 'bg-blue-100 text-blue-800 border-blue-200',
  'Études': 'bg-green-100 text-green-800 border-green-200',
  'Questions': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Idées': 'bg-purple-100 text-purple-800 border-purple-200',
  'Général': 'bg-gray-100 text-gray-800 border-gray-200'
};

export default function ForumTopicPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [topic, setTopic] = useState<ForumTopic | null>(null);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newReply, setNewReply] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const getValidToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        localStorage.removeItem('token');
        return null;
      }
      
      const payload = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000);
      
      if (payload.exp && payload.exp < now) {
        localStorage.removeItem('token');
        return null;
      }
      
      return token;
    } catch (error) {
      localStorage.removeItem('token');
      return null;
    }
  };

  const fetchTopic = async () => {
    const token = getValidToken();
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/forum/topics/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }
        if (response.status === 404) {
          setError('Sujet non trouvé');
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la récupération du sujet');
      }

      const data = await response.json();
      setTopic(data.topic);
      setReplies(data.replies || []);
    } catch (error: any) {
      console.error('Erreur fetch topic:', error);
      setError(error.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const submitReply = async () => {
    const token = getValidToken();
    if (!token) {
      router.push('/login');
      return;
    }

    if (!newReply.trim()) {
      setError('Le contenu de la réponse est requis');
      return;
    }

    try {
      setSubmittingReply(true);
      const response = await fetch(`/api/forum/topics/${params.id}/replies`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: newReply.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'envoi de la réponse');
      }

      setNewReply('');
      await fetchTopic(); // Refresh to show new reply
    } catch (error: any) {
      console.error('Erreur submit reply:', error);
      setError(error.message || 'Une erreur est survenue');
    } finally {
      setSubmittingReply(false);
    }
  };

  const likeTopic = async () => {
    const token = getValidToken();
    if (!token) return;

    try {
      const response = await fetch(`/api/forum/topics/${params.id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors du like');
      }

      await fetchTopic(); // Refresh to update like count
    } catch (error: any) {
      console.error('Erreur like topic:', error);
      setError(error.message || 'Une erreur est survenue');
    }
  };

  const likeReply = async (replyId: number) => {
    const token = getValidToken();
    if (!token) return;

    try {
      const response = await fetch(`/api/forum/replies/${replyId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors du like');
      }

      await fetchTopic(); // Refresh to update like count
    } catch (error: any) {
      console.error('Erreur like reply:', error);
      setError(error.message || 'Une erreur est survenue');
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchTopic();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du sujet...</p>
        </div>
      </div>
    );
  }

  if (error && !topic) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Sujet non trouvé</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => router.push('/forum')} className="bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au forum
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/forum')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au forum
          </Button>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {topic && (
          <>
            {/* Sujet principal */}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      {topic.is_pinned && <Pin className="h-4 w-4 text-red-500" />}
                      <Badge className={categoryColors[topic.category as keyof typeof categoryColors] || categoryColors['Général']}>
                        {topic.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-2xl mb-3">{topic.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{topic.author_name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(topic.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                      {topic.author_university && (
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {topic.author_university}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={likeTopic}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <Heart className="h-4 w-4 mr-1" />
                      {topic.likes}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {topic.content}
                  </p>
                </div>
                {topic.tags && topic.tags.length > 0 && (
                  <div className="mt-4 flex gap-2">
                    {topic.tags.map((tag, index) => (
                      <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Formulaire de réponse */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-lg">Participer à la discussion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="reply">Votre réponse</Label>
                    <Textarea
                      id="reply"
                      value={newReply}
                      onChange={(e) => setNewReply(e.target.value)}
                      placeholder="Partagez votre point de vue..."
                      rows={4}
                    />
                  </div>
                  <Button 
                    onClick={submitReply}
                    disabled={submittingReply || !newReply.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {submittingReply ? (
                      <>Envoi en cours...</>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Envoyer la réponse
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Réponses */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {replies.length} {replies.length === 1 ? 'réponse' : 'réponses'}
              </h2>
              
              {replies.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">Soyez le premier à répondre !</p>
                  </CardContent>
                </Card>
              ) : (
                replies.map((reply) => (
                  <Card key={reply.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{reply.author_name}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(reply.created_at).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {reply.is_helpful && (
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              Utile
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => likeReply(reply.id)}
                            className="text-gray-500 hover:text-green-500"
                          >
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            {reply.likes}
                          </Button>
                        </div>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {reply.content}
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
