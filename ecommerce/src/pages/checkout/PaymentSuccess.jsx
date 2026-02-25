import { useLocation, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../App.css';
import { apiFetch } from '../../api/client';

function PaymentSuccess() {
    const { state } = useLocation();
    const order = state?.order;
    const [merchantUpiId, setMerchantUpiId] = useState('karasaaram@paytm');

    useEffect(() => {
        apiFetch('/api/merchant-upi')
            .then(({ data }) => data.success && setMerchantUpiId(data.merchantUpiId))
            .catch(() => {});
    }, []);

    if (!order) {
        return (
            <div className="min-vh-100 py-5 d-flex align-items-center justify-content-center" style={{ fontFamily: 'var(--font-body)', backgroundColor: 'var(--athangudi-cream)' }}>
                <div className="text-center">
                    <h4 style={{ color: 'var(--chettinad-charcoal)' }}>Order not found</h4>
                    <Link to="/" className="btn btn-chettinad-primary mt-3">Go Home</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-vh-100 py-5" style={{ fontFamily: 'var(--font-body)', backgroundColor: 'var(--athangudi-cream)' }}>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-8 col-lg-6">
                        <div className="chettinad-card p-5 text-center">
                            <div className="mb-4" style={{ fontSize: '4rem' }}>✓</div>
                            <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--chettinad-maroon)', fontWeight: 600 }}>Order Placed!</h2>
                            <p className="text-muted mt-2">Thank you for your order.</p>
                            <div className="my-4 p-3" style={{ backgroundColor: 'rgba(196, 92, 62, 0.1)', borderRadius: '4px' }}>
                                <p className="mb-1"><strong>Order No:</strong> {order.orderNumber}</p>
                                <p className="mb-1"><strong>Total:</strong> ₹{parseFloat(order.subtotal).toFixed(2)}</p>
                                {order.paymentMethod === 'UPI' && (
                                    <>
                                        <p className="mb-1 small"><strong>Payment:</strong> UPI</p>
                                        <p className="mb-1 small"><strong>Merchant UPI:</strong> {merchantUpiId}</p>
                                        {order.upiId && (
                                            <p className="mb-0 small"><strong>Your UPI:</strong> {order.upiId}</p>
                                        )}
                                    </>
                                )}
                            </div>
                            <p className="fw-bold mb-2" style={{ color: 'var(--chettinad-charcoal)', fontSize: '0.95rem' }}>
                                Order must be placed at least 12 hours before your required delivery/time.
                            </p>
                            {order.emailSent !== false && (
                                <p className="small text-muted">Invoice has been sent to your email.</p>
                            )}
                            <Link to="/" className="btn btn-chettinad-primary mt-3">Continue Shopping</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PaymentSuccess;
