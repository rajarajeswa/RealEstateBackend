import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../App.css';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { apiFetch } from '../../api/client';

function MyOrders() {
    const { user, token, isAuthenticated } = useAuth();
    const { addToCart } = useCart();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isAuthenticated && token) {
            fetchOrders();
        }
    }, [isAuthenticated, token]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const { data } = await apiFetch('/api/my-orders', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (data.success) {
                setOrders(data.orders);
            } else {
                setError(data.message || 'Failed to fetch orders');
            }
        } catch (err) {
            setError(err.message || 'Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    const handleReorder = (order) => {
        order.items.forEach(item => {
            addToCart({
                productId: item.productId,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image
            });
        });
        alert('Items added to cart!');
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        const statusColors = {
            'pending': 'bg-warning text-dark',
            'paid': 'bg-success',
            'shipped': 'bg-info',
            'delivered': 'bg-success',
            'cancelled': 'bg-danger'
        };
        return statusColors[status] || 'bg-secondary';
    };

    if (!isAuthenticated) {
        return (
            <div className="min-vh-100 py-5 text-center" style={{ fontFamily: 'var(--font-body)', backgroundColor: 'var(--athangudi-cream)' }}>
                <div className="container">
                    <h3>Please login to view your orders</h3>
                    <Link to="/login" className="btn btn-chettinad-primary mt-3">Login</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-vh-100 py-5" style={{ fontFamily: 'var(--font-body)', backgroundColor: 'var(--athangudi-cream)' }}>
            <div className="container">
            <h2 className="mb-4" style={{ color: 'var(--chettinad-maroon)', fontFamily: 'var(--font-display)' }}>
                📦 My Orders
            </h2>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : error ? (
                <div className="alert alert-danger">{error}</div>
            ) : orders.length === 0 ? (
                <div className="text-center py-5">
                    <div style={{ fontSize: '4rem' }}>🛒</div>
                    <h4 className="mt-3">No orders yet</h4>
                    <p className="text-muted">Start shopping to see your orders here!</p>
                    <Link to="/" className="btn btn-chettinad-primary mt-2">Browse Products</Link>
                </div>
            ) : (
                <div className="row g-4">
                    {orders.map((order) => (
                        <div key={order.id} className="col-12">
                            <div className="card shadow-sm" style={{ borderRadius: '12px', border: 'none' }}>
                                <div className="card-header d-flex justify-content-between align-items-center" style={{ backgroundColor: 'var(--chettinad-cream)', borderRadius: '12px 12px 0 0' }}>
                                    <div>
                                        <span className="fw-bold">Order #{order.orderNumber}</span>
                                        <br />
                                        <small className="text-muted">{formatDate(order.createdAt)}</small>
                                    </div>
                                    <span className={`badge ${getStatusBadge(order.status)}`}>
                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </span>
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-8">
                                            <h6 className="mb-3">Items:</h6>
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="d-flex align-items-center mb-2 p-2" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                                                    {item.image && (
                                                        <img 
                                                            src={item.image.startsWith('http') ? item.image : `http://localhost:5000/uploads/${item.image}`}
                                                            alt={item.name}
                                                            style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }}
                                                            className="me-3"
                                                            onError={(e) => { e.target.style.display = 'none'; }}
                                                        />
                                                    )}
                                                    <div className="flex-grow-1">
                                                        <p className="mb-0 fw-medium">{item.name}</p>
                                                        <small className="text-muted">₹{item.price} × {item.quantity}</small>
                                                    </div>
                                                    <span className="fw-bold">₹{(parseFloat(item.price || 0) * parseInt(item.quantity || 1)).toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="col-md-4">
                                            <div className="p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                                                <p className="mb-2"><strong>Total:</strong> ₹{parseFloat(order.subtotal || 0).toFixed(2)}</p>
                                                {order.shippingAddress && (
                                                    <p className="mb-2 small">
                                                        <strong>Delivery:</strong><br />
                                                        {order.shippingAddress}
                                                    </p>
                                                )}
                                                {order.customerPhone && (
                                                    <p className="mb-0 small">
                                                        <strong>Phone:</strong> {order.customerPhone}
                                                    </p>
                                                )}
                                            </div>
                                            <button 
                                                className="btn btn-outline-primary w-100 mt-3"
                                                onClick={() => handleReorder(order)}
                                            >
                                                🔄 Reorder
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            </div>
        </div>
    );
}

export default MyOrders;