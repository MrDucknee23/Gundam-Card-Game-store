import React, { useState, useEffect } from 'react';
import { MessageCircle, Plus, Pencil, Trash2, Search, Tag, Save, X } from 'lucide-react';
import { Breadcrumb } from '../components/Breadcrumb';
import { toast } from 'sonner';
import { AdminActionButton, AdminActionGroup } from '../components/admin/AdminActionButton';

const STORAGE_KEY = 'admin_chat_templates';

interface ChatTemplate {
  id: string;
  category: string;
  keyword: string;
  response: string;
  createdAt: string;
  updatedAt: string;
}

type TemplateSeedSignature = Pick<ChatTemplate, 'category' | 'keyword' | 'response'>;

const DEFAULT_TEMPLATES: ChatTemplate[] = [
  {
    id: '1',
    category: 'Sản phẩm',
    keyword: 'hàng chính hãng',
    response: 'Tất cả sản phẩm của Gundam Store đều là hàng chính hãng 100% từ Bandai Nhật Bản. Mỗi sản phẩm có tem chống giả và được kiểm tra kỹ trước khi giao.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    category: 'Vận chuyển',
    keyword: 'ship, vận chuyển',
    response: 'Nội thành TP.HCM: 1-2 ngày. Tỉnh thành: 3-5 ngày. Miễn phí ship cho đơn từ 1.000.000₫! Chúng tôi dùng GHN, Viettel Post và J&T.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    category: 'Thanh toán',
    keyword: 'thanh toán, COD, chuyển khoản',
    response: 'Chúng tôi hỗ trợ: Chuyển khoản ngân hàng, Ví điện tử (Momo/ZaloPay/VNPay), Thẻ tín dụng, và COD (thanh toán khi nhận hàng).',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    category: 'Đổi trả',
    keyword: 'đổi trả, hoàn tiền',
    response: 'Chính sách đổi trả 7 ngày từ khi nhận hàng, sản phẩm nguyên seal, phụ kiện đầy đủ, có hóa đơn. Lỗi từ shop: đổi mới hoặc hoàn tiền 100%.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '5',
    category: 'Bảo hành',
    keyword: 'bảo hành, lỗi sản phẩm',
    response: 'Bảo hành 30 ngày cho lỗi sản xuất. Vui lòng kiểm tra khi nhận và quay video unboxing. Liên hệ trong 48h nếu phát hiện lỗi.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '6',
    category: 'Khuyến mãi',
    keyword: 'giảm giá, khuyến mãi, ưu đãi',
    response: 'Đăng ký thành viên để nhận ưu đãi độc quyền! Theo dõi fanpage để cập nhật chương trình khuyến mãi mới nhất. Đơn từ 1 triệu được freeship!',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const DEFAULT_TEMPLATE_SIGNATURES: TemplateSeedSignature[] = DEFAULT_TEMPLATES.map(({ category, keyword, response }) => ({
  category,
  keyword,
  response,
}));

const CATEGORIES = ['Tất cả', 'Sản phẩm', 'Vận chuyển', 'Thanh toán', 'Đổi trả', 'Bảo hành', 'Khuyến mãi', 'Khác'];

const isSeededDefaultTemplates = (items: unknown): items is ChatTemplate[] => {
  if (!Array.isArray(items) || items.length !== DEFAULT_TEMPLATE_SIGNATURES.length) {
    return false;
  }

  return DEFAULT_TEMPLATE_SIGNATURES.every((seed) => items.some((item) => (
    typeof item === 'object'
    && item !== null
    && 'category' in item
    && 'keyword' in item
    && 'response' in item
    && item.category === seed.category
    && item.keyword === seed.keyword
    && item.response === seed.response
  )));
};

export const AdminChatTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<ChatTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Tất cả');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ChatTemplate | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ChatTemplate | null>(null);
  const [form, setForm] = useState({ category: 'Sản phẩm', keyword: '', response: '' });

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setTemplates([]);
      return;
    }

    if (stored) {
      try {
        const parsed = JSON.parse(stored);

        if (!Array.isArray(parsed)) {
          setTemplates([]);
          localStorage.removeItem(STORAGE_KEY);
          return;
        }

        if (isSeededDefaultTemplates(parsed)) {
          setTemplates([]);
          localStorage.removeItem(STORAGE_KEY);
          return;
        }

        setTemplates(parsed);
      } catch {
        setTemplates([]);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const saveTemplates = (updated: ChatTemplate[]) => {
    setTemplates(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const openAdd = () => {
    setEditingTemplate(null);
    setForm({ category: 'Sản phẩm', keyword: '', response: '' });
    setIsModalOpen(true);
  };

  const openEdit = (t: ChatTemplate) => {
    setEditingTemplate(t);
    setForm({ category: t.category, keyword: t.keyword, response: t.response });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!form.keyword.trim() || !form.response.trim()) {
      toast.error('Vui lòng nhập từ khóa và nội dung trả lời');
      return;
    }
    const now = new Date().toISOString();
    if (editingTemplate) {
      const updated = templates.map(t =>
        t.id === editingTemplate.id
          ? { ...t, ...form, updatedAt: now }
          : t
      );
      saveTemplates(updated);
      toast.success('Đã cập nhật câu trả lời!');
    } else {
      const newTemplate: ChatTemplate = {
        id: Date.now().toString(),
        ...form,
        createdAt: now,
        updatedAt: now
      };
      saveTemplates([newTemplate, ...templates]);
      toast.success('Đã thêm câu trả lời mới!');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (t: ChatTemplate) => {
    setDeleteTarget(t);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    saveTemplates(templates.filter(t => t.id !== deleteTarget.id));
    toast.success('Đã xóa câu trả lời');
    setDeleteTarget(null);
  };

  const filtered = templates.filter(t => {
    const matchCat = categoryFilter === 'Tất cả' || t.category === categoryFilter;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || t.keyword.toLowerCase().includes(q) || t.response.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const categoryColors: Record<string, string> = {
    'Sản phẩm': 'bg-blue-100 text-blue-700',
    'Vận chuyển': 'bg-purple-100 text-purple-700',
    'Thanh toán': 'bg-green-100 text-green-700',
    'Đổi trả': 'bg-orange-100 text-orange-700',
    'Bảo hành': 'bg-yellow-100 text-yellow-700',
    'Khuyến mãi': 'bg-pink-100 text-pink-700',
    'Khác': 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <Breadcrumb items={[{ label: 'Admin', href: '/admin' }, { label: 'Trả lời Live Chat' }]} />

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <MessageCircle className="w-8 h-8 text-primary" />
              Trả lời Live Chat
            </h1>
            <p className="text-gray-600 mt-1">Quản lý các câu trả lời nhanh cho hỗ trợ khách hàng</p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-primary hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Thêm mới
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {['Sản phẩm', 'Vận chuyển', 'Thanh toán', 'Đổi trả'].map(cat => (
            <div key={cat} className="bg-white rounded-xl p-4 border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">{cat}</p>
              <p className="text-2xl font-bold text-gray-900">{templates.filter(t => t.category === cat).length}</p>
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm theo từ khóa hoặc nội dung..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-sm"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    categoryFilter === cat
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-3">Hiển thị {filtered.length} / {templates.length} câu trả lời</p>
        </div>

        {/* Templates Grid */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-700 font-medium mb-1">
              {templates.length === 0 ? 'Chưa có câu trả lời nào' : 'Không tìm thấy câu trả lời nào'}
            </p>
            <p className="text-sm text-gray-500">
              {templates.length === 0
                ? 'Thêm câu trả lời đầu tiên để admin sử dụng dữ liệu thật thay vì mẫu mặc định.'
                : 'Thử đổi từ khóa tìm kiếm hoặc bộ lọc danh mục.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(t => (
              <div key={t.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${categoryColors[t.category] || 'bg-gray-100 text-gray-700'}`}>
                      {t.category}
                    </span>
                  </div>
                  <AdminActionGroup className="ml-2 flex-shrink-0">
                    <AdminActionButton
                      onClick={() => openEdit(t)}
                      tone="neutral"
                      label="Chỉnh sửa"
                    >
                      <Pencil />
                    </AdminActionButton>
                    <AdminActionButton
                      onClick={() => handleDelete(t)}
                      tone="danger"
                      label="Xóa"
                    >
                      <Trash2 />
                    </AdminActionButton>
                  </AdminActionGroup>
                </div>

                {/* Keywords */}
                <div className="mb-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Tag className="w-3.5 h-3.5 text-gray-400" />
                    <p className="text-xs text-gray-500 font-medium">Từ khóa kích hoạt</p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {t.keyword.split(',').map((kw, i) => (
                      <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{kw.trim()}</span>
                    ))}
                  </div>
                </div>

                {/* Response */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Nội dung trả lời</p>
                  <p className="text-sm text-gray-800 leading-relaxed line-clamp-3 break-words whitespace-pre-wrap max-w-full">{t.response}</p>
                </div>

                <p className="text-xs text-gray-400 mt-3">
                  Cập nhật: {new Date(t.updatedAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {editingTemplate ? 'Chỉnh sửa trả lời' : 'Thêm trả lời mới'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Danh mục</label>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
                >
                  {CATEGORIES.filter(c => c !== 'Tất cả').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Từ khóa kích hoạt <span className="text-gray-400 font-normal">(phân cách bằng dấu phẩy)</span>
                </label>
                <input
                  type="text"
                  value={form.keyword}
                  onChange={e => setForm({ ...form, keyword: e.target.value })}
                  placeholder="vd: ship, giao hàng, vận chuyển"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nội dung trả lời</label>
                <textarea
                  value={form.response}
                  onChange={e => setForm({ ...form, response: e.target.value })}
                  placeholder="Nhập nội dung sẽ hiển thị khi khách hàng hỏi về từ khóa này..."
                  rows={5}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                {editingTemplate ? 'Lưu thay đổi' : 'Thêm mẫu'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Xác nhận xóa</h2>
            <p className="text-sm text-gray-600 mb-6">
              Bạn có chắc muốn xóa câu trả lời "{deleteTarget.keyword}"? Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
