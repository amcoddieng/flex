'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Filter,
  Heart,
  Pin,
  User,
  Calendar,
  TrendingUp,
  BookOpen,
  Briefcase,
  HelpCircle,
  Lightbulb
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
  _count?: {
    replies: number;
  };
}

const categoryIcons = {
  'Carrière': <Briefcase className="h-4 w-4" />,
  'Études': <BookOpen className="h-4 w-4" />,
  'Questions': <HelpCircle className="h-4 w-4" />,
  'Idées': <Lightbulb className="h-4 w-4" />,
  'Général': <MessageSquare className="h-4 w-4" />
};

const categoryColors = {
  'Carrière': 'bg-blue-100 text-blue-800 border-blue-200',
  'Études': 'bg-green-100 text-green-800 border-green-200',
  'Questions': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Idées': 'bg-purple-100 text-purple-800 border-purple-200',
  'Général': 'bg-gray-100 text-gray-800 border-gray-200'
};

export default function ForumPage() {
  const router = useRouter();
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showNewTopicDialog, setShowNewTopicDialog] = useState(false);
  const [newTopic, setNewTopic] = useState({
    title: '',
    content: '',
    category: 'Général',
    tags: ''
  });

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

  const fetchTopics = async () => {
    const token = getValidToken();
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);

      const response = await fetch(`/api/forum/topics?${params.toString()}`, {
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
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la récupération des sujets');
      }

      const data = await response.json();
      setTopics(data.topics || []);
    } catch (error: any) {
      console.error('Erreur fetch topics:', error);
      setError(error.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const createTopic = async () => {
    const token = getValidToken();
    if (!token) {
      router.push('/login');
      return;
    }

    if (!newTopic.title.trim() || !newTopic.content.trim()) {
      setError('Le titre et le contenu sont requis');
      return;
    }

    try {
      const tags = newTopic.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      const response = await fetch('/api/forum/topics', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newTopic.title,
          content: newTopic.content,
          category: newTopic.category,
          tags: tags
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la création du sujet');
      }

      setShowNewTopicDialog(false);
      setNewTopic({ title: '', content: '', category: 'Général', tags: '' });
      await fetchTopics();
    } catch (error: any) {
      console.error('Erreur create topic:', error);
      setError(error.message || 'Une erreur est survenue');
    }
  };

  const likeTopic = async (topicId: number) => {
    const token = getValidToken();
    if (!token) return;

    try {
      const response = await fetch(`/api/forum/topics/${topicId}/like`, {
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

      await fetchTopics();
    } catch (error: any) {
      console.error('Erreur like topic:', error);
      setError(error.message || 'Une erreur est survenue');
    }
  };

  useEffect(() => {
    fetchTopics();
  }, [searchTerm, selectedCategory]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du forum...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Forum FlexJob</h1>
              <p className="text-gray-600">Partagez vos expériences, posez des questions et échangez avec la communauté</p>
            </div>
            <Dialog open={showNewTopicDialog} onOpenChange={setShowNewTopicDialog}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau sujet
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Créer un nouveau sujet</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Titre</Label>
                    <Input
                      id="title"
                      value={newTopic.title}
                      onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                      placeholder="Entrez un titre clair et concis"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Catégorie</Label>
                    <Select value={newTopic.category} onValueChange={(value) => setNewTopic({ ...newTopic, category: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Général">Général</SelectItem>
                        <SelectItem value="Carrière">Carrière</SelectItem>
                        <SelectItem value="Études">Études</SelectItem>
                        <SelectItem value="Questions">Questions</SelectItem>
                        <SelectItem value="Idées">Idées</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="content">Contenu</Label>
                    <Textarea
                      id="content"
                      value={newTopic.content}
                      onChange={(e) => setNewTopic({ ...newTopic, content: e.target.value })}
                      placeholder="Développez votre sujet en détail..."
                      rows={6}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
                    <Input
                      id="tags"
                      value={newTopic.tags}
                      onChange={(e) => setNewTopic({ ...newTopic, tags: e.target.value })}
                      placeholder="ex: stage, alternance, informatique"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setShowNewTopicDialog(false)}>
                      Annuler
                    </Button>
                    <Button onClick={createTopic} className="bg-blue-600 hover:bg-blue-700">
                      Publier
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher des sujets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                <SelectItem value="Général">Général</SelectItem>
                <SelectItem value="Carrière">Carrière</SelectItem>
                <SelectItem value="Études">Études</SelectItem>
                <SelectItem value="Questions">Questions</SelectItem>
                <SelectItem value="Idées">Idées</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {topics.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun sujet trouvé</h3>
                <p className="text-gray-600 mb-6">Soyez le premier à lancer une discussion !</p>
                <Button onClick={() => setShowNewTopicDialog(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un sujet
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {topics.map((topic) => (
                <Card key={topic.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/forum/${topic.id}`)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {topic.is_pinned && <Pin className="h-4 w-4 text-red-500" />}
                          <Badge className={categoryColors[topic.category as keyof typeof categoryColors] || categoryColors['Général']}>
                            {categoryIcons[topic.category as keyof typeof categoryIcons] || categoryIcons['Général']}
                            <span className="ml-1">{topic.category}</span>
                          </Badge>
                        </div>
                        <CardTitle className="text-xl line-clamp-2 hover:text-blue-600 transition-colors">
                          {topic.title}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Heart className="h-4 w-4" />
                        {topic.likes}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {topic.content}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{topic.author_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(topic.created_at).toLocaleDateString('fr-FR')}</span>
                        </div>
                        {topic.author_university && (
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {topic.author_university}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {topic.tags && topic.tags.length > 0 && (
                          <div className="flex gap-1">
                            {topic.tags.slice(0, 2).map((tag, index) => (
                              <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            likeTopic(topic.id);
                          }}
                          className="text-gray-500 hover:text-red-500"
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
