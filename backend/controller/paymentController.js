const { Order } = require('../model/Order');
const { Premix } = require('../model/premix');
const { generateInvoicePDF } = require('../services/invoiceService');
const { sendInvoiceEmail, sendOrderNotificationToAdmin, sendPaymentConfirmationEmail } = require('../services/emailService');
const { Sequelize } = require('sequelize');
const crypto = require('crypto');

/**
 * Verify webhook signature from PSP
 * @param {string} payload - Raw request body as string
 * @param {string} signature - Signature from PSP header
 * @param {string} secret - Webhook secret from env
 * @returns {boolean}
 */
const verifyWebhookSignature = (payload, signature, secret) => {
    if (!signature || !secret) {
        return false;
    }
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
    return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
    );
};

/**
 * UPI Webhook Handler - Receives payment notifications from PSP
 * POST /api/payment/webhook/upi
 * 
 * Expected payload format (generic PSP format):
 * {
 *   "utr": "123456789012",           // UPI Transaction Reference (required)
 *   "amount": 100.00,                 // Transaction amount (required)
 *   "merchantVpa": "merchant@upi",    // Merchant VPA (required)
 *   "customerVpa": "customer@upi",    // Customer VPA (optional)
 *   "status": "SUCCESS|FAILED",       // Transaction status (required)
 *   "timestamp": "2024-01-01T00:00:00Z", // Transaction timestamp (optional)
 *   "orderNumber": "KSXXXXXX",        // Order number (optional - for matching)
 *   "referenceId": "custom_ref"       // Custom reference (optional)
 * }
 */
const handleUpiWebhook = async (req, res) => {
    const startTime = Date.now();
    let rawPayload;
    
    try {
        // Get raw body for signature verification
        rawPayload = JSON.stringify(req.body);
        const signature = req.headers['x-webhook-signature'] || req.headers['x-signature'] || '';
        
        console.log('[Webhook] Received UPI webhook:', {
            headers: req.headers,
            body: req.body,
            signature: signature ? 'present' : 'missing'
        });

        // Verify webhook signature if secret is configured
        const webhookSecret = process.env.UPI_WEBHOOK_SECRET;
        if (webhookSecret) {
            if (!verifyWebhookSignature(rawPayload, signature, webhookSecret)) {
                console.error('[Webhook] Invalid signature');
                return res.status(401).json({
                    success: false,
                    message: 'Invalid webhook signature'
                });
            }
        }

        const { 
            utr, 
            amount, 
            merchantVpa, 
            customerVpa, 
            status, 
            timestamp,
            orderNumber,
            referenceId 
        } = req.body;

        // Validate required fields
        if (!utr || !amount || !merchantVpa || !status) {
            console.error('[Webhook] Missing required fields:', { utr: !!utr, amount: !!amount, merchantVpa: !!merchantVpa, status: !!status });
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: utr, amount, merchantVpa, status'
            });
        }

        // Verify merchant VPA matches our configured VPA
        const configuredMerchantVpa = process.env.MERCHANT_UPI_ID;
        if (configuredMerchantVpa && merchantVpa.toLowerCase() !== configuredMerchantVpa.toLowerCase()) {
            console.error('[Webhook] Merchant VPA mismatch:', { received: merchantVpa, expected: configuredMerchantVpa });
            return res.status(400).json({
                success: false,
                message: 'Merchant VPA does not match'
            });
        }

        // Find order by orderNumber or UTR
        let order;
        if (orderNumber) {
            order = await Order.findOne({ where: { orderNumber } });
        }
        
        if (!order) {
            // Try to find by UTR (in case payment was already reported)
            order = await Order.findOne({ where: { utr: utr.toString() } });
        }

        if (!order) {
            // Try to find pending/verifying order with matching amount
            order = await Order.findOne({
                where: {
                    subtotal: parseFloat(amount),
                    status: ['pending', 'verifying']
                },
                order: [['createdAt', 'DESC']]
            });
        }

        if (!order) {
            console.error('[Webhook] No matching order found for webhook:', { utr, amount, orderNumber });
            // Still return 200 to acknowledge receipt, but log for manual review
            return res.status(200).json({
                success: false,
                message: 'No matching order found - requires manual review',
                utr,
                amount
            });
        }

        console.log('[Webhook] Found matching order:', { orderNumber: order.orderNumber, status: order.status });

        // Check if order is already paid
        if (order.status === 'paid' || order.status === 'completed') {
            console.log('[Webhook] Order already paid:', order.orderNumber);
            return res.status(200).json({
                success: true,
                message: 'Order already paid',
                orderNumber: order.orderNumber
            });
        }

        // Verify amount matches
        if (Math.abs(parseFloat(order.subtotal) - parseFloat(amount)) > 0.01) {
            console.error('[Webhook] Amount mismatch:', { orderAmount: order.subtotal, paidAmount: amount });
            // Store webhook data but don't mark as paid
            await order.update({
                webhookData: req.body,
                utr: utr.toString(),
                merchantVpa,
                customerVpa
            });
            return res.status(200).json({
                success: false,
                message: 'Amount mismatch - requires manual verification',
                orderNumber: order.orderNumber,
                expectedAmount: order.subtotal,
                receivedAmount: amount
            });
        }

        // Process based on transaction status
        if (status.toUpperCase() === 'SUCCESS') {
            // Mark order as paid
            await order.update({
                status: 'paid',
                utr: utr.toString(),
                merchantVpa,
                customerVpa,
                razorpayPaymentId: `UPI_${utr}`,
                webhookVerified: true,
                webhookData: req.body
            });

            // Decrement product quantities if not already done
            for (const item of order.items) {
                if (item.productId) {
                    try {
                        await Premix.decrement('quantity', {
                            by: parseInt(item.quantity) || 1,
                            where: { id: item.productId }
                        });
                    } catch (err) {
                        console.error('[Webhook] Failed to decrement stock for product:', item.productId, err.message);
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
                    paymentMethod: 'UPI',
                    merchantUpiId: merchantVpa,
                    customerUpiId: customerVpa,
                    utr: utr.toString()
                });

                await sendInvoiceEmail(order.customerEmail, order.customerName, order.orderNumber, pdfBuffer);
                await sendPaymentConfirmationEmail(order.customerEmail, order.customerName, order.orderNumber, 'paid');
                console.log('[Webhook] Invoice sent to customer:', order.customerEmail);
            } catch (emailError) {
                console.error('[Webhook] Failed to send invoice email:', emailError.message);
                // Don't fail the webhook for email errors
            }

            console.log('[Webhook] Order marked as paid:', order.orderNumber, 'UTR:', utr);
            
            return res.status(200).json({
                success: true,
                message: 'Payment verified and order confirmed',
                orderNumber: order.orderNumber,
                utr,
                status: 'paid'
            });

        } else if (status.toUpperCase() === 'FAILED' || status.toUpperCase() === 'CANCELLED') {
            // Mark order as failed
            await order.update({
                status: 'failed',
                utr: utr.toString(),
                merchantVpa,
                customerVpa,
                webhookData: req.body
            });

            // Restore product quantities if they were decremented
            for (const item of order.items) {
                if (item.productId) {
                    try {
                        await Premix.increment('quantity', {
                            by: parseInt(item.quantity) || 1,
                            where: { id: item.productId }
                        });
                    } catch (err) {
                        console.error('[Webhook] Failed to restore stock for product:', item.productId, err.message);
                    }
                }
            }

            // Notify customer of failed payment
            try {
                await sendPaymentConfirmationEmail(order.customerEmail, order.customerName, order.orderNumber, 'failed');
            } catch (emailError) {
                console.error('[Webhook] Failed to send failure notification:', emailError.message);
            }

            console.log('[Webhook] Order marked as failed:', order.orderNumber);
            
            return res.status(200).json({
                success: true,
                message: 'Payment failed - order updated',
                orderNumber: order.orderNumber,
                status: 'failed'
            });

        } else {
            console.error('[Webhook] Unknown status:', status);
            return res.status(400).json({
                success: false,
                message: 'Unknown transaction status',
                status
            });
        }

    } catch (error) {
        console.error('[Webhook] Error processing webhook:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error processing webhook',
            error: error.message
        });
    }
};

/**
 * Manual UTR verification endpoint (for admin or manual verification)
 * POST /api/payment/verify-utr
 * Body: { orderNumber, utr, amount, merchantVpa? }
 */
const verifyUtrManually = async (req, res) => {
    try {
        const { orderNumber, utr, amount, merchantVpa } = req.body;

        if (!orderNumber || !utr) {
            return res.status(400).json({
                success: false,
                message: 'Order number and UTR are required'
            });
        }

        const order = await Order.findOne({ where: { orderNumber } });
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        if (order.status === 'paid' || order.status === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Order is already paid'
            });
        }

        // Verify amount if provided
        if (amount && Math.abs(parseFloat(order.subtotal) - parseFloat(amount)) > 0.01) {
            return res.status(400).json({
                success: false,
                message: 'Amount mismatch',
                expectedAmount: order.subtotal,
                providedAmount: amount
            });
        }

        // Update order with UTR and mark as paid
        await order.update({
            status: 'paid',
            utr: utr.toString(),
            merchantVpa: merchantVpa || process.env.MERCHANT_UPI_ID,
            razorpayPaymentId: `UPI_${utr}`,
            webhookVerified: false // Manual verification, not from webhook
        });

        // Decrement product quantities
        for (const item of order.items) {
            if (item.productId) {
                await Premix.decrement('quantity', {
                    by: parseInt(item.quantity) || 1,
                    where: { id: item.productId }
                });
            }
        }

        // Generate and send invoice
        const pdfBuffer = await generateInvoicePDF({
            orderNumber: order.orderNumber,
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            shippingAddress: order.shippingAddress,
            items: order.items,
            subtotal: order.subtotal,
            createdAt: order.createdAt,
            paymentMethod: 'UPI',
            merchantUpiId: merchantVpa || process.env.MERCHANT_UPI_ID,
            utr: utr.toString()
        });

        await sendInvoiceEmail(order.customerEmail, order.customerName, order.orderNumber, pdfBuffer);
        await sendPaymentConfirmationEmail(order.customerEmail, order.customerName, order.orderNumber, 'paid');

        return res.status(200).json({
            success: true,
            message: 'UTR verified and order confirmed',
            order: {
                orderNumber: order.orderNumber,
                status: 'paid',
                utr
            }
        });

    } catch (error) {
        console.error('Manual UTR verification error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to verify UTR',
            error: error.message
        });
    }
};

// Generate unique order number
const generateOrderNumber = () => {
    return 'KS' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
};

/**
 * Create a pending order (before payment verification)
 * POST /api/payment/create-pending
 * Body: { customerEmail, customerName?, customerPhone?, shippingAddress?, items }
 */
const createPendingOrder = async (req, res) => {
    try {
        const { customerEmail: formEmail, customerName, customerPhone, shippingAddress, items } = req.body;
        const userEmail = req.user.email;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one item is required'
            });
        }

        const customerEmail = formEmail?.trim() || userEmail;
        const subtotal = items.reduce((sum, item) => {
            return sum + (parseFloat(item.price) * parseInt(item.quantity || 1));
        }, 0);

        const orderNumber = generateOrderNumber();

        // Create order with PENDING status
        const order = await Order.create({
            orderNumber,
            razorpayOrderId: `PENDING_${orderNumber}`,
            razorpayPaymentId: null,
            customerEmail: customerEmail.trim(),
            customerName: customerName?.trim() || null,
            customerPhone: customerPhone?.trim() || null,
            shippingAddress: shippingAddress?.trim() || null,
            items,
            subtotal,
            status: 'pending' // Order is pending until payment is verified
        });

        // Send notification to admin about new pending order
        const orderForAdmin = { 
            orderNumber, 
            customerEmail, 
            customerName: customerName?.trim() || null, 
            customerPhone: customerPhone?.trim() || null, 
            shippingAddress: shippingAddress?.trim() || null, 
            items, 
            subtotal,
            paymentMethod: 'UPI',
            status: 'pending'
        };
        await sendOrderNotificationToAdmin(orderForAdmin, null);

        return res.status(201).json({
            success: true,
            message: 'Order created. Please complete payment to confirm.',
            order: {
                id: order.id,
                orderNumber,
                subtotal,
                status: 'pending',
                customerEmail
            }
        });
    } catch (error) {
        console.error('Create pending order error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create order',
            error: error.message
        });
    }
};

/**
 * Confirm payment after user makes UPI payment
 * POST /api/payment/confirm-payment
 * Body: { orderNumber, upiTransactionId?, paymentScreenshot? }
 */
const confirmPayment = async (req, res) => {
    try {
        const { orderNumber, upiTransactionId } = req.body;
        const userEmail = req.user.email;

        const order = await Order.findOne({ where: { orderNumber } });
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Verify the order belongs to the user
        if (order.customerEmail !== userEmail) {
            return res.status(403).json({
                success: false,
                message: 'This order does not belong to you'
            });
        }

        if (order.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Order is already ${order.status}`
            });
        }

        // Update order with payment info but keep as 'verifying'
        await order.update({
            razorpayPaymentId: upiTransactionId ? `UPI_${upiTransactionId}` : `MANUAL_${Date.now()}`,
            status: 'verifying' // Admin needs to verify
        });

        // Decrement product quantities
        for (const item of order.items) {
            if (item.productId) {
                await Premix.decrement('quantity', {
                    by: parseInt(item.quantity) || 1,
                    where: { id: item.productId }
                });
            }
        }

        // Generate invoice PDF
        const pdfBuffer = await generateInvoicePDF({
            orderNumber,
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            shippingAddress: order.shippingAddress,
            items: order.items,
            subtotal: order.subtotal,
            createdAt: order.createdAt,
            paymentMethod: 'UPI',
            merchantUpiId: process.env.MERCHANT_UPI_ID || 'karasaaram@paytm',
            customerUpiId: upiTransactionId
        });

        // Send confirmation email to customer
        await sendInvoiceEmail(order.customerEmail, order.customerName, orderNumber, pdfBuffer);

        // Send notification to admin for verification
        const orderForAdmin = { 
            orderNumber, 
            customerEmail: order.customerEmail, 
            customerName: order.customerName, 
            customerPhone: order.customerPhone, 
            shippingAddress: order.shippingAddress, 
            items: order.items, 
            subtotal: order.subtotal,
            paymentMethod: 'UPI',
            upiTransactionId: upiTransactionId || 'Manual verification needed',
            status: 'verifying'
        };
        await sendOrderNotificationToAdmin(orderForAdmin, pdfBuffer);

        return res.status(200).json({
            success: true,
            message: 'Payment submitted for verification. You will receive confirmation email shortly.',
            order: {
                id: order.id,
                orderNumber,
                subtotal: order.subtotal,
                status: 'verifying'
            }
        });
    } catch (error) {
        console.error('Confirm payment error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to confirm payment',
            error: error.message
        });
    }
};

/**
 * Admin: Verify payment and confirm order
 * POST /api/payment/admin/verify
 * Body: { orderNumber, verified: boolean }
 */
const adminVerifyPayment = async (req, res) => {
    try {
        const { orderNumber, verified } = req.body;

        const order = await Order.findOne({ where: { orderNumber } });
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        if (order.status !== 'verifying') {
            return res.status(400).json({
                success: false,
                message: `Order status is ${order.status}, cannot verify`
            });
        }

        const newStatus = verified ? 'paid' : 'failed';
        
        await order.update({ status: newStatus });

        // If payment failed, restore product quantities
        if (!verified) {
            for (const item of order.items) {
                if (item.productId) {
                    await Premix.increment('quantity', {
                        by: parseInt(item.quantity) || 1,
                        where: { id: item.productId }
                    });
                }
            }
        }

        // Send status update email to customer
        if (verified) {
            await sendPaymentConfirmationEmail(order.customerEmail, order.customerName, orderNumber, 'paid');
        }

        return res.status(200).json({
            success: true,
            message: verified ? 'Payment verified and order confirmed' : 'Payment rejected',
            order: {
                id: order.id,
                orderNumber,
                status: newStatus
            }
        });
    } catch (error) {
        console.error('Admin verify payment error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to verify payment',
            error: error.message
        });
    }
};

/**
 * Demo mode: Create order and simulate payment success (for testing)
 * POST /api/payment/demo-complete
 */
const demoCompletePayment = async (req, res) => {
    try {
        const { customerEmail: formEmail, customerName, customerPhone, shippingAddress, items } = req.body;
        const userEmail = req.user.email;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one item is required'
            });
        }
        const customerEmail = formEmail?.trim() || userEmail;
        const subtotal = items.reduce((sum, item) => {
            return sum + (parseFloat(item.price) * parseInt(item.quantity || 1));
        }, 0);

        const orderNumber = generateOrderNumber();
        const paymentId = `DEMO_PAY_${orderNumber}`;

        // Create order
        const order = await Order.create({
            orderNumber,
            razorpayOrderId: `DEMO_ORDER_${orderNumber}`,
            razorpayPaymentId: paymentId,
            customerEmail: customerEmail.trim(),
            customerName: customerName?.trim() || null,
            customerPhone: customerPhone?.trim() || null,
            shippingAddress: shippingAddress?.trim() || null,
            items,
            subtotal,
            status: 'paid'
        });

        // Decrement product quantities
        for (const item of items) {
            if (item.productId) {
                await Premix.decrement('quantity', {
                    by: parseInt(item.quantity) || 1,
                    where: { id: item.productId }
                });
            }
        }

        // Generate invoice PDF
        const pdfBuffer = await generateInvoicePDF({
            orderNumber,
            customerName,
            customerEmail,
            shippingAddress,
            items,
            subtotal,
            createdAt: order.createdAt,
            paymentMethod: 'Demo',
            merchantUpiId: process.env.MERCHANT_UPI_ID || 'karasaaram@paytm'
        });

        // Send email to customer and to admin
        const emailResult = await sendInvoiceEmail(customerEmail, customerName, orderNumber, pdfBuffer);
        const orderForAdmin = { 
            orderNumber, 
            customerEmail, 
            customerName: customerName?.trim() || null, 
            customerPhone: customerPhone?.trim() || null, 
            shippingAddress: shippingAddress?.trim() || null, 
            items, 
            subtotal,
            paymentMethod: 'Demo'
        };
        await sendOrderNotificationToAdmin(orderForAdmin, pdfBuffer);

        return res.status(201).json({
            success: true,
            message: 'Order placed successfully! Invoice sent to your email.',
            order: {
                id: order.id,
                orderNumber,
                subtotal,
                paymentMethod: 'Demo',
                emailSent: emailResult.success
            }
        });
    } catch (error) {
        console.error('Demo payment error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to process order',
            error: error.message
        });
    }
};

module.exports = { 
    createPendingOrder, 
    confirmPayment, 
    adminVerifyPayment,
    demoCompletePayment,
    handleUpiWebhook,
    verifyUtrManually
};
