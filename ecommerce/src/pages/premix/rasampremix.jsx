import { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../App.css';
import { useCart } from '../../context/CartContext';
import { apiFetch, apiBase } from '../../api/client';

// Rasam images for product cards
const rasamImages = [
    'https://www.sizzlingtastebuds.com/wp-content/uploads/2023/02/7-380x380.png',
    'https://healthybecause.in/cdn/shop/files/rasam.png?v=1708434303&width=832',
    'https://i0.wp.com/www.sharmiskitchen.com/wp-content/uploads/2023/03/Rasam-premix.jpg?fit=1200%2C1800&ssl=1',
    'https://i0.wp.com/desikhazana.in/wp-content/uploads/2021/03/rasam-Premix.jpg?fit=1728%2C1728&ssl=1',
    'https://mister-pop.com/wp-content/uploads/2025/06/rasam-premix.jpg',
    'https://premasculinary.com/wp-content/uploads/2022/07/Instant-Rasam-Premix-Powder-Recipe-768x1024.jpg',
    'https://premasculinary.com/wp-content/uploads/2022/07/Rasam-Premix-powder-step-4-1.jpg'
];

// Function to get image for product based on index (ensures no same images are next to each other)
const getProductImage = (index) => {
    return rasamImages[index % rasamImages.length];
};

function RasamPremix() {   
    const { addToCart } = useCart();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [quantities, setQuantities] = useState({});

    useEffect(() => {
        apiFetch('/api/premix/rasam')
            .then(({ data }) => {
                if (data.success) {
                    setProducts(data.products);
                    const initialQuantities = {};
                    data.products.forEach(p => {
                        initialQuantities[p.id] = 1;
                    });
                    setQuantities(initialQuantities);
                } else {
                    setError(data.message || 'Failed to fetch products');
                }
            })
            .catch(err => {
                console.error("Error fetching data:", err);
                setError(err.message || 'Connection error. Is the backend running?');
            })
            .finally(() => setLoading(false));
    }, []);

    const incrementQuantity = (productId, maxQty) => {
        setQuantities(prev => ({
            ...prev,
            [productId]: Math.min((prev[productId] || 1) + 1, maxQty)
        }));
    };

    const decrementQuantity = (productId) => {
        setQuantities(prev => ({
            ...prev,
            [productId]: Math.max((prev[productId] || 1) - 1, 1)
        }));
    };

    const handleAddToCart = (product) => {
        const qty = quantities[product.id] || 1;
        addToCart({ ...product, quantity: qty });
        setProducts(prev => prev.map(p => 
            p.id === product.id ? { ...p, quantity: p.quantity - qty } : p
        ));
        setQuantities(prev => ({ ...prev, [product.id]: 1 }));
    };

    if (loading) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ fontFamily: 'var(--font-body)', backgroundColor: 'var(--athangudi-cream)' }}>
                <p style={{ color: 'var(--chettinad-charcoal)' }}>Loading rasam products...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center p-4" style={{ fontFamily: 'var(--font-body)', backgroundColor: 'var(--athangudi-cream)' }}>
                <div className="alert chettinad-card border-danger" style={{ color: 'var(--chettinad-charcoal)' }}>❌ {error}</div>
            </div>
        );
    }

    return (
        <div className="min-vh-100 py-5" style={{ fontFamily: 'var(--font-body)', backgroundColor: 'var(--athangudi-cream)' }}>
            <div className="container">
                <div className="text-center mb-5">
                    <div className="d-inline-block mb-2" style={{ width: '60px', height: '3px', backgroundColor: 'var(--athangudi-teal)' }} />
                    <h2 className="mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--chettinad-maroon)', fontWeight: 600 }}>Rasam Premix Products</h2>
                    <p className="text-muted">Aromatic rasam masalas with traditional herbs</p>
                </div>
                {products.length === 0 ? (
                    <div className="text-center p-5 chettinad-card">
                        <p className="mb-0" style={{ color: 'var(--chettinad-charcoal)' }}>No rasam products available</p>
                    </div>
                ) : (
                    <div className="row g-4">
                        {products.map((product, index) => (
                            <div key={product.id} className="col-md-4">
                                <div className="chettinad-card card h-100 border-0 overflow-hidden">
                                    <div style={{ borderTop: '4px solid var(--athangudi-teal)' }}>
                                        <img 
                                            src={getProductImage(index)}
                                            className="card-img-top" 
                                            alt={product.name}
                                            style={{ height: '200px', objectFit: 'cover' }}
                                        />
                                    </div>
                                    <div className="card-body">
                                        <h5 className="card-title fw-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--chettinad-charcoal)' }}>{product.name}</h5>
                                        <p className="card-text text-muted small">{product.description}</p>
                                        <div className="d-flex justify-content-between align-items-center mt-3">
                                            <span className="h5 fw-bold mb-0" style={{ color: 'var(--chettinad-maroon)' }}>₹{product.price}</span>
                                            <small className="text-muted">Serves: {product.serving}</small>
                                        </div>
                                        <div className="mt-2">
                                            <small style={{ color: product.quantity > 0 ? 'var(--athangudi-teal)' : 'var(--chettinad-terracotta)' }}>
                                                {product.quantity > 0 ? `In Stock: ${product.quantity}` : 'Out of Stock'}
                                            </small>
                                        </div>
                                        
                                        {/* Quantity Selector */}
                                        {product.quantity > 0 && (
                                            <div className="d-flex align-items-center gap-2 mt-3 mb-3">
                                                <span className="small fw-bold">Qty:</span>
                                                <div className="btn-group" role="group">
                                                    <button 
                                                        type="button" 
                                                        className="btn btn-outline-secondary btn-sm"
                                                        onClick={() => decrementQuantity(product.id)}
                                                        disabled={quantities[product.id] <= 1}
                                                        style={{ width: '36px' }}
                                                    >
                                                        −
                                                    </button>
                                                    <span className="btn btn-outline-secondary btn-sm disabled" style={{ width: '50px' }}>
                                                        {quantities[product.id] || 1}
                                                    </span>
                                                    <button 
                                                        type="button" 
                                                        className="btn btn-outline-secondary btn-sm"
                                                        onClick={() => incrementQuantity(product.id, product.quantity)}
                                                        disabled={quantities[product.id] >= product.quantity}
                                                        style={{ width: '36px' }}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        
                                        <button 
                                            className="btn btn-chettinad-primary w-100"
                                            onClick={() => handleAddToCart(product)}
                                            disabled={product.quantity <= 0}
                                        >
                                            {product.quantity <= 0 ? 'Out of Stock' : `Add ${quantities[product.id] || 1} to Cart`}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )

}
export default RasamPremix;
