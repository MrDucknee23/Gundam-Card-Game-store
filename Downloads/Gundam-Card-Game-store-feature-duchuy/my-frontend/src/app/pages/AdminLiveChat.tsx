import { useEffect, useRef, useState } from 'react';
import { MessageCircleMore, SendHorizontal } from 'lucide-react';
import { Breadcrumb } from '../components/Breadcrumb';
import { useChat } from '../context/ChatContext';
import { toast } from 'sonner';

const formatChatTime = (value: string | null) => value
  ? new Date(value).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
  : '';

const getConversationCustomerName = (conversation?: {
  customerProfile?: { name?: string | null; email?: string | null } | null;
  customerGuest?: { name?: string | null; email?: string | null } | null;
}) => {
  const accountName = conversation?.customerProfile?.name?.trim();
  if (accountName) {
    return accountName;
  }

  const accountEmail = conversation?.customerProfile?.email?.trim();
  if (accountEmail) {
    return accountEmail;
  }

  const guestName = conversation?.customerGuest?.name?.trim();
  if (guestName) {
    if (guestName.toLowerCase() === 'khach vang lai') {
      return 'Khách guest';
    }
    return guestName;
  }

  const guestEmail = conversation?.customerGuest?.email?.trim();
  if (guestEmail) {
    return guestEmail;
  }

  return 'Khách guest';
};

export const AdminLiveChat: React.FC = () => {
  const {
    conversations,
    activeConversationId,
    activeConversation,
    activeMessages,
    isConnected,
    isLoadingConversations,
    loadConversationMessages,
    markRead,
    refreshConversations,
    sendMessage,
    setActiveConversationId,
  } = useChat();
  const [draft, setDraft] = useState('');
  const lastLoadedConversationIdRef = useRef<string | null>(null);

  useEffect(() => {
    void refreshConversations();
  }, [refreshConversations]);

  useEffect(() => {
    const openConversation = async () => {
      if (activeConversationId) {
        if (lastLoadedConversationIdRef.current !== activeConversationId) {
          lastLoadedConversationIdRef.current = activeConversationId;
          await loadConversationMessages(activeConversationId);
        }
        await markRead(activeConversationId);
      }
    };

    void openConversation();
  }, [activeConversationId, loadConversationMessages, markRead]);

  const handleSend = async () => {
    if (!activeConversationId || !draft.trim()) {
      return;
    }

    try {
      await sendMessage(activeConversationId, draft.trim());
      setDraft('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể gửi tin nhắn');
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f8fb_0%,#eef2f8_100%)] p-6">
      <div className="mx-auto max-w-[1600px]">
        <Breadcrumb items={[{ label: 'Admin', href: '/admin' }, { label: 'Live Chat' }]} />
        <div className="mb-6 mt-4 flex items-center justify-between rounded-[30px] border border-white/70 bg-white/85 px-7 py-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">Support Center</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Live Chat</h1>
            <p className="mt-2 text-sm text-slate-500">Tin nhắn đồng bộ hai chiều với khách hàng qua REST + Socket.IO.</p>
          </div>
          <div className={`rounded-full px-4 py-2 text-sm font-semibold ${isConnected ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
            {isConnected ? 'Realtime online' : 'Realtime reconnecting'}
          </div>
        </div>

        <div className="grid min-h-[76vh] grid-cols-1 gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <section className="overflow-hidden rounded-[30px] border border-white/70 bg-white/90 shadow-[0_24px_70px_rgba(15,23,42,0.07)] backdrop-blur-xl">
            <div className="border-b border-slate-100 px-5 py-4">
              <p className="text-sm font-semibold text-slate-900">Cuộc trò chuyện</p>
            </div>
            <div className="max-h-[72vh] overflow-y-auto p-3">
              {isLoadingConversations && conversations.length === 0 ? (
                <p className="p-4 text-sm text-slate-500">Đang tải danh sách chat...</p>
              ) : conversations.length === 0 ? (
                <div className="m-3 rounded-[24px] border border-dashed border-slate-200 p-6 text-sm text-slate-500">Chưa có cuộc trò chuyện nào.</div>
              ) : conversations.map((conversation) => {
                const isActive = conversation.id === activeConversationId;
                const customerName = getConversationCustomerName(conversation);
                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => setActiveConversationId(conversation.id)}
                    className={`mb-3 w-full rounded-[24px] border px-4 py-4 text-left transition-all ${isActive ? 'border-primary/30 bg-rose-50 shadow-[0_14px_30px_rgba(220,20,60,0.12)]' : 'border-transparent bg-slate-50 hover:border-slate-200 hover:bg-white'}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{customerName}</p>
                        <p className="mt-1 line-clamp-2 text-xs text-slate-500">{conversation.lastMessage?.text || 'Chưa có tin nhắn'}</p>
                      </div>
                      {conversation.unreadAdminCount > 0 && (
                        <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-2 text-xs font-bold text-white">
                          {conversation.unreadAdminCount}
                        </span>
                      )}
                    </div>
                    <p className="mt-3 text-[11px] text-slate-400">{formatChatTime(conversation.lastMessageAt)}</p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="flex min-h-[76vh] flex-col overflow-hidden rounded-[30px] border border-white/70 bg-white/95 shadow-[0_24px_70px_rgba(15,23,42,0.07)] backdrop-blur-xl">
            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-50 text-primary">
                  <MessageCircleMore className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-base font-semibold text-slate-900">{activeConversation ? getConversationCustomerName(activeConversation) : 'Chọn cuộc trò chuyện'}</p>
                  <p className="text-xs text-slate-500">{activeConversation?.subject || 'Hỗ trợ từ website'}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto bg-[linear-gradient(180deg,#fcfcfe_0%,#f6f8fb_100%)] px-6 py-6">
              {activeConversation ? activeMessages.map((message) => {
                const isAdminMessage = message.sender.role === 'admin';
                return (
                  <div key={message.id} className={`flex ${isAdminMessage ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[78%] rounded-[24px] px-4 py-3 ${isAdminMessage ? 'bg-slate-900 text-white shadow-[0_14px_30px_rgba(15,23,42,0.18)]' : 'border border-slate-200 bg-white text-slate-900 shadow-sm'}`}>
                      <p className="text-sm leading-6">{message.text}</p>
                      <p className={`mt-2 text-[11px] ${isAdminMessage ? 'text-slate-300' : 'text-slate-400'}`}>{formatChatTime(message.sentAt)}</p>
                    </div>
                  </div>
                );
              }) : (
                <div className="rounded-[24px] border border-dashed border-slate-200 bg-white p-8 text-sm text-slate-500">Chọn một cuộc trò chuyện để bắt đầu trả lời khách hàng.</div>
              )}
            </div>

            <div className="border-t border-slate-100 px-6 py-5">
              <div className="flex items-end gap-3 rounded-[26px] border border-slate-200 bg-white p-3 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Trả lời khách hàng..."
                  className="min-h-[64px] flex-1 resize-none border-0 bg-transparent px-2 py-1 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!draft.trim() || !activeConversationId}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-slate-200"
                >
                  <SendHorizontal className="h-5 w-5" />
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};