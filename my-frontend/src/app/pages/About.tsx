import React from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { CheckCircle2, Shield, Heart, Sparkles } from 'lucide-react';

export const About: React.FC = () => {
  const hero = useScrollAnimation(0.1);
  const story = useScrollAnimation(0.1);
  const values1 = useScrollAnimation(0.1);
  const values2 = useScrollAnimation(0.1);
  const values3 = useScrollAnimation(0.1);
  const values4 = useScrollAnimation(0.1);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div 
        ref={hero.ref}
        className={`relative h-[70vh] flex items-center justify-center overflow-hidden transition-all duration-1000 ${
          hero.isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Background with gradient overlay */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1705393928685-4dec061491dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxndW5kYW0lMjByb2JvdCUyMG1vZGVsfGVufDF8fHx8MTc3NTAyOTY0NHww&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Gundam Store"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white">
          <h1 
            className={`text-5xl md:text-7xl mb-6 transition-all duration-1000 delay-200 ${
              hero.isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            Về chúng tôi
          </h1>
          <p 
            className={`text-xl md:text-2xl text-gray-200 transition-all duration-1000 delay-400 ${
              hero.isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            Nơi đam mê gặp gỡ chất lượng
          </p>
        </div>
      </div>

      {/* Brand Story Section */}
      <div 
        ref={story.ref}
        className={`max-w-7xl mx-auto px-6 py-24 transition-all duration-1000 ${
          story.isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
        }`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl text-black">
              Câu chuyện của chúng tôi
            </h2>
            <div className="w-20 h-1 bg-primary"></div>
            <p className="text-lg text-gray-700 leading-relaxed">
              Được thành lập vào năm 2020, GUNDAM STORE bắt đầu từ niềm đam mê với mô hình Gundam 
              và thẻ bài sưu tầm. Chúng tôi hiểu rằng mỗi sản phẩm không chỉ là một món đồ, 
              mà là một phần trong hành trình sưu tầm của bạn.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Với sứ mệnh mang đến những sản phẩm chính hãng, chất lượng cao và dịch vụ khách hàng 
              xuất sắc, chúng tôi đã phục vụ hàng ngàn khách hàng trên toàn quốc. Mỗi sản phẩm 
              đều được chọn lọc kỹ càng để đảm bảo sự hài lòng tuyệt đối.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Chúng tôi không chỉ bán sản phẩm - chúng tôi xây dựng cộng đồng những người yêu 
              thích Gundam và TCG, nơi mọi người có thể chia sẻ niềm đam mê chung.
            </p>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1612126887536-3d6993d0924e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB3b3Jrc3BhY2UlMjBzdG9yZXxlbnwxfHx8fDE3NzUwMjk2NDd8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Our Store"
                className="w-full h-[500px] object-cover"
              />
            </div>
            {/* Decorative element */}
            <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-secondary/10 rounded-2xl -z-10"></div>
          </div>
        </div>
      </div>

      {/* Core Values Section */}
      <div className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl text-black mb-4">
              Giá Trị Cốt Lõi
            </h2>
            <div className="w-20 h-1 bg-primary mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Value 1 - Quality First */}
            <div 
              ref={values1.ref}
              className={`bg-white rounded-2xl p-12 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] ${
                values1.isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
            >
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl text-black mb-4">
                Chất lượng đặt lên hàng đầu
              </h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Chúng tôi cung cấp mô hình Gundam và thẻ bài sưu tầm chính hãng, chất lượng cao. 
                Mỗi sản phẩm đều được kiểm định kỹ lưỡng trước khi đến tay bạn.
              </p>
            </div>

            {/* Value 2 - Trusted Source */}
            <div 
              ref={values2.ref}
              className={`bg-white rounded-2xl p-12 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] delay-100 ${
                values2.isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
            >
              <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-2xl text-black mb-4">
                Nguồn hàng đáng tin cậy
              </h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Tất cả sản phẩm được tuyển chọn cẩn thận từ các nhà cung cấp uy tín. 
                Cam kết 100% hàng chính hãng, xuất xứ rõ ràng.
              </p>
            </div>

            {/* Value 3 - Passion for Community */}
            <div 
              ref={values3.ref}
              className={`bg-white rounded-2xl p-12 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] delay-200 ${
                values3.isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
            >
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl text-black mb-4">
                Đam mê cộng đồng
              </h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Kết nối các nhà sưu tầm và người đam mê với nhau. 
                Tạo nên một cộng đồng sôi động, nơi mọi người chia sẻ niềm đam mê chung.
              </p>
            </div>

            {/* Value 4 - Customer Experience */}
            <div 
              ref={values4.ref}
              className={`bg-white rounded-2xl p-12 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] delay-300 ${
                values4.isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
            >
              <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-2xl text-black mb-4">
                Trải nghiệm khách hàng
              </h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Mang đến trải nghiệm mua sắm mượt mà và dịch vụ hỗ trợ tận tâm. 
                Sự hài lòng của bạn là ưu tiên hàng đầu của chúng tôi.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};