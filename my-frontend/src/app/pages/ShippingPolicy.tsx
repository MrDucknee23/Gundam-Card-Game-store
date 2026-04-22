import React from 'react';
import { Link } from 'react-router';

const shippingAreas = [
  { area: 'Nội thành TP.HCM', time: '1 - 2 ngày làm việc' },
  { area: 'Khu vực miền Nam', time: '2 - 4 ngày làm việc' },
  { area: 'Miền Trung và miền Bắc', time: '3 - 6 ngày làm việc' },
  { area: 'Khu vực xa, hải đảo', time: '5 - 8 ngày làm việc' },
];

export const ShippingPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-slate-900 via-black to-primary text-white">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <p className="text-sm uppercase tracking-[0.3em] text-white/70 mb-3">Gundam Store</p>
          <h1 className="text-4xl md:text-5xl font-bold">Chính sách vận chuyển</h1>
          <p className="text-white/80 mt-4 text-lg max-w-3xl leading-relaxed">
            Cập nhật đầy đủ về thời gian giao hàng, cách tính phí ship và quy trình đóng gói an toàn cho sản phẩm sưu tầm.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Đơn vị vận chuyển</p>
            <p className="text-2xl font-bold text-gray-900">GHN, J&T, Viettel Post</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Miễn phí vận chuyển</p>
            <p className="text-2xl font-bold text-gray-900">Từ 1.000.000₫</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Theo dõi đơn hàng</p>
            <p className="text-2xl font-bold text-gray-900">24/7</p>
          </div>
        </div>

        <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Phạm vi giao hàng</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Shop hỗ trợ giao hàng toàn quốc. Mọi đơn hàng đều được xác nhận thông tin trước khi bàn giao cho đơn vị vận chuyển.
          </p>
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700">Khu vực</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700">Thời gian dự kiến</th>
                </tr>
              </thead>
              <tbody>
                {shippingAreas.map((item) => (
                  <tr key={item.area} className="border-t border-gray-200">
                    <td className="px-4 py-3 text-sm text-gray-800">{item.area}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Phí vận chuyển</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-2 leading-relaxed">
              <li>Miễn phí ship toàn quốc cho đơn hàng từ 1.000.000₫.</li>
              <li>Đơn dưới mức freeship sẽ được tính theo khu vực và trọng lượng thực tế.</li>
              <li>Phí vận chuyển được hiển thị rõ ràng trước khi xác nhận thanh toán.</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Đóng gói an toàn</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-2 leading-relaxed">
              <li>Hộp carton nhiều lớp và lớp chống sốc cho sản phẩm mô hình.</li>
              <li>Thẻ bài được cố định bằng lớp bảo vệ cứng để tránh cong gãy.</li>
              <li>Dán nhãn hàng dễ vỡ và kiểm tra ngoại quan trước khi gửi đi.</li>
            </ul>
          </div>
        </section>

        <section className="bg-primary/5 rounded-2xl border border-primary/20 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Theo dõi hoặc thay đổi đơn giao</h2>
          <p className="text-gray-700 mb-4">
            Nếu cần cập nhật địa chỉ, số điện thoại hoặc muốn kiểm tra tiến trình đơn hàng, hãy liên hệ ngay khi đơn chưa được bàn giao cho đơn vị vận chuyển.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/orders" className="px-5 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors">
              Theo dõi đơn hàng
            </Link>
            <Link to="/contact" className="px-5 py-2.5 border border-gray-300 text-gray-800 rounded-lg font-medium hover:bg-white transition-colors">
              Liên hệ hỗ trợ
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};
