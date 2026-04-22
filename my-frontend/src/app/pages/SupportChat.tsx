import { useEffect, useRef, useState } from 'react';
import { MessageCircleMore, SendHorizontal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { getStoredGuestOrderAccess } from '../utils/guestOrderAccess';
import { toast } from 'sonner';

const formatChatTime = (value: string) => new Date(value).toLocaleString('vi-VN', {
  hour: '2-digit',
  minute: '2-digit',
  day: '2-digit',
  month: '2-digit',
});

export const SupportChat: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const guestAccess = getStoredGuestOrderAccess();
  const {
    activeConversationId,
    activeMessages,
    ensureConversation,
    isConnected,
    isLoadingMessages,
    loadConversationMessages,
    markRead,
    sendMessage,
  } = useChat();
  const [draft, setDraft] = useState('');
  const lastLoadedConversationIdRef = useRef<string | null>(null);

  useEffect(() => {
    const bootstrapConversation = async () => {
      if (!activeConversationId) {
        const conversation = await ensureConversation({
          subject: 'Hỗ trợ khách hàng từ website',
          customerName: user?.fullName || guestAccess.name,
        });
        await loadConversationMessages(conversation.id);
        await markRead(conversation.id);
        return;
      }

      if (lastLoadedConversationIdRef.current !== activeConversationId) {
        lastLoadedConversationIdRef.current = activeConversationId;
        await loadConversationMessages(activeConversationId);
      }
      await markRead(activeConversationId);
    };

    void bootstrapConversation();
  }, [activeConversationId, ensureConversation, guestAccess.name, loadConversationMessages, markRead, user?.fullName]);

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
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto flex max-w-5xl flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_18px_44px_rgba(15,23,42,0.08)] lg:min-h-[76vh] lg:flex-row">
        <aside className="border-b border-slate-100 bg-[radial-gradient(circle_at_top_left,#ffe1e8,transparent_45%),linear-gradient(180deg,#fff,#fff7f8)] p-8 lg:w-[22rem] lg:border-b-0 lg:border-r">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">Live Support</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">Nhắn tin với Admin</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">Cuộc trò chuyện này dùng thời gian thật từ server và đồng bộ hai chiều với inbox Admin.</p>
          <div className="mt-8 rounded-[24px] border border-slate-200 bg-white p-5">
            <p className="text-sm font-semibold text-slate-900">Trạng thái kết nối</p>
            <p className={`mt-2 text-sm ${isConnected ? 'text-emerald-600' : 'text-amber-600'}`}>{isConnected ? 'Đang kết nối realtime' : 'Đang chờ kết nối realtime'}</p>
            <p className="mt-4 text-xs text-slate-500">Người dùng: {user?.fullName || guestAccess.name || guestAccess.email}</p>
          </div>
        </aside>

        <section className="flex flex-1 flex-col bg-[linear-gradient(180deg,#ffffff_0%,#fafbff_100%)]">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="text-lg font-semibold text-slate-900">Hộp thư hỗ trợ khách hàng</h2>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
            {isLoadingMessages && activeMessages.length === 0 ? (
              <p className="text-sm text-slate-500">Đang tải tin nhắn...</p>
            ) : activeMessages.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-slate-200 bg-white p-8 text-sm text-slate-500">Hãy gửi tin nhắn đầu tiên để bắt đầu cuộc trò chuyện.</div>
            ) : (
              activeMessages.map((message) => {
                const isOwnMessage = message.sender.role === 'customer';
                return (
                  <div key={message.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-[24px] px-4 py-3 shadow-sm ${isOwnMessage ? 'bg-primary text-white' : 'bg-white text-slate-900 border border-slate-200'}`}>
                      <p className="text-sm leading-6">{message.text}</p>
                      <p className={`mt-2 text-[11px] ${isOwnMessage ? 'text-white/75' : 'text-slate-400'}`}>{formatChatTime(message.sentAt)}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="border-t border-slate-100 px-6 py-5">
            <div className="flex items-end gap-3 rounded-[26px] border border-slate-200 bg-white p-3 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Nhập nội dung cần hỗ trợ..."
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
  );
};