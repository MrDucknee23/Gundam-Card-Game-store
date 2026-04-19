import React from 'react';

export const ShippingPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-black text-white py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold">Chinh sach van chuyen</h1>
          <p className="text-gray-300 mt-3 text-lg">Thong tin giao hang cho don mo hinh, phu kien va the bai.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">
        <section>
          <h2 className="text-2xl font-bold text-black mb-3">1. Khu vuc giao hang</h2>
          <p className="text-gray-700 leading-relaxed">
            Gundam Store giao hang toan quoc thong qua doi tac van chuyen noi dia. Don hang noi thanh
            duoc uu tien giao nhanh trong ngay hoac ngay tiep theo.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-black mb-3">2. Thoi gian giao du kien</h2>
          <ul className="list-disc pl-5 text-gray-700 space-y-2 leading-relaxed">
            <li>Noi thanh HCM: 1-2 ngay lam viec.</li>
            <li>Cac tinh mien Nam: 2-4 ngay lam viec.</li>
            <li>Mien Trung va mien Bac: 3-6 ngay lam viec.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-black mb-3">3. Phi van chuyen</h2>
          <p className="text-gray-700 leading-relaxed">
            Phi ship duoc tinh theo khoi luong va khu vuc nhan. He thong se hien thi chi phi cuoi cung
            truoc khi ban xac nhan dat hang.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-black mb-3">4. Dong goi an toan</h2>
          <p className="text-gray-700 leading-relaxed">
            Tat ca don mo hinh va the bai deu duoc dong goi xop chong soc, hop carton 2 lop,
            kem nhan canh bao hang de vo de han che toi da hu hong khi van chuyen.
          </p>
        </section>
      </div>
    </div>
  );
};
