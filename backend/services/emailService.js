const nodemailer = require('nodemailer');

/**
 * Create email transporter
 */
const createTransporter = () => {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass) {
        console.warn('⚠️ EMAIL_USER or EMAIL_PASS not set in .env. Skipping email.');
        return null;
    }

    return nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
        // Add timeout settings
        connectionTimeout: 10000,
        socketTimeout: 10000
    });
};

/**
 * Send invoice email to customer
 * Configure SMTP in .env: EMAIL_USER, EMAIL_PASS
 * For Gmail: enable "App passwords" at https://myaccount.google.com/apppasswords
 * IMPORTANT: Use App Password, NOT your regular Gmail password
 */
const sendInvoiceEmail = async (toEmail, customerName, orderNumber, pdfBuffer) => {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    console.log(`📧 Attempting to send invoice email to: ${toEmail}`);
    console.log(`📧 Order Number: ${orderNumber}`);
    console.log(`📧 Email User configured: ${user ? 'Yes' : 'No'}`);
    console.log(`📧 Email Pass configured: ${pass ? 'Yes' : 'No'}`);

    if (!user || !pass) {
        console.warn('⚠️ EMAIL_USER or EMAIL_PASS not set in .env. Skipping email.');
        console.warn('⚠️ To enable emails:');
        console.warn('⚠️ 1. Go to https://myaccount.google.com/apppasswords');
        console.warn('⚠️ 2. Generate a new App Password for "Mail"');
        console.warn('⚠️ 3. Add EMAIL_USER=your-email@gmail.com to .env');
        console.warn('⚠️ 4. Add EMAIL_PASS=your-app-password to .env');
        return { success: false, message: 'Email not configured. Please set EMAIL_USER and EMAIL_PASS in .env' };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(toEmail)) {
        console.error(`❌ Invalid email format: ${toEmail}`);
        return { success: false, message: 'Invalid email format' };
    }

    const transporter = createTransporter();

    const mailOptions = {
        from: `"Kara-Saaram" <${user}>`,
        to: toEmail,
        subject: `Your Invoice - Order #${orderNumber} | Kara-Saaram`,
        text: `Dear ${customerName || 'Customer'},

Thank you for your order! Please find your invoice attached.

Order Number: ${orderNumber}

If you have any questions, please reply to this email.

Best regards,
Kara-Saaram Team
Authentic Chettinadu Masalas`,
        html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: linear-gradient(135deg, #722F37, #5A252C); padding: 20px; text-align: center;">
        <h1 style="color: #D4AF37; margin: 0;">Kara-Saaram</h1>
        <p style="color: #F5EDE4; margin: 5px 0 0;">Authentic Chettinadu Masalas</p>
    </div>
    <div style="padding: 20px; background: #FFFEF9;">
        <h2 style="color: #722F37;">Thank You for Your Order!</h2>
        <p>Dear ${customerName || 'Customer'},</p>
        <p>Thank you for your order! Please find your invoice attached to this email.</p>
        <div style="background: #F5EDE4; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Order Number:</strong> ${orderNumber}</p>
        </div>
        <p>If you have any questions, please reply to this email.</p>
        <p>Best regards,<br><strong>Kara-Saaram Team</strong></p>
    </div>
    <div style="background: #2C2420; padding: 15px; text-align: center; color: #9E9186;">
        <p style="margin: 0;">© 2024 Kara-Saaram. All rights reserved.</p>
    </div>
</div>`,
        attachments: [
            {
                filename: `Invoice-${orderNumber}.pdf`,
                content: pdfBuffer,
                contentType: 'application/pdf'
            }
        ]
    };

    try {
        console.log('📧 Sending email...');
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully!');
        console.log(`✅ Message ID: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (err) {
        console.error('❌ Email send error:', err.message);
        console.error('❌ Full error:', err);
        
        // Provide helpful error messages
        if (err.code === 'EAUTH') {
            return { 
                success: false, 
                message: 'Email authentication failed. Please use an App Password, not your regular Gmail password. Generate one at https://myaccount.google.com/apppasswords' 
            };
        }
        if (err.code === 'ECONNECTION') {
            return { 
                success: false, 
                message: 'Could not connect to email server. Please check your internet connection.' 
            };
        }
        
        return { success: false, message: err.message };
    }
};

/**
 * Send order notification to admin (you). Set ADMIN_EMAIL in .env.
 */
const sendOrderNotificationToAdmin = async (order, pdfBuffer) => {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;
    const adminEmail = process.env.ADMIN_EMAIL || user;

    console.log(`📧 Sending admin notification to: ${adminEmail}`);

    if (!user || !pass) {
        console.warn('⚠️ EMAIL_USER or EMAIL_PASS not set. Skipping admin email.');
        return { success: false };
    }

    const transporter = createTransporter();
    const itemsList = (order.items || []).map(i => `  • ${i.name} x ${i.quantity} = ₹${(parseFloat(i.price) * parseInt(i.quantity)).toFixed(2)}`).join('\n');

    const merchantUpiId = process.env.MERCHANT_UPI_ID || 'karasaaram@paytm';
    let paymentInfo = `Payment: ${order.paymentMethod || 'Demo'}`;
    if (order.paymentMethod === 'UPI') {
        paymentInfo = `Payment: UPI\nMerchant UPI: ${merchantUpiId}`;
        if (order.upiTransactionId) paymentInfo += `\nTransaction ID: ${order.upiTransactionId}`;
    }

    const mailOptions = {
        from: `"Kara-Saaram Orders" <${user}>`,
        to: adminEmail,
        subject: `🛒 New Order #${order.orderNumber} | Kara-Saaram`,
        text: `New order received!

═══════════════════════════════════════
ORDER DETAILS
═══════════════════════════════════════

Order Number: ${order.orderNumber}
${paymentInfo}

═══════════════════════════════════════
CUSTOMER DETAILS
═══════════════════════════════════════

Name: ${order.customerName || '—'}
Email: ${order.customerEmail}
Phone: ${order.customerPhone || '—'}
Address: ${order.shippingAddress || '—'}

═══════════════════════════════════════
ITEMS
═══════════════════════════════════════

${itemsList}

───────────────────────────────────────
TOTAL: ₹${parseFloat(order.subtotal).toFixed(2)}
───────────────────────────────────────

Invoice is attached to this email.

Kara-Saaram Order System`,
        attachments: pdfBuffer ? [{ 
            filename: `Invoice-${order.orderNumber}.pdf`, 
            content: pdfBuffer,
            contentType: 'application/pdf'
        }] : []
    };

    try {
        console.log('📧 Sending admin notification...');
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Admin notification sent successfully!');
        console.log(`✅ Message ID: ${info.messageId}`);
        return { success: true };
    } catch (err) {
        console.error('❌ Admin email error:', err.message);
        console.error('❌ Full error:', err);
        return { success: false, message: err.message };
    }
};

module.exports = { sendInvoiceEmail, sendOrderNotificationToAdmin };
