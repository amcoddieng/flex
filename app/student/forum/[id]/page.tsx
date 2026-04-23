"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { decodeToken } from "@/lib/jwt";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  Heart, 
  ArrowLeft,
  Send,
  ThumbsUp,
  Pin,
  Building,
  Clock,
  User,
  Reply,
  MoreVertical,
  Edit,
  Trash2,
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
  reply_comment_id: number;
  author_id: number;
  author_name: string;
  content: string;
  likes: number;
  created_at: string;
}

interface Toast {
  type: 'success' | 'error';
  message: string;
}

// Composant pour les notifications
const ToastNotification: React.FC<{ toast: Toast | null; onClose: () => void }> = ({ toast, onClose }) => {
  if (!toast) return null;
  
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);
  
  return (
    <div className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
      toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
    }`}>
      <div className="flex items-center gap-2">
        <span>{toast.message}</span>
        <button onClick={onClose} className="ml-2">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// Composant pour une réponse individuelle
const ReplyItem = React.memo(({ 
  reply, 
  currentUserId,
  onLike, 
  onToggleReplies, 
  isExpanded,
  commentReplies,
  newCommentReply,
  onCommentReplyChange,
  onSubmitCommentReply,
  submittingCommentReply,
  onEdit,
  onDelete,
  formatDate
}: { 
  reply: ForumReply;
  currentUserId?: number;
  onLike: (id: number) => void;
  onToggleReplies: (id: number) => void;
  isExpanded: boolean;
  commentReplies?: CommentReply[];
  newCommentReply?: string;
  onCommentReplyChange?: (value: string) => void;
  onSubmitCommentReply?: () => void;
  submittingCommentReply?: boolean;
  onEdit?: (reply: ForumReply) => void;
  onDelete?: (id: number) => void;
  formatDate: (date: string) => string;
}) => {
  const [showActions, setShowActions] = useState(false);
  const isAuthor = currentUserId === reply.author_id;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
          {reply.author_name?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-gray-900">{reply.author_name}</h4>
              {reply.is_helpful && (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                  Utile
                </span>
              )}
            </div>
            {isAuthor && (
              <div className="relative">
                <button
                  onClick={() => setShowActions(!showActions)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <MoreVertical className="h-4 w-4 text-gray-500" />
                </button>
                {showActions && (
                  <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <button
                      onClick={() => {
                        onEdit?.(reply);
                        setShowActions(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Edit className="h-3 w-3" />
                      Modifier
                    </button>
                    <button
                      onClick={() => {
                        onDelete?.(reply.id);
                        setShowActions(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 className="h-3 w-3" />
                      Supprimer
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <Clock className="h-3 w-3" />
            <span>{formatDate(reply.created_at)}</span>
            {reply.author_university && (
              <>
                <Building className="h-3 w-3" />
                <span className="truncate">{reply.author_university}</span>
              </>
            )}
          </div>
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {reply.content}
            </p>
          </div>
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onLike(reply.id)}
              className="gap-2"
            >
              <ThumbsUp className="h-4 w-4" />
              {reply.likes}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleReplies(reply.id)}
              className="gap-2"
            >
              <Reply className="h-4 w-4" />
              Répondre
            </Button>
          </div>

          {/* Comment Replies Section - seulement s'il y a des réponses */}
          {commentReplies && commentReplies.length > 0 && (
            <div className="mt-4 pl-4 border-l-2 border-gray-200">
              {/* Comment Replies List */}
              <div className="space-y-3 mb-4">
                {commentReplies.map((commentReply) => (
                  <div key={commentReply.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                        {commentReply.author_name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-medium text-gray-900 text-sm">{commentReply.author_name}</h5>
                          <span className="text-xs text-gray-500">
                            {formatDate(commentReply.created_at)}
                          </span>
                        </div>
                        <div className="prose max-w-none">
                          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                            {commentReply.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply to Comment Form */}
              {isExpanded && (
                <div className="mb-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCommentReply || ''}
                      onChange={(e) => onCommentReplyChange?.(e.target.value)}
                      placeholder="Répondre à ce commentaire..."
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          onSubmitCommentReply?.();
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={onSubmitCommentReply}
                      disabled={!newCommentReply?.trim() || submittingCommentReply}
                      className="gap-2"
                    >
                      {submittingCommentReply ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

ReplyItem.displayName = 'ReplyItem';

export default function ForumTopicPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = params.id as string;

  // State
  const [topic, setTopic] = useState<ForumTopic | null>(null);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [commentReplies, setCommentReplies] = useState<Record<number, CommentReply[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newReply, setNewReply] = useState("");
  const [newCommentReply, setNewCommentReply] = useState<Record<number, string>>({});
  const [submittingReply, setSubmittingReply] = useState(false);
  const [submittingCommentReply, setSubmittingCommentReply] = useState<Record<number, boolean>>({});
  const [expandedReplies, setExpandedReplies] = useState<Set<number>>(new Set());
  const [showAllReplies, setShowAllReplies] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number>();
  const [toast, setToast] = useState<Toast | null>(null);
  const [likingReply, setLikingReply] = useState<number | null>(null);
  const [likingTopic, setLikingTopic] = useState(false);
  const [editingReply, setEditingReply] = useState<ForumReply | null>(null);

  // Get valid token
  const getValidToken = useCallback((): string | null => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('token');
    if (!token) return null;
    const decoded = decodeToken(token);
    if (!decoded || decoded.role !== 'STUDENT') {
      localStorage.removeItem('token');
      return null;
    }
    setCurrentUserId(decoded.userId);
    return token;
  }, []);
  // Format date - corrigé
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }, []);

  // Show toast message
  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
  }, []);

  // Check authentication
  useEffect(() => {
    const token = getValidToken();
    setIsAuthenticated(!!token);
    if (!token) {
      router.push('/login');
      return;
    }
  }, [router, getValidToken]);

  // Fetch topic details
  useEffect(() => {
    if (!topicId || !isAuthenticated) return;

    const fetchTopic = async () => {
      try {
        const token = getValidToken();
        if (!token) return;

        // Fetch topic
        const topicRes = await fetch(`/api/student/forum/topics/${topicId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!topicRes.ok) {
          throw new Error('Sujet non trouvé');
        }

        const topicData = await topicRes.json();
        setTopic(topicData.data);

        // Fetch replies
        const repliesRes = await fetch(`/api/student/forum/topics/${topicId}/replies`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (repliesRes.ok) {
          const repliesData = await repliesRes.json();
          setReplies(repliesData.data || []);
        }

      } catch (err: any) {
        const errorMessage = err.message || 'Erreur lors du chargement du sujet';
        setError(errorMessage);
        showToast('error', errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchTopic();
  }, [topicId, isAuthenticated, getValidToken, showToast]);

  // Handle reply submission
  const handleReply = useCallback(async () => {
    if (!newReply.trim() || !topicId) return;

    setSubmittingReply(true);
    try {
      const token = getValidToken();
      if (!token) return;

      const res = await fetch(`/api/student/forum/topics/${topicId}/replies`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newReply.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error('Erreur lors de l\'envoi de la réponse');
      }

      const data = await res.json();
      if (data.success) {
        setReplies(prev => [data.data, ...prev]);
        setNewReply("");
        showToast('success', 'Réponse envoyée avec succès');
      } else {
        throw new Error(data.error || 'Réponse échouée');
      }
    } catch (err: any) {
      showToast('error', err.message);
    } finally {
      setSubmittingReply(false);
    }
  }, [newReply, topicId, getValidToken, showToast]);

  // Handle like topic
  const handleLikeTopic = useCallback(async () => {
    if (!topicId || likingTopic) return;

    setLikingTopic(true);
    try {
      const token = getValidToken();
      if (!token) return;

      const res = await fetch(`/api/student/forum/topics/${topicId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setTopic(prev => prev ? { ...prev, likes: prev.likes + 1 } : null);
      }
    } catch (err) {
      console.error('Error liking topic:', err);
    } finally {
      setLikingTopic(false);
    }
  }, [topicId, getValidToken, likingTopic]);

  // Handle like reply
  const handleLikeReply = useCallback(async (replyId: number) => {
    if (likingReply === replyId) return;
    
    setLikingReply(replyId);
    try {
      const token = getValidToken();
      if (!token) return;

      const res = await fetch(`/api/student/forum/replies/${replyId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setReplies(prev => prev.map(reply => 
          reply.id === replyId ? { ...reply, likes: reply.likes + 1 } : reply
        ));
      }
    } catch (err) {
      console.error('Error liking reply:', err);
    } finally {
      setLikingReply(null);
    }
  }, [getValidToken, likingReply]);

  // Handle edit reply
  const handleEditReply = useCallback((reply: ForumReply) => {
    setEditingReply(reply);
    setNewReply(reply.content);
    // Scroll to reply form
    document.getElementById('reply-form')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Handle update reply
  const handleUpdateReply = useCallback(async () => {
    if (!editingReply || !newReply.trim()) return;

    setSubmittingReply(true);
    try {
      const token = getValidToken();
      if (!token) return;

      const res = await fetch(`/api/student/forum/replies/${editingReply.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newReply.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error('Erreur lors de la modification');
      }

      const data = await res.json();
      if (data.success) {
        setReplies(prev => prev.map(reply =>
          reply.id === editingReply.id ? { ...reply, content: newReply.trim() } : reply
        ));
        setNewReply("");
        setEditingReply(null);
        showToast('success', 'Réponse modifiée avec succès');
      } else {
        throw new Error(data.error || 'Modification échouée');
      }
    } catch (err: any) {
      showToast('error', err.message);
    } finally {
      setSubmittingReply(false);
    }
  }, [editingReply, newReply, getValidToken, showToast]);

  // Handle delete reply
  const handleDeleteReply = useCallback(async (replyId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette réponse ?')) return;

    try {
      const token = getValidToken();
      if (!token) return;

      const res = await fetch(`/api/student/forum/replies/${replyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setReplies(prev => prev.filter(reply => reply.id !== replyId));
        showToast('success', 'Réponse supprimée avec succès');
      } else {
        throw new Error('Erreur lors de la suppression');
      }
    } catch (err: any) {
      showToast('error', err.message);
    }
  }, [getValidToken, showToast]);

  // Fetch comment replies for a specific reply
  const fetchCommentReplies = useCallback(async (replyId: number) => {
    try {
      const token = getValidToken();
      if (!token) return;

      const res = await fetch(`/api/student/forum/replies/${replyId}/comment-replies`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setCommentReplies(prev => ({
          ...prev,
          [replyId]: data.data || []
        }));
      }
    } catch (err) {
      console.error('Error fetching comment replies:', err);
    }
  }, [getValidToken]);

  // Toggle comment replies visibility
  const toggleCommentReplies = useCallback(async (replyId: number) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(replyId)) {
        newSet.delete(replyId);
      } else {
        newSet.add(replyId);
        if (!commentReplies[replyId]) {
          fetchCommentReplies(replyId);
        }
      }
      return newSet;
    });
  }, [commentReplies, fetchCommentReplies]);

  // Handle comment reply submission
  const handleCommentReply = useCallback(async (replyId: number) => {
    const content = newCommentReply[replyId]?.trim();
    if (!content) return;

    setSubmittingCommentReply(prev => ({ ...prev, [replyId]: true }));
    try {
      const token = getValidToken();
      if (!token) return;

      const res = await fetch(`/api/student/forum/replies/${replyId}/comment-replies`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error('Erreur lors de l\'envoi de la réponse');
      }

      const data = await res.json();
      if (data.success) {
        setCommentReplies(prev => ({
          ...prev,
          [replyId]: [data.data, ...(prev[replyId] || [])]
        }));
        setNewCommentReply(prev => ({ ...prev, [replyId]: '' }));
        showToast('success', 'Réponse envoyée avec succès');
      } else {
        throw new Error(data.error || 'Réponse échouée');
      }
    } catch (err: any) {
      showToast('error', err.message);
    } finally {
      setSubmittingCommentReply(prev => ({ ...prev, [replyId]: false }));
    }
  }, [newCommentReply, getValidToken, showToast]);

  // Handle keyboard shortcuts (Ctrl+Enter)
  const handleKeyPress = useCallback((e: React.KeyboardEvent, action: () => void) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  }, []);

  if (!isAuthenticated) {
    return <div className="p-8">Vérification...</div>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-slate-600">Chargement du sujet...</p>
        </div>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error || 'Sujet non trouvé'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="gap-2 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au forum
        </Button>
        
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          {/* Topic Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center text-white font-semibold flex-shrink-0">
                {topic.author_name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {topic.author_name}
                  </h3>
                  {topic.is_pinned && <Pin className="h-4 w-4 text-red-500" />}
                  {topic.category && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      {topic.category}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <Clock className="h-3 w-3" />
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

          {/* Topic Content */}
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{topic.title}</h1>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {topic.content}
              </p>
            </div>
            
            {topic.tags && (
              <div className="flex flex-wrap gap-2 mt-4">
                {topic.tags.split(',').map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            )}

            {/* Topic Actions */}
            <div className="flex items-center gap-4 mt-6 pt-4 border-t border-gray-100">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLikeTopic}
                disabled={likingTopic}
                className="gap-2"
              >
                {likingTopic ? (
                  <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Heart className="h-4 w-4" />
                )}
                {topic.likes}
              </Button>
              <div className="text-sm text-gray-500">
                <MessageSquare className="h-4 w-4 inline mr-1" />
                {replies.length} réponse{replies.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reply Form */}
      <div className="mb-6" id="reply-form">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            {editingReply ? 'Modifier la réponse' : 'Répondre au sujet'}
          </h3>
          <div className="space-y-4">
            <textarea
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              placeholder="Écrivez votre réponse..."
              rows={4}
              onKeyDown={(e) => handleKeyPress(e, editingReply ? handleUpdateReply : handleReply)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
            />
            <div className="flex justify-end gap-2">
              {editingReply && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingReply(null);
                    setNewReply("");
                  }}
                >
                  Annuler
                </Button>
              )}
              <Button
                onClick={editingReply ? handleUpdateReply : handleReply}
                disabled={!newReply.trim() || submittingReply}
                className="gap-2"
              >
                {submittingReply ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {editingReply ? 'Modifier' : 'Envoyer la réponse'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Replies */}
      <div className="space-y-4">
        {replies.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucune réponse pour le moment</p>
            <p className="text-sm text-gray-400 mt-2">Soyez le premier à répondre !</p>
          </div>
        ) : (
          <>
            {/* Afficher les 3 dernières réponses par défaut */}
            {(showAllReplies ? replies : replies.slice(0, 3)).map((reply) => (
              <ReplyItem
                key={reply.id}
                reply={reply}
                currentUserId={currentUserId}
                onLike={handleLikeReply}
                onToggleReplies={toggleCommentReplies}
                isExpanded={true}
                commentReplies={commentReplies[reply.id]}
                newCommentReply={newCommentReply[reply.id]}
                onCommentReplyChange={(value) => setNewCommentReply(prev => ({ ...prev, [reply.id]: value }))}
                onSubmitCommentReply={() => handleCommentReply(reply.id)}
                submittingCommentReply={submittingCommentReply[reply.id]}
                onEdit={handleEditReply}
                onDelete={handleDeleteReply}
                formatDate={formatDate}
              />
            ))}

            {/* Bouton "Voir plus" si plus de 3 réponses */}
            {replies.length > 3 && (
              <div className="text-center py-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAllReplies(!showAllReplies)}
                  className="gap-2"
                >
                  {showAllReplies ? (
                    <>Afficher moins</>
                  ) : (
                    <>
                      Voir plus de réponses
                      <span className="text-gray-500">({replies.length - 3} supplémentaires)</span>
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}