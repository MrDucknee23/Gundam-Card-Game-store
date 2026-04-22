import type { OrderStatus, PaymentStatus } from '../../data/orders';

interface StatusBadgeProps {
  status: OrderStatus | PaymentStatus;
  type: 'order' | 'payment';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type }) => {
  const getStyles = () => {
    if (type === 'order') {
      const orderStatus = status as OrderStatus;
      switch (orderStatus) {
        case 'processing':
          return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'shipped':
          return 'bg-purple-100 text-purple-800 border-purple-200';
        case 'delivered':
          return 'bg-green-100 text-green-800 border-green-200';
        case 'cancelled':
          return 'bg-red-100 text-red-800 border-red-200';
        default:
          return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    } else {
      const paymentStatus = status as PaymentStatus;
      switch (paymentStatus) {
        case 'paid':
          return 'bg-green-100 text-green-800 border-green-200';
        case 'pending':
          return 'bg-orange-100 text-orange-800 border-orange-200';
        case 'failed':
          return 'bg-red-100 text-red-800 border-red-200';
        default:
          return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    }
  };

  const getLabel = () => {
    if (type === 'order') {
      const orderStatus = status as OrderStatus;
      const labels: Record<OrderStatus, string> = {
        processing: 'Đang xử lý',
        shipped: 'Đã gửi hàng',
        delivered: 'Đã giao hàng',
        cancelled: 'Đã hủy'
      };
      return labels[orderStatus];
    } else {
      const paymentStatus = status as PaymentStatus;
      const labels: Record<PaymentStatus, string> = {
        paid: 'Đã thanh toán',
        pending: 'Chờ thanh toán',
        failed: 'Thất bại'
      };
      return labels[paymentStatus];
    }
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStyles()}`}
    >
      {getLabel()}
    </span>
  );
};
