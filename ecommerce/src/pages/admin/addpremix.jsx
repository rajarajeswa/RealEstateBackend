import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../App.css';

function AddPremix() {
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [formData, setFormData] = useState({
        name: '', category: '', price: '', serving: '', description: '', quantity: '', image: null
    });

    // These MUST match the 'isIn' array in your Sequelize model exactly
    const categories = {
        "Sambar": ["Traditional Sambar", "Vegetable Sambar", "Tamarind Sambar", "Drumstick Sambar", "Palak Sambar"],
        "Rasam": ["Traditional Rasam", "Lemon Rasam", "Pepper Rasam", "Garlic Rasam", "Tomato Rasam"],
        "Curry": ["Chicken Curry", "Vegetable Curry", "Fish Curry", "Egg Curry", "Paneer Curry"],
        "Rice Dishes": ["Biryani", "Pulao", "Tomato Rice", "Lemon Rice", "Curd Rice"],
        "Soups": ["Tomato Soup", "Vegetable Soup", "Chicken Soup", "Mushroom Soup", "Sweet Corn Soup"],
        "Beverages": ["Tea", "Coffee", "Badam Milk", "Horlicks", "Boost"],
        "Desserts": ["Kheer Mix", "Payasam Mix", "Halwa Mix", "Pudding Mix", "Custard Mix"],
        "Breakfast": ["Idli Mix", "Dosa Mix", "Upma Mix", "Poha Mix", "Oats Mix"],
        "Snacks": ["Bhel Mix", "Chaat Mix", "Samosa Mix", "Pakora Mix", "Vada Mix"],
        "Regional Special": ["Chettinadu Special", "Kongunadu Special", "Madurai Special", "Tirunelveli Special", "Kanyakumari Special"]
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'image' ? files[0] : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        
        // Validate all fields
        if (!formData.name || formData.name.trim() === '') {
            setMessage('❌ Please enter a product name');
            setLoading(false);
            return;
        }
        
        if (!formData.category || formData.category.trim() === '') {
            setMessage('❌ Please select a category');
            setLoading(false);
            return;
        }
        
        if (!formData.price || formData.price.trim() === '' || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
            setMessage('❌ Please enter a valid price');
            setLoading(false);
            return;
        }
        
        if (!formData.serving || formData.serving.trim() === '' || isNaN(formData.serving) || parseInt(formData.serving) <= 0) {
            setMessage('❌ Please enter valid serving information');
            setLoading(false);
            return;
        }
        
        if (!formData.description || formData.description.trim() === '' || formData.description.trim().length < 10) {
            setMessage('❌ Description must be at least 10 characters long');
            setLoading(false);
            return;
        }
        
        if (!formData.quantity || formData.quantity.trim() === '' || isNaN(formData.quantity) || parseInt(formData.quantity) < 0) {
            setMessage('❌ Please enter a valid quantity');
            setLoading(false);
            return;
        }
        
        // Validate image first
        if (!formData.image) {
            setMessage('❌ Please select an image');
            setLoading(false);
            return;
        }
        
        const data = new FormData();
        
        data.append('name', formData.name);
        data.append('category', formData.category);
        data.append('price', formData.price);
        data.append('serving', formData.serving); 
        data.append('description', formData.description);
        data.append('quantity', formData.quantity);
        data.append('image', formData.image);

        try {
            const response = await fetch('http://localhost:5000/api/add', {
                method: 'POST',
                body: data
            });
            
            const result = await response.json();
            
            if (result.success) {
                setMessage('✅ Product added successfully!');
                setFormData({ name: '', category: '', price: '', serving: '', description: '', quantity: '', image: null });
                fileInputRef.current.value = "";
            } else {
                setMessage(`❌ Error: ${result.message}`);
            }
        } catch (err) {
            setMessage(`❌ Connection failed: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-vh-100 py-5" style={{ fontFamily: 'var(--font-body)', backgroundColor: 'var(--athangudi-cream)' }}>
            <div className="container">
                <div className="mb-4">
                    <Link to="/admin" className="btn btn-chettinad-outline">← Back to Dashboard</Link>
                </div>
                
                <div className="chettinad-card p-4 p-md-5">
                    <div className="text-center mb-4">
                        <div className="d-inline-block mb-2" style={{ width: '60px', height: '3px', backgroundColor: 'var(--chettinad-terracotta)' }} />
                        <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--chettinad-maroon)', fontWeight: 600 }}>
                            Add New Premix Product
                        </h2>
                        <p className="text-muted">Fill in the details to add a new product</p>
                    </div>
                    
                    {message && (
                        <div className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-danger'} mb-4`}>
                            {message}
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit}>
                        <div className="row g-4">
                            <div className="col-md-6">
                                <label className="form-label fw-bold" style={{ color: 'var(--chettinad-charcoal)' }}>
                                    Product Name *
                                </label>
                                <input 
                                    type="text" 
                                    name="name" 
                                    className="form-control form-control-lg" 
                                    value={formData.name} 
                                    onChange={handleChange} 
                                    placeholder="Enter product name"
                                    style={{ borderRadius: '8px' }}
                                    required 
                                />
                            </div>
                            
                            <div className="col-md-6">
                                <label className="form-label fw-bold" style={{ color: 'var(--chettinad-charcoal)' }}>
                                    Category *
                                </label>
                                <select 
                                    name="category" 
                                    className="form-select form-select-lg" 
                                    value={formData.category} 
                                    onChange={handleChange}
                                    style={{ borderRadius: '8px' }}
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {Object.entries(categories).map(([group, items]) => (
                                        <optgroup key={group} label={`${group}`}>
                                            {items.map(item => <option key={item} value={item}>{item}</option>)}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="col-md-4">
                                <label className="form-label fw-bold" style={{ color: 'var(--chettinad-charcoal)' }}>
                                    Price (₹) *
                                </label>
                                <input 
                                    type="number" 
                                    name="price" 
                                    className="form-control form-control-lg" 
                                    value={formData.price} 
                                    onChange={handleChange} 
                                    step="0.01"
                                    placeholder="0.00"
                                    style={{ borderRadius: '8px' }}
                                    required 
                                />
                            </div>
                            
                            <div className="col-md-4">
                                <label className="form-label fw-bold" style={{ color: 'var(--chettinad-charcoal)' }}>
                                    Servings *
                                </label>
                                <input 
                                    type="number" 
                                    name="serving" 
                                    className="form-control form-control-lg" 
                                    value={formData.serving} 
                                    onChange={handleChange}
                                    placeholder="Number of servings"
                                    style={{ borderRadius: '8px' }}
                                    required 
                                />
                            </div>
                            
                            <div className="col-md-4">
                                <label className="form-label fw-bold" style={{ color: 'var(--chettinad-charcoal)' }}>
                                    Initial Stock *
                                </label>
                                <input 
                                    type="number" 
                                    name="quantity" 
                                    className="form-control form-control-lg" 
                                    value={formData.quantity} 
                                    onChange={handleChange}
                                    placeholder="Available quantity"
                                    style={{ borderRadius: '8px' }}
                                    required 
                                />
                            </div>
                            
                            <div className="col-12">
                                <label className="form-label fw-bold" style={{ color: 'var(--chettinad-charcoal)' }}>
                                    Description * (minimum 10 characters)
                                </label>
                                <textarea 
                                    name="description" 
                                    className="form-control" 
                                    rows="4" 
                                    value={formData.description} 
                                    onChange={handleChange}
                                    placeholder="Describe your product in detail..."
                                    style={{ borderRadius: '8px', resize: 'vertical' }}
                                    required
                                ></textarea>
                            </div>
                            
                            <div className="col-12">
                                <label className="form-label fw-bold" style={{ color: 'var(--chettinad-charcoal)' }}>
                                    Product Image *
                                </label>
                                <input 
                                    type="file" 
                                    name="image" 
                                    ref={fileInputRef} 
                                    className="form-control form-control-lg" 
                                    onChange={handleChange}
                                    accept="image/*"
                                    style={{ borderRadius: '8px' }}
                                    required 
                                />
                                <small className="text-muted">Supported formats: JPG, PNG, GIF</small>
                            </div>
                            
                            <div className="col-12 mt-4">
                                <button 
                                    type="submit" 
                                    className="btn btn-chettinad-primary btn-lg w-100"
                                    disabled={loading}
                                    style={{ borderRadius: '8px', padding: '12px' }}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Saving Product...
                                        </>
                                    ) : (
                                        '📤 Upload Product'
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AddPremix;