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
  User,
  Send,
  Calendar
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

export default function StudentForum() {
  const router = useRouter();
  const [isAuthed, setIsAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<ForumTopic | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [newReply, setNewReply] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showNewTopicModal, setShowNewTopicModal] = useState(false);
  const [newTopic, setNewTopic] = useState({
    title: "",
    content: "",
    category: ""
  });

  const categories = ["Général", "Études", "Carrière", "Projets", "Social"];
  
  const filteredTopics = topics.filter(topic => {
    const matchesSearch = topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         topic.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || topic.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const payload = decodeToken(token);
      if (payload.role !== 'STUDENT') {
        router.push('/login');
        return;
      }
      setIsAuthed(true);
      fetchTopics();
    } catch (error) {
      console.error('Token validation error:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const fetchTopics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/student/forum/topics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setTopics(data.topics || []);
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
      setError('Erreur lors du chargement des sujets');
    }
  };

  const fetchReplies = async (topicId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/student/forum/topics/${topicId}/replies`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setReplies(data.replies || []);
      }
    } catch (error) {
      console.error('Error fetching replies:', error);
    }
  };

  const handleLikeTopic = async (topicId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/student/forum/topics/${topicId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setTopics(prev => prev.map(topic => 
          topic.id === topicId 
            ? { ...topic, likes: topic.likes + 1 }
            : topic
        ));
      }
    } catch (error) {
      console.error('Error liking topic:', error);
    }
  };

  const handleLikeReply = async (replyId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/student/forum/replies/${replyId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setReplies(prev => prev.map(reply => 
          reply.id === replyId 
            ? { ...reply, likes: reply.likes + 1 }
            : reply
        ));
      }
    } catch (error) {
      console.error('Error liking reply:', error);
    }
  };

  const handleReplySubmit = async () => {
    if (!newReply.trim() || !selectedTopic) return;

    setSubmittingReply(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/student/forum/topics/${selectedTopic.id}/replies`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: newReply })
      });

      if (response.ok) {
        const data = await response.json();
        setReplies(prev => [...prev, data.reply]);
        setNewReply("");
        setSuccess("Réponse envoyée avec succès !");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
      setError('Erreur lors de l\'envoi de la réponse');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleNewTopicSubmit = async () => {
    if (!newTopic.title.trim() || !newTopic.content.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/student/forum/topics', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTopic)
      });

      if (response.ok) {
        const data = await response.json();
        setTopics(prev => [data.topic, ...prev]);
        setNewTopic({ title: "", content: "", category: "" });
        setShowNewTopicModal(false);
        setSuccess("Sujet créé avec succès !");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (error) {
      console.error('Error creating topic:', error);
      setError('Erreur lors de la création du sujet');
    }
  };

  if (!isAuthed) {
    return <div className="p-8">Vérification...</div>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin"></div>
          <p className="text-gray-600">Chargement du forum...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-200px)] bg-[#ECE5DD] rounded-lg overflow-hidden">
      <div className="flex h-full">
        {/* Conversations List - Left Sidebar */}
        <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
          {/* Conversations Header */}
          <div className="bg-[#075E54] text-white px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold">Forum Étudiant</h1>
                  <p className="text-xs text-[#ECE5DD] opacity-90">Discussions en ligne</p>
                </div>
              </div>
              <Button
                onClick={() => setShowNewTopicModal(true)}
                className="gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white border-none"
              >
                <Plus className="h-4 w-4" />
                Nouveau Sujet
              </Button>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="p-3 bg-white border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher des sujets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25D366]/20 text-sm"
              />
            </div>
          </div>
          
          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {filteredTopics.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune discussion</h3>
                <p className="text-gray-600 text-sm">Commencez une nouvelle conversation !</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredTopics.map((topic) => (
                  <div
                    key={topic.id}
                    onClick={() => {
                      setSelectedTopic(topic);
                      fetchReplies(topic.id);
                    }}
                    className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedTopic?.id === topic.id ? 'bg-gray-100' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-[#25D366] rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        {topic.author_name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 truncate text-sm">
                            {topic.title}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {new Date(topic.created_at).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                          <User className="h-3 w-3" />
                          <span>{topic.author_name}</span>
                          {topic.category && (
                            <span className="px-2 py-0.5 bg-[#25D366]/20 text-[#075E54] text-xs rounded-full">
                              {topic.category}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{topic.content}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            <span>{topic.likes}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Reply className="h-3 w-3" />
                            <span>{replies.filter(r => r.topic_id === topic.id).length}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Chat Area - Right Side */}
        <div className="flex-1 flex flex-col bg-[#ECE5DD]">
          {selectedTopic ? (
            <>
              {/* Chat Header */}
              <div className="bg-[#075E54] text-white px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {selectedTopic.author_name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-semibold text-white">{selectedTopic.title}</h2>
                    <p className="text-xs text-[#ECE5DD] opacity-90">
                      {selectedTopic.author_name} · {selectedTopic.category || 'Général'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedTopic(null);
                    setReplies([]);
                  }}
                  className="text-white hover:bg-[#128C7E]"
                >
                  ×
                </Button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Original Topic Message */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#25D366] rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                    {selectedTopic.author_name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="max-w-[75%]">
                    <div className="bg-white rounded-lg shadow-sm px-4 py-3">
                      <div className="text-xs font-semibold text-[#075E54] mb-1">
                        {selectedTopic.author_name}
                      </div>
                      <p className="text-sm text-gray-800 leading-relaxed">{selectedTopic.content}</p>
                      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                        <span>{new Date(selectedTopic.created_at).toLocaleString('fr-FR')}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLikeTopic(selectedTopic.id);
                            }}
                            className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors"
                          >
                            <Heart className="h-3 w-3" />
                            <span>{selectedTopic.likes}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Replies */}
                {replies.map((reply) => (
                  <div key={reply.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-[#128C7E] rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                      {reply.author_name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="max-w-[75%]">
                      <div className="bg-white rounded-lg shadow-sm px-4 py-3">
                        <div className="text-xs font-semibold text-[#075E54] mb-1">
                          {reply.author_name}
                        </div>
                        <p className="text-sm text-gray-800 leading-relaxed">{reply.content}</p>
                        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                          <span>{new Date(reply.created_at).toLocaleString('fr-FR')}</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLikeReply(reply.id);
                              }}
                              className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors"
                            >
                              <Heart className="h-3 w-3" />
                              <span>{reply.likes}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {replies.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">Soyez le premier à répondre !</p>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex items-end gap-3">
                  <textarea
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    placeholder="Tapez votre réponse..."
                    className="flex-1 resize-none border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#25D366]/20 focus:border-[#25D366]"
                    rows={1}
                  />
                  <Button
                    onClick={handleReplySubmit}
                    disabled={!newReply.trim() || submittingReply}
                    className="bg-[#25D366] hover:bg-[#128C7E] text-white"
                  >
                    {submittingReply ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Sélectionnez une discussion</h3>
                <p className="text-gray-600">Choisissez une conversation pour commencer à discuter</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Topic Modal */}
      {showNewTopicModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Nouveau Sujet</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                <input
                  type="text"
                  value={newTopic.title}
                  onChange={(e) => setNewTopic({...newTopic, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25D366]/20 focus:border-[#25D366]"
                  placeholder="Titre du sujet..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <select
                  value={newTopic.category}
                  onChange={(e) => setNewTopic({...newTopic, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25D366]/20 focus:border-[#25D366]"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contenu</label>
                <textarea
                  value={newTopic.content}
                  onChange={(e) => setNewTopic({...newTopic, content: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25D366]/20 focus:border-[#25D366]"
                  rows={6}
                  placeholder="Contenu du sujet..."
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
                onClick={handleNewTopicSubmit}
                disabled={!newTopic.title.trim() || !newTopic.content.trim()}
                className="bg-[#25D366] hover:bg-[#128C7E] text-white"
              >
                Créer le sujet
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Success/Error Messages */}
      {success && (
        <div className="fixed top-4 right-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg z-50">
          {success}
        </div>
      )}
      {error && (
        <div className="fixed top-4 right-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg z-50">
          {error}
        </div>
      )}
    </div>
  );
}
