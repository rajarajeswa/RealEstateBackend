import { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../App.css';
import { useCart } from '../../context/CartContext';
import { apiFetch, apiBase } from '../../api/client';

// Sambar images for product cards
const sambarImages = [
    'https://www.spiceindiaonline.com/wp-content/uploads/2017/03/%E0%AE%AA%E0%AE%BE%E0%AE%9A%E0%AE%BF%E0%AE%AA%E0%AF%8D%E0%AE%AA%E0%AE%B0%E0%AF%81%E0%AE%AA%E0%AF%8D%E0%AE%AA%E0%AF%81-%E0%AE%9A%E0%AE%BE%E0%AE%AE%E0%AF%8D%E0%AE%AA%E0%AE%BE%E0%AE%B0%E0%AF%8D.jpg',
    'https://www.southindianfoods.in/gallery/south-indian-sambar.jpg',
    'https://i.pinimg.com/736x/eb/25/a9/eb25a99361f957917f7fb977464e7e74.jpg',
    'https://i.pinimg.com/736x/4a/1d/d7/4a1dd78b769f8e3444c8d5a6dccf1ad6.jpg',
    'https://www.whiskaffair.com/wp-content/uploads/2020/10/Sambar-2-3-640x853.jpg',
    'https://vismaifood.com/storage/app/uploads/public/bf3/8a5/b71/thumb__700_0_0_0_auto.jpg',
    'https://tse3.mm.bing.net/th/id/OIP.O6LB8LHw88U9scAQGwrFfgHaE3?rs=1&pid=ImgDetMain&o=7&rm=3',
    'https://tse4.mm.bing.net/th/id/OIP.4q0yCl6-uEv--pgX0hJVMwHaJ3?rs=1&pid=ImgDetMain&o=7&rm=3',
    'https://tse2.mm.bing.net/th/id/OIP.HJSeElRLI12n50WMLaeaIQAAAA?rs=1&pid=ImgDetMain&o=7&rm=3'
];

// Function to get image for product based on index (ensures no same images are next to each other)
const getProductImage = (index) => {
    return sambarImages[index % sambarImages.length];
};

function SambarPremix() {   
    const { addToCart } = useCart();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [quantities, setQuantities] = useState({});

    useEffect(() => {
        apiFetch('/api/premix/sambar')
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
                setError(err.message || 'Connection error. Is the backend running at ' + apiBase() + '?');
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
        // Update local product stock
        setProducts(prev => prev.map(p => 
            p.id === product.id ? { ...p, quantity: p.quantity - qty } : p
        ));
        setQuantities(prev => ({ ...prev, [product.id]: 1 }));
    };

    if (loading) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ fontFamily: 'var(--font-body)', backgroundColor: 'var(--athangudi-cream)' }}>
                <p style={{ color: 'var(--chettinad-charcoal)' }}>Loading sambar products...</p>
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
                    <div className="d-inline-block mb-2" style={{ width: '60px', height: '3px', backgroundColor: 'var(--chettinad-terracotta)' }} />
                    <h2 className="mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--chettinad-maroon)', fontWeight: 600 }}>Sambar Premix Products</h2>
                    <p className="text-muted">Traditional sambar masalas crafted with heritage recipes</p>
                </div>
                {products.length === 0 ? (
                    <div className="text-center p-5 chettinad-card">
                        <p className="mb-0" style={{ color: 'var(--chettinad-charcoal)' }}>No sambar products available</p>
                    </div>
                ) : (
                    <div className="row g-4">
                        {products.map((product, index) => (
                            <div key={product.id} className="col-md-4">
                                <div className="chettinad-card card h-100 border-0 overflow-hidden">
                                    <div style={{ borderTop: '4px solid var(--chettinad-terracotta)' }}>
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
                                            <small className="text-muted">Serves: {product.serving} people</small>
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
export default SambarPremix
