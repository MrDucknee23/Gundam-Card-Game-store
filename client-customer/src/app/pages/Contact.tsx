import React, { useState } from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { toast } from 'sonner';

export const Contact: React.FC = () => {
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const header = useScrollAnimation(0.1);
  const content = useScrollAnimation(0.1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Tin nhắn đã được gửi! Chúng tôi sẽ liên hệ lại sớm nhất.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div 
        ref={header.ref}
        className={`bg-black text-white py-20 transition-all duration-1000 ${
          header.isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl mb-4">Liên hệ</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Chúng tôi luôn sẵn sàng hỗ trợ bạn
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div 
        ref={content.ref}
        className={`max-w-7xl mx-auto px-6 py-16 transition-all duration-1000 ${
          content.isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
        }`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left Side - Contact Form */}
          <div>
            <div className="mb-8">
              <h2 className="text-3xl text-black mb-4">Gửi tin nhắn cho chúng tôi</h2>
              <p className="text-gray-600">
                Điền thông tin bên dưới và chúng tôi sẽ liên hệ lại với bạn trong thời gian sớm nhất.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm text-gray-700 mb-2">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  required
                  className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-300 focus:outline-none ${
                    focusedField === 'name'
                      ? 'border-primary'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  placeholder="Nhập họ và tên của bạn"
                />
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  required
                  className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-300 focus:outline-none ${
                    focusedField === 'email'
                      ? 'border-primary'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  placeholder="email@example.com"
                />
              </div>

              {/* Subject Field */}
              <div>
                <label htmlFor="subject" className="block text-sm text-gray-700 mb-2">
                  Tiêu đề *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('subject')}
                  onBlur={() => setFocusedField(null)}
                  required
                  className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-300 focus:outline-none ${
                    focusedField === 'subject'
                      ? 'border-primary'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  placeholder="Tiêu đề tin nhắn"
                />
              </div>

              {/* Message Field */}
              <div>
                <label htmlFor="message" className="block text-sm text-gray-700 mb-2">
                  Tin nhắn *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('message')}
                  onBlur={() => setFocusedField(null)}
                  required
                  rows={6}
                  className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-300 focus:outline-none resize-none ${
                    focusedField === 'message'
                      ? 'border-primary'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  placeholder="Nội dung tin nhắn của bạn..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-black hover:bg-gray-900 text-white py-4 rounded-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
              >
                Gửi tin nhắn
              </button>
            </form>
          </div>

          {/* Right Side - Contact Info */}
          <div className="lg:pl-8">
            <div className="mb-8">
              <h2 className="text-3xl text-black mb-4">Thông tin liên hệ</h2>
              <p className="text-gray-600">
                Bạn cũng có thể liên hệ trực tiếp với chúng tôi qua các thông tin dưới đây.
              </p>
            </div>

            <div className="space-y-8">
              {/* Office Address */}
              <div>
                <h3 className="text-lg text-black mb-3">Văn phòng</h3>
                <p className="text-gray-700 leading-relaxed">
                  123 Đường chính, Quận 1<br />
                  Thành phố Hồ Chí Minh<br />
                  Việt Nam
                </p>
              </div>

              {/* Phone */}
              <div>
                <h3 className="text-lg text-black mb-3">Điện thoại</h3>
                <p className="text-gray-700">+84 123 456 789</p>
                <p className="text-sm text-gray-500 mt-1">Thứ 2 - Thứ 6: 9:00 - 18:00</p>
              </div>

              {/* Email */}
              <div>
                <h3 className="text-lg text-black mb-3">Email</h3>
                <p className="text-gray-700">support@gundamstore.com</p>
                <p className="text-sm text-gray-500 mt-1">Chúng tôi sẽ phản hồi trong vòng 24 giờ</p>
              </div>

              {/* Working Hours */}
              <div className="bg-gray-50 rounded-xl p-6 mt-8">
                <h3 className="text-lg text-black mb-4">Giờ làm việc</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-700">
                    <span>Thứ Hai - Thứ Sáu</span>
                    <span className="font-medium">09:00 - 18:00</span>
                  </div>
                  <div className="w-full h-px bg-gray-200"></div>
                  <div className="flex justify-between text-gray-700">
                    <span>Thứ Bảy</span>
                    <span className="font-medium">10:00 - 16:00</span>
                  </div>
                  <div className="w-full h-px bg-gray-200"></div>
                  <div className="flex justify-between text-gray-700">
                    <span>Chủ Nhật</span>
                    <span className="font-medium">Đóng cửa</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full-Width Map Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl text-black mb-3">Vị trí cửa hàng</h2>
            <p className="text-gray-600">Ghé thăm showroom của chúng tôi</p>
          </div>

          <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-200 h-[500px] md:h-[600px]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4609562155475!2d106.69531731533417!3d10.776889192320955!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f38f9ed887b%3A0x14aded310a2f4e3!2zMTIzIMSQLiBOZ3V54buFbiBUaMOqIE1pbmcgS2hhaSwgUGjGsOG7nW5nIELhur9uIE5naMOoLCBRdeG6rW4gMSwgVGjDoG5oIHBo4buRIEjhu5MgQ2jDrSBNaW5oLCBWaeG7h3QgTmFt!5e0!3m2!1svi!2s!4v1234567890123!5m2!1svi!2s"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Vị trí GUNDAM STORE"
              className="hover:opacity-95 transition-opacity duration-300"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};