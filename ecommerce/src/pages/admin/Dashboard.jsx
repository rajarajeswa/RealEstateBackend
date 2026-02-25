import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../App.css';
import { apiFetch, apiBase } from '../../api/client';

function Dashboard() {
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [editingProduct, setEditingProduct] = useState(null);
    const [newStock, setNewStock] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    useEffect(() => {
        Promise.all([
            apiFetch('/api/orders'),
            apiFetch('/api/premix/sambar'),
            apiFetch('/api/premix/rasam'),
            apiFetch('/api/premix/curry'),
            apiFetch('/api/premix/speciality')
        ]).then(responses => {
            const ordersData = responses[0].data.success ? responses[0].data.orders : [];
            const allProducts = [
                ...(responses[1].data.success ? responses[1].data.products : []),
                ...(responses[2].data.success ? responses[2].data.products : []),
                ...(responses[3].data.success ? responses[3].data.products : []),
                ...(responses[4].data.success ? responses[4].data.products : [])
            ];
            setOrders(ordersData);
            setProducts(allProducts);
        }).catch(err => {
            console.error('Error fetching data:', err);
        }).finally(() => setLoading(false));
    }, []);

    const updateStock = async (productId, quantity) => {
        try {
            const { data } = await apiFetch(`/api/products/${productId}/stock`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity: parseInt(quantity) })
            });
            if (data.success) {
                setProducts(products.map(p => p.id === productId ? { ...p, quantity: parseInt(quantity) } : p));
                setEditingProduct(null);
                setNewStock('');
                alert('Stock updated successfully!');
            } else {
                alert(data.message || 'Failed to update stock');
            }
        } catch (err) {
            alert(err.message || 'Failed to update stock');
        }
    };

    const deleteProduct = async (productId, productName) => {
        if (!window.confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
            return;
        }
        try {
            const { data } = await apiFetch(`/api/products/${productId}`, {
                method: 'DELETE'
            });
            if (data.success) {
                setProducts(products.filter(p => p.id !== productId));
                alert('Product deleted successfully!');
            } else {
                alert(data.message || 'Failed to delete product');
            }
        } catch (err) {
            alert(err.message || 'Failed to delete product');
        }
    };

    const updateOrderStatus = async (orderId, status) => {
        try {
            const { data } = await apiFetch(`/api/orders/${orderId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (data.success) {
                setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
            } else {
                alert(data.message || 'Failed to update status');
            }
        } catch (err) {
            alert(err.message || 'Failed to update status');
        }
    };

    const getStatusBadge = (status) => {
        const colors = {
            pending: 'bg-warning text-dark',
            paid: 'bg-info',
            completed: 'bg-success',
            cancelled: 'bg-danger'
        };
        return <span className={`badge ${colors[status] || 'bg-secondary'}`}>{status}</span>;
    };

    const totalRevenue = orders.filter(o => o.status === 'paid' || o.status === 'completed').reduce((sum, o) => sum + parseFloat(o.subtotal), 0);
    const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'paid').length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;

    // Filter products based on search and category
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             product.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    // Get unique categories for filter
    const uniqueCategories = [...new Set(products.map(p => p.category))];

    if (loading) {
        return (
            <div className="min-vh-100 py-5 d-flex align-items-center justify-content-center">
                <p style={{ color: 'var(--chettinad-charcoal)' }}>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="min-vh-100 py-5" style={{ fontFamily: 'var(--font-body)', backgroundColor: 'var(--athangudi-cream)' }}>
            <div className="container">
                <div className="text-center mb-4">
                    <div className="d-inline-block mb-2" style={{ width: '60px', height: '3px', backgroundColor: 'var(--chettinad-terracotta)' }} />
                    <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--chettinad-maroon)', fontWeight: 600 }}>Admin Dashboard</h2>
                    <p className="text-muted">Manage your store</p>
                </div>

                {/* Navigation Tabs */}
                <div className="chettinad-card p-2 mb-4">
                    <div className="nav nav-pills nav-fill">
                        <button className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')} style={activeTab === 'overview' ? { backgroundColor: 'var(--chettinad-maroon)', color: 'white' } : { color: 'var(--chettinad-charcoal)' }}>Overview</button>
                        <button className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')} style={activeTab === 'orders' ? { backgroundColor: 'var(--chettinad-maroon)', color: 'white' } : { color: 'var(--chettinad-charcoal)' }}>Orders</button>
                        <button className={`nav-link ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')} style={activeTab === 'products' ? { backgroundColor: 'var(--chettinad-maroon)', color: 'white' } : { color: 'var(--chettinad-charcoal)' }}>Products & Stock</button>
                        <button className={`nav-link ${activeTab === 'add' ? 'active' : ''}`} onClick={() => setActiveTab('add')} style={activeTab === 'add' ? { backgroundColor: 'var(--chettinad-maroon)', color: 'white' } : { color: 'var(--chettinad-charcoal)' }}>Add Product</button>
                    </div>
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div>
                        <div className="row g-4 mb-4">
                            <div className="col-md-3">
                                <div className="chettinad-card p-4 text-center">
                                    <h3 style={{ color: 'var(--chettinad-maroon)' }}>{orders.length}</h3>
                                    <p className="text-muted mb-0">Total Orders</p>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="chettinad-card p-4 text-center">
                                    <h3 style={{ color: 'var(--chettinad-terracotta)' }}>{pendingOrders}</h3>
                                    <p className="text-muted mb-0">Pending Orders</p>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="chettinad-card p-4 text-center">
                                    <h3 style={{ color: 'var(--athangudi-teal)' }}>{completedOrders}</h3>
                                    <p className="text-muted mb-0">Completed</p>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="chettinad-card p-4 text-center">
                                    <h3 style={{ color: 'var(--chettinad-maroon)' }}>₹{totalRevenue.toFixed(2)}</h3>
                                    <p className="text-muted mb-0">Revenue</p>
                                </div>
                            </div>
                        </div>

                        <div className="chettinad-card p-4">
                            <h5 className="fw-bold mb-3">Recent Orders</h5>
                            {orders.length === 0 ? (
                                <p className="text-muted">No orders yet</p>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Order #</th>
                                                <th>Customer</th>
                                                <th>Total</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.slice(0, 5).map(order => (
                                                <tr key={order.id}>
                                                    <td>{order.orderNumber}</td>
                                                    <td>{order.customerName || order.customerEmail}</td>
                                                    <td>₹{parseFloat(order.subtotal).toFixed(2)}</td>
                                                    <td>{getStatusBadge(order.status)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                    <div className="chettinad-card p-4">
                        <h5 className="fw-bold mb-3">All Orders</h5>
                        <div className="table-responsive">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Order #</th>
                                        <th>Date</th>
                                        <th>Customer</th>
                                        <th>Phone</th>
                                        <th>Address</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(order => (
                                        <tr key={order.id}>
                                            <td>{order.orderNumber}</td>
                                            <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <div>{order.customerName || '—'}</div>
                                                <small className="text-muted">{order.customerEmail}</small>
                                            </td>
                                            <td>{order.customerPhone || '—'}</td>
                                            <td style={{ maxWidth: '150px', fontSize: '0.85rem' }}>{order.shippingAddress || '—'}</td>
                                            <td>₹{parseFloat(order.subtotal).toFixed(2)}</td>
                                            <td>{getStatusBadge(order.status)}</td>
                                            <td>
                                                <div className="dropdown">
                                                    <button className="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">Update</button>
                                                    <ul className="dropdown-menu">
                                                        <li><button className="dropdown-item" onClick={() => updateOrderStatus(order.id, 'paid')}>Mark Paid</button></li>
                                                        <li><button className="dropdown-item" onClick={() => updateOrderStatus(order.id, 'completed')}>Mark Completed</button></li>
                                                        <li><button className="dropdown-item" onClick={() => updateOrderStatus(order.id, 'cancelled')}>Cancel</button></li>
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

                {/* Products Tab */}
                {activeTab === 'products' && (
                    <div className="chettinad-card p-4">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="fw-bold mb-0">Products & Stock Management</h5>
                            <Link to="/add" className="btn btn-chettinad-primary btn-sm">+ Add Product</Link>
                        </div>
                        
                        {/* Search and Filter */}
                        <div className="row g-3 mb-4">
                            <div className="col-md-6">
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    placeholder="🔍 Search products by name or category..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ borderRadius: '8px' }}
                                />
                            </div>
                            <div className="col-md-4">
                                <select 
                                    className="form-select" 
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    style={{ borderRadius: '8px' }}
                                >
                                    <option value="all">All Categories</option>
                                    {uniqueCategories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-2">
                                <span className="badge bg-secondary p-2" style={{ fontSize: '0.9rem' }}>
                                    {filteredProducts.length} products
                                </span>
                            </div>
                        </div>
                        
                        <div className="table-responsive">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Image</th>
                                        <th>Name</th>
                                        <th>Category</th>
                                        <th>Price</th>
                                        <th>Stock</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProducts.map(product => (
                                        <tr key={product.id}>
                                            <td>
                                                <img src={`${apiBase()}${product.image}`} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                                            </td>
                                            <td>{product.name}</td>
                                            <td>{product.category}</td>
                                            <td>₹{product.price}</td>
                                            <td>
                                                {editingProduct === product.id ? (
                                                    <input 
                                                        type="number" 
                                                        className="form-control form-control-sm" 
                                                        style={{ width: '80px' }}
                                                        value={newStock}
                                                        onChange={(e) => setNewStock(e.target.value)}
                                                    />
                                                ) : (
                                                    <span className={`badge ${product.quantity > 10 ? 'bg-success' : product.quantity > 0 ? 'bg-warning text-dark' : 'bg-danger'}`}>{product.quantity}</span>
                                                )}
                                            </td>
                                            <td>
                                                {editingProduct === product.id ? (
                                                    <>
                                                        <button className="btn btn-sm btn-success me-1" onClick={() => updateStock(product.id, newStock)}>Save</button>
                                                        <button className="btn btn-sm btn-secondary" onClick={() => { setEditingProduct(null); setNewStock(''); }}>Cancel</button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button className="btn btn-sm btn-outline-primary me-1" onClick={() => { setEditingProduct(product.id); setNewStock(product.quantity.toString()); }}>Update Stock</button>
                                                        <button className="btn btn-sm btn-outline-danger" onClick={() => deleteProduct(product.id, product.name)}>🗑️ Delete</button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Add Product Tab */}
                {activeTab === 'add' && (
                    <div className="chettinad-card p-4">
                        <h5 className="fw-bold mb-3">Add New Product</h5>
                        <p className="text-muted">Use the form below to add a new product</p>
                        <Link to="/add" className="btn btn-chettinad-primary">Go to Add Product Page</Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
