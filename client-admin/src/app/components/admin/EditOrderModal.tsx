import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { Order, OrderStatus } from '../../data/orders';

interface EditOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onSave: (updatedOrder: Partial<Order>) => void;
}

export const EditOrderModal: React.FC<EditOrderModalProps> = ({
  isOpen,
  onClose,
  order,
  onSave,
}) => {
  const [orderStatus, setOrderStatus] = useState<OrderStatus>(order.orderStatus);
  const [shippingAddress, setShippingAddress] = useState(
    `${order.shippingAddress.street}, ${order.shippingAddress.ward}, ${order.shippingAddress.district}, ${order.shippingAddress.city}`
  );
  const [items, setItems] = useState(order.items.map(item => ({ ...item })));

  if (!isOpen) return null;

  const handleQuantityChange = (index: number, newQuantity: number) => {
    const updatedItems = [...items];
    if (newQuantity > 0) {
      updatedItems[index].quantity = newQuantity;
      setItems(updatedItems);
    }
  };

  const handleSave = () => {
    onSave({
      orderStatus,
      items,
      // You can add shipping address parsing logic here if needed
    });
    onClose();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div
          className="bg-white rounded-lg max-w-3xl w-full my-8 relative border border-primary/30"
          style={{
            boxShadow: '0 4px 20px rgba(220, 20, 60, 0.15), 0 0 40px rgba(220, 20, 60, 0.1), 0 0 60px rgba(220, 20, 60, 0.05)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-black">
              Chỉnh sửa Đơn hàng {order.orderNumber}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            {/* Status Dropdown */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Trạng thái
              </label>
              <select
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value as OrderStatus)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-gray-900"
              >
                <option value="processing">Đang xử lý</option>
                <option value="shipped">Đang vận chuyển</option>
                <option value="delivered">Giao thành công</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>

            {/* Shipping Address */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Thông tin vận chuyển
              </label>
              <textarea
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none text-gray-900"
                placeholder="Nhập địa chỉ giao hàng..."
              />
            </div>

            {/* Items Table */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Sản phẩm trong đơn
              </label>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Sản phẩm
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Đơn giá
                      </th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Số lượng
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Thành tiền
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {items.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="w-12 h-12 object-cover rounded border border-gray-200"
                            />
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">
                                {item.productName}
                              </p>
                              <p className="text-xs text-gray-500">SKU: {item.productId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right text-sm text-gray-900">
                          {formatCurrency(item.price)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleQuantityChange(index, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 1)}
                              className="w-16 text-center border border-gray-300 rounded py-1 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                              min="1"
                            />
                            <button
                              onClick={() => handleQuantityChange(index, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-gray-900">
                          {formatCurrency(item.price * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={3} className="py-3 px-4 text-right font-bold text-gray-900">
                        Tổng cộng:
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-primary text-lg">
                        {formatCurrency(calculateSubtotal())}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Lưu thay đổi
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
