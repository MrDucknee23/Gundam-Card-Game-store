import { buildApiUrl } from './api';
import { buildGuestOrderHeaders, getStoredGuestOrderAccess } from './guestOrderAccess';
import type { ChatConversation, ChatConversationMessagesResponse, ChatMessage } from '../types/chat';

const CHAT_API_URL = buildApiUrl('/chat');
const AUTH_TOKEN_STORAGE_KEY = 'authToken';

// In-memory only — never written to localStorage/sessionStorage.
// Every full page load (F5 / new tab) re-executes this module → _anonSessionId
// resets to null → backend creates a fresh conversation → chat box is empty.
// SPA navigation within the same tab reuses the module instance so messages
// remain visible while browsing without a full reload.
let _anonSessionId: string | null = null;

const createAnonSessionId = () => {
  const randomPart = Math.random().toString(36).slice(2, 12);
  return `anon_${Date.now().toString(36)}_${randomPart}`;
};

export const getOrCreateAnonSessionId = () => {
  if (!_anonSessionId) {
    _anonSessionId = createAnonSessionId();
  }
  return _anonSessionId;
};

export const clearAnonChatSession = () => {
  _anonSessionId = null;
};

const buildChatHeaders = (includeJsonContentType = false) => {
  const authToken = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)?.trim() || '';
  const headers: Record<string, string> = includeJsonContentType ? { 'Content-Type': 'application/json' } : {};

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
    return headers;
  }

  headers['X-Anon-Session-Id'] = getOrCreateAnonSessionId();

  const guestAccess = getStoredGuestOrderAccess();
  return buildGuestOrderHeaders({
    ...headers,
    ...(guestAccess.name ? { 'X-Guest-Name': guestAccess.name } : {}),
  });
};

const requestJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, init);
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || 'Không thể tải dữ liệu chat');
  }

  return response.json() as Promise<T>;
};

export const fetchChatConversations = () => requestJson<ChatConversation[]>(`${CHAT_API_URL}/conversations`, {
  headers: buildChatHeaders(),
  cache: 'no-store',
});

export const ensureChatConversation = (payload: { subject?: string; orderId?: string; customerName?: string } = {}) => requestJson<ChatConversation>(`${CHAT_API_URL}/conversations/ensure`, {
  method: 'POST',
  headers: buildChatHeaders(true),
  body: JSON.stringify(payload),
});

export const fetchConversationMessages = (conversationId: string) => requestJson<ChatConversationMessagesResponse>(`${CHAT_API_URL}/conversations/${conversationId}/messages`, {
  headers: buildChatHeaders(),
  cache: 'no-store',
});

export const sendConversationMessage = (conversationId: string, text: string) => requestJson<{ conversation: ChatConversation; message: ChatMessage; serverTime: string }>(`${CHAT_API_URL}/conversations/${conversationId}/messages`, {
  method: 'POST',
  headers: buildChatHeaders(true),
  body: JSON.stringify({ text }),
});

export const markConversationRead = (conversationId: string) => requestJson<{ conversation: ChatConversation; serverTime: string }>(`${CHAT_API_URL}/conversations/${conversationId}/read`, {
  method: 'POST',
  headers: buildChatHeaders(true),
  body: JSON.stringify({}),
});

export const getChatSocketAuth = () => {
  const authToken = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)?.trim() || '';
  if (authToken) {
    return { token: authToken };
  }

  const guestAccess = getStoredGuestOrderAccess();
  if (!guestAccess.accessToken) {
    return {
      anonSessionId: getOrCreateAnonSessionId(),
      guestName: guestAccess.name,
    };
  }

  return {
    guestAccessToken: guestAccess.accessToken,
    guestName: guestAccess.name,
  };
};

export const getChatSocketBaseUrl = () => {
  const configuredBaseUrl = import.meta.env.VITE_API_URL?.trim();
  const configuredProxyTarget = import.meta.env.VITE_API_PROXY_TARGET?.trim();

  if (configuredProxyTarget) {
    return configuredProxyTarget.replace(/\/$/, '');
  }

  if (configuredBaseUrl && !configuredBaseUrl.startsWith('/')) {
    return configuredBaseUrl.replace(/\/api\/?$/, '');
  }

  const isLocalHost = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
  if (isLocalHost) {
    return 'http://localhost:5000';
  }

  return window.location.origin;
};