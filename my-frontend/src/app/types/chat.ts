export interface ChatConversation {
  id: string;
  customerUser: string | null;
  customerProfile: {
    name?: string | null;
    email?: string | null;
  } | null;
  anonSessionId: string;
  customerGuest: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
  adminParticipants: string[];
  orderId: string | null;
  channel: 'website';
  status: 'open' | 'closed';
  subject: string;
  lastMessage: {
    text: string;
    senderRole: 'admin' | 'customer';
    sentAt: string;
  } | null;
  unreadAdminCount: number;
  unreadCustomerCount: number;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: {
    role: 'admin' | 'customer';
    userId: string | null;
    name: string;
    email: string;
  };
  text: string;
  sentAt: string;
  readByAdminAt: string | null;
  readByCustomerAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatConversationMessagesResponse {
  conversation: ChatConversation;
  messages: ChatMessage[];
  serverTime: string;
}