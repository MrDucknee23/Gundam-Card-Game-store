import React from 'react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-black text-white py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold">Chinh sach bao mat</h1>
          <p className="text-gray-300 mt-3 text-lg">Cam ket bao ve thong tin ca nhan va du lieu giao dich cua khach hang.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-black mb-2">1. Du lieu thu thap</h2>
          <p className="text-gray-700 leading-relaxed">
            Chung toi thu thap thong tin co ban nhu ho ten, email, so dien thoai, dia chi giao hang de xu ly
            don hang va cham soc khach hang.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-black mb-2">2. Muc dich su dung</h2>
          <ul className="list-disc pl-5 text-gray-700 space-y-2 leading-relaxed">
            <li>Xac nhan va giao don hang.</li>
            <li>Thong bao cap nhat trang thai don.</li>
            <li>Ho tro sau ban va giai quyet khiieu nai.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-black mb-2">3. Bao mat thong tin</h2>
          <p className="text-gray-700 leading-relaxed">
            Du lieu duoc bao ve boi cac bien phap ky thuat va quy trinh noi bo. Chung toi khong ban thong tin
            ca nhan cua khach hang cho ben thu ba.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-black mb-2">4. Lien he ve bao mat</h2>
          <p className="text-gray-700 leading-relaxed">
            Moi yeu cau lien quan den quyen rieng tu, vui long lien he: support@gundamstore.com.
          </p>
        </section>
      </div>
    </div>
  );
};
