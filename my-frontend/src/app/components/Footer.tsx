import React from 'react';
import { Link } from 'react-router';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

export const Footer: React.FC = () => {
  const footer = useScrollAnimation(0.1);

  return (
    <footer 
      ref={footer.ref}
      className={`bg-black text-white mt-32 transition-all duration-1000 ${
        footer.isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl text-white mb-4">
              GUNDAM STORE
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Điểm đến hàng đầu cho mô hình Gundam và thẻ bài sưu tầm chính hãng tại Việt Nam.
            </p>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h4 className="text-lg text-white mb-6">Điều hướng</h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/" 
                  className="text-gray-400 hover:text-white transition-colors duration-300 inline-block hover:translate-x-1"
                >
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link 
                  to="/shop" 
                  className="text-gray-400 hover:text-white transition-colors duration-300 inline-block hover:translate-x-1"
                >
                  Cửa hàng
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className="text-gray-400 hover:text-white transition-colors duration-300 inline-block hover:translate-x-1"
                >
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-gray-400 hover:text-white transition-colors duration-300 inline-block hover:translate-x-1"
                >
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Support */}
          <div>
            <h4 className="text-lg text-white mb-6">Hỗ trợ</h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/faq" 
                  className="text-gray-400 hover:text-white transition-colors duration-300 inline-block hover:translate-x-1"
                >
                  Câu hỏi thường gặp
                </Link>
              </li>
              <li>
                <Link
                  to="/return-policy"
                  className="text-gray-400 hover:text-white transition-colors duration-300 inline-block hover:translate-x-1"
                >
                  Chính sách đổi trả
                </Link>
              </li>
              <li>
                <Link
                  to="/shipping-policy"
                  className="text-gray-400 hover:text-white transition-colors duration-300 inline-block hover:translate-x-1"
                >
                  Chính sách vận chuyển
                </Link>
              </li>
              <li>
                <Link
                  to="/purchase-guide"
                  className="text-gray-400 hover:text-white transition-colors duration-300 inline-block hover:translate-x-1"
                >
                  Hướng dẫn mua hàng
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h4 className="text-lg text-white mb-6">Liên hệ</h4>
            <ul className="space-y-4 text-gray-400">
              <li>
                <p className="text-sm text-gray-500 mb-1">Địa chỉ</p>
                <p className="leading-relaxed">
                  123 Đường chính, Quận 1<br />
                  TP. Hồ Chí Minh, Việt Nam
                </p>
              </li>
              <li>
                <p className="text-sm text-gray-500 mb-1">Email</p>
                <a 
                  href="mailto:support@gundamstore.com" 
                  className="hover:text-white transition-colors duration-300"
                >
                  support@gundamstore.com
                </a>
              </li>
              <li>
                <p className="text-sm text-gray-500 mb-1">Điện thoại</p>
                <a 
                  href="tel:+84123456789" 
                  className="hover:text-white transition-colors duration-300"
                >
                  +84 123 456 789
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              &copy; 2026 GUNDAM STORE. Bảo lưu mọi quyền.
            </p>
            <div className="flex gap-6 text-sm">
              <Link
                to="/terms-of-use"
                className="text-gray-400 hover:text-white transition-colors duration-300"
              >
                Điều khoản sử dụng
              </Link>
              <Link
                to="/privacy-policy"
                className="text-gray-400 hover:text-white transition-colors duration-300"
              >
                Chính sách bảo mật
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};