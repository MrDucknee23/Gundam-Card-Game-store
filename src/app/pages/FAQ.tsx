import React, { useState, useMemo } from 'react';
import { 
  MessageCircle, 
  BookOpen, 
  Package, 
  ChevronDown
} from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

// ===========================
// TYPES & INTERFACES
// ===========================
interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: 'product' | 'shipping' | 'payment' | 'warranty' | 'return';
}

interface SupportCardData {
  id: number;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  ctaText: string;
  ctaAction: () => void;
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
    icon: MessageCircle,
    title: 'Live Chat',
    description: 'Trò chuyện trực tiếp với đội ngũ hỗ trợ 24/7',
    ctaText: 'Bắt đầu chat',
    ctaAction: () => alert('🎯 Live Chat sẽ được kích hoạt (Demo)')
  },
  {
    id: 2,
    icon: BookOpen,
    title: 'Hướng dẫn chi tiết',
    description: 'Xem các hướng dẫn về sản phẩm và dịch vụ',
    ctaText: 'Xem hướng dẫn',
    ctaAction: () => alert('📖 Chuyển đến trang hướng dẫn (Demo)')
  },
  {
    id: 3,
    icon: Package,
    title: 'Theo dõi đơn hàng',
    description: 'Kiểm tra tình trạng vận chuyển realtime',
    ctaText: 'Theo dõi ngay',
    ctaAction: () => alert('📦 Chuyển đến trang theo dõi (Demo)')
  }
];

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
}

const SupportCard: React.FC<SupportCardProps> = ({ card, index, isVisible }) => {
  const Icon = card.icon;
  
  return (
    <div
      className={`
        bg-white border-2 border-gray-200 rounded-2xl p-8
        hover:border-primary hover:shadow-xl hover:-translate-y-2
        transition-all duration-300 cursor-pointer
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
      `}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Icon Container */}
      <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
        <Icon className="w-8 h-8 text-primary" />
      </div>

      {/* Content */}
      <h3 className="text-2xl text-black mb-3">{card.title}</h3>
      <p className="text-gray-600 mb-6 leading-relaxed">{card.description}</p>

      {/* CTA Button */}
      <button
        onClick={card.ctaAction}
        className="
          w-full bg-primary hover:bg-red-700 text-white 
          py-3 px-6 rounded-lg 
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
  // State management
  const [activeCategory, setActiveCategory] = useState('all');
  const [openFaqId, setOpenFaqId] = useState<number | null>(null);

  // Scroll animations
  const header = useScrollAnimation(0.1);
  const cards = useScrollAnimation(0.1);
  const faqSection = useScrollAnimation(0.1);

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

  return (
    <div className="min-h-screen bg-white">
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
            />
          ))}
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
        <div className="max-w-5xl mx-auto px-6">
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
                onClick={() => alert('📞 Chuyển đến trang liên hệ (Demo)')}
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