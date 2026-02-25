const { DataTypes } = require('sequelize');
const sequelize = require('../db/db-connection');

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    orderNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: 'order_number'
    },
    razorpayOrderId: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'razorpay_order_id'
    },
    razorpayPaymentId: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'razorpay_payment_id'
    },
    // UPI Transaction Reference (UTR) from PSP webhook
    utr: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'utr',
        comment: 'UPI Transaction Reference from PSP webhook'
    },
    // Merchant VPA that received the payment
    merchantVpa: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'merchant_vpa',
        comment: 'Merchant VPA that received the payment'
    },
    // Customer VPA who sent the payment
    customerVpa: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'customer_vpa',
        comment: 'Customer VPA who sent the payment'
    },
    // Webhook verification status
    webhookVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'webhook_verified',
        comment: 'Whether payment was verified via PSP webhook'
    },
    // Raw webhook data for audit
    webhookData: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'webhook_data',
        comment: 'Raw webhook payload from PSP'
    },
    customerEmail: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'customer_email'
    },
    customerName: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'customer_name'
    },
    customerPhone: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'customer_phone'
    },
    shippingAddress: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'shipping_address'
    },
    items: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: 'Array of {productId, name, price, quantity, image}'
    },
    subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'verifying', 'paid', 'completed', 'cancelled', 'failed', 'refunded'),
        defaultValue: 'pending'
    }
}, {
    tableName: 'orders',
    timestamps: true
});

module.exports = { Order };
