"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { decodeToken } from "@/lib/jwt";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  Heart, 
  Reply, 
  Plus,
  Search,
  Filter,
  TrendingUp,
  Pin,
  Calendar,
  User,
  Building,
  Send,
  ThumbsUp,
  ThumbsDown,
  Star,
  Hash
} from "lucide-react";

interface ForumTopic {
  id: number;
  author_id: number;
  author_name: string;
  author_university?: string;
  author_department?: string;
  category?: string;
  title: string;
  content: string;
  tags?: string;
  likes: number;
  is_pinned: boolean;
  created_at: string;
}

interface ForumReply {
  id: number;
  topic_id: number;
  author_id: number;
  author_name: string;
  author_university?: string;
  content: string;
  likes: number;
  is_helpful: boolean;
  created_at: string;
}

export default function StudentForumPage() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<ForumTopic | null>(null);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [showNewTopicModal, setShowNewTopicModal] = useState(false);
  const [newTopic, setNewTopic] = useState({ title: '', content: '', category: '', tags: '' });
  const [newReply, setNewReply] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const hasCheckedAuth = useRef(false);

  const categories = [
    'Général',
    'Carrière',
    'Entretiens',
    'Compétences',
    'Formation',
    'Technologies',
    'Entreprises',
    'Conseils'
  ];

  const getValidToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('token');
    if (!token) return null;
    const decoded = decodeToken(token);
    if (!decoded || decoded.role !== 'STUDENT') {
      localStorage.removeItem('token');
      return null;
    }
    return token;
  };

  useEffect(() => {
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;

    const token = getValidToken();
    if (!token) {
      router.push('/login');
      return;
    }
    setIsAuthed(true);
    fetchTopics();
  }, [router]);

  const fetchTopics = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getValidToken();
      if (!token) return;

      const res = await fetch('/api/student/forum/topics', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!res.ok) {
        throw new Error('Erreur lors de la récupération des sujets');
      }

      const data = await res.json();
      if (data.success) {
        setTopics(data.data);
      } else {
        throw new Error(data.error || 'Réponse invalide');
      }
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('fetchTopics error:', message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const fetchReplies = async (topicId: number) => {
    try {
      const token = getValidToken();
      if (!token) return;

      const res = await fetch(`/api/student/forum/topics/${topicId}/replies`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!res.ok) {
        throw new Error('Erreur lors de la récupération des réponses');
      }

      const data = await res.json();
      if (data.success) {
        setReplies(data.data);
      }
    } catch (err: any) {
      console.error('fetchReplies error:', err);
    }
  };

  const handleCreateTopic = async () => {
    if (!newTopic.title.trim() || !newTopic.content.trim()) {
      setError('Le titre et le contenu sont requis');
      return;
    }

    try {
      const token = getValidToken();
      if (!token) return;

      const res = await fetch('/api/student/forum/topics', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTopic),
      });
      
      if (!res.ok) {
        throw new Error('Erreur lors de la création du sujet');
      }

      const data = await res.json();
      if (data.success) {
        setTopics(prev => [data.data, ...prev]);
        setShowNewTopicModal(false);
        setNewTopic({ title: '', content: '', category: '', tags: '' });
        setSuccess('Sujet créé avec succès');
      } else {
        throw new Error(data.error || 'Création échouée');
      }
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('handleCreateTopic error:', message);
      setError(message);
    }
  };

  const handleReply = async () => {
    if (!newReply.trim() || !selectedTopic) return;

    try {
      const token = getValidToken();
      if (!token) return;

      const res = await fetch(`/api/student/forum/topics/${selectedTopic.id}/replies`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newReply }),
      });
      
      if (!res.ok) {
        throw new Error('Erreur lors de la réponse');
      }

      const data = await res.json();
      if (data.success) {
        setReplies(prev => [...prev, data.data]);
        setNewReply('');
        setSuccess('Réponse ajoutée avec succès');
      }
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('handleReply error:', message);
      setError(message);
    }
  };

  const handleLikeTopic = async (topicId: number) => {
    try {
      const token = getValidToken();
      if (!token) return;

      const res = await fetch(`/api/student/forum/topics/${topicId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (res.ok) {
        setTopics(prev => prev.map(topic => 
          topic.id === topicId 
            ? { ...topic, likes: topic.likes + 1 }
            : topic
        ));
      }
    } catch (err) {
      console.error('handleLikeTopic error:', err);
    }
  };

  const handleLikeReply = async (replyId: number) => {
    try {
      const token = getValidToken();
      if (!token) return;

      const res = await fetch(`/api/student/forum/replies/${replyId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (res.ok) {
        setReplies(prev => prev.map(reply => 
          reply.id === replyId 
            ? { ...reply, likes: reply.likes + 1 }
            : reply
        ));
      }
    } catch (err) {
      console.error('handleLikeReply error:', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredTopics = topics.filter(topic => {
    const matchesSearch = topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         topic.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || topic.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!isAuthed) {
    return <div className="p-8">Vérification...</div>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-slate-600">Chargement du forum...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Forum Étudiant</h1>
          <p className="text-slate-600">Partagez, discutez et apprenez ensemble</p>
        </div>
        <Button
          onClick={() => setShowNewTopicModal(true)}
          className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Plus className="h-4 w-4" />
          Nouveau Sujet
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Topics List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search and Filter */}
          <div className="bg-white rounded-xl border border-slate-200/50 shadow-sm p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher des sujets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="">Toutes les catégories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Topics */}
          <div className="space-y-4">
            {filteredTopics.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">Aucun sujet trouvé</h3>
                <p className="text-slate-600">Soyez le premier à créer un sujet !</p>
              </div>
            ) : (
              filteredTopics.map((topic) => (
                <div
                  key={topic.id}
                  className="bg-white rounded-xl border border-slate-200/50 shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    setSelectedTopic(topic);
                    fetchReplies(topic.id);
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                        {topic.author_name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                          {topic.title}
                          {topic.is_pinned && <Pin className="h-4 w-4 text-red-500" />}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <User className="h-3 w-3" />
                          <span>{topic.author_name}</span>
                          {topic.author_university && (
                            <>
                              <Building className="h-3 w-3" />
                              <span>{topic.author_university}</span>
                            </>
                          )}
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(topic.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {topic.category && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          {topic.category}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-slate-700 mb-4 line-clamp-3">{topic.content}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLikeTopic(topic.id);
                        }}
                        className="flex items-center gap-1 text-slate-600 hover:text-red-500 transition-colors"
                      >
                        <Heart className="h-4 w-4" />
                        <span className="text-sm">{topic.likes}</span>
                      </button>
                      <div className="flex items-center gap-1 text-slate-600">
                        <Reply className="h-4 w-4" />
                        <span className="text-sm">Répondre</span>
                      </div>
                    </div>
                    
                    {topic.tags && (
                      <div className="flex items-center gap-2">
                        <Hash className="h-3 w-3 text-slate-400" />
                        <div className="flex gap-1">
                          {topic.tags.split(',').map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Topic Detail Sidebar */}
        {selectedTopic && (
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200/50 shadow-sm p-6 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Discussion</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTopic(null)}
                >
                  ×
                </Button>
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {/* Topic Content */}
                <div className="border-b border-slate-200 pb-4">
                  <h3 className="font-semibold text-slate-900 mb-2">{selectedTopic.title}</h3>
                  <p className="text-slate-700 text-sm leading-relaxed">{selectedTopic.content}</p>
                  <div className="flex items-center gap-2 mt-3 text-xs text-slate-600">
                    <User className="h-3 w-3" />
                    <span>{selectedTopic.author_name}</span>
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(selectedTopic.created_at)}</span>
                  </div>
                </div>
                
                {/* Replies */}
                <div className="space-y-3">
                  <h4 className="font-medium text-slate-900">Réponses ({replies.length})</h4>
                  {replies.length === 0 ? (
                    <p className="text-slate-600 text-sm">Soyez le premier à répondre !</p>
                  ) : (
                    replies.map((reply) => (
                      <div key={reply.id} className="border-b border-slate-100 pb-3">
                        <div className="flex items-start gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center text-white font-semibold text-xs">
                            {reply.author_name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-slate-900 text-sm">{reply.author_name}</span>
                              <span className="text-xs text-slate-600">{formatDate(reply.created_at)}</span>
                              {reply.is_helpful && (
                                <Star className="h-3 w-3 text-yellow-500" />
                              )}
                            </div>
                            <p className="text-slate-700 text-sm leading-relaxed">{reply.content}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <button
                                onClick={() => handleLikeReply(reply.id)}
                                className="flex items-center gap-1 text-slate-600 hover:text-red-500 transition-colors text-xs"
                              >
                                <ThumbsUp className="h-3 w-3" />
                                <span>{reply.likes}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                {/* Reply Input */}
                <div className="pt-4 border-t border-slate-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Écrire une réponse..."
                      value={newReply}
                      onChange={(e) => setNewReply(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleReply()}
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                    />
                    <Button
                      onClick={handleReply}
                      size="sm"
                      className="gap-1"
                    >
                      <Send className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New Topic Modal */}
      {showNewTopicModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">Créer un nouveau sujet</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Titre</label>
                <input
                  type="text"
                  value={newTopic.title}
                  onChange={(e) => setNewTopic(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="Titre de votre sujet..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Catégorie</label>
                <select
                  value={newTopic.category}
                  onChange={(e) => setNewTopic(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contenu</label>
                <textarea
                  value={newTopic.content}
                  onChange={(e) => setNewTopic(prev => ({ ...prev, content: e.target.value }))}
                  rows={6}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="Décrivez votre sujet en détail..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tags (séparés par des virgules)</label>
                <input
                  type="text"
                  value={newTopic.tags}
                  onChange={(e) => setNewTopic(prev => ({ ...prev, tags: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="ex: entretien, conseil, technologie"
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowNewTopicModal(false)}
              >
                Annuler
              </Button>
              <Button
                onClick={handleCreateTopic}
                className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Send className="h-4 w-4" />
                Créer le sujet
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
