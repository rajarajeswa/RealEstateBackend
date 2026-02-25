const Razorpay = require('razorpay');
const crypto = require('crypto');
const { Order } = require('../model/Order');
const { Premix } = require('../model/premix');
const { generateInvoicePDF } = require('../services/invoiceService');
const { sendInvoiceEmail, sendPaymentConfirmationEmail } = require('../services/emailService');

// Initialize Razorpay
const getRazorpayInstance = () => {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!keyId || !keySecret || keyId === 'rzp_test_your_key_id_here') {
        return null;
    }
    
    return new Razorpay({
        key_id: keyId,
        key_secret: keySecret
    });
};

/**
 * Create a Razorpay order
 * POST /api/payment/razorpay/create-order
 */
const createRazorpayOrder = async (req, res) => {
    try {
        const razorpay = getRazorpayInstance();
        
        if (!razorpay) {
            return res.status(400).json({
                success: false,
                message: 'Razorpay is not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env'
            });
        }

        const { amount, customerEmail, customerName, customerPhone, shippingAddress, items } = req.body;
        const userEmail = req.user.email;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid amount is required'
            });
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one item is required'
            });
        }

        // Create Razorpay order
        const orderNumber = 'KS' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
        
        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(amount * 100), // Razorpay expects amount in paise
            currency: 'INR',
            receipt: orderNumber,
            notes: {
                customerEmail: customerEmail || userEmail,
                customerName: customerName || '',
                orderNumber: orderNumber
            }
        });

        // Create pending order in database
        const order = await Order.create({
            orderNumber,
            razorpayOrderId: razorpayOrder.id,
            customerEmail: (customerEmail || userEmail).trim(),
            customerName: customerName?.trim() || null,
            customerPhone: customerPhone?.trim() || null,
            shippingAddress: shippingAddress?.trim() || null,
            items,
            subtotal: amount,
            status: 'pending'
        });

        return res.status(200).json({
            success: true,
            order: {
                id: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                receipt: razorpayOrder.receipt,
                key_id: process.env.RAZORPAY_KEY_ID,
                orderNumber: orderNumber,
                customerEmail: customerEmail || userEmail,
                customerName: customerName || ''
            }
        });

    } catch (error) {
        console.error('Create Razorpay order error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create payment order',
            error: error.message
        });
    }
};

/**
 * Verify Razorpay payment
 * POST /api/payment/razorpay/verify
 */
const verifyRazorpayPayment = async (req, res) => {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature,
            orderNumber 
        } = req.body;

        // Verify signature
        const keySecret = process.env.RAZORPAY_KEY_SECRET;
        const expectedSignature = crypto
            .createHmac('sha256', keySecret)
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment signature'
            });
        }

        // Find and update order
        const order = await Order.findOne({ 
            where: { 
                orderNumber,
                razorpayOrderId: razorpay_order_id 
            } 
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        if (order.status === 'paid') {
            return res.status(200).json({
                success: true,
                message: 'Payment already verified',
                order: {
                    orderNumber: order.orderNumber,
                    status: 'paid'
                }
            });
        }

        // Update order status
        await order.update({
            status: 'paid',
            razorpayPaymentId: razorpay_payment_id,
            webhookVerified: true
        });

        // Decrement product quantities
        for (const item of order.items) {
            if (item.productId) {
                try {
                    await Premix.decrement('quantity', {
                        by: parseInt(item.quantity) || 1,
                        where: { id: item.productId }
                    });
                } catch (err) {
                    console.error('Failed to decrement stock:', err.message);
                }
            }
        }

        // Generate and send invoice
        try {
            const pdfBuffer = await generateInvoicePDF({
                orderNumber: order.orderNumber,
                customerName: order.customerName,
                customerEmail: order.customerEmail,
                shippingAddress: order.shippingAddress,
                items: order.items,
                subtotal: order.subtotal,
                createdAt: order.createdAt,
                paymentMethod: 'Razorpay',
                razorpayPaymentId
            });

            await sendInvoiceEmail(order.customerEmail, order.customerName, order.orderNumber, pdfBuffer);
            await sendPaymentConfirmationEmail(order.customerEmail, order.customerName, order.orderNumber, 'paid');
        } catch (emailError) {
            console.error('Failed to send invoice:', emailError.message);
        }

        return res.status(200).json({
            success: true,
            message: 'Payment verified successfully',
            order: {
                orderNumber: order.orderNumber,
                status: 'paid',
                amount: order.subtotal
            }
        });

    } catch (error) {
        console.error('Verify Razorpay payment error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to verify payment',
            error: error.message
        });
    }
};

/**
 * Razorpay Webhook Handler
 * POST /api/payment/razorpay/webhook
 */
const handleRazorpayWebhook = async (req, res) => {
    try {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const signature = req.headers['x-razorpay-signature'];

        // Verify webhook signature
        if (webhookSecret && webhookSecret !== 'your_webhook_secret_here') {
            const expectedSignature = crypto
                .createHmac('sha256', webhookSecret)
                .update(JSON.stringify(req.body))
                .digest('hex');

            if (signature !== expectedSignature) {
                console.error('[Razorpay Webhook] Invalid signature');
                return res.status(400).json({
                    success: false,
                    message: 'Invalid webhook signature'
                });
            }
        }

        const event = req.body;
        console.log('[Razorpay Webhook] Event:', event.event);

        // Handle payment captured event
        if (event.event === 'payment.captured') {
            const payment = event.payload.payment.entity;
            const orderId = payment.order_id;

            // Find order by Razorpay order ID
            const order = await Order.findOne({ 
                where: { razorpayOrderId: orderId } 
            });

            if (!order) {
                console.error('[Razorpay Webhook] Order not found for order_id:', orderId);
                return res.status(200).json({ success: true }); // Acknowledge webhook
            }

            if (order.status === 'paid') {
                console.log('[Razorpay Webhook] Order already paid:', order.orderNumber);
                return res.status(200).json({ success: true });
            }

            // Update order
            await order.update({
                status: 'paid',
                razorpayPaymentId: payment.id,
                webhookVerified: true,
                webhookData: event
            });

            // Decrement stock
            for (const item of order.items) {
                if (item.productId) {
                    try {
                        await Premix.decrement('quantity', {
                            by: parseInt(item.quantity) || 1,
                            where: { id: item.productId }
                        });
                    } catch (err) {
                        console.error('[Razorpay Webhook] Failed to decrement stock:', err.message);
                    }
                }
            }

            // Send invoice
            try {
                const pdfBuffer = await generateInvoicePDF({
                    orderNumber: order.orderNumber,
                    customerName: order.customerName,
                    customerEmail: order.customerEmail,
                    shippingAddress: order.shippingAddress,
                    items: order.items,
                    subtotal: order.subtotal,
                    createdAt: order.createdAt,
                    paymentMethod: 'Razorpay',
                    razorpayPaymentId: payment.id
                });

                await sendInvoiceEmail(order.customerEmail, order.customerName, order.orderNumber, pdfBuffer);
            } catch (emailError) {
                console.error('[Razorpay Webhook] Failed to send invoice:', emailError.message);
            }

            console.log('[Razorpay Webhook] Order marked as paid:', order.orderNumber);
        }

        // Handle payment failed event
        if (event.event === 'payment.failed') {
            const payment = event.payload.payment.entity;
            const orderId = payment.order_id;

            const order = await Order.findOne({ 
                where: { razorpayOrderId: orderId } 
            });

            if (order && order.status !== 'paid') {
                await order.update({
                    status: 'failed',
                    webhookData: event
                });

                console.log('[Razorpay Webhook] Order marked as failed:', order.orderNumber);
            }
        }

        return res.status(200).json({ success: true });

    } catch (error) {
        console.error('[Razorpay Webhook] Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Webhook processing error'
        });
    }
};

/**
 * Get Razorpay key ID for frontend
 * GET /api/payment/razorpay/key
 */
const getRazorpayKey = async (req, res) => {
    const keyId = process.env.RAZORPAY_KEY_ID;
    
    if (!keyId || keyId === 'rzp_test_your_key_id_here') {
        return res.status(400).json({
            success: false,
            message: 'Razorpay is not configured'
        });
    }

    return res.status(200).json({
        success: true,
        key_id: keyId
    });
};

module.exports = {
    createRazorpayOrder,
    verifyRazorpayPayment,
    handleRazorpayWebhook,
    getRazorpayKey
};
