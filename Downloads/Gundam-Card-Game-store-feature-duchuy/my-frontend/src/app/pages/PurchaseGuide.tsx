import React from 'react';

export const PurchaseGuide: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-black text-white py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold">Huong dan mua hang</h1>
          <p className="text-gray-300 mt-3 text-lg">Quy trinh dat hang nhanh va an toan tai Gundam Store.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
        <div className="rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-black mb-2">Buoc 1: Tim va loc san pham</h2>
          <p className="text-gray-700 leading-relaxed">
            Su dung thanh tim kiem hoac bo loc theo danh muc, cap do, do hiem va khoang gia de tim dung
            mau mo hinh hoac the bai mong muon.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-black mb-2">Buoc 2: Them vao gio hang</h2>
          <p className="text-gray-700 leading-relaxed">
            Kiem tra thong tin san pham, so luong ton kho, sau do them vao gio hang. Ban co the danh dau
            yeu thich de luu danh sach theo doi gia.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-black mb-2">Buoc 3: Thanh toan</h2>
          <p className="text-gray-700 leading-relaxed">
            Dien thong tin nhan hang, chon phuong thuc thanh toan (COD hoac chuyen khoan), xac nhan chi phi
            van chuyen va dat hang.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-black mb-2">Buoc 4: Theo doi don</h2>
          <p className="text-gray-700 leading-relaxed">
            Theo doi trang thai don trong muc Don hang cua toi. Neu can ho tro, lien he bo phan cham soc
            khach hang de duoc xu ly nhanh.
          </p>
        </div>
      </div>
    </div>
  );
};
