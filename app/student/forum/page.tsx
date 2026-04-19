"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { decodeToken } from "@/lib/jwt";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  Heart, 
  Plus,
  Search,
  Pin,
  Building,
  Send,
  ThumbsUp,
  Star,
  X
} from "lucide-react";

// Types
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

interface CommentReply {
  id: number;
  reply_id: number;
  author_id: number;
  author_name: string;
  author_university?: string;
  content: string;
  likes: number;
  is_helpful?: boolean;
  created_at: string;
}

// Constants
const CATEGORIES = [
  'Général',
  'Carrière',
  'Entretiens',
  'Compétences',
  'Formation',
  'Technologies',
  'Entreprises',
  'Conseils'
];

export default function StudentForumPage() {
  // State
  const [isAuthed, setIsAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<ForumTopic | null>(null);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [commentReplies, setCommentReplies] = useState<CommentReply[]>([]);
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());
  const [expandedReplies, setExpandedReplies] = useState<Set<number>>(new Set());
  const [newCommentReply, setNewCommentReply] = useState<Record<number, string>>({});
  const [showNewTopicModal, setShowNewTopicModal] = useState(false);
  const [newTopic, setNewTopic] = useState({ title: '', content: '', category: '', tags: '' });
  const [newReply, setNewReply] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const router = useRouter();
  const hasCheckedAuth = useRef(false);

  // Helper Functions
  const getValidToken = useCallback((): string | null => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('token');
    if (!token) return null;
    const decoded = decodeToken(token);
    if (!decoded || decoded.role !== 'STUDENT') {
      localStorage.removeItem('token');
      return null;
    }
    return token;
  }, []);

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

  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 3000);
  };

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  // API Calls
  const fetchTopics = useCallback(async () => {
    setLoading(true);
    try {
      const token = getValidToken();
      if (!token) return;

      const res = await fetch('/api/student/forum/topics', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!res.ok) throw new Error('Erreur lors de la récupération des sujets');

      const data = await res.json();
      if (data.success) {
        setTopics(data.data);
      } else {
        throw new Error(data.error || 'Réponse invalide');
      }
    } catch (err: any) {
      console.error('fetchTopics error:', err);
      showError(err.message || 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [getValidToken]);

  const fetchReplies = useCallback(async (topicId: number) => {
    try {
      const token = getValidToken();
      if (!token) return;

      const res = await fetch(`/api/student/forum/topics/${topicId}/replies`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!res.ok) throw new Error('Erreur lors de la récupération des réponses');

      const data = await res.json();
      if (data.success) {
        setReplies(data.data);
      }
    } catch (err: any) {
      console.error('fetchReplies error:', err);
      showError(err.message);
    }
  }, [getValidToken]);

  const fetchCommentReplies = useCallback(async (replyId: number) => {
    try {
      const token = getValidToken();
      if (!token) return;

      const res = await fetch(`/api/student/forum/replies/${replyId}/replies`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setCommentReplies(prev => {
            const filtered = prev.filter(r => r.reply_id !== replyId);
            return [...filtered, ...data.data];
          });
        }
      }
    } catch (err) {
      console.error('fetchCommentReplies error:', err);
    }
  }, [getValidToken]);

  // Handlers
  const handleCreateTopic = async () => {
    if (!newTopic.title.trim() || !newTopic.content.trim()) {
      showError('Le titre et le contenu sont requis');
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
      
      if (!res.ok) throw new Error('Erreur lors de la création du sujet');

      const data = await res.json();
      if (data.success) {
        setTopics(prev => [data.data, ...prev]);
        setShowNewTopicModal(false);
        setNewTopic({ title: '', content: '', category: '', tags: '' });
        showSuccess('Sujet créé avec succès');
      } else {
        throw new Error(data.error || 'Création échouée');
      }
    } catch (err: any) {
      console.error('handleCreateTopic error:', err);
      showError(err.message);
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
      
      if (!res.ok) throw new Error('Erreur lors de la réponse');

      const data = await res.json();
      if (data.success) {
        setReplies(prev => [...prev, data.data]);
        setNewReply('');
        showSuccess('Réponse ajoutée avec succès');
      }
    } catch (err: any) {
      console.error('handleReply error:', err);
      showError(err.message);
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

  const handleCommentReply = async (replyId: number) => {
    const content = newCommentReply[replyId];
    if (!content?.trim()) return;

    try {
      const token = getValidToken();
      if (!token) return;

      const res = await fetch(`/api/student/forum/replies/${replyId}/replies`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setCommentReplies(prev => [...prev, data.data]);
          setNewCommentReply(prev => ({ ...prev, [replyId]: '' }));
          showSuccess('Réponse ajoutée avec succès');
        }
      } else {
        throw new Error('Erreur lors de l\'ajout de la réponse');
      }
    } catch (err) {
      console.error('handleCommentReply error:', err);
      showError('Erreur lors de l\'ajout de la réponse');
    }
  };

  const handleLikeReplyReply = async (replyId: number) => {
    try {
      const token = getValidToken();
      if (!token) return;

      const res = await fetch(`/api/student/forum/comment-replies/${replyId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (res.ok) {
        setCommentReplies(prev => prev.map(reply => 
          reply.id === replyId 
            ? { ...reply, likes: reply.likes + 1 }
            : reply
        ));
      }
    } catch (err) {
      console.error('handleLikeReplyReply error:', err);
    }
  };

  const handleTopicClick = async (topic: ForumTopic) => {
    setSelectedTopic(topic);
    await fetchReplies(topic.id);
    // Reset expanded states when opening a new topic
    setExpandedComments(new Set());
    setExpandedReplies(new Set());
  };

  const toggleExpandedComments = (topicId: number) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(topicId)) {
        newSet.delete(topicId);
      } else {
        newSet.add(topicId);
      }
      return newSet;
    });
  };

  const toggleExpandedReplies = (replyId: number) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(replyId)) {
        newSet.delete(replyId);
      } else {
        newSet.add(replyId);
        // Fetch replies when expanding
        fetchCommentReplies(replyId);
      }
      return newSet;
    });
  };

  // Effects
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
  }, [router, getValidToken, fetchTopics]);

  // Filtered topics
  const filteredTopics = topics.filter(topic => {
    const matchesSearch = topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         topic.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || topic.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Loading and auth checks
  if (!isAuthed) {
    return <div className="p-8 text-center">Vérification...</div>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-600">Chargement du forum...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Forum Étudiant</h1>
          <p className="text-gray-600">Partagez, discutez et apprenez ensemble</p>
        </div>
        <Button
          onClick={() => setShowNewTopicModal(true)}
          className="gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          <Plus className="h-4 w-4"/>
          Nouveau Sujet
        </Button>
      </div>

      {/* Notifications */}
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

      {/* Search and Filter */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher des sujets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-700/20 focus:border-gray-700"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-700/20 focus:border-gray-700"
          >
            <option value="">Toutes les catégories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Topics */}
      <div className="space-y-4">
        {filteredTopics.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun sujet trouvé</h3>
            <p className="text-gray-600">Soyez le premier à créer un sujet !</p>
          </div>
        ) : (
          filteredTopics.map((topic) => (
            <div
              key={topic.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Post Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    {topic.author_name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">
                        {topic.author_name}
                      </h3>
                      {topic.is_pinned && <Pin className="h-4 w-4 text-red-500" />}
                      {topic.category && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          {topic.category}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>{formatDate(topic.created_at)}</span>
                      {topic.author_university && (
                        <>
                          <Building className="h-3 w-3" />
                          <span className="truncate">{topic.author_university}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Post Content */}
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">{topic.title}</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{topic.content}</p>
                
                {topic.tags && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {topic.tags.split(',').map((tag, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Post Actions */}
              <div className="px-6 py-3 border-t border-gray-100">
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => handleLikeTopic(topic.id)}
                    className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors"
                  >
                    <Heart className="h-5 w-5" />
                    <span className="text-sm">{topic.likes}</span>
                  </button>
                  <button
                    onClick={() => handleTopicClick(topic)}
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors"
                  >
                    <MessageSquare className="h-5 w-5" />
                    <span className="text-sm">
                      {selectedTopic?.id === topic.id ? 'Masquer' : 'Commenter'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Comments Section */}
              {selectedTopic?.id === topic.id && (
                <div className="border-t border-gray-100">
                  {/* Comments List */}
                  <div className="p-6 space-y-4">
                    {replies.length === 0 ? (
                      <p className="text-gray-600 text-center py-4">Soyez le premier à commenter !</p>
                    ) : (
                      <>
                        {(expandedComments.has(topic.id) ? replies : replies.slice(0, 2)).map((reply) => (
                          <div key={reply.id} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                              {reply.author_name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="bg-gray-50 rounded-lg p-3">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  <span className="font-medium text-gray-900 text-sm">{reply.author_name}</span>
                                  <span className="text-xs text-gray-500">{formatDate(reply.created_at)}</span>
                                  {reply.is_helpful && (
                                    <Star className="h-3 w-3 text-yellow-500" />
                                  )}
                                </div>
                                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{reply.content}</p>
                                <div className="flex items-center gap-4 mt-2">
                                  <button
                                    onClick={() => handleLikeReply(reply.id)}
                                    className="flex items-center gap-1 text-gray-600 hover:text-red-500 transition-colors text-xs"
                                  >
                                    <ThumbsUp className="h-3 w-3" />
                                    <span>{reply.likes}</span>
                                  </button>
                                  <button
                                    onClick={() => toggleExpandedReplies(reply.id)}
                                    className="text-blue-600 hover:text-blue-700 text-xs font-medium"
                                  >
                                    {expandedReplies.has(reply.id) ? 'Masquer les réponses' : 'Répondre'}
                                  </button>
                                </div>
                              </div>

                              {/* Nested Replies */}
                              {expandedReplies.has(reply.id) && (
                                <div className="ml-6 mt-3 space-y-3">
                                  {commentReplies
                                    .filter(r => r.reply_id === reply.id)
                                    .map((commentReply) => (
                                      <div key={commentReply.id} className="flex gap-2">
                                        <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                                          {commentReply.author_name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 bg-gray-50 rounded-lg p-2">
                                          <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <span className="font-medium text-gray-900 text-xs">{commentReply.author_name}</span>
                                            <span className="text-gray-500 text-xs">{formatDate(commentReply.created_at)}</span>
                                          </div>
                                          <p className="text-gray-700 text-xs leading-relaxed whitespace-pre-wrap">{commentReply.content}</p>
                                          <button
                                            onClick={() => handleLikeReplyReply(commentReply.id)}
                                            className="flex items-center gap-1 text-gray-600 hover:text-red-500 transition-colors text-xs mt-1"
                                          >
                                            <ThumbsUp className="h-2 w-2" />
                                            <span>{commentReply.likes}</span>
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  
                                  {/* Add nested reply input */}
                                  <div className="flex gap-2 ml-6">
                                    <input
                                      type="text"
                                      placeholder="Répondre à ce commentaire..."
                                      value={newCommentReply[reply.id] || ''}
                                      onChange={(e) => setNewCommentReply(prev => ({ ...prev, [reply.id]: e.target.value }))}
                                      onKeyPress={(e) => e.key === 'Enter' && handleCommentReply(reply.id)}
                                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                                    />
                                    <Button
                                      size="sm"
                                      onClick={() => handleCommentReply(reply.id)}
                                      className="gap-1"
                                    >
                                      <Send className="h-3 w-3" />
                                      Envoyer
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        
                        {/* Show more comments button */}
                        {replies.length > 2 && (
                          <button
                            onClick={() => toggleExpandedComments(topic.id)}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            {expandedComments.has(topic.id) 
                              ? 'Voir moins de commentaires' 
                              : `Voir plus de commentaires (${replies.length - 2})`}
                          </button>
                        )}
                      </>
                    )}
                  </div>

                  {/* Add Comment Input */}
                  <div className="px-6 pb-6">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                        MOI
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Écrire un commentaire..."
                          value={newReply}
                          onChange={(e) => setNewReply(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleReply()}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* New Topic Modal */}
      {showNewTopicModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowNewTopicModal(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Créer un nouveau sujet</h2>
              <button onClick={() => setShowNewTopicModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                <input
                  type="text"
                  value={newTopic.title}
                  onChange={(e) => setNewTopic(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="Titre de votre sujet..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <select
                  value={newTopic.category}
                  onChange={(e) => setNewTopic(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contenu *</label>
                <textarea
                  value={newTopic.content}
                  onChange={(e) => setNewTopic(prev => ({ ...prev, content: e.target.value }))}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="Décrivez votre sujet en détail..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (séparés par des virgules)</label>
                <input
                  type="text"
                  value={newTopic.tags}
                  onChange={(e) => setNewTopic(prev => ({ ...prev, tags: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="ex: entretien, conseil, technologie"
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowNewTopicModal(false)}
              >
                Annuler
              </Button>
              <Button
                onClick={handleCreateTopic}
                className="gap-2 bg-blue-600 hover:bg-blue-700"
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