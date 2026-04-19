import React from 'react';

export const TermsOfUse: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-black text-white py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold">Dieu khoan su dung</h1>
          <p className="text-gray-300 mt-3 text-lg">Quy dinh va dieu kien khi su dung nen tang Gundam Store.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-black mb-2">1. Chap nhan dieu khoan</h2>
          <p className="text-gray-700 leading-relaxed">
            Khi truy cap va dat hang tren website, ban dong y voi cac dieu khoan su dung va chinh sach hien hanh.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-black mb-2">2. Tai khoan nguoi dung</h2>
          <p className="text-gray-700 leading-relaxed">
            Ban co trach nhiem bao mat thong tin dang nhap. Moi hoat dong phat sinh tu tai khoan duoc xem la
            do chu tai khoan thuc hien.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-black mb-2">3. Gia ca va ton kho</h2>
          <p className="text-gray-700 leading-relaxed">
            Gia san pham va ton kho co the thay doi theo thoi diem. Chung toi co quyen cap nhat thong tin
            de dam bao tinh chinh xac cua don hang.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-black mb-2">4. Quyen so huu noi dung</h2>
          <p className="text-gray-700 leading-relaxed">
            Toan bo noi dung, hinh anh va bo cuc tren website thuoc quyen so huu cua Gundam Store hoac doi tac
            duoc cap phep. Khong sao chep trai phep duoi moi hinh thuc.
          </p>
        </section>
      </div>
    </div>
  );
};
