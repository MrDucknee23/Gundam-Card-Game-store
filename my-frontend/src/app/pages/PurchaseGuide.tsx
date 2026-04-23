import React from 'react';

export const PurchaseGuide: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-black text-white py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold">Hướng dẫn mua hàng</h1>
          <p className="text-gray-300 mt-3 text-lg">Quy trình đặt hàng nhanh và an toàn tại Gundam Store.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
        <div className="rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-black mb-2">Bước 1: Tìm và lọc sản phẩm</h2>
          <p className="text-gray-700 leading-relaxed">
            Sử dụng thanh tìm kiếm hoặc bộ lọc theo danh mục, cấp độ, độ hiếm và khoảng giá để tìm đúng
            mẫu mô hình hoặc thẻ bài mong muốn.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-black mb-2">Bước 2: Thêm vào giỏ hàng</h2>
          <p className="text-gray-700 leading-relaxed">
            Kiểm tra thông tin sản phẩm, số lượng tồn kho, sau đó thêm vào giỏ hàng. Bạn có thể đánh dấu
            yêu thích để lưu danh sách theo dõi giá.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-black mb-2">Bước 3: Thanh toán</h2>
          <p className="text-gray-700 leading-relaxed">
            Điền thông tin nhận hàng, chọn phương thức thanh toán (COD hoặc chuyển khoản), xác nhận chi phí
            vận chuyển và đặt hàng.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-black mb-2">Bước 4: Theo dõi đơn</h2>
          <p className="text-gray-700 leading-relaxed">
            Theo dõi trạng thái đơn trong mục Đơn hàng của tôi. Nếu cần hỗ trợ, liên hệ bộ phận chăm sóc
            khách hàng để được xử lý nhanh.
          </p>
        </div>
      </div>
    </div>
  );
};
