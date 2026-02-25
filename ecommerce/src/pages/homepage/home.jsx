import 'bootstrap/dist/css/bootstrap.min.css';
import '../../App.css';
import { Link } from 'react-router-dom';

function HomePage() {
    return (
        <div style={{ fontFamily: 'var(--font-body)', minHeight: '100vh', backgroundColor: 'var(--earth-ivory)' }}>
            {/* Hero Section */}
            <section className="hero-section">
                <img 
                    src="banner.jpg" 
                    alt="Authentic Chettinadu Masalas"
                    className="hero-bg"
                />
                <div className="hero-overlay"></div>
                
                <div className="container hero-content">
                    <div className="row align-items-center">
                        <div className="col-lg-7">
                            <div className="hero-badge animate-fadeInUp">
                                Premium Quality Spices
                            </div>
                            
                            <h1 className="hero-title animate-fadeInUp stagger-1">
                                Authentic <span>Chettinadu</span> Masalas
                            </h1>
                            
                            <p className="hero-subtitle animate-fadeInUp stagger-2">
                                Traditional stone-ground spices crafted with generations of expertise. 
                                Experience the true taste of Tamil Nadu's rich culinary heritage.
                            </p>
                            
                            <div className="d-flex gap-3 flex-wrap animate-fadeInUp stagger-3">
                                <Link to="/sambar-powder" className="btn btn-accent-chettinad btn-lg">
                                    Explore Collection
                                </Link>
                                <Link to="/about" className="btn btn-outline-chettinad btn-lg" style={{ borderColor: 'rgba(255,255,255,0.5)', color: 'var(--earth-ivory)' }}>
                                    Our Story
                                </Link>
                            </div>
                            
                            <div className="hero-features animate-fadeInUp stagger-4">
                                <div className="hero-feature">
                                    <span className="dot"></span>
                                    100% Natural Ingredients
                                </div>
                                <div className="hero-feature">
                                    <span className="dot"></span>
                                    Free Shipping Pan India
                                </div>
                                <div className="hero-feature">
                                    <span className="dot"></span>
                                    Premium Quality
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Decorative bottom border */}
                <div 
                    className="position-absolute bottom-0 start-0 w-100" 
                    style={{ 
                        height: '6px', 
                        background: 'repeating-linear-gradient(90deg, var(--primary-maroon), var(--primary-maroon) 30px, var(--gold-primary) 30px, var(--gold-primary) 60px)',
                        zIndex: 3
                    }}
                />
            </section>

            {/* Features Section */}
            <section className="py-5">
                <div className="container py-4">
                    <div className="section-heading">
                        <span className="subtitle">Our Promise</span>
                        <h2 className="title">Heritage Crafted Excellence</h2>
                        <div className="divider">
                            <span className="icon">◆</span>
                        </div>
                    </div>
                    
                    <div className="row g-4">
                        {[
                            { title: 'Stone Ground', desc: 'Traditional grinding methods preserve authentic flavors and aromas', color: 'var(--athangudi-teal)' },
                            { title: '100% Natural', desc: 'No artificial preservatives, colors, or additives - just pure spices', color: 'var(--spice-corriander)' },
                            { title: 'Heritage Recipes', desc: 'Generations of authentic Chettinadu recipes passed down through time', color: 'var(--primary-maroon)' },
                            { title: 'Premium Quality', desc: 'Handpicked spices sourced from the finest farms across Tamil Nadu', color: 'var(--spice-turmeric)' }
                        ].map((item, i) => (
                            <div key={i} className="col-md-6 col-lg-3">
                                <div 
                                    className="feature-card h-100"
                                    style={{ '--feature-color': item.color }}
                                >
                                    <div className="feature-icon">
                                        <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>0{i + 1}</span>
                                    </div>
                                    <h5 className="feature-title">{item.title}</h5>
                                    <p className="feature-description">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Products Section */}
            <section className="py-5" style={{ backgroundColor: 'var(--earth-cream)' }}>
                <div className="container py-4">
                    <div className="section-heading">
                        <span className="subtitle">Discover</span>
                        <h2 className="title">Premium Spice Collection</h2>
                        <div className="divider">
                            <span className="icon">◆</span>
                        </div>
                        <p className="description">
                            Explore our authentic Chettinadu masalas, crafted with love and tradition
                        </p>
                    </div>
                    
                    <div className="row g-4">
                        {[
                            { 
                                title: 'Sambar Powder', 
                                desc: 'Traditional blend with 15+ authentic spices for the perfect sambar',
                                route: '/sambar-powder',
                                tag: 'Best Seller'
                            },
                            { 
                                title: 'Rasam Powder', 
                                desc: 'Aromatic blend with traditional herbs for a soul-warming rasam',
                                route: '/rasam-powder',
                                tag: 'Popular'
                            },
                            { 
                                title: 'Curry Premix', 
                                desc: 'Versatile blend for rich, flavorful curries every time',
                                route: '/curry-powder',
                                tag: 'New'
                            },
                            { 
                                title: 'Special Masalas', 
                                desc: 'Exclusive Chettinadu special blends for unique dishes',
                                route: '/speciality-powder',
                                tag: 'Premium'
                            }
                        ].map((product, i) => (
                            <div key={i} className="col-md-6 col-lg-3">
                                <div className="product-card h-100">
                                    <div className="product-image">
                                        {product.tag && (
                                            <span 
                                                className="position-absolute top-0 end-0 m-3 px-3 py-1"
                                                style={{
                                                    background: 'var(--primary-maroon)',
                                                    color: 'var(--gold-light)',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    borderRadius: 'var(--radius-full)',
                                                    letterSpacing: '0.5px'
                                                }}
                                            >
                                                {product.tag}
                                            </span>
                                        )}
                                        <div className="product-icon">
                                            <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--gold-light)' }}>
                                                {product.title.charAt(0)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="product-content">
                                        <h5 className="product-title">{product.title}</h5>
                                        <p className="product-description">{product.desc}</p>
                                        <Link 
                                            to={product.route} 
                                            className="btn btn-primary-chettinad w-100"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Banner */}
            <section className="cta-section">
                <div className="cta-pattern"></div>
                <div className="container">
                    <div className="cta-content">
                        <h2 className="cta-title">
                            Experience True Chettinadu Flavor
                        </h2>
                        <p className="cta-subtitle">
                            Handcrafted with authentic recipes passed down through generations. 
                            Bring the taste of Tamil Nadu to your kitchen.
                        </p>
                        <Link to="/sambar-powder" className="btn btn-accent-chettinad btn-lg">
                            Shop Premium Collection
                        </Link>
                    </div>
                </div>
            </section>

            {/* Our Story Section */}
            <section className="py-5">
                <div className="container py-4">
                    <div className="row align-items-center g-5">
                        <div className="col-lg-6">
                            <div 
                                className="position-relative"
                                style={{ 
                                    borderRadius: 'var(--radius-lg)',
                                    overflow: 'hidden',
                                    boxShadow: 'var(--shadow-xl)'
                                }}
                            >
                                <img 
                                    src="49668803207_5b0095c196_b.jpg" 
                                    alt="Traditional Spice Preparation"
                                    style={{
                                        width: '100%',
                                        height: '450px',
                                        objectFit: 'cover'
                                    }}
                                />
                                <div 
                                    className="position-absolute bottom-0 start-0 w-100 p-4"
                                    style={{
                                        background: 'linear-gradient(transparent, rgba(0,0,0,0.8))'
                                    }}
                                >
                                    <p className="text-white mb-0" style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                                        Traditional stone-grinding process preserving authentic flavors
                                    </p>
                                </div>
                                {/* Decorative corner accent */}
                                <div 
                                    className="position-absolute top-0 start-0"
                                    style={{
                                        width: '80px',
                                        height: '80px',
                                        background: 'linear-gradient(135deg, var(--gold-primary) 50%, transparent 50%)'
                                    }}
                                />
                            </div>
                        </div>
                        
                        <div className="col-lg-6">
                            <div className="section-heading text-start">
                                <span className="subtitle">Our Heritage</span>
                                <h2 className="title">A Legacy of Authentic Flavors</h2>
                            </div>
                            
                            <p style={{ lineHeight: 1.8, marginBottom: '1.5rem' }}>
                                Since 1965, <strong style={{ color: 'var(--primary-maroon)' }}>Kara-Saaram</strong> has been 
                                preserving the authentic taste of Chettinadu cuisine. Our masalas are crafted using 
                                time-honored techniques, with each spice carefully selected and stone-ground to perfection.
                            </p>
                            
                            <p style={{ lineHeight: 1.8, marginBottom: '2rem' }}>
                                From the sun-dried chillies of Ramnad to the hand-picked coriander seeds, every ingredient 
                                tells a story of tradition, quality, and the passionate pursuit of authentic flavor. 
                                We bring the rich culinary heritage of Tamil Nadu's Chettinad region to your kitchen.
                            </p>
                            
                            <div className="row g-3 mb-4">
                                {[
                                    { text: 'Three generations of expertise' },
                                    { text: 'Traditional stone-grinding methods' },
                                    { text: 'Sourced from local farmers' }
                                ].map((item, i) => (
                                    <div key={i} className="col-sm-6">
                                        <div className="d-flex align-items-center gap-2">
                                            <span 
                                                style={{
                                                    width: '8px',
                                                    height: '8px',
                                                    background: 'var(--athangudi-teal)',
                                                    borderRadius: '50%'
                                                }}
                                            />
                                            <span style={{ fontSize: '0.95rem' }}>{item.text}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <Link to="/about" className="btn btn-primary-chettinad">
                                Learn More About Us
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Us Section */}
            <section className="py-5" style={{ backgroundColor: 'var(--primary-maroon)' }}>
                <div className="container py-4">
                    <div className="text-center mb-5">
                        <span 
                            className="d-inline-block px-4 py-2 mb-3"
                            style={{
                                background: 'rgba(212, 175, 55, 0.2)',
                                color: 'var(--gold-light)',
                                borderRadius: 'var(--radius-full)',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                letterSpacing: '1px'
                            }}
                        >
                            Why Choose Us
                        </span>
                        <h2 
                            className="display-5 fw-bold text-white mb-3" 
                            style={{ fontFamily: 'var(--font-display)' }}
                        >
                            The Kara-Saaram Difference
                        </h2>
                        <p className="text-white" style={{ opacity: 0.85, maxWidth: '600px', margin: '0 auto' }}>
                            Quality and authenticity in every pack - that's our promise to you
                        </p>
                    </div>
                    
                    <div className="row g-4">
                        {[
                            { title: 'Farm Fresh', desc: 'Sourced directly from trusted farmers across Tamil Nadu' },
                            { title: 'Traditional Roasting', desc: 'Each spice roasted to perfection for enhanced aroma' },
                            { title: 'Hygienic Packaging', desc: 'Vacuum-sealed to preserve freshness and flavor' },
                            { title: 'Fast Delivery', desc: 'Quick shipping across India with careful handling' },
                            { title: 'Quality Assured', desc: 'Every batch tested for purity and consistency' },
                            { title: 'Dedicated Support', desc: 'Expert help for recipes and cooking tips' }
                        ].map((item, i) => (
                            <div key={i} className="col-md-6 col-lg-4">
                                <div 
                                    className="p-4 h-100 text-center"
                                    style={{ 
                                        backgroundColor: 'rgba(255,255,255,0.08)', 
                                        borderRadius: 'var(--radius-lg)',
                                        transition: 'all var(--transition-normal)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)';
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    <div 
                                        style={{
                                            width: '50px',
                                            height: '50px',
                                            background: 'var(--gold-primary)',
                                            borderRadius: 'var(--radius-md)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            margin: '0 auto 1rem',
                                            fontSize: '1.25rem',
                                            fontWeight: 700,
                                            color: 'var(--primary-maroon)'
                                        }}
                                    >
                                        {String(i + 1).padStart(2, '0')}
                                    </div>
                                    <h5 
                                        className="fw-bold mt-3 mb-2 text-white" 
                                        style={{ fontFamily: 'var(--font-display)' }}
                                    >
                                        {item.title}
                                    </h5>
                                    <p className="text-white mb-0" style={{ opacity: 0.8, fontSize: '0.9rem' }}>
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-5">
                <div className="container py-4">
                    <div className="row text-center">
                        {[
                            { number: '50+', label: 'Years of Heritage' },
                            { number: '15+', label: 'Authentic Blends' },
                            { number: '10K+', label: 'Happy Customers' },
                            { number: '100%', label: 'Natural Ingredients' }
                        ].map((stat, i) => (
                            <div key={i} className="col-6 col-md-3">
                                <div className="stat-item">
                                    <h2 className="stat-number">{stat.number}</h2>
                                    <p className="stat-label">{stat.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-5" style={{ backgroundColor: 'var(--earth-cream)' }}>
                <div className="container py-4">
                    <div className="section-heading">
                        <span className="subtitle">Testimonials</span>
                        <h2 className="title">What Our Customers Say</h2>
                        <div className="divider">
                            <span className="icon">◆</span>
                        </div>
                        <p className="description">
                            Trusted by thousands of home cooks across India
                        </p>
                    </div>
                    
                    <div className="row g-4">
                        {[
                            { 
                                name: 'Lakshmi R.', 
                                location: 'Chennai', 
                                text: 'The sambar powder reminds me of my grandmother\'s cooking. Absolutely authentic and fresh! The aroma itself takes me back to my childhood.',
                                rating: 5 
                            },
                            { 
                                name: 'Priya M.', 
                                location: 'Bangalore', 
                                text: 'Best rasam powder I\'ve ever used. The aroma is incredible and the taste is just perfect. Will definitely order again!',
                                rating: 5 
                            },
                            { 
                                name: 'Anand K.', 
                                location: 'Mumbai', 
                                text: 'Finally found authentic Chettinadu masalas outside Tamil Nadu. Quality is top-notch and the packaging keeps everything fresh.',
                                rating: 5 
                            }
                        ].map((testimonial, i) => (
                            <div key={i} className="col-lg-4">
                                <div className="testimonial-card">
                                    <div className="testimonial-rating">
                                        {[...Array(testimonial.rating)].map((_, j) => (
                                            <span key={j} className="star">★</span>
                                        ))}
                                    </div>
                                    <p className="testimonial-text">
                                        "{testimonial.text}"
                                    </p>
                                    <div className="testimonial-author">
                                        <div className="author-avatar">
                                            {testimonial.name.charAt(0)}
                                        </div>
                                        <div className="author-info">
                                            <div className="author-name">{testimonial.name}</div>
                                            <div className="author-location">{testimonial.location}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How to Use Section */}
            <section className="py-5">
                <div className="container py-4">
                    <div className="section-heading">
                        <span className="subtitle">Simple Steps</span>
                        <h2 className="title">How to Use Our Masalas</h2>
                        <div className="divider">
                            <span className="icon">◆</span>
                        </div>
                        <p className="description">
                            Bring restaurant-quality flavors to your kitchen in three simple steps
                        </p>
                    </div>
                    
                    <div className="row g-4">
                        {[
                            { step: '01', title: 'Choose Your Blend', desc: 'Select from our range of authentic Chettinadu masalas - each crafted for a specific dish', color: 'var(--primary-maroon)' },
                            { step: '02', title: 'Add to Your Dish', desc: 'Use 1-2 tablespoons for perfect flavor balance. Adjust to your taste preference', color: 'var(--athangudi-teal)' },
                            { step: '03', title: 'Cook & Enjoy', desc: 'Experience the authentic taste of Chettinadu at home with family and friends', color: 'var(--spice-turmeric)' }
                        ].map((item, i) => (
                            <div key={i} className="col-md-4">
                                <div 
                                    className="text-center p-4 h-100"
                                    style={{
                                        background: 'var(--earth-ivory)',
                                        borderRadius: 'var(--radius-lg)',
                                        border: '1px solid rgba(114, 47, 55, 0.08)'
                                    }}
                                >
                                    <div 
                                        className="d-inline-flex align-items-center justify-content-center mb-4"
                                        style={{ 
                                            width: '90px', 
                                            height: '90px', 
                                            backgroundColor: item.color, 
                                            borderRadius: '50%',
                                            boxShadow: 'var(--shadow-md)'
                                        }}
                                    >
                                        <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--earth-ivory)' }}>
                                            {item.step}
                                        </span>
                                    </div>
                                    
                                    <h5 
                                        className="fw-bold mb-2" 
                                        style={{ fontFamily: 'var(--font-display)', color: 'var(--neutral-charcoal)' }}
                                    >
                                        {item.title}
                                    </h5>
                                    <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Newsletter Section */}
            <section className="newsletter-section">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-6 text-center">
                            <h3 className="newsletter-title">
                                Stay Connected
                            </h3>
                            <p className="newsletter-subtitle">
                                Subscribe for authentic recipes, cooking tips, and exclusive offers
                            </p>
                            <div className="newsletter-form">
                                <input 
                                    type="email" 
                                    className="newsletter-input" 
                                    placeholder="Enter your email address"
                                />
                                <button className="btn btn-accent-chettinad newsletter-btn">
                                    Subscribe
                                </button>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginTop: '1rem' }}>
                                We respect your privacy. Unsubscribe anytime.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="container py-5 text-center">
                <div className="py-5">
                    <span 
                        className="d-inline-block mb-3"
                        style={{
                            fontFamily: 'var(--font-accent)',
                            fontSize: '1.5rem',
                            color: 'var(--spice-turmeric)'
                        }}
                    >
                        Ready to Taste?
                    </span>
                    <h2 
                        className="display-5 fw-bold mb-4" 
                        style={{ fontFamily: 'var(--font-display)', color: 'var(--primary-maroon)' }}
                    >
                        Experience Authentic Chettinadu Today
                    </h2>
                    <p 
                        className="lead mb-4" 
                        style={{ 
                            fontFamily: 'var(--font-body)', 
                            maxWidth: '600px', 
                            margin: '0 auto 2rem',
                            color: 'var(--neutral-warm-gray)'
                        }}
                    >
                        Order now and bring the rich, aromatic flavors of Chettinadu heritage to your kitchen. 
                        Your taste buds will thank you.
                    </p>
                    <div className="d-flex gap-3 justify-content-center flex-wrap">
                        <Link to="/sambar-powder" className="btn btn-primary-chettinad btn-lg px-5">
                            Shop Now
                        </Link>
                        <Link to="/about" className="btn btn-outline-chettinad btn-lg px-5">
                            Learn More
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer 
                className="py-5"
                style={{ 
                    backgroundColor: 'var(--neutral-charcoal)',
                    borderTop: '4px solid var(--gold-primary)'
                }}
            >
                <div className="container">
                    <div className="row g-4">
                        <div className="col-lg-4">
                            <h4 style={{ fontFamily: 'var(--font-display)', color: 'var(--earth-ivory)' }}>
                                Kara-Saaram
                            </h4>
                            <p style={{ fontFamily: 'var(--font-accent)', color: 'var(--spice-turmeric)', fontSize: '1.25rem' }}>
                                Authentic Chettinadu Masalas
                            </p>
                            <p style={{ color: 'var(--neutral-light)', fontSize: '0.9rem', marginTop: '1rem' }}>
                                Bringing the authentic taste of Chettinadu to kitchens across India since 1965.
                            </p>
                        </div>
                        <div className="col-lg-4">
                            <h6 style={{ color: 'var(--earth-ivory)', fontWeight: 600, marginBottom: '1rem' }}>
                                Quick Links
                            </h6>
                            <ul className="list-unstyled">
                                {[
                                    { name: 'Sambar Powder', path: '/sambar-powder' },
                                    { name: 'Rasam Powder', path: '/rasam-powder' },
                                    { name: 'Curry Premix', path: '/curry-powder' },
                                    { name: 'Special Masalas', path: '/speciality-powder' },
                                    { name: 'About Us', path: '/about' }
                                ].map((link, i) => (
                                    <li key={i} className="mb-2">
                                        <Link 
                                            to={link.path} 
                                            style={{ 
                                                color: 'var(--neutral-light)', 
                                                textDecoration: 'none',
                                                fontSize: '0.9rem',
                                                transition: 'color var(--transition-fast)'
                                            }}
                                            onMouseEnter={(e) => e.target.style.color = 'var(--gold-primary)'}
                                            onMouseLeave={(e) => e.target.style.color = 'var(--neutral-light)'}
                                        >
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="col-lg-4">
                            <h6 style={{ color: 'var(--earth-ivory)', fontWeight: 600, marginBottom: '1rem' }}>
                                Contact Us
                            </h6>
                            <p style={{ color: 'var(--neutral-light)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                Email: info@kara-saaram.com
                            </p>
                            <p style={{ color: 'var(--neutral-light)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                Phone: +91 98765 43210
                            </p>
                            <p style={{ color: 'var(--neutral-light)', fontSize: '0.9rem' }}>
                                Location: Chettinad, Tamil Nadu, India
                            </p>
                        </div>
                    </div>
                    <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '2rem 0 1rem' }} />
                    <p className="text-center mb-0" style={{ color: 'var(--neutral-light)', fontSize: '0.85rem' }}>
                        © 2024 Kara-Saaram. All rights reserved. Crafted with passion in Chettinad.
                    </p>
                </div>
            </footer>
        </div>
    );
}

export default HomePage;
