const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const MERCHANT_UPI_ID = process.env.MERCHANT_UPI_ID || 'karasaaram@paytm';

/**
 * Generate invoice PDF and return buffer
 * @param {Object} order - { orderNumber, customerName, customerEmail, items, subtotal, createdAt }
 */
const generateInvoicePDF = (order) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const chunks = [];
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header
        doc.fontSize(24).text('Kara-Saaram', { align: 'center' });
        doc.fontSize(10).text('Authentic Chettinadu Masalas', { align: 'center' });
        doc.moveDown(2);

        doc.fontSize(14).text('INVOICE', { align: 'center' });
        doc.moveDown();

        // Order details
        doc.fontSize(10);
        doc.text(`Order No: ${order.orderNumber}`);
        doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}`);
        doc.moveDown();

        // Customer
        doc.text(`Bill To:`);
        doc.text(order.customerName || 'Customer');
        doc.text(order.customerEmail);
        if (order.shippingAddress) doc.text(order.shippingAddress);
        doc.moveDown(2);

        // Table header
        const tableTop = doc.y;
        doc.font('Helvetica-Bold');
        doc.text('Product', 50, tableTop, { width: 200 });
        doc.text('Qty', 250, tableTop);
        doc.text('Price', 300, tableTop);
        doc.text('Amount', 380, tableTop);
        doc.font('Helvetica');
        doc.moveDown(0.5);

        let y = doc.y;
        order.items.forEach((item) => {
            const amount = (parseFloat(item.price) * parseInt(item.quantity)).toFixed(2);
            doc.text(item.name, 50, y, { width: 200 });
            doc.text(String(item.quantity), 250, y);
            doc.text(`₹${parseFloat(item.price).toFixed(2)}`, 300, y);
            doc.text(`₹${amount}`, 380, y);
            y += 20;
        });
        doc.y = y + 10;

        // Total
        doc.font('Helvetica-Bold');
        doc.text(`Total: ₹${parseFloat(order.subtotal).toFixed(2)}`, 350, doc.y);
        doc.font('Helvetica');
        doc.moveDown(2);

        // Payment info
        if (order.paymentMethod === 'UPI' || order.paymentMethod === 'upi') {
            doc.fontSize(9);
            doc.text(`Payment Method: UPI`, 50, doc.y);
            doc.text(`Merchant UPI: ${order.merchantUpiId || MERCHANT_UPI_ID}`, 50, doc.y + 15);
            if (order.customerUpiId) {
                doc.text(`Your UPI: ${order.customerUpiId}`, 50, doc.y + 30);
            }
            doc.moveDown(2);
        }

        doc.fontSize(9).text('Thank you for your order!', { align: 'center' });
        doc.text('Kara-Saaram • Est. 1965', { align: 'center' });

        doc.end();
    });
};

module.exports = { generateInvoicePDF };
