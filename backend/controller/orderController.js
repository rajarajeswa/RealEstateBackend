const { Order } = require('../model/Order');

const getOrders = async (req, res) => {
    try {
        const { status } = req.query;
        const whereClause = status && status !== 'all' ? { status } : {};
        
        const orders = await Order.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'orderNumber', 'razorpayOrderId', 'razorpayPaymentId', 'customerEmail', 'customerName', 'customerPhone', 'shippingAddress', 'items', 'subtotal', 'status', 'createdAt']
        });
        const parsed = orders.map(o => ({
            ...o.toJSON(),
            items: typeof o.items === 'string' ? JSON.parse(o.items) : (o.items || [])
        }));
        return res.json({ success: true, orders: parsed });
    } catch (error) {
        console.error('Get orders error:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch orders' });
    }
};

// Get orders for logged-in user
const getMyOrders = async (req, res) => {
    try {
        const userEmail = req.user.email;
        
        const orders = await Order.findAll({
            where: { customerEmail: userEmail },
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'orderNumber', 'razorpayOrderId', 'razorpayPaymentId', 'customerEmail', 'customerName', 'customerPhone', 'shippingAddress', 'items', 'subtotal', 'status', 'createdAt']
        });
        const parsed = orders.map(o => ({
            ...o.toJSON(),
            items: typeof o.items === 'string' ? JSON.parse(o.items) : (o.items || [])
        }));
        return res.json({ success: true, orders: parsed });
    } catch (error) {
        console.error('Get my orders error:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch orders' });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!['pending', 'paid', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }
        
        const order = await Order.findByPk(id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        
        await order.update({ status });
        return res.json({ success: true, message: 'Order status updated', order: order.toJSON() });
    } catch (error) {
        console.error('Update order status error:', error);
        return res.status(500).json({ success: false, message: 'Failed to update order status' });
    }
};

module.exports = { getOrders, getMyOrders, updateOrderStatus };
