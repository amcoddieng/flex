"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { decodeToken } from "@/lib/jwt";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmployerProtection } from "@/components/employer-protection";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { 
  MessageCircle, 
  Search, 
  Send, 
  Clock, 
  Check, 
  CheckCheck, 
  X, 
  Briefcase 
} from "lucide-react";
import Link from "next/link";

type Conversation = {
  id: number;
  offer_id: number;
  offer_title: string;
  first_name: string;
  last_name: string;
  student_email: string;
  unread_count: number;
  last_message: string;
  last_message_time: string;
  created_at: string;
};

type Message = {
  id: number;
  sender_type: 'student' | 'employer';
  sender_id: number;
  sender_name: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export default function EmployerMessagesPage() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasCheckedAuth = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Importer le hook depuis le layout parent via contexte ou le recréer ici
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const { unreadCount: messageUnreadCount, refreshUnreadCount } = useUnreadMessages(token);

  const getValidToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('token');
    if (!token) return null;
    const decoded = decodeToken(token);
    if (!decoded || decoded.role !== 'EMPLOYER') {
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
    if (!selectedConversation) return;
    
    // Rafraîchir les messages toutes les 10 secondes
    const interval = setInterval(() => {
      fetchMessages(selectedConversation.id);
    }, 10000);

    return () => clearInterval(interval);
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Effet pour gérer l'ouverture automatique depuis l'URL - version simplifiée
  useEffect(() => {
    const conversationId = searchParams.get('conversation');
    if (!conversationId || selectedConversation) return;
    
    const targetId = parseInt(conversationId);
    
    // Valider que l'ID est un nombre valide
    if (isNaN(targetId)) {
      console.log('❌ ID de conversation invalide:', conversationId);
      router.replace('/employer/messages');
      return;
    }
    
    console.log('🔍 Recherche conversation ID:', targetId);
    console.log('📋 Conversations disponibles:', conversations.map(c => c.id));
    
    // Chercher directement dans les conversations actuelles
    const conversation = conversations.find(conv => conv.id === targetId);
    
    if (conversation) {
      console.log('✅ Conversation trouvée, ouverture...');
      selectConversation(conversation);
      router.replace('/employer/messages');
    } else if (conversations.length > 0) {
      // Si on a des conversations mais pas la bonne, attendre un peu et réessayer une fois
      console.log('❌ Conversation pas encore disponible, attente...');
      const timeoutId = setTimeout(() => {
        // Recharger les conversations une seule fois
        fetchConversations().then(() => {
          // Après rechargement, chercher à nouveau
          const refreshedConversation = conversations.find(conv => conv.id === targetId);
          if (refreshedConversation) {
            console.log('✅ Conversation trouvée après rechargement');
            selectConversation(refreshedConversation);
            router.replace('/employer/messages');
          } else {
            console.log('❌ Conversation toujours pas trouvée, abandon');
            router.replace('/employer/messages');
          }
        });
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [searchParams.get('conversation'), selectedConversation, conversations.length]);

  // Helper pour formater la date
  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (messageDate.getTime() === today.getTime()) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (messageDate.getTime() === today.getTime() - 86400000) {
      return 'Hier';
    } else {
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }
  };

  // Grouper les messages par date
  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [date: string]: Message[] } = {};
    
    messages.forEach(message => {
      const date = new Date(message.created_at);
      const dateKey = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toDateString();
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });
    
    return groups;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

      const res = await fetch("/api/employer/conversations", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Erreur lors de la récupération des conversations");

      const data = await res.json();
      setConversations(data.data || []);
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: number) => {
    setMessagesLoading(true);
    try {
      const token = getValidToken();
      if (!token) return;

      const res = await fetch(`/api/employer/conversations/${conversationId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Erreur lors de la récupération des messages");

      const data = await res.json();
      setMessages(data.data || []);
    } catch (err: any) {
      console.error('Error fetching messages:', err);
    } finally {
      setMessagesLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setSending(true);
    try {
      const token = getValidToken();
      if (!token) return;

      const res = await fetch(`/api/employer/conversations/${selectedConversation.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message: newMessage.trim() }),
      });

      if (!res.ok) throw new Error("Erreur lors de l'envoi du message");

      const data = await res.json();
      setMessages(prev => [...prev, data.data]);
      setNewMessage("");
      
      // Mettre à jour la dernière conversation dans la liste
      setConversations(prev => prev.map(conv => 
        conv.id === selectedConversation.id 
          ? { ...conv, last_message: data.data.message, last_message_time: data.data.created_at }
          : conv
      ));
    } catch (err: any) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  const selectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.id);
    refreshUnreadCount();
    // Marquer comme lu (mettre à jour le compteur non lu)
    setConversations(prev => prev.map(conv => 
      conv.id === conversation.id ? { ...conv, unread_count: 0 } : conv
    ));
  };

  const filteredConversations = conversations.filter(conv =>
    conv.offer_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `${conv.first_name} ${conv.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.student_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnreadCount = conversations.reduce((acc, conv) => acc + conv.unread_count, 0);

  if (!isAuthed) return <div className="p-8">Vérification...</div>;

  return (
    <EmployerProtection>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <div className="flex-1 flex">
          {/* Sidebar - Conversations */}
          <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 bg-white sticky top-0 z-10">
            <div className="flex items-center gap-3 mb-4">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-slate-900">Messages</h2>
              {totalUnreadCount > 0 && (
                <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                  {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                </span>
              )}
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Rechercher une conversation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm text-slate-600 mt-2">Chargement...</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center">
              <MessageCircle className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">
                {searchQuery ? 'Aucune conversation trouvée' : 'Aucune conversation'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => selectConversation(conversation)}
                  className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors ${
                    selectedConversation?.id === conversation.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                      {conversation.first_name.charAt(0).toUpperCase()}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-slate-900 truncate">
                          {conversation.first_name} {conversation.last_name}
                        </h3>
                        <span className="text-xs text-slate-500">
                          {new Date(conversation.last_message_time || conversation.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1 mb-2">
                        <Briefcase className="h-3 w-3 text-slate-400" />
                        <p className="text-xs text-slate-600 truncate">{conversation.offer_title}</p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-600 truncate">
                          {conversation.last_message || 'Nouvelle conversation'}
                        </p>
                        {conversation.unread_count > 0 && (
                          <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                            {conversation.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header - Fixed */}
            <div className="bg-white border-b border-slate-200 p-4 sticky top-0 z-10 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                    {selectedConversation.first_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {selectedConversation.first_name} {selectedConversation.last_name}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-slate-600">
                      <Briefcase className="h-3 w-3" />
                      {selectedConversation.offer_title}
                    </div>
                  </div>
                </div>
                
                <Button variant="outline" size="sm" onClick={() => setSelectedConversation(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
              {messagesLoading ? (
                <div className="text-center py-8">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-sm text-slate-600 mt-2">Chargement des messages...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(groupMessagesByDate(messages)).map(([dateKey, dayMessages], dateIndex) => (
                    <div key={dateKey}>
                      {/* Séparateur de date */}
                      {dateIndex > 0 && (
                        <div className="flex items-center justify-center my-4">
                          <div className="bg-slate-200 h-px flex-1"></div>
                          <span className="px-3 text-xs text-slate-500 bg-slate-50">
                            {new Date(dateKey).toLocaleDateString('fr-FR', { 
                              weekday: 'long', 
                              day: 'numeric', 
                              month: 'long' 
                            })}
                          </span>
                          <div className="bg-slate-200 h-px flex-1"></div>
                        </div>
                      )}
                      
                      {/* Messages du jour */}
                      <div className="space-y-3">
                        {dayMessages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.sender_type === 'employer' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                message.sender_type === 'employer'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white text-slate-900 border border-slate-200'
                              }`}
                            >
                              <p className="text-sm">{message.message}</p>
                              <div className={`flex items-center gap-1 mt-1 text-xs ${
                                message.sender_type === 'employer' ? 'text-blue-100' : 'text-slate-500'
                              }`}>
                                <Clock className="h-3 w-3" />
                                {formatMessageDate(message.created_at)}
                                {message.sender_type === 'employer' && (
                                  message.is_read ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input - Fixed */}
            <div className="bg-white border-t border-slate-200 p-4 sticky bottom-0 z-10 shadow-lg">
              <div className="flex gap-2">
                <Input
                  placeholder="Tapez votre message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  className="flex-1"
                  disabled={sending}
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={sending || !newMessage.trim()}
                  className="gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  {sending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
          ) : (
            /* Empty State */
            <div className="flex-1 flex items-center justify-center bg-slate-50">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Sélectionnez une conversation
                </h3>
                <p className="text-slate-600">
                  Choisissez une conversation dans la liste pour commencer à discuter
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </EmployerProtection>
  );
}
