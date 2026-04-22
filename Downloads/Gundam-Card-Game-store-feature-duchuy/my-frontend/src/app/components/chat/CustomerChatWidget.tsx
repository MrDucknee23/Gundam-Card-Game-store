import { useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircleMore, SendHorizontal, X } from 'lucide-react';
import { useLocation } from 'react-router';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { getStoredGuestOrderAccess } from '../../utils/guestOrderAccess';

const formatChatTime = (value: string) => new Date(value).toLocaleTimeString('vi-VN', {
  hour: '2-digit',
  minute: '2-digit',
});

export const CustomerChatWidget: React.FC = () => {
  const location = useLocation();
  const { user, isAdmin } = useAuth();
  const guestAccess = getStoredGuestOrderAccess();
  const {
    activeConversationId,
    activeMessages,
    isChatWidgetOpen,
    isConnected,
    isLoadingMessages,
    closeChatWidget,
    ensureConversation,
    loadConversationMessages,
    markRead,
    sendMessage,
  } = useChat();

  const [draft, setDraft] = useState('');
  const lastLoadedConversationIdRef = useRef<string | null>(null);
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isChatWidgetOpen) {
      return;
    }

    const bootstrapConversation = async () => {
      if (!activeConversationId) {
        const conversation = await ensureConversation({
          subject: 'Customer support from website',
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
  }, [
    activeConversationId,
    ensureConversation,
    guestAccess.name,
    isChatWidgetOpen,
    loadConversationMessages,
    markRead,
    user?.fullName,
  ]);

  useEffect(() => {
    if (!isChatWidgetOpen) {
      return;
    }

    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages, isChatWidgetOpen]);

  const handleSend = async () => {
    if (!activeConversationId || !draft.trim()) {
      return;
    }

    try {
      await sendMessage(activeConversationId, draft.trim());
      setDraft('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Khong the gui tin nhan');
    }
  };

  const customerDisplayName = useMemo(
    () => user?.fullName || guestAccess.name || guestAccess.email || 'Guest user',
    [guestAccess.email, guestAccess.name, user?.fullName]
  );

  if (!isChatWidgetOpen || isAdmin || location.pathname.startsWith('/admin') || location.pathname === '/support-chat') {
    return null;
  }

  return (
    <section className="fixed bottom-5 right-5 z-50 flex h-[520px] w-[360px] flex-col overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-[0_22px_50px_rgba(15,23,42,0.22)]">
      <header className="flex items-start justify-between bg-primary px-4 py-4 text-white">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
            <MessageCircleMore className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-semibold leading-none">Gundam Store Support</p>
            <div className="mt-2 flex items-center gap-1.5 text-sm text-rose-100">
              <span className={`h-2.5 w-2.5 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-amber-300'}`} />
              {isConnected ? 'Dang truc tuyen' : 'Dang ket noi'}
            </div>
          </div>
        </div>
        <button
          type="button"
          aria-label="Close chat"
          onClick={closeChatWidget}
          className="rounded-full p-1.5 text-white/90 transition-colors hover:bg-white/15 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto bg-slate-50 px-4 py-4">
        {isLoadingMessages && activeMessages.length === 0 ? (
          <p className="text-sm text-slate-500">Dang tai tin nhan...</p>
        ) : activeMessages.length === 0 ? (
          <article className="max-w-[92%] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700 shadow-sm">
            <p className="text-[17px] leading-7">Xin chao! Toi la nhan vien ho tro cua Gundam Store. Toi co the giup gi cho ban hom nay?</p>
          </article>
        ) : (
          activeMessages.map((message) => {
            const isOwnMessage = message.sender.role === 'customer';
            return (
              <div key={message.id} className={`mb-3 flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${isOwnMessage ? 'bg-primary text-white' : 'border border-slate-200 bg-white text-slate-800'}`}>
                  <p className="leading-6">{message.text}</p>
                  <p className={`mt-1.5 text-[11px] ${isOwnMessage ? 'text-white/80' : 'text-slate-400'}`}>{formatChatTime(message.sentAt)}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messageEndRef} />
      </div>

      <footer className="border-t border-slate-200 bg-white px-3 py-3">
        <p className="mb-2 text-[11px] text-slate-500">Nguoi dung: {customerDisplayName}</p>
        <div className="flex items-center gap-2">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                void handleSend();
              }
            }}
            placeholder="Nhap tin nhan..."
            className="h-10 flex-1 rounded-2xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-primary/40"
          />
          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={!draft.trim() || !activeConversationId}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-slate-500 transition-colors hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-75"
          >
            <SendHorizontal className="h-4 w-4" />
          </button>
        </div>
      </footer>
    </section>
  );
};
