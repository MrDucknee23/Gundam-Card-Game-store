import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import type { ChatConversation, ChatMessage } from '../types/chat';
import {
  clearAnonChatSession,
  ensureChatConversation,
  fetchChatConversations,
  fetchConversationMessages,
  getChatSocketAuth,
  getChatSocketBaseUrl,
  markConversationRead,
  sendConversationMessage,
} from '../utils/chatApi';

type ChatContextType = {
  conversations: ChatConversation[];
  activeConversationId: string | null;
  activeConversation: ChatConversation | null;
  activeMessages: ChatMessage[];
  isChatWidgetOpen: boolean;
  isConnected: boolean;
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  totalUnreadCount: number;
  openChatWidget: () => void;
  closeChatWidget: () => void;
  toggleChatWidget: () => void;
  setActiveConversationId: (conversationId: string | null) => void;
  refreshConversations: () => Promise<void>;
  ensureConversation: (payload?: { subject?: string; orderId?: string; customerName?: string }) => Promise<ChatConversation>;
  loadConversationMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, text: string) => Promise<void>;
  markRead: (conversationId: string) => Promise<void>;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const upsertConversation = (items: ChatConversation[], nextConversation: ChatConversation) => {
  const existing = items.find((item) => item.id === nextConversation.id);
  const nextItems = existing
    ? items.map((item) => item.id === nextConversation.id ? nextConversation : item)
    : [nextConversation, ...items];

  return [...nextItems].sort((a, b) => new Date(b.lastMessageAt || b.updatedAt).getTime() - new Date(a.lastMessageAt || a.updatedAt).getTime());
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messagesByConversation, setMessagesByConversation] = useState<Record<string, ChatMessage[]>>({});
  const [isChatWidgetOpen, setIsChatWidgetOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const prevIsAuthenticatedRef = useRef(isAuthenticated);

  const openChatWidget = useCallback(() => {
    setIsChatWidgetOpen(true);
  }, []);

  const closeChatWidget = useCallback(() => {
    setIsChatWidgetOpen(false);
  }, []);

  const toggleChatWidget = useCallback(() => {
    setIsChatWidgetOpen((current) => !current);
  }, []);

  const refreshConversations = useCallback(async () => {
    setIsLoadingConversations(true);
    try {
      const nextConversations = await fetchChatConversations();
      setConversations(nextConversations);
      setActiveConversationId((current) => current && nextConversations.some((conversation) => conversation.id === current)
        ? current
        : null);
    } finally {
      setIsLoadingConversations(false);
    }
  }, []);

  const ensureConversation = useCallback(async (payload: { subject?: string; orderId?: string; customerName?: string } = {}) => {
    const conversation = await ensureChatConversation(payload);
    setConversations((current) => upsertConversation(current, conversation));
    setActiveConversationId(conversation.id);
    return conversation;
  }, []);

  const loadConversationMessages = useCallback(async (conversationId: string) => {
    setIsLoadingMessages(true);
    try {
      const payload = await fetchConversationMessages(conversationId);
      setConversations((current) => upsertConversation(current, payload.conversation));
      setMessagesByConversation((current) => ({ ...current, [conversationId]: payload.messages }));
      socketRef.current?.emit('chat:join-conversation', conversationId);
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  const sendMessage = useCallback(async (conversationId: string, text: string) => {
    const payload = await sendConversationMessage(conversationId, text);
    setConversations((current) => upsertConversation(current, payload.conversation));
    setMessagesByConversation((current) => {
      const existing = current[conversationId] || [];
      // The socket may have already delivered this message before the REST response resolved
      if (existing.some((m) => m.id === payload.message.id)) return current;
      return { ...current, [conversationId]: [...existing, payload.message] };
    });
  }, []);

  const markRead = useCallback(async (conversationId: string) => {
    const payload = await markConversationRead(conversationId);
    setConversations((current) => upsertConversation(current, payload.conversation));
    socketRef.current?.emit('chat:read', { conversationId });
  }, []);

  // Clear chat state when user logs out so the next session starts fresh
  useEffect(() => {
    const wasAuthenticated = prevIsAuthenticatedRef.current;
    prevIsAuthenticatedRef.current = isAuthenticated;

    if (wasAuthenticated && !isAuthenticated) {
      setConversations([]);
      setActiveConversationId(null);
      setMessagesByConversation({});
      setIsChatWidgetOpen(false);
      clearAnonChatSession();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const socketAuth = getChatSocketAuth();
    const socket = io(getChatSocketBaseUrl(), {
      path: '/socket.io',
      // polling trước để Render proxy hoàn thành handshake, rồi tự upgrade lên websocket
      transports: ['polling', 'websocket'],
      auth: socketAuth,
    });

    socketRef.current = socket;

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('chat:message', ({ conversation, message }) => {
      setConversations((current) => upsertConversation(current, conversation));
      setMessagesByConversation((current) => {
        const existing = current[message.conversationId] || [];
        // Deduplicate: message may already be in state from the optimistic sendMessage call
        if (existing.some((m) => m.id === message.id)) return current;
        return { ...current, [message.conversationId]: [...existing, message] };
      });
    });
    socket.on('chat:conversation-updated', ({ conversation }) => {
      setConversations((current) => upsertConversation(current, conversation));
    });

    void refreshConversations();

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, refreshConversations]);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId) || null,
    [conversations, activeConversationId]
  );

  const activeMessages = useMemo(
    () => (activeConversationId ? messagesByConversation[activeConversationId] || [] : []),
    [messagesByConversation, activeConversationId]
  );

  const totalUnreadCount = useMemo(
    () => conversations.reduce((sum, conversation) => sum + (isAdmin ? conversation.unreadAdminCount : conversation.unreadCustomerCount), 0),
    [conversations, isAdmin]
  );

  const value = useMemo(() => ({
    conversations,
    activeConversationId,
    activeConversation,
    activeMessages,
    isChatWidgetOpen,
    isConnected,
    isLoadingConversations,
    isLoadingMessages,
    totalUnreadCount,
    openChatWidget,
    closeChatWidget,
    toggleChatWidget,
    setActiveConversationId,
    refreshConversations,
    ensureConversation,
    loadConversationMessages,
    sendMessage,
    markRead,
  }), [
    conversations,
    activeConversationId,
    activeConversation,
    activeMessages,
    isChatWidgetOpen,
    isConnected,
    isLoadingConversations,
    isLoadingMessages,
    totalUnreadCount,
    openChatWidget,
    closeChatWidget,
    toggleChatWidget,
    refreshConversations,
    ensureConversation,
    loadConversationMessages,
    sendMessage,
    markRead,
  ]);

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }

  return context;
};