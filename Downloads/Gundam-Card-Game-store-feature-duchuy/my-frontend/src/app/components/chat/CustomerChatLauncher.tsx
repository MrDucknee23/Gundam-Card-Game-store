import { MessageCircleMore } from 'lucide-react';
import { useLocation } from 'react-router';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';

export const CustomerChatLauncher: React.FC = () => {
  const location = useLocation();
  const { totalUnreadCount, isChatWidgetOpen, openChatWidget } = useChat();
  const { isAdmin } = useAuth();

  if (isAdmin || location.pathname.startsWith('/admin') || location.pathname === '/support-chat' || isChatWidgetOpen) {
    return null;
  }

  const canOpenChat = true;

  return (
    <button
      type="button"
      onClick={openChatWidget}
      className="fixed bottom-5 right-5 z-40 flex items-center gap-3 rounded-full bg-primary px-5 py-3 text-white shadow-[0_18px_45px_rgba(220,20,60,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-primary">
        <MessageCircleMore className="h-5 w-5" />
      </span>
      <span className="text-sm font-semibold">{canOpenChat ? 'Chat hỗ trợ' : 'Chat hỗ trợ nhanh'}</span>
      {totalUnreadCount > 0 && (
        <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-2 text-xs font-bold text-primary">
          {totalUnreadCount}
        </span>
      )}
    </button>
  );
};