const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  minimumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat('vi-VN');

/** Format giá tiền VND có ký hiệu ₫ — ví dụ: 100.000.000 ₫ */
export const formatPrice = (price: number): string => currencyFormatter.format(price);

/** Alias cho formatPrice — dùng trong các trang dùng tên formatCurrency */
export const formatCurrency = formatPrice;

/** Format số có dấu chấm phân cách, không ký hiệu tiền — ví dụ: 100.000.000 */
export const formatPriceNumber = (price: number): string => numberFormatter.format(price);
