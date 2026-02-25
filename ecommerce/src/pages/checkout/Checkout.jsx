import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../App.css';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../api/client';

// Load Razorpay script
const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

function Checkout() {
    const { cart, cartTotal, clearCart, removeFromCart, updateQuantity } = useCart();
    const { isAuthenticated, token, user } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ customerEmail: '', customerName: '', customerPhone: '', shippingAddress: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentComplete, setPaymentComplete] = useState(false);
    const [orderData, setOrderData] = useState(null);
    const [razorpayKeyId, setRazorpayKeyId] = useState(null);
    const [razorpayOrder, setRazorpayOrder] = useState(null);

    // Address management state
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [addressForm, setAddressForm] = useState({
        label: 'Home',
        name: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: ''
    });
    const [addressLoading, setAddressLoading] = useState(false);

    // Fetch Razorpay key
    useEffect(() => {
        apiFetch('/api/payment/razorpay/key')
            .then(({ data }) => {
                if (data.success) {
                    setRazorpayKeyId(data.key_id);
                }
            })
            .catch(() => {});
    }, []);

    // Fetch saved addresses
    useEffect(() => {
        if (isAuthenticated && token) {
            apiFetch('/api/addresses', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(({ data }) => {
                    if (data.success) {
                        setAddresses(data.addresses);
                        // Select default address or first address
                        const defaultAddr = data.addresses.find(a => a.isDefault);
                        if (defaultAddr) {
                            setSelectedAddressId(defaultAddr.id);
                            populateFormFromAddress(defaultAddr);
                        } else if (data.addresses.length > 0) {
                            setSelectedAddressId(data.addresses[0].id);
                            populateFormFromAddress(data.addresses[0]);
                        }
                    }
                })
                .catch(() => {});
        }
    }, [isAuthenticated, token]);

    const populateFormFromAddress = (address) => {
        setForm(prev => ({
            ...prev,
            customerName: address.name,
            customerPhone: address.phone || '',
            shippingAddress: `${address.addressLine1}${address.addressLine2 ? ', ' + address.addressLine2 : ''}, ${address.city}, ${address.state} - ${address.pincode}`
        }));
    };

    const handleAddressSelect = (address) => {
        setSelectedAddressId(address.id);
        populateFormFromAddress(address);
    };

    const handleDeleteAddress = async (addressId, e) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this address?')) return;
        
        try {
            const { data } = await apiFetch(`/api/addresses/${addressId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (data.success) {
                setAddresses(prev => prev.filter(a => a.id !== addressId));
                if (selectedAddressId === addressId) {
                    const remaining = addresses.filter(a => a.id !== addressId);
                    if (remaining.length > 0) {
                        setSelectedAddressId(remaining[0].id);
                        populateFormFromAddress(remaining[0]);
                    } else {
                        setSelectedAddressId(null);
                    }
                }
            } else {
                alert(data.message || 'Failed to delete address');
            }
        } catch (err) {
            alert(err.message || 'Failed to delete address');
        }
    };

    const handleAddressFormChange = (e) => {
        setAddressForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSaveAddress = async (e) => {
        e.preventDefault();
        setAddressLoading(true);
        try {
            const { data } = await apiFetch('/api/addresses', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(addressForm)
            });
            if (data.success) {
                setAddresses(prev => [...prev, data.address]);
                setSelectedAddressId(data.address.id);
                populateFormFromAddress(data.address);
                setShowAddressForm(false);
                setAddressForm({
                    label: 'Home',
                    name: '',
                    phone: '',
                    addressLine1: '',
                    addressLine2: '',
                    city: '',
                    state: '',
                    pincode: ''
                });
            } else {
                alert(data.message || 'Failed to save address');
            }
        } catch (err) {
            alert(err.message || 'Failed to save address');
        } finally {
            setAddressLoading(false);
        }
    };

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // Handle Razorpay Payment
    const handleRazorpayPayment = async () => {
        setLoading(true);
        setError('');

        try {
            // Load Razorpay script
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                setError('Failed to load Razorpay. Please check your internet connection.');
                setLoading(false);
                return;
            }

            const orderItems = cart.map(p => ({
                productId: p.productId,
                name: p.name,
                price: p.price,
                quantity: p.quantity,
                image: p.image
            }));

            // Create Razorpay order
            const { data } = await apiFetch('/api/payment/razorpay/create-order', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    amount: cartTotal,
                    customerEmail: form.customerEmail.trim() || user?.email || '',
                    customerName: form.customerName.trim() || undefined,
                    customerPhone: form.customerPhone.trim() || undefined,
                    shippingAddress: form.shippingAddress.trim() || undefined,
                    items: orderItems
                })
            });

            if (!data.success) {
                setError(data.message || 'Failed to create order');
                setLoading(false);
                return;
            }

            setRazorpayOrder(data.order);

            // Open Razorpay checkout
            const options = {
                key: data.order.key_id,
                amount: data.order.amount,
                currency: data.order.currency,
                order_id: data.order.id,
                name: 'Kara-Saaram',
                description: 'Premium Premix Products',
                image: '/favicon.svg',
                prefill: {
                    name: data.order.customerName || form.customerName || '',
                    email: data.order.customerEmail || form.customerEmail || user?.email || '',
                    contact: form.customerPhone || ''
                },
                notes: {
                    orderNumber: data.order.orderNumber
                },
                theme: {
                    color: '#722F37'
                },
                handler: async function (response) {
                    // Verify payment
                    try {
                        const verifyData = await apiFetch('/api/payment/razorpay/verify', {
                            method: 'POST',
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                orderNumber: data.order.orderNumber
                            })
                        });

                        if (verifyData.data.success) {
                            setOrderData(verifyData.data.order);
                            setPaymentComplete(true);
                            clearCart();
                            setShowPaymentModal(true);
                        } else {
                            setError(verifyData.data.message || 'Payment verification failed');
                        }
                    } catch (err) {
                        setError(err.message || 'Payment verification failed');
                    }
                },
                modal: {
                    ondismiss: function() {
                        setLoading(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                setError(`Payment failed: ${response.error.description}`);
                setLoading(false);
            });
            rzp.open();

        } catch (err) {
            setError(err.message || 'Connection error. Is the backend running?');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (cart.length === 0) {
            setError('Cart is empty');
            return;
        }
        if (!isAuthenticated) {
            navigate('/login', { state: { from: { pathname: '/checkout' } } });
            return;
        }
        if (!form.customerEmail.trim() && !user?.email) {
            setError('Email is required for invoice');
            return;
        }

        // Start Razorpay payment
        await handleRazorpayPayment();
    };

    const handleCloseModal = () => {
        setShowPaymentModal(false);
        if (paymentComplete) {
            navigate('/');
        }
    };

    if (cart.length === 0 && !loading) {
        return (
            <div className="min-vh-100 py-5 d-flex align-items-center justify-content-center" style={{ fontFamily: 'var(--font-body)', backgroundColor: 'var(--earth-cream)' }}>
                <div className="text-center">
                    <h4 style={{ color: 'var(--neutral-charcoal)' }}>Your cart is empty</h4>
                    <Link to="/" className="btn btn-primary-chettinad mt-3">Continue Shopping</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-vh-100 py-5" style={{ fontFamily: 'var(--font-body)', backgroundColor: 'var(--earth-cream)' }}>
            <div className="container">
                <div className="text-center mb-4">
                    <div className="d-inline-block mb-2" style={{ width: '60px', height: '3px', backgroundColor: 'var(--primary-maroon)' }} />
                    <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--primary-maroon)', fontWeight: 600 }}>Checkout</h2>
                    <p className="text-muted">Secure Payment via Razorpay • Invoice will be emailed</p>
                </div>
                <div 
                    className="alert text-center mb-4 py-3" 
                    style={{ 
                        backgroundColor: 'rgba(212, 175, 55, 0.15)', 
                        border: '2px solid var(--gold-primary)', 
                        color: 'var(--neutral-charcoal)',
                        fontWeight: 500,
                        fontSize: '0.95rem',
                        borderRadius: 'var(--radius-md)'
                    }}
                >
                    Order must be placed at least 12 hours before your required delivery time.
                </div>

                <div className="row g-4">
                    <div className="col-lg-7">
                        <div className="card-chettinad p-4">
                            <h5 className="mb-4 fw-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--neutral-charcoal)' }}>Customer Details</h5>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Invoice Email (optional, uses your login email if blank)</label>
                                    <input type="email" name="customerEmail" className="form-control" value={form.customerEmail} onChange={handleChange} placeholder={user?.email || 'your@email.com'} />
                                </div>

                                {/* Address Selection Section */}
                                {isAuthenticated && addresses.length > 0 && !showAddressForm && (
                                    <div className="mb-4">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <label className="form-label fw-bold mb-0">Select Delivery Address</label>
                                            <button 
                                                type="button" 
                                                className="btn btn-sm btn-outline-chettinad"
                                                onClick={() => setShowAddressForm(true)}
                                            >
                                                + Add New Address
                                            </button>
                                        </div>
                                        <div className="row g-3">
                                            {addresses.map((addr) => (
                                                <div key={addr.id} className="col-md-6">
                                                    <div 
                                                        className={`p-3 rounded cursor-pointer ${selectedAddressId === addr.id ? 'border border-2' : 'border'}`}
                                                        style={{ 
                                                            cursor: 'pointer',
                                                            borderColor: selectedAddressId === addr.id ? 'var(--primary-maroon)' : '#ddd',
                                                            backgroundColor: selectedAddressId === addr.id ? 'rgba(114, 47, 55, 0.05)' : 'white',
                                                            transition: 'all 0.2s',
                                                            borderRadius: 'var(--radius-md)'
                                                        }}
                                                        onClick={() => handleAddressSelect(addr)}
                                                    >
                                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                                            <div>
                                                                <span 
                                                                    className="badge me-2"
                                                                    style={{ backgroundColor: 'var(--athangudi-teal)', color: 'white' }}
                                                                >
                                                                    {addr.label}
                                                                </span>
                                                                {addr.isDefault && (
                                                                    <span 
                                                                        className="badge"
                                                                        style={{ backgroundColor: 'var(--spice-corriander)', color: 'white' }}
                                                                    >
                                                                        Default
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <button 
                                                                className="btn btn-sm btn-link text-danger p-0"
                                                                onClick={(e) => handleDeleteAddress(addr.id, e)}
                                                                title="Delete address"
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>
                                                        <p className="mb-1 fw-bold">{addr.name}</p>
                                                        <p className="mb-1 small text-muted">
                                                            {addr.addressLine1}
                                                            {addr.addressLine2 && <>, {addr.addressLine2}</>}
                                                        </p>
                                                        <p className="mb-1 small text-muted">{addr.city}, {addr.state} - {addr.pincode}</p>
                                                        {addr.phone && <p className="mb-0 small">Phone: {addr.phone}</p>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Add New Address Form */}
                                {showAddressForm && (
                                    <div className="mb-4 p-3 border rounded" style={{ backgroundColor: '#f8f9fa' }}>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h6 className="mb-0 fw-bold">Add New Address</h6>
                                            <button 
                                                type="button" 
                                                className="btn btn-sm btn-outline-secondary"
                                                onClick={() => setShowAddressForm(false)}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <label className="form-label small">Address Type</label>
                                                <select name="label" className="form-select" value={addressForm.label} onChange={handleAddressFormChange}>
                                                    <option value="Home">Home</option>
                                                    <option value="Office">Office</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small">Full Name *</label>
                                                <input type="text" name="name" className="form-control" value={addressForm.name} onChange={handleAddressFormChange} required />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small">Phone</label>
                                                <input type="tel" name="phone" className="form-control" value={addressForm.phone} onChange={handleAddressFormChange} placeholder="10-digit mobile" />
                                            </div>
                                            <div className="col-12">
                                                <label className="form-label small">Address Line 1 (House/Flat no.) *</label>
                                                <input type="text" name="addressLine1" className="form-control" value={addressForm.addressLine1} onChange={handleAddressFormChange} required />
                                            </div>
                                            <div className="col-12">
                                                <label className="form-label small">Address Line 2 (Street, Landmark)</label>
                                                <input type="text" name="addressLine2" className="form-control" value={addressForm.addressLine2} onChange={handleAddressFormChange} />
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label small">City *</label>
                                                <input type="text" name="city" className="form-control" value={addressForm.city} onChange={handleAddressFormChange} required />
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label small">State *</label>
                                                <input type="text" name="state" className="form-control" value={addressForm.state} onChange={handleAddressFormChange} required />
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label small">Pincode *</label>
                                                <input type="text" name="pincode" className="form-control" value={addressForm.pincode} onChange={handleAddressFormChange} placeholder="6 digits" required />
                                            </div>
                                            <div className="col-12">
                                                <button 
                                                    type="button" 
                                                    className="btn btn-primary-chettinad w-100"
                                                    onClick={handleSaveAddress}
                                                    disabled={addressLoading}
                                                >
                                                    {addressLoading ? 'Saving...' : 'Save Address'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Manual Entry (when no addresses or not authenticated) */}
                                {(!isAuthenticated || addresses.length === 0) && !showAddressForm && (
                                    <>
                                        <div className="mb-3">
                                            <label className="form-label">Name</label>
                                            <input type="text" name="customerName" className="form-control" value={form.customerName} onChange={handleChange} placeholder="Your name" />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Phone</label>
                                            <input type="tel" name="customerPhone" className="form-control" value={form.customerPhone} onChange={handleChange} placeholder="10-digit mobile" />
                                        </div>
                                        <div className="mb-4">
                                            <label className="form-label">Shipping Address</label>
                                            <textarea name="shippingAddress" className="form-control" rows="3" value={form.shippingAddress} onChange={handleChange} placeholder="Full address for delivery" />
                                        </div>
                                        {isAuthenticated && (
                                            <button 
                                                type="button" 
                                                className="btn btn-outline-chettinad btn-sm mb-3"
                                                onClick={() => setShowAddressForm(true)}
                                            >
                                                + Add Saved Address
                                            </button>
                                        )}
                                    </>
                                )}
                                
                                {/* Payment Info */}
                                <div 
                                    className="mb-4 p-3" 
                                    style={{ 
                                        backgroundColor: 'rgba(114, 47, 55, 0.05)', 
                                        borderRadius: 'var(--radius-md)', 
                                        border: '1px solid rgba(114, 47, 55, 0.2)' 
                                    }}
                                >
                                    <div className="d-flex align-items-center gap-2 mb-3">
                                        <span className="fw-bold" style={{ color: 'var(--primary-maroon)' }}>Secure Payment</span>
                                    </div>
                                    <p className="small text-muted mb-3">Pay securely using Razorpay - supports UPI, Cards, Net Banking & Wallets</p>
                                    <div className="d-flex flex-wrap gap-2">
                                        {[
                                            { name: 'UPI', color: '#5F259F' },
                                            { name: 'Credit/Debit Card', color: '#1a1a2e' },
                                            { name: 'Net Banking', color: '#00875F' },
                                            { name: 'Wallet', color: '#00BAF2' }
                                        ].map(method => (
                                            <span
                                                key={method.name}
                                                className="badge"
                                                style={{ 
                                                    backgroundColor: method.color,
                                                    fontSize: '0.75rem',
                                                    padding: '6px 12px'
                                                }}
                                            >
                                                {method.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                
                                {!isAuthenticated && (
                                    <div 
                                        className="alert mb-4" 
                                        style={{ 
                                            backgroundColor: 'rgba(212, 168, 75, 0.15)', 
                                            border: '1px solid var(--gold-primary)', 
                                            color: 'var(--neutral-charcoal)',
                                            borderRadius: 'var(--radius-md)'
                                        }}
                                    >
                                        Please login to complete payment.
                                    </div>
                                )}
                                {error && <div className="alert alert-danger">{error}</div>}
                                <button type="submit" className="btn btn-primary-chettinad btn-lg w-100" disabled={loading}>
                                    {loading ? 'Processing...' : isAuthenticated ? 'Proceed to Payment' : 'Login to Pay'}
                                </button>
                            </form>
                        </div>
                    </div>
                    <div className="col-lg-5">
                        <div className="card-chettinad p-4">
                            <h5 className="mb-4 fw-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--neutral-charcoal)' }}>Order Summary</h5>
                            {cart.map((item) => (
                                <div key={item.productId} className="py-3 border-bottom">
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div className="flex-grow-1">
                                            <strong>{item.name}</strong>
                                            <div className="d-flex align-items-center gap-2 mt-2">
                                                <button 
                                                    type="button"
                                                    className="btn btn-sm btn-outline-secondary"
                                                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                                    style={{ width: '30px', padding: '2px' }}
                                                >
                                                    −
                                                </button>
                                                <span style={{ minWidth: '30px', textAlign: 'center' }}>{item.quantity}</span>
                                                <button 
                                                    type="button"
                                                    className="btn btn-sm btn-outline-secondary"
                                                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                    style={{ width: '30px', padding: '2px' }}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                        <div className="text-end">
                                            <span style={{ color: 'var(--primary-maroon)' }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                                            <div className="mt-2">
                                                <button 
                                                    type="button"
                                                    className="btn btn-sm text-danger"
                                                    onClick={() => removeFromCart(item.productId)}
                                                    style={{ fontSize: '0.75rem', padding: '2px 6px' }}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {cart.length === 0 && (
                                <div className="text-center py-4">
                                    <p className="text-muted mb-2">Your cart is empty</p>
                                    <Link to="/" className="btn btn-outline-chettinad btn-sm">Continue Shopping</Link>
                                </div>
                            )}
                            <div className="d-flex justify-content-between align-items-center mt-4 pt-3">
                                <strong>Total</strong>
                                <span className="h5 mb-0" style={{ color: 'var(--primary-maroon)' }}>₹{cartTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Success Modal */}
            {showPaymentModal && paymentComplete && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content" style={{ borderRadius: 'var(--radius-lg)', border: 'none' }}>
                            <div 
                                className="modal-header" 
                                style={{ 
                                    background: 'linear-gradient(135deg, var(--athangudi-teal) 0%, #1a4a4a 100%)',
                                    color: 'white', 
                                    borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
                                    border: 'none'
                                }}
                            >
                                <h5 className="modal-title fw-bold">Payment Successful!</h5>
                                <button 
                                    type="button" 
                                    className="btn-close btn-close-white" 
                                    onClick={handleCloseModal}
                                ></button>
                            </div>
                            
                            <div className="modal-body p-4 text-center">
                                <div 
                                    className="d-inline-flex align-items-center justify-content-center mb-4"
                                    style={{
                                        width: '80px',
                                        height: '80px',
                                        backgroundColor: 'var(--athangudi-teal)',
                                        borderRadius: '50%'
                                    }}
                                >
                                    <svg 
                                        width="40" 
                                        height="40" 
                                        viewBox="0 0 24 24" 
                                        fill="none" 
                                        stroke="white" 
                                        strokeWidth="3"
                                    >
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                </div>
                                
                                <h4 className="mb-3" style={{ color: 'var(--athangudi-teal)' }}>
                                    Order Placed Successfully!
                                </h4>
                                
                                {orderData && (
                                    <div 
                                        className="p-3 mb-4"
                                        style={{ 
                                            backgroundColor: 'var(--earth-cream)', 
                                            borderRadius: 'var(--radius-md)' 
                                        }}
                                    >
                                        <p className="mb-2">
                                            <strong>Order Number:</strong> {orderData.orderNumber}
                                        </p>
                                        <p className="mb-2">
                                            <strong>Amount Paid:</strong> ₹{orderData.amount || orderData.subtotal}
                                        </p>
                                        <p className="mb-0">
                                            <strong>Invoice sent to:</strong> {form.customerEmail || user?.email}
                                        </p>
                                    </div>
                                )}
                                
                                <p className="text-muted">
                                    Thank you for your order! You will receive an invoice email shortly.
                                </p>
                            </div>
                            
                            <div className="modal-footer p-3" style={{ backgroundColor: 'var(--earth-cream)' }}>
                                <button 
                                    type="button" 
                                    className="btn btn-primary-chettinad btn-lg w-100"
                                    onClick={handleCloseModal}
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Checkout;
