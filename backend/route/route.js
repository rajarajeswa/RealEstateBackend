const express = require('express');
const { addProduct, getProductsByCategory, updateStock, decrementStock, incrementStock, deleteProduct, getAllProducts } = require('../controller/productcontroller');
const { 
    createPendingOrder, 
    confirmPayment, 
    adminVerifyPayment,
    demoCompletePayment,
    handleUpiWebhook,
    verifyUtrManually
} = require('../controller/paymentController');
const { 
    createRazorpayOrder, 
    verifyRazorpayPayment, 
    handleRazorpayWebhook,
    getRazorpayKey 
} = require('../controller/razorpayController');
const { getOrders, getMyOrders, updateOrderStatus } = require('../controller/orderController');
const { register, login } = require('../controller/authController');
const { parseAuthForm, verifyToken } = require('../middleware/authMiddleware');
const {
    getAddresses,
    getAddressById,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress
} = require('../controller/addressController');
const router = express.Router();

// Auth routes
router.post('/auth/register', register);
router.post('/auth/login', parseAuthForm, login);

// Product routes
router.post('/add', addProduct);
router.get('/products', getAllProducts);
router.delete('/products/:id', deleteProduct);

// Order routes
router.get('/orders', getOrders);
router.get('/my-orders', verifyToken, getMyOrders);
router.put('/orders/:id/status', updateOrderStatus);

// Payment routes - New flow with verification
router.post('/payment/create-pending', verifyToken, createPendingOrder);
router.post('/payment/confirm-payment', verifyToken, confirmPayment);
router.post('/payment/admin/verify', verifyToken, adminVerifyPayment);
router.post('/payment/demo-complete', verifyToken, demoCompletePayment);

// Razorpay Payment Routes
router.get('/payment/razorpay/key', getRazorpayKey);
router.post('/payment/razorpay/create-order', verifyToken, createRazorpayOrder);
router.post('/payment/razorpay/verify', verifyRazorpayPayment);
router.post('/payment/razorpay/webhook', handleRazorpayWebhook);

// UPI Webhook route - NO AUTH (called by PSP server-side)
// This endpoint receives payment notifications from UPI PSPs
router.post('/payment/webhook/upi', handleUpiWebhook);

// Manual UTR verification (admin use)
router.post('/payment/verify-utr', verifyToken, verifyUtrManually);

// Legacy UPI route (keeping for backward compatibility)
router.post('/payment/upi-complete', verifyToken, demoCompletePayment);

// Product category routes
router.get('/premix/sambar', getProductsByCategory('sambar'));
router.get('/premix/rasam', getProductsByCategory('rasam'));
router.get('/premix/curry', getProductsByCategory('curry'));
router.get('/premix/speciality', getProductsByCategory('speciality'));

// Stock management routes
router.put('/products/:id/stock', updateStock);
router.post('/products/:id/decrement', decrementStock);
router.post('/products/:id/increment', incrementStock);

// Address management routes (all require authentication)
router.get('/addresses', verifyToken, getAddresses);
router.get('/addresses/:id', verifyToken, getAddressById);
router.post('/addresses', verifyToken, createAddress);
router.put('/addresses/:id', verifyToken, updateAddress);
router.delete('/addresses/:id', verifyToken, deleteAddress);
router.put('/addresses/:id/default', verifyToken, setDefaultAddress);

// Health check (for "is backend running?")
router.get('/test', (req, res) => {
    res.json({ message: 'Server is working!', timestamp: new Date() });
});
router.get('/health', (req, res) => {
    res.json({ ok: true });
});

// Merchant UPI and Bank details for frontend
router.get('/merchant-upi', (req, res) => {
    res.json({ 
        success: true, 
        merchantUpiId: process.env.MERCHANT_UPI_ID || 'karasaaram@paytm',
        merchantName: process.env.MERCHANT_NAME || 'Kara-Saaram',
        bankName: process.env.BANK_NAME || '',
        bankAccountNumber: process.env.BANK_ACCOUNT_NUMBER || '',
        bankIfscCode: process.env.BANK_IFSC_CODE || '',
        bankAccountName: process.env.BANK_ACCOUNT_NAME || '',
        // WhatsApp number for payment confirmation
        whatsappNumber: process.env.WHATSAPP_NUMBER || ''
    });
});

module.exports = router;
