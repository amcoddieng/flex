"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { decodeToken } from "@/lib/jwt";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  MessageCircle, 
  Send,
  Search,
  Building,
  Clock,
  CheckCircle,
  Circle,
  User,
  Paperclip,
  Smile,
  MoreVertical
} from "lucide-react";
import Link from "next/link";

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  created_at: string;
  is_read: boolean;
  sender_type: 'STUDENT' | 'EMPLOYER';
  receiver_type: 'STUDENT' | 'EMPLOYER';
  sender_name?: string;
}

interface Conversation {
  id: number;
  participant_id: number;
  participant_name: string;
  participant_company?: string;
  participant_type: 'STUDENT' | 'EMPLOYER';
  offer_id: number;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  is_active: boolean;
}

export default function StudentMessagesPage() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const router = useRouter();
  const hasCheckedAuth = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
    fetchConversations();
  }, [router]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-refresh messages when conversation is selected
  useEffect(() => {
    if (!selectedConversation) return;
    
    // Clear any existing interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }
    
    // Set up new interval for refreshing messages
    refreshIntervalRef.current = setInterval(() => {
      fetchMessages(selectedConversation.id);
    }, 10000); // Refresh every 10 seconds
    
    // Cleanup on unmount or conversation change
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [selectedConversation?.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getValidToken();
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await fetch('/api/student/conversations', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!res.ok) {
        throw new Error('Erreur lors de la récupération des conversations');
      }

      const data = await res.json();
      if (data.success) {
        setConversations(data.data);
      } else {
        throw new Error(data.error || 'Réponse invalide');
      }
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('fetchConversations error:', message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = useCallback(async (conversationId: number) => {
    try {
      setMessagesLoading(true);
      const token = getValidToken();
      if (!token) return;

      const res = await fetch(`/api/student/conversations/${conversationId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!res.ok) {
        throw new Error('Erreur lors de la récupération des messages');
      }

      const data = await res.json();
      if (data.success) {
        setMessages(data.data);
        // Mark messages as read
        markMessagesAsRead(conversationId);
      } else {
        throw new Error(data.error || 'Réponse invalide');
      }
    } catch (err: any) {
      console.error('fetchMessages error:', err);
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  const markMessagesAsRead = async (conversationId: number) => {
    try {
      const token = getValidToken();
      if (!token) return;

      await fetch(`/api/student/conversations/${conversationId}/read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      // Update conversation unread count
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, unread_count: 0 }
            : conv
        )
      );
    } catch (err) {
      console.error('markMessagesAsRead error:', err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sendingMessage) return;

    setSendingMessage(true);
    try {
      const token = getValidToken();
      if (!token) return;

      const res = await fetch(`/api/student/conversations/${selectedConversation.id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newMessage.trim() }),
      });
      
      if (!res.ok) {
        throw new Error('Erreur lors de l\'envoi du message');
      }

      const data = await res.json();
      if (data.success) {
        setMessages(prev => [...prev, data.data]);
        setNewMessage("");
        
        // Update conversation last message
        setConversations(prev =>
          prev.map(conv =>
            conv.id === selectedConversation.id
              ? { ...conv, last_message: newMessage.trim(), last_message_at: new Date().toISOString() }
              : conv
          )
        );
      } else {
        throw new Error(data.error || 'Envoi échoué');
      }
    } catch (err: any) {
      console.error('sendMessage error:', err);
      alert(err.message || 'Erreur lors de l\'envoi du message');
    } finally {
      setSendingMessage(false);
    }
  };

  const selectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.id);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    
    return date.toLocaleDateString('fr-FR');
  };

  const filteredConversations = conversations.filter(conv =>
    conv.participant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (conv.participant_company && conv.participant_company.toLowerCase().includes(searchTerm.toLowerCase())) ||
    conv.last_message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAuthed) {
    return <div className="p-8">Vérification...</div>;
  }

  return (
    <div className="h-[calc(100vh-200px)] flex gap-4">
      {/* Conversations List */}
      <div className={`bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col ${
        selectedConversation ? 'hidden md:flex md:w-96' : 'w-full md:w-96'
      }`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une conversation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin"></div>
            </div>
          ) : filteredConversations.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => selectConversation(conversation)}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-semibold shrink-0">
                      {conversation.participant_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {conversation.participant_name}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {formatTime(conversation.last_message_at)}
                        </span>
                      </div>
                      {conversation.participant_company && (
                        <p className="text-xs text-gray-600 mb-1">{conversation.participant_company}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 truncate">{conversation.last_message}</p>
                        {conversation.unread_count > 0 && (
                          <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                            {conversation.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? "Aucune conversation trouvée" : "Aucun message"}
              </h3>
              <p className="text-sm text-gray-600">
                {searchTerm 
                  ? "Essayez de modifier votre recherche" 
                  : "Vos conversations avec les employeurs apparaîtront ici"
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col ${
        selectedConversation ? 'flex' : 'hidden md:flex'
      }`}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-semibold">
                  {selectedConversation.participant_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedConversation.participant_name}</h3>
                  {selectedConversation.participant_company && (
                    <p className="text-xs text-gray-600">{selectedConversation.participant_company}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedConversation(null)}
                  className="md:hidden"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </Button>
                <Button variant="ghost" size="sm" className="hidden md:flex">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messagesLoading && messages.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex mb-4 ${message.sender_type === 'STUDENT' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.sender_type === 'EMPLOYER' && (
                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white font-semibold text-xs mr-2 flex-shrink-0">
                          {message.sender_name?.charAt(0).toUpperCase() || 'E'}
                        </div>
                      )}
                      <div
                        className={`max-w-[70%] px-4 py-3 rounded-2xl shadow-sm ${
                          message.sender_type === 'STUDENT'
                            ? 'bg-white-900 text-black shadow-lg rounded-br-none'
                            : 'bg-white text-gray-900 border border-gray-200 shadow-md rounded-bl-none'
                        }`}
                      >
                        {message.sender_type === 'EMPLOYER' && (
                          <div className="text-xs font-semibold text-purple-600 mb-1">
                            {message.sender_name || 'Employeur'}
                          </div>
                        )}
                        <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                          {message.content}
                        </p>
                        <div className={`flex items-center justify-between mt-2 text-xs ${
                          message.sender_type === 'STUDENT' ? 'text-blue-100' : 'text-gray-400'
                        }`}>
                          <span>{formatTime(message.created_at)}</span>
                          {message.sender_type === 'STUDENT' && (
                            <div className="flex items-center gap-1">
                              {message.is_read ? (
                                <>
                                  <span className="text-xs">Lu</span>
                                  <CheckCircle className="h-3 w-3" />
                                </>
                              ) : (
                                <>
                                  <span className="text-xs">Envoyé</span>
                                  <Circle className="h-3 w-3" />
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      {message.sender_type === 'STUDENT' && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-700 to-gray-800 flex items-center justify-center text-white font-semibold text-xs ml-2 flex-shrink-0">
                          <span>MOI</span>
                        </div>
                      )}
                    </div>
                  ))}
                  {messagesLoading && (
                    <div className="flex justify-start mb-4">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center text-white font-semibold text-xs mr-2 flex-shrink-0">
                        E
                      </div>
                      <div className="bg-white text-slate-900 border border-slate-200 shadow-md px-4 py-3 rounded-2xl rounded-bl-none">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-100">
              <div className="flex items-end gap-3">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Tapez votre message..."
                  className="flex-1 resize-none border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-700/20 focus:border-gray-700"
                  rows={1}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sendingMessage}
                  className="bg-gradient-to-r from-gray-900 to-gray-900 hover:from-green-500 hover:to-gray-800"
                >
                  {sendingMessage ? (
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
              <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Sélectionnez une conversation</h3>
              <p className="text-slate-600">Choisissez une conversation pour commencer à discuter</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
