import React from 'react';

export const ReturnPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-black text-white py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold">Chinh sach doi tra</h1>
          <p className="text-gray-300 mt-3 text-lg">Ap dung cho mo hinh Gundam va the bai suu tam tai Gundam Store.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">
        <section>
          <h2 className="text-2xl font-bold text-black mb-3">1. Dieu kien doi tra</h2>
          <ul className="list-disc pl-5 text-gray-700 space-y-2 leading-relaxed">
            <li>San pham con nguyen hop, day du phu kien, tem niem phong va hoa don mua hang.</li>
            <li>Thoi gian yeu cau doi tra trong vong 7 ngay ke tu ngay nhan hang.</li>
            <li>Khong ap dung doi tra voi san pham da lap rap, bi hu hong do nguoi dung.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-black mb-3">2. Truong hop duoc ho tro</h2>
          <ul className="list-disc pl-5 text-gray-700 space-y-2 leading-relaxed">
            <li>San pham loi nha san xuat, thieu chi tiet trong hop.</li>
            <li>Giao sai mau, sai phien ban, sai don hang.</li>
            <li>San pham hu hong do van chuyen (co video mo hop trong 24 gio dau).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-black mb-3">3. Quy trinh doi tra</h2>
          <div className="grid gap-3 text-gray-700 leading-relaxed">
            <p>Buoc 1: Lien he ho tro qua email support@gundamstore.com hoac hotline +84 123 456 789.</p>
            <p>Buoc 2: Cung cap ma don, hinh anh loi va video mo hop (neu co).</p>
            <p>Buoc 3: Nhan huong dan gui hang ve kho va xac nhan xu ly trong 2-4 ngay lam viec.</p>
            <p>Buoc 4: Hoan tien hoac doi san pham moi tuy theo ket qua kiem tra.</p>
          </div>
        </section>
      </div>
    </div>
  );
};
