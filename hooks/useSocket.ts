"use client";

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSocketOptions {
  token: string;
  autoConnect?: boolean;
}

interface MessageData {
  id: number;
  conversation_id: number;
  sender_type: string;
  sender_id: number;
  content: string;
  is_read: boolean;
  created_at: string;
  sender_name: string;
}

interface TypingData {
  userId: number;
  userType: string;
  conversationId: number;
}

export const useSocket = ({ token, autoConnect = true }: UseSocketOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState<MessageData | null>(null);
  const [messageNotification, setMessageNotification] = useState<{
    conversationId: number;
    message: MessageData;
  } | null>(null);
  const [messagesRead, setMessagesRead] = useState<{ conversationId: number } | null>(null);
  const [typingUsers, setTypingUsers] = useState<TypingData[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token || !autoConnect) return;

    // Initialize socket connection
    const socket = io({
      path: '/api/socket/io',
      addTrailingSlash: false,
      auth: {
        token
      }
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
      setError(null);
      
      // Join conversations when connected
      socket.emit('join_conversations');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setError(error.message);
      setIsConnected(false);
    });

    // Message events
    socket.on('new_message', (message: MessageData) => {
      console.log('🔔 WebSocket new_message received:', message);
      setNewMessage(message);
    });

    socket.on('message_notification', (data: { conversationId: number; message: MessageData }) => {
      console.log('Message notification:', data);
      setMessageNotification(data);
    });

    socket.on('messages_read', (data: { conversationId: number }) => {
      console.log('Messages read:', data);
      setMessagesRead(data);
    });

    // Typing events
    socket.on('user_typing', (data: TypingData) => {
      setTypingUsers(prev => {
        const filtered = prev.filter(u => u.userId !== data.userId);
        return [...filtered, data];
      });
    });

    socket.on('user_stopped_typing', (data: TypingData) => {
      setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
    });

    socket.on('error', (error: { message: string }) => {
      console.error('Socket error:', error);
      setError(error.message);
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };

  }, [token, autoConnect]);

  // Clear message states after they're handled
  const clearNewMessage = () => setNewMessage(null);
  const clearMessageNotification = () => setMessageNotification(null);
  const clearMessagesRead = () => setMessagesRead(null);

  // Send message function
  const sendMessage = (conversationId: number, content: string) => {
    console.log('🚀 useSocket sendMessage called:', { conversationId, content, isConnected });
    if (socketRef.current && isConnected) {
      console.log('📡 Emitting send_message to WebSocket');
      socketRef.current.emit('send_message', {
        conversationId,
        content
      });
    } else {
      console.log('❌ WebSocket not connected, cannot send message');
    }
  };

  // Mark messages as read
  const markAsRead = (conversationId: number) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('mark_as_read', { conversationId });
    }
  };

  // Typing indicators
  const startTyping = (conversationId: number) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('typing_start', { conversationId });
    }
  };

  const stopTyping = (conversationId: number) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('typing_stop', { conversationId });
    }
  };

  // Check if user is typing in a specific conversation
  const isUserTyping = (conversationId: number) => {
    return typingUsers.some(u => u.conversationId === conversationId);
  };

  return {
    isConnected,
    error,
    newMessage,
    messageNotification,
    messagesRead,
    typingUsers,
    isUserTyping,
    clearNewMessage,
    clearMessageNotification,
    clearMessagesRead,
    sendMessage,
    markAsRead,
    startTyping,
    stopTyping
  };
};
