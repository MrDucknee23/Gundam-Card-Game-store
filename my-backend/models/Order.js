    const mongoose = require('mongoose');

    const OrderSchema = new mongoose.Schema({
    orderCode: { type: String, required: true, unique: true }, // Mã đơn hàng để tìm kiếm
    customer: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: String,
        address: String,
    },
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        price: Number,
        quantity: Number
    }],
    subtotal: Number,
    shippingFee: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paymentStatus: { 
        type: String, 
        enum: ['Chưa thanh toán', 'Đã thanh toán', 'Đã hoàn tiền'], 
        default: 'Chưa thanh toán' 
    },
    orderStatus: { 
        type: String, 
        enum: ['Đang xử lý', 'Đã gửi hàng', 'Đã giao hàng', 'Đã hủy'], 
        default: 'Đang xử lý' 
    },
    shippingMethod: { type: String, default: 'Giao hàng nhanh' },
    internalNotes: { type: String, default: "" }, // Chỉ Admin thấy
    history: [{ // Dữ liệu cho component Timeline trực quan
        status: String,
        updatedAt: { type: Date, default: Date.now },
        note: String
    }]
    }, { timestamps: true });

    module.exports = mongoose.model('Order', OrderSchema);