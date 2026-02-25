import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../App.css';
import { apiFetch } from '../../api/client';

function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');

    const fetchOrders = async (statusFilter = 'all') => {
        setLoading(true);
        try {
            const url = statusFilter && statusFilter !== 'all' ? `/api/orders?status=${statusFilter}` : '/api/orders';
            const { data } = await apiFetch(url);
            if (data.success) {
                const parsed = (data.orders || []).map(o => ({
                    ...o,
                    items: typeof o.items === 'string' ? JSON.parse(o.items) : (o.items || [])
                }));
                setOrders(parsed);
            }
        } catch (err) {
            setError(err.message || 'Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders(filter);
    }, [filter]);

    const updateStatus = async (orderId, newStatus) => {
        try {
            const { data } = await apiFetch(`/api/orders/${orderId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (data.success) {
                setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            } else {
                alert(data.message || 'Failed to update status');
            }
        } catch (err) {
            alert(err.message || 'Failed to update status');
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { class: 'bg-warning text-dark', icon: '⏳', label: 'Pending' },
            paid: { class: 'bg-info', icon: '💳', label: 'Paid' },
            completed: { class: 'bg-success', icon: '✓', label: 'Completed' },
            cancelled: { class: 'bg-danger', icon: '✕', label: 'Cancelled' },
            failed: { class: 'bg-danger', icon: '!', label: 'Failed' },
            refunded: { class: 'bg-secondary', icon: '↩', label: 'Refunded' }
        };
        const config = statusConfig[status] || { class: 'bg-secondary', icon: '•', label: status };
        return (
            <span className={`badge ${config.class}`} style={{ fontSize: '0.85rem', padding: '0.5em 0.75em' }}>
                {config.icon} {config.label}
            </span>
        );
    };

    const calculateTotalQuantity = (items) => {
        return items.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0);
    };

    if (loading && orders.length === 0) {
        return (
            <div className="min-vh-100 py-5 d-flex align-items-center justify-content-center" style={{ fontFamily: 'var(--font-body)', backgroundColor: 'var(--athangudi-cream)' }}>
                <div className="text-center">
                    <div className="spinner-border" style={{ color: 'var(--chettinad-maroon)' }} role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3" style={{ color: 'var(--chettinad-charcoal)' }}>Loading orders...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-vh-100 py-5 d-flex align-items-center justify-content-center" style={{ fontFamily: 'var(--font-body)', backgroundColor: 'var(--athangudi-cream)' }}>
                <div className="text-center">
                    <div className="chettinad-card p-5">
                        <div style={{ fontSize: '3rem', color: 'var(--chettinad-terracotta)' }}>⚠</div>
                        <p className="text-danger mt-3">{error}</p>
                        <Link to="/" className="btn btn-chettinad-primary mt-3">Return to Home</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-vh-100 py-5" style={{ fontFamily: 'var(--font-body)', backgroundColor: 'var(--athangudi-cream)' }}>
            <div className="container">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <div className="d-inline-block mb-2" style={{ width: '60px', height: '3px', backgroundColor: 'var(--chettinad-terracotta)' }} />
                        <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--chettinad-maroon)', fontWeight: 600 }}>
                            Order Management
                        </h2>
                        <p className="text-muted mb-0">View and manage customer orders</p>
                    </div>
                    <Link to="/add" className="btn btn-chettinad-outline">
                        <span className="me-2">+</span> Add Product
                    </Link>
                </div>

                {/* Filter Section */}
                <div className="chettinad-card p-4 mb-4">
                    <div className="d-flex align-items-center gap-3 flex-wrap">
                        <span className="fw-semibold" style={{ color: 'var(--chettinad-charcoal)' }}>
                            Filter by Status:
                        </span>
                        {['all', 'pending', 'paid', 'completed', 'cancelled'].map(status => (
                            <button
                                key={status}
                                className={`btn btn-sm ${filter === status ? 'btn-chettinad-primary' : 'btn-outline-secondary'}`}
                                onClick={() => setFilter(status)}
                            >
                                {status === 'all' ? 'All Orders' : status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {orders.length === 0 ? (
                    <div className="chettinad-card p-5 text-center">
                        <div style={{ fontSize: '3rem', color: 'var(--chettinad-ochre)' }}>📦</div>
                        <p className="text-muted mt-3 mb-0">No orders found matching your criteria.</p>
                    </div>
                ) : (
                    <div className="chettinad-card overflow-visible">
                        <div className="table-responsive" style={{ overflowX: 'auto', overflowY: 'visible' }}>
                            <table className="table table-hover mb-0" style={{ minWidth: '1200px' }}>
                                <thead style={{ backgroundColor: 'rgba(196, 92, 62, 0.1)' }}>
                                    <tr>
                                        <th style={{ fontWeight: 600 }}>Order ID</th>
                                        <th style={{ fontWeight: 600 }}>Date</th>
                                        <th style={{ fontWeight: 600 }}>Customer</th>
                                        <th style={{ fontWeight: 600 }}>Phone</th>
                                        <th style={{ fontWeight: 600 }}>Shipping Address</th>
                                        <th style={{ fontWeight: 600 }}>Transaction ID</th>
                                        <th style={{ fontWeight: 600 }}>Items</th>
                                        <th style={{ fontWeight: 600 }}>Total</th>
                                        <th style={{ fontWeight: 600 }}>Status</th>
                                        <th style={{ fontWeight: 600 }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr key={order.id}>
                                            <td>
                                                <span className="fw-bold" style={{ color: 'var(--chettinad-maroon)', fontFamily: 'monospace' }}>
                                                    {order.orderNumber}
                                                </span>
                                            </td>
                                            <td>
                                                <div>{new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</div>
                                                <small className="text-muted">
                                                    {new Date(order.createdAt).toLocaleTimeString('en-IN', { timeStyle: 'short' })}
                                                </small>
                                            </td>
                                            <td>
                                                <div className="fw-semibold">{order.customerName || 'N/A'}</div>
                                                <small className="text-muted">{order.customerEmail}</small>
                                            </td>
                                            <td>
                                                <span style={{ fontFamily: 'monospace' }}>{order.customerPhone || 'N/A'}</span>
                                            </td>
                                            <td style={{ maxWidth: '200px' }}>
                                                <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem', lineHeight: 1.4 }}>
                                                    {order.shippingAddress || 'N/A'}
                                                </div>
                                            </td>
                                            <td>
                                                {order.razorpayPaymentId || order.razorpayOrderId ? (
                                                    <code style={{ 
                                                        fontSize: '0.75rem', 
                                                        color: 'var(--athangudi-teal)',
                                                        backgroundColor: 'rgba(29, 79, 79, 0.1)',
                                                        padding: '0.25em 0.5em',
                                                        borderRadius: '4px'
                                                    }}>
                                                        {order.razorpayPaymentId || order.razorpayOrderId}
                                                    </code>
                                                ) : (
                                                    <span className="text-muted">—</span>
                                                )}
                                            </td>
                                            <td>
                                                <div>
                                                    {Array.isArray(order.items) ? (
                                                        <>
                                                            {order.items.slice(0, 2).map((item, idx) => (
                                                                <div key={idx} className="small">
                                                                    <span className="fw-medium">{item.name}</span>
                                                                    <span className="text-muted ms-1">×{item.quantity}</span>
                                                                </div>
                                                            ))}
                                                            {order.items.length > 2 && (
                                                                <small className="text-muted fst-italic">
                                                                    +{order.items.length - 2} more item(s)
                                                                </small>
                                                            )}
                                                            <div className="mt-1">
                                                                <span className="badge bg-light text-dark" style={{ fontSize: '0.75rem' }}>
                                                                    {calculateTotalQuantity(order.items)} items total
                                                                </span>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <span className="text-muted">N/A</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <span className="fw-bold" style={{ color: 'var(--chettinad-maroon)', fontSize: '1rem' }}>
                                                    ₹{parseFloat(order.subtotal).toFixed(2)}
                                                </span>
                                            </td>
                                            <td>{getStatusBadge(order.status)}</td>
                                            <td>
                                                <div className="dropup">
                                                    <button 
                                                        className="btn btn-sm btn-outline-secondary dropdown-toggle" 
                                                        type="button" 
                                                        data-bs-toggle="dropdown" 
                                                        aria-expanded="false"
                                                    >
                                                        Update Status
                                                    </button>
                                                    <ul className="dropdown-menu dropdown-menu-end" style={{ position: 'absolute', zIndex: 1050 }}>
                                                        <li>
                                                            <button 
                                                                className="dropdown-item d-flex align-items-center gap-2"
                                                                onClick={() => updateStatus(order.id, 'paid')}
                                                            >
                                                                <span style={{ color: 'var(--athangudi-teal)' }}>💳</span>
                                                                Mark as Paid
                                                            </button>
                                                        </li>
                                                        <li>
                                                            <button 
                                                                className="dropdown-item d-flex align-items-center gap-2"
                                                                onClick={() => updateStatus(order.id, 'completed')}
                                                            >
                                                                <span style={{ color: 'var(--athangudi-teal)' }}>✓</span>
                                                                Mark as Completed
                                                            </button>
                                                        </li>
                                                        <li><hr className="dropdown-divider" /></li>
                                                        <li>
                                                            <button 
                                                                className="dropdown-item d-flex align-items-center gap-2 text-danger"
                                                                onClick={() => updateStatus(order.id, 'cancelled')}
                                                            >
                                                                <span>✕</span>
                                                                Cancel Order
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Orders;
