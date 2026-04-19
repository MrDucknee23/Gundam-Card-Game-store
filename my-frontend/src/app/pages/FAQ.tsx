import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router';
import { 
  MessageCircle, 
  BookOpen, 
  Package, 
  ChevronDown,
  X,
  Send
} from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { toast } from 'sonner';
import { buildApiUrl } from '../utils/api';

// ===========================
// TYPES & INTERFACES
// ===========================
interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: 'product' | 'shipping' | 'payment' | 'warranty' | 'return';
}

type SupportCategoryId = 'live-chat' | 'guide' | 'tracking';

interface SupportCardData {
  id: number;
  supportId: SupportCategoryId;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  ctaText: string;
  href?: string;
  action?: 'chat' | 'scroll-faq';
}

interface Category {
  id: string;
  name: string;
}

// ===========================
// MOCK DATA - FAQ
// ===========================
const faqData: FAQItem[] = [
  // Sản phẩm
  {
    id: 1,
    question: 'Sản phẩm Gundam có phải hàng chính hãng không?',
    answer: 'Tất cả sản phẩm Gundam của chúng tôi đều là hàng chính hãng 100%, được nhập khẩu trực tiếp từ Bandai Nhật Bản và các nhà phân phối uy tín. Mỗi sản phẩm đều có tem chống hàng giả và được kiểm tra kỹ lưỡng trước khi giao đến tay khách hàng.',
    category: 'product'
  },
  {
    id: 2,
    question: 'Thẻ bài Trading Card có được bảo quản tốt không?',
    answer: 'Chúng tôi bảo quản tất cả thẻ bài trong môi trường có kiểm soát nhiệt độ và độ ẩm. Các thẻ hiếm và có giá trị cao được bảo vệ bằng sleeve và toploader chuyên dụng.',
    category: 'product'
  },
  {
    id: 3,
    question: 'Làm thế nào để phân biệt các Grade của Gundam?',
    answer: 'Gundam có nhiều grade khác nhau: HG (High Grade) - cơ bản, giá rẻ; RG (Real Grade) - chi tiết cao; MG (Master Grade) - 1/100 scale, khớp nối tốt; PG (Perfect Grade) - cao cấp nhất với kích thước lớn và chi tiết tối đa.',
    category: 'product'
  },
  {
    id: 4,
    question: 'Có chính sách bảo hành cho mô hình Gundam không?',
    answer: 'Chúng tôi cung cấp bảo hành 30 ngày cho tất cả mô hình Gundam về lỗi sản xuất như thiếu phụ kiện, bể vỡ do vận chuyển. Vui lòng kiểm tra sản phẩm ngay khi nhận và liên hệ trong vòng 48h nếu có vấn đề.',
    category: 'product'
  },
  
  // Vận chuyển
  {
    id: 5,
    question: 'Thời gian vận chuyển mất bao lâu?',
    answer: 'Nội thành TP.HCM: 1-2 ngày làm việc. Các tỉnh thành khác: 3-5 ngày làm việc. Vùng xa: 5-7 ngày làm việc. Chúng tôi sử dụng các đơn vị vận chuyển uy tín như Giao Hàng Nhanh, Viettel Post và J&T Express.',
    category: 'shipping'
  },
  {
    id: 6,
    question: 'Phí vận chuyển được tính như thế nào?',
    answer: 'Phí vận chuyển phụ thuộc vào trọng lượng và khoảng cách. Đơn hàng từ 1.000.000₫ trở lên được MIỄN PHÍ SHIP toàn quốc. Đơn hàng dưới 1 triệu: nội thành 30.000₫, ngoại thành 50.000₫.',
    category: 'shipping'
  },
  {
    id: 7,
    question: 'Tôi có thể thay đổi địa chỉ giao hàng sau khi đặt không?',
    answer: 'Có thể thay đổi địa chỉ giao hàng trong vòng 24h sau khi đặt hàng và trước khi đơn hàng được giao cho đơn vị vận chuyển. Vui lòng liên hệ ngay qua hotline hoặc email để chúng tôi cập nhật thông tin.',
    category: 'shipping'
  },
  {
    id: 8,
    question: 'Làm sao để theo dõi đơn hàng của tôi?',
    answer: 'Sau khi đơn hàng được giao cho đơn vị vận chuyển, bạn sẽ nhận được mã tracking qua email và SMS. Bạn có thể theo dõi trực tiếp trên website của đơn vị vận chuyển hoặc tại trang "Đơn hàng của tôi" trên website.',
    category: 'shipping'
  },
  
  // Thanh toán
  {
    id: 9,
    question: 'Những hình thức thanh toán nào được chấp nhận?',
    answer: 'Chúng tôi chấp nhận: Chuyển khoản ngân hàng, Ví điện tử (Momo, ZaloPay, VNPay), Thẻ tín dụng/ghi nợ (Visa, Mastercard), và COD (thanh toán khi nhận hàng).',
    category: 'payment'
  },
  {
    id: 10,
    question: 'Có thể thanh toán qua COD không?',
    answer: 'Có, chúng tôi hỗ trợ COD (Cash On Delivery) cho tất cả đơn hàng. Tuy nhiên, đơn hàng có giá trị trên 5.000.000₫ yêu cầu đặt cọc trước 30% để đảm bảo cam kết mua hàng.',
    category: 'payment'
  },
  {
    id: 11,
    question: 'Tôi có được hoá đơn VAT không?',
    answer: 'Có, chúng tôi xuất hoá đơn VAT đỏ theo yêu cầu. Vui lòng cung cấp đầy đủ thông tin công ty (tên, mã số thuế, địa chỉ) khi đặt hàng hoặc liên hệ trong vòng 7 ngày sau khi nhận hàng.',
    category: 'payment'
  },
  {
    id: 12,
    question: 'Thanh toán online có an toàn không?',
    answer: 'Tất cả giao dịch thanh toán online đều được mã hóa SSL 256-bit và xử lý qua cổng thanh toán bảo mật của các đối tác uy tín. Chúng tôi không lưu trữ thông tin thẻ của bạn.',
    category: 'payment'
  },
  
  // Bảo hành
  {
    id: 13,
    question: 'Sản phẩm có được bảo hành không?',
    answer: 'Sản phẩm Gundam được bảo hành 30 ngày về lỗi sản xuất (thiếu phụ kiện, bể vỡ do vận chuyển, khuôn lỗi). Thẻ bài không áp dụng bảo hành nhưng có chính sách đổi trả trong 7 ngày nếu có lỗi từ nhà sản xuất.',
    category: 'warranty'
  },
  {
    id: 14,
    question: 'Nếu sản phẩm bị thiếu phụ kiện thì xử lý thế nào?',
    answer: 'Vui lòng kiểm tra kỹ sản phẩm khi nhận hàng và quay video unboxing. Nếu phát hiện thiếu phụ kiện, liên hệ ngay trong 48h kèm video bóc hộp để được hỗ trợ gửi bổ sung hoàn toàn MIỄN PHÍ.',
    category: 'warranty'
  },
  {
    id: 15,
    question: 'Điều kiện để được bảo hành là gì?',
    answer: 'Sản phẩm còn trong thời gian bảo hành, có hoá đơn mua hàng, lỗi do nhà sản xuất (không áp dụng cho lỗi do người dùng làm rơi, vỡ, sơn lại, cắt/dũa linh kiện).',
    category: 'warranty'
  },
  
  // Đổi trả
  {
    id: 16,
    question: 'Chính sách đổi trả như thế nào?',
    answer: 'Chúng tôi chấp nhận đổi trả trong vòng 7 ngày kể từ khi nhận hàng với điều kiện: sản phẩm chưa mở seal/hộp, còn nguyên tem, phụ kiện đầy đủ, có hoá đơn. Phí ship đổi trả do khách hàng chi trả, trừ trường hợp lỗi từ shop.',
    category: 'return'
  },
  {
    id: 17,
    question: 'Tôi có thể đổi sang sản phẩm khác không?',
    answer: 'Có thể đổi sang sản phẩm khác có giá trị tương đương hoặc cao hơn (bù thêm tiền chênh lệch). Sản phẩm muốn đổi phải còn hàng và đáp ứng điều kiện đổi trả.',
    category: 'return'
  },
  {
    id: 18,
    question: 'Nếu sản phẩm bị lỗi từ nhà sản xuất thì sao?',
    answer: 'Nếu sản phẩm có lỗi từ nhà sản xuất (khuôn bể, màu sai, thiếu phụ kiện, in lỗi trên thẻ), chúng tôi sẽ đổi mới 100% hoặc hoàn tiền toàn bộ. Vui lòng cung cấp hình ảnh, video unboxing và mô tả chi tiết lỗi.',
    category: 'return'
  },
  {
    id: 19,
    question: 'Hoàn tiền mất bao lâu?',
    answer: 'Sau khi nhận và kiểm tra sản phẩm đổi trả hợp lệ, chúng tôi sẽ hoàn tiền trong vòng 5-7 ngày làm việc về tài khoản ngân hàng hoặc ví điện tử mà bạn đã thanh toán.',
    category: 'return'
  }
];

// ===========================
// SUPPORT CARDS DATA
// ===========================
const supportCardsData: SupportCardData[] = [
  {
    id: 1,
    supportId: 'live-chat',
    icon: MessageCircle,
    title: 'Live Chat',
    description: 'Trò chuyện trực tiếp với đội ngũ hỗ trợ 24/7',
    ctaText: 'Bắt đầu chat',
    action: 'chat'
  },
  {
    id: 2,
    supportId: 'guide',
    icon: BookOpen,
    title: 'Hướng dẫn chi tiết',
    description: 'Xem các hướng dẫn về sản phẩm và dịch vụ',
    ctaText: 'Xem hướng dẫn',
    action: 'scroll-faq'
  },
  {
    id: 3,
    supportId: 'tracking',
    icon: Package,
    title: 'Theo dõi đơn hàng',
    description: 'Kiểm tra tình trạng vận chuyển realtime',
    ctaText: 'Theo dõi ngay'
  }
];

const guideShortcuts: Array<{ id: number; title: string; description: string; category: FAQItem['category'] }> = [
  {
    id: 1,
    title: 'Hướng dẫn chọn mô hình đúng grade',
    description: 'So sánh HG, RG, MG, PG và gợi ý theo ngân sách giống trung tâm hỗ trợ Shopee.',
    category: 'product',
  },
  {
    id: 2,
    title: 'Hướng dẫn thanh toán và xác nhận đơn',
    description: 'Cách thanh toán COD/chuyển khoản, kiểm tra đơn đã xác nhận hay chưa.',
    category: 'payment',
  },
  {
    id: 3,
    title: 'Hướng dẫn giao hàng, đổi trả và bảo hành',
    description: 'Các mốc vận chuyển, thời gian nhận hàng và xử lý khi phát sinh vấn đề.',
    category: 'shipping',
  },
];

const getChatReply = (message: string) => {
  const normalized = message.toLowerCase();

  if (normalized.includes('đơn') || normalized.includes('ship') || normalized.includes('giao')) {
    return 'Bạn có thể vào mục "Theo dõi đơn hàng" ngay bên trên, nhập mã đơn + email để xem tiến trình realtime như Shopee.';
  }

  if (normalized.includes('thanh toán') || normalized.includes('cod') || normalized.includes('chuyển khoản')) {
    return 'Shop hỗ trợ COD và chuyển khoản. Với đơn lớn, bạn có thể được yêu cầu đặt cọc. Mình đã có phần hướng dẫn chi tiết trong danh mục "Hướng dẫn chi tiết".';
  }

  if (normalized.includes('đổi') || normalized.includes('trả') || normalized.includes('bảo hành')) {
    return 'Bạn được hỗ trợ đổi trả theo chính sách từng loại sản phẩm. Hãy mở danh mục "Đổi trả" hoặc "Bảo hành" bên dưới để xem điều kiện cụ thể.';
  }

  return 'Mình đã nhận câu hỏi của bạn. Bạn có thể chọn ngay 1 danh mục FAQ bên dưới để xem câu trả lời chính xác hơn.';
};

// ===========================
// CATEGORIES
// ===========================
const categories: Category[] = [
  { id: 'all', name: 'Tất cả' },
  { id: 'product', name: 'Sản phẩm' },
  { id: 'shipping', name: 'Vận chuyển' },
  { id: 'payment', name: 'Thanh toán' },
  { id: 'warranty', name: 'Bảo hành' },
  { id: 'return', name: 'Đổi trả' }
];

// ===========================
// COMPONENT: SupportCard
// ===========================
interface SupportCardProps {
  card: SupportCardData;
  index: number;
  isVisible: boolean;
  isActive: boolean;
  onSelect: (supportId: SupportCategoryId) => void;
  onChatOpen: () => void;
  onScrollFaq: () => void;
}

const SupportCard: React.FC<SupportCardProps> = ({
  card,
  index,
  isVisible,
  isActive,
  onSelect,
  onChatOpen,
  onScrollFaq,
}) => {
  const Icon = card.icon;
  const navigate = useNavigate();

  const handleCardSelect = () => {
    onSelect(card.supportId);
  };

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onSelect(card.supportId);

    if (card.href) {
      navigate(card.href);
      return;
    }

    if (card.action === 'chat') {
      onChatOpen();
      return;
    }

    if (card.action === 'scroll-faq') {
      onScrollFaq();
    }
  };
  
  return (
    <div
      className={`
        bg-white border-2 border-gray-200 rounded-2xl p-8
        flex flex-col cursor-pointer
        hover:border-primary hover:shadow-xl hover:-translate-y-2
        transition-all duration-300
        ${isActive ? 'border-primary shadow-lg -translate-y-1' : ''}
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
      `}
      style={{ transitionDelay: `${index * 100}ms` }}
      onClick={handleCardSelect}
    >
      <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
        <Icon className="w-8 h-8 text-primary" />
      </div>

      <h3 className="text-2xl text-black mb-3">{card.title}</h3>
      <p className="text-gray-600 mb-6 leading-relaxed flex-1">{card.description}</p>

      <button
        onClick={handleButtonClick}
        className="
          w-full bg-primary hover:bg-red-700 text-white 
          py-3 px-6 rounded-lg font-medium
          transition-all duration-300 
          hover:shadow-lg hover:scale-105
        "
      >
        {card.ctaText}
      </button>
    </div>
  );
};

// ===========================
// COMPONENT: CategoryTabs
// ===========================
interface CategoryTabsProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({ 
  categories, 
  activeCategory, 
  onCategoryChange 
}) => {
  return (
    <div className="overflow-x-auto scrollbar-hide -mx-2 px-2">
      <div className="flex gap-3 min-w-max md:min-w-0 pb-2 md:pb-0 py-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`
              px-6 py-3 rounded-lg transition-all duration-300 whitespace-nowrap
              ${activeCategory === category.id
                ? 'bg-primary text-white shadow-lg scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
              }
            `}
            style={{ 
              borderRadius: '8px',
              willChange: 'transform'
            }}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
};

// ===========================
// COMPONENT: AccordionItem
// ===========================
interface AccordionItemProps {
  faq: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ faq, isOpen, onToggle }) => {
  return (
    <div 
      className="
        bg-white rounded-xl shadow-sm 
        hover:shadow-md transition-all duration-300 
        border border-gray-100
      "
    >
      {/* Question - Clickable Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 text-left group"
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${faq.id}`}
      >
        <h3 className="text-lg text-black group-hover:text-primary transition-colors duration-300 pr-4">
          {faq.question}
        </h3>
        <ChevronDown
          className={`
            w-6 h-6 text-gray-400 group-hover:text-primary 
            transition-all duration-300 flex-shrink-0
            ${isOpen ? 'rotate-180' : ''}
          `}
        />
      </button>

      {/* Answer - Collapsible Content */}
      <div
        id={`faq-answer-${faq.id}`}
        className={`
          overflow-hidden transition-all duration-300 ease-in-out
          ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="px-6 pb-6 pt-0">
          <div className="border-t border-gray-100 pt-4">
            <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ===========================
// COMPONENT: LiveChatModal
// ===========================
interface ChatMessage {
  id: number;
  from: 'user' | 'support';
  text: string;
  time: string;
}

const initialMessages: ChatMessage[] = [
  {
    id: 1,
    from: 'support',
    text: 'Xin chào! Tôi là nhân viên hỗ trợ của Gundam Store. Tôi có thể giúp gì cho bạn hôm nay? 😊',
    time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  }
];

const LiveChatModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const autoReplies: Record<string, string> = {
    default: 'Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong thời gian sớm nhất. Trong giờ hành chính (8:00 - 22:00), thời gian phản hồi dưới 5 phút.',
    hàng: 'Tất cả sản phẩm của chúng tôi đều là hàng chính hãng 100% từ Bandai Nhật Bản. Bạn có thể kiểm tra tem xác thực trên sản phẩm.',
    ship: 'Nội thành TP.HCM giao 1-2 ngày, tỉnh thành khác 3-5 ngày. Miễn phí ship cho đơn từ 1.000.000₫!',
    vận: 'Nội thành TP.HCM giao 1-2 ngày, tỉnh thành khác 3-5 ngày. Miễn phí ship cho đơn từ 1.000.000₫!',
    giá: 'Bạn có thể xem giá sản phẩm tại trang Cửa hàng. Chúng tôi có nhiều ưu đãi hấp dẫn cho thành viên!',
    đổi: 'Chính sách đổi trả trong 7 ngày, sản phẩm còn nguyên seal và phụ kiện đầy đủ. Bạn cần hỗ trợ gì thêm không?',
    trả: 'Chính sách đổi trả trong 7 ngày, sản phẩm còn nguyên seal và phụ kiện đầy đủ. Bạn cần hỗ trợ gì thêm không?',
    bảo: 'Bảo hành 30 ngày cho lỗi sản xuất. Vui lòng liên hệ trong 48h kèm video unboxing khi phát hiện lỗi.',
    thanh: 'Chúng tôi hỗ trợ: Chuyển khoản, Ví điện tử (Momo, ZaloPay, VNPay), Thẻ tín dụng, và COD (thanh toán khi nhận hàng).',
    cod: 'Có, chúng tôi hỗ trợ COD toàn quốc! Đơn trên 5.000.000₫ cần đặt cọc 30% trước.',
  };

  const getAutoReply = (msg: string): string => {
    const lower = msg.toLowerCase();
    // First check admin-managed templates from localStorage
    try {
      const stored = localStorage.getItem('admin_chat_templates');
      if (stored) {
        const adminTemplates: { keyword: string; response: string }[] = JSON.parse(stored);
        for (const tpl of adminTemplates) {
          const keywords = tpl.keyword.split(',').map(k => k.trim().toLowerCase());
          if (keywords.some(k => k && lower.includes(k))) {
            return tpl.response;
          }
        }
      }
    } catch {}
    // Fallback to hardcoded replies
    for (const keyword of Object.keys(autoReplies)) {
      if (lower.includes(keyword)) return autoReplies[keyword];
    }
    return autoReplies['default'];
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text) return;
    const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = { id: Date.now(), from: 'user', text, time: now };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');

    setTimeout(() => {
      const reply: ChatMessage = {
        id: Date.now() + 1,
        from: 'support',
        text: getAutoReply(text),
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, reply]);
    }, 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-4 md:p-8 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300"
        style={{ height: '520px' }}
      >
        {/* Header */}
        <div className="bg-primary text-white px-5 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">Gundam Store Support</p>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <p className="text-xs text-white/80">Đang trực tuyến</p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] ${msg.from === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.from === 'user'
                    ? 'bg-primary text-white rounded-br-sm'
                    : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm'
                }`}>
                  {msg.text}
                </div>
                <span className="text-xs text-gray-400 px-1">{msg.time}</span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex-shrink-0 p-3 bg-white border-t border-gray-100 flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập tin nhắn..."
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="w-10 h-10 bg-primary hover:bg-red-700 disabled:bg-gray-300 text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ===========================
// COMPONENT: FAQList
// ===========================
interface FAQListProps {
  faqs: FAQItem[];
  openFaqId: number | null;
  onToggle: (id: number) => void;
}

const FAQList: React.FC<FAQListProps> = ({ faqs, openFaqId, onToggle }) => {
  if (faqs.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
          <BookOpen className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-2xl text-gray-800 mb-2">
          Không tìm thấy câu hỏi nào
        </h3>
        <p className="text-gray-500">
          Vui lòng thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {faqs.map((faq) => (
        <AccordionItem
          key={faq.id}
          faq={faq}
          isOpen={openFaqId === faq.id}
          onToggle={() => onToggle(faq.id)}
        />
      ))}
    </div>
  );
};

// ===========================
// MAIN COMPONENT: FAQ
// ===========================
export const FAQ: React.FC = () => {
  const navigate = useNavigate();

  // State management
  const [activeCategory, setActiveCategory] = useState('all');
  const [openFaqId, setOpenFaqId] = useState<number | null>(null);
  const [activeSupportCategory, setActiveSupportCategory] = useState<SupportCategoryId>('live-chat');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ id: number; role: 'user' | 'bot'; text: string }>>([
    {
      id: 1,
      role: 'bot',
      text: 'Xin chào! Mình là trợ lý hỗ trợ đơn hàng. Bạn cần tư vấn về sản phẩm, thanh toán hay theo dõi vận chuyển?',
    },
  ]);
  const [trackingForm, setTrackingForm] = useState({ orderCode: '', email: '', phone: '' });
  const [isTrackingLookupLoading, setIsTrackingLookupLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const faqSectionRef = useRef<HTMLDivElement>(null);

  // Scroll animations
  const header = useScrollAnimation(0.1);
  const cards = useScrollAnimation(0.1);
  const faqSection = useScrollAnimation(0.1);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const guestEmail = localStorage.getItem('guestOrderEmail') || '';
    const guestPhone = localStorage.getItem('guestOrderPhone') || '';

    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setTrackingForm((prev) => ({
          ...prev,
          email: user?.email || guestEmail,
          phone: user?.phone || guestPhone,
        }));
        return;
      } catch {
        // Keep guest defaults if local user state is broken.
      }
    }

    setTrackingForm((prev) => ({ ...prev, email: guestEmail, phone: guestPhone }));
  }, []);

  // Filter FAQs based on category only
  const filteredFaqs = useMemo(() => {
    let filtered = faqData;

    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(faq => faq.category === activeCategory);
    }

    return filtered;
  }, [activeCategory]);

  // Toggle accordion (only one open at a time)
  const handleToggleFaq = (id: number) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  // Handle category change
  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    setOpenFaqId(null); // Close all accordions when switching tabs
  };

  const handleScrollToFaq = useCallback(() => {
    faqSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const openFaqByCategory = useCallback((categoryId: FAQItem['category']) => {
    setActiveSupportCategory('guide');
    setActiveCategory(categoryId);
    const firstMatched = faqData.find((faq) => faq.category === categoryId);
    setOpenFaqId(firstMatched ? firstMatched.id : null);
    handleScrollToFaq();
  }, [handleScrollToFaq]);

  const handleSupportSelect = (supportId: SupportCategoryId) => {
    setActiveSupportCategory(supportId);
  };

  const handleQuickQuestion = (question: string) => {
    const userMessage = { id: Date.now(), role: 'user' as const, text: question };
    const botMessage = { id: Date.now() + 1, role: 'bot' as const, text: getChatReply(question) };
    setChatMessages((prev) => [...prev, userMessage, botMessage]);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();

    if (!chatInput.trim()) {
      toast.error('Vui lòng nhập nội dung cần hỗ trợ');
      return;
    }

    const message = chatInput.trim();
    const userMessage = { id: Date.now(), role: 'user' as const, text: message };
    const botMessage = { id: Date.now() + 1, role: 'bot' as const, text: getChatReply(message) };

    setChatMessages((prev) => [...prev, userMessage, botMessage]);
    setChatInput('');
  };

  const handleTrackingLookup = async (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedOrderCode = trackingForm.orderCode.trim().toUpperCase();
    const normalizedEmail = trackingForm.email.trim();
    const normalizedPhone = trackingForm.phone.trim();

    if (!normalizedOrderCode || !normalizedEmail) {
      toast.error('Vui lòng nhập mã đơn hàng và email đặt hàng');
      return;
    }

    setIsTrackingLookupLoading(true);

    try {
      const params = new URLSearchParams();
      params.set('email', normalizedEmail);
      if (normalizedPhone) {
        params.set('phone', normalizedPhone);
      }

      const response = await fetch(`${buildApiUrl('/orders')}?${params.toString()}`);
      const payload = await response.json().catch(() => []);

      if (!response.ok) {
        throw new Error((payload as { message?: string })?.message || 'Không thể tra cứu đơn hàng');
      }

      const orders = Array.isArray(payload) ? payload : [];
      const matched = orders.find((order: { id: string; orderNumber?: string; customerName?: string }) => (order.orderNumber || '').toUpperCase() === normalizedOrderCode);

      if (!matched) {
        toast.error('Không tìm thấy đơn hàng. Vui lòng kiểm tra lại mã đơn/email.');
        return;
      }

      localStorage.setItem('guestOrderEmail', normalizedEmail);
      localStorage.setItem('guestOrderPhone', normalizedPhone);
      localStorage.setItem('guestOrderName', matched.customerName || 'Khách hàng');

      toast.success('Đã tìm thấy đơn hàng, đang chuyển sang trang theo dõi...');
      navigate(`/orders/${matched.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể tra cứu đơn hàng';
      toast.error(message);
    } finally {
      setIsTrackingLookupLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Live Chat Modal */}
      <LiveChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      {/* ===========================
          HEADER SECTION
      =========================== */}
      <div
        ref={header.ref}
        className={`
          bg-black text-white py-20
          transition-all duration-1000
          ${header.isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
        `}
      >
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl mb-4">
            Câu hỏi thường gặp
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Tìm câu trả lời nhanh chóng cho mọi thắc mắc của bạn
          </p>
        </div>
      </div>

      {/* ===========================
          SUPPORT CARDS SECTION
      =========================== */}
      <div
        ref={cards.ref}
        className={`
          max-w-7xl mx-auto px-6 py-16
          transition-all duration-1000
          ${cards.isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}
        `}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {supportCardsData.map((card, index) => (
            <SupportCard
              key={card.id}
              card={card}
              index={index}
              isVisible={cards.isVisible}
              isActive={activeSupportCategory === card.supportId}
              onSelect={handleSupportSelect}
              onChatOpen={() => setIsChatOpen(true)}
              onScrollFaq={handleScrollToFaq}
            />
          ))}
        </div>

        <div className="mt-8 bg-white border-2 border-gray-200 rounded-2xl p-6 md:p-8">
          {activeSupportCategory === 'live-chat' && (
            <div>
              <h3 className="text-2xl text-black mb-2">Live chat hỗ trợ nhanh</h3>
              <p className="text-gray-600 mb-5">Mô phỏng trung tâm chat hỗ trợ kiểu Shopee: hỏi nhanh, trả lời nhanh, có gợi ý sẵn.</p>

              <div className="flex flex-wrap gap-2 mb-5">
                <button onClick={() => handleQuickQuestion('Làm sao để theo dõi đơn hàng?')} className="px-3 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                  Theo dõi đơn hàng
                </button>
                <button onClick={() => handleQuickQuestion('Shop hỗ trợ thanh toán gì?')} className="px-3 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                  Hình thức thanh toán
                </button>
                <button onClick={() => handleQuickQuestion('Chính sách đổi trả ra sao?')} className="px-3 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                  Chính sách đổi trả
                </button>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3 max-h-64 overflow-y-auto">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[90%] px-4 py-2 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-white text-gray-700 border border-gray-200'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendChat} className="mt-4 flex gap-3">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Nhập câu hỏi của bạn..."
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <button type="submit" className="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                  Gửi
                </button>
              </form>
            </div>
          )}

          {activeSupportCategory === 'guide' && (
            <div>
              <h3 className="text-2xl text-black mb-2">Trung tâm hướng dẫn chi tiết</h3>
              <p className="text-gray-600 mb-5">Chọn mục hướng dẫn để mở thẳng nhóm FAQ tương ứng, giống cách Shopee điều hướng theo chủ đề hỗ trợ.</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {guideShortcuts.map((guide) => (
                  <div key={guide.id} className="rounded-xl border border-gray-200 p-4 hover:border-primary hover:shadow-md transition-all">
                    <h4 className="text-lg text-black mb-2">{guide.title}</h4>
                    <p className="text-sm text-gray-600 mb-4 min-h-[60px]">{guide.description}</p>
                    <button
                      onClick={() => openFaqByCategory(guide.category)}
                      className="w-full py-2.5 rounded-lg bg-black text-white hover:bg-gray-900 transition-colors"
                    >
                      Xem ngay
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSupportCategory === 'tracking' && (
            <div>
              <h3 className="text-2xl text-black mb-2">Theo dõi đơn hàng realtime</h3>
              <p className="text-gray-600 mb-5">Nhập mã đơn và email đặt hàng để xem tiến trình giao hàng như Shopee: xử lý, vận chuyển, giao thành công.</p>

              <form onSubmit={handleTrackingLookup} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={trackingForm.orderCode}
                  onChange={(e) => setTrackingForm((prev) => ({ ...prev, orderCode: e.target.value.toUpperCase() }))}
                  placeholder="Mã đơn (ví dụ: ORD-123456)"
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <input
                  type="email"
                  value={trackingForm.email}
                  onChange={(e) => setTrackingForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="Email đặt hàng"
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <input
                  type="tel"
                  value={trackingForm.phone}
                  onChange={(e) => setTrackingForm((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="Số điện thoại (không bắt buộc)"
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <button
                  type="submit"
                  disabled={isTrackingLookupLoading}
                  className="md:col-span-3 py-3 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                  {isTrackingLookupLoading ? 'Đang tra cứu...' : 'Theo dõi đơn hàng ngay'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* ===========================
          FAQ SECTION
      =========================== */}
      <div
        ref={faqSection.ref}
        className={`
          bg-gray-50 py-20
          transition-all duration-1000
          ${faqSection.isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}
        `}
      >
        <div ref={faqSectionRef} className="max-w-5xl mx-auto px-6">
          {/* Section Title */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl text-black mb-4">
              Tìm câu trả lời
            </h2>
            <p className="text-gray-600 text-lg">
              Tìm kiếm hoặc chọn danh mục để xem các câu hỏi phổ biến
            </p>
          </div>

          {/* Category Tabs */}
          <div className="mb-10">
            <CategoryTabs
              categories={categories}
              activeCategory={activeCategory}
              onCategoryChange={handleCategoryChange}
            />
          </div>

          {/* FAQ List - Accordion */}
          <FAQList
            faqs={filteredFaqs}
            openFaqId={openFaqId}
            onToggle={handleToggleFaq}
          />

          {/* Additional Help CTA */}
          {filteredFaqs.length > 0 && (
            <div className="mt-16 text-center bg-white rounded-2xl p-12 shadow-sm border border-gray-200">
              <h3 className="text-2xl text-black mb-3">
                Vẫn cần thêm hỗ trợ?
              </h3>
              <p className="text-gray-600 mb-6">
                Đội ngũ của chúng tôi luôn sẵn sàng giúp đỡ bạn 24/7
              </p>
              <button
                onClick={() => navigate('/contact')}
                className="
                  bg-black hover:bg-gray-900 text-white 
                  py-3 px-8 rounded-lg 
                  transition-all duration-300 
                  hover:shadow-lg hover:scale-105
                "
              >
                Liên hệ chúng tôi
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};