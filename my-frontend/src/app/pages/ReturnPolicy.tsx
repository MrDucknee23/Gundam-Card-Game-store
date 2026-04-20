import React from 'react';
import { Link } from 'react-router';

const returnCases = [
  'Sản phẩm bị lỗi từ nhà sản xuất, thiếu chi tiết hoặc sai phiên bản.',
  'Hàng giao không đúng mẫu mã, số lượng hoặc sai đơn đặt hàng.',
  'Sản phẩm hư hỏng trong quá trình vận chuyển và có hình ảnh, video xác nhận khi mở hộp.',
];

const nonReturnCases = [
  'Sản phẩm đã qua lắp ráp, bóc seal, sử dụng hoặc bị can thiệp bởi người dùng.',
  'Hộp móp nhẹ không ảnh hưởng đến chất lượng sản phẩm bên trong.',
  'Các trường hợp hư hỏng do bảo quản sai cách, rơi vỡ hoặc tác động bên ngoài sau khi nhận hàng.',
];

export const ReturnPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-black via-gray-900 to-primary text-white">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <p className="text-sm uppercase tracking-[0.3em] text-white/70 mb-3">Gundam Store</p>
          <h1 className="text-4xl md:text-5xl font-bold">Chính sách đổi trả</h1>
          <p className="text-white/80 mt-4 text-lg max-w-3xl leading-relaxed">
            Hỗ trợ đổi trả minh bạch cho mô hình Gundam và thẻ bài sưu tầm chính hãng, giúp bạn an tâm khi mua sắm.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Thời gian yêu cầu</p>
            <p className="text-2xl font-bold text-gray-900">7 ngày</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Xử lý phản hồi</p>
            <p className="text-2xl font-bold text-gray-900">24 - 48h</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Hoàn tiền dự kiến</p>
            <p className="text-2xl font-bold text-gray-900">5 - 7 ngày</p>
          </div>
        </div>

        <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Điều kiện áp dụng</h2>
          <ul className="list-disc pl-5 text-gray-700 space-y-2 leading-relaxed">
            <li>Sản phẩm còn nguyên hộp, đầy đủ phụ kiện, tem niêm phong và hóa đơn mua hàng.</li>
            <li>Yêu cầu đổi trả được gửi trong vòng 7 ngày kể từ thời điểm nhận hàng.</li>
            <li>Khách hàng cung cấp đầy đủ hình ảnh, video và mã đơn hàng để đối chiếu.</li>
          </ul>
        </section>

        <section className="grid md:grid-cols-2 gap-6">
          <div className="bg-green-50 rounded-2xl border border-green-200 p-6">
            <h3 className="text-xl font-bold text-green-800 mb-4">Trường hợp được hỗ trợ</h3>
            <ul className="space-y-3 text-green-900">
              {returnCases.map((item) => (
                <li key={item} className="flex gap-2">
                  <span>•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-red-50 rounded-2xl border border-red-200 p-6">
            <h3 className="text-xl font-bold text-red-800 mb-4">Trường hợp không áp dụng</h3>
            <ul className="space-y-3 text-red-900">
              {nonReturnCases.map((item) => (
                <li key={item} className="flex gap-2">
                  <span>•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Quy trình đổi trả</h2>
          <div className="space-y-3 text-gray-700 leading-relaxed">
            <p><strong>Bước 1:</strong> Liên hệ bộ phận hỗ trợ qua email hoặc hotline.</p>
            <p><strong>Bước 2:</strong> Gửi mã đơn hàng, mô tả lỗi, ảnh hoặc video xác minh.</p>
            <p><strong>Bước 3:</strong> Shop xác nhận điều kiện và hướng dẫn gửi hàng về kho.</p>
            <p><strong>Bước 4:</strong> Tiến hành đổi sản phẩm mới hoặc hoàn tiền theo kết quả kiểm tra.</p>
          </div>
        </section>

        <section className="bg-primary/5 rounded-2xl border border-primary/20 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Cần hỗ trợ nhanh?</h2>
          <p className="text-gray-700 mb-4">
            Nếu đơn hàng của bạn gặp vấn đề, hãy liên hệ ngay để được ưu tiên xử lý sớm nhất.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/contact" className="px-5 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors">
              Liên hệ hỗ trợ
            </Link>
            <Link to="/faq" className="px-5 py-2.5 border border-gray-300 text-gray-800 rounded-lg font-medium hover:bg-white transition-colors">
              Xem câu hỏi thường gặp
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};
