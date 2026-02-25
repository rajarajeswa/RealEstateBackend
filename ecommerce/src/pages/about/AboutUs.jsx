import 'bootstrap/dist/css/bootstrap.min.css';
import '../../App.css';

function AboutUs() {
    return (
        <div className="min-vh-100 py-5" style={{ fontFamily: 'var(--font-body)', backgroundColor: 'var(--athangudi-cream)' }}>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-10">
                        <div className="text-center mb-5">
                            <div className="d-inline-block mb-2" style={{ width: '60px', height: '3px', backgroundColor: 'var(--chettinad-terracotta)' }} />
                            <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--chettinad-maroon)', fontWeight: 600 }}>About Kara-Saaram</h1>
                            <p className="lead text-muted">Authentic Chettinadu masalas since 1965</p>
                        </div>

                        <div className="chettinad-card p-5 mb-5">
                            <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--chettinad-charcoal)', fontWeight: 600 }}>Our Story</h3>
                            <p className="text-muted mb-0">
                                Kara-Saaram was born in the heart of Chettinad, where spice routes and tradition meet. For over five decades we have been crafting masalas the way our ancestors did—stone-ground, slow-roasted, and blended by hand. What started as a small family enterprise in 1965 has grown into a name that home cooks and chefs trust for the true taste of Tamil Nadu.
                            </p>
                        </div>

                        <div className="row g-4 mb-5">
                            <div className="col-md-4">
                                <div className="chettinad-card p-4 h-100" style={{ borderTop: '4px solid var(--chettinad-terracotta)' }}>
                                    <h5 style={{ fontFamily: 'var(--font-display)', color: 'var(--chettinad-maroon)' }}>Heritage</h5>
                                    <p className="text-muted small mb-0">
                                        Every blend carries the legacy of Chettinad’s spice heritage—recipes passed down through generations and made with the same care and respect for flavour.
                                    </p>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="chettinad-card p-4 h-100" style={{ borderTop: '4px solid var(--athangudi-teal)' }}>
                                    <h5 style={{ fontFamily: 'var(--font-display)', color: 'var(--chettinad-maroon)' }}>Stone-Ground</h5>
                                    <p className="text-muted small mb-0">
                                        We still use traditional stone grinding. No industrial milling—just the slow, even crush that releases oils and aromas the way modern machines cannot.
                                    </p>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="chettinad-card p-4 h-100" style={{ borderTop: '4px solid var(--chettinad-ochre)' }}>
                                    <h5 style={{ fontFamily: 'var(--font-display)', color: 'var(--chettinad-maroon)' }}>100% Natural</h5>
                                    <p className="text-muted small mb-0">
                                        No artificial colours, flavours, or preservatives. Only whole spices, roasted and ground to bring out the best in your cooking.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="chettinad-card p-5 mb-5">
                            <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--chettinad-charcoal)', fontWeight: 600 }}>Why Chettinadu?</h3>
                            <p className="text-muted">
                                Chettinad cuisine is known for its bold, layered flavours and its use of freshly ground spices. Our premixes—sambar, rasam, curry, and speciality blends—are designed to bring that authenticity to your kitchen. Whether you are making a weekday sambar or a festive spread, Kara-Saaram gives you the base that generations of Tamil homes have relied on.
                            </p>
                            <p className="text-muted mb-0">
                                We source quality ingredients and blend them in small batches so every packet delivers consistency and taste. When you cook with Kara-Saaram, you are not just adding masala—you are adding a piece of Chettinadu to your table.
                            </p>
                        </div>

                        <div className="text-center py-4" style={{ borderTop: '1px solid rgba(196, 92, 62, 0.2)' }}>
                            <p className="mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--chettinad-maroon)', fontSize: '1.25rem' }}>Kara-Saaram</p>
                            <p className="text-muted small mb-0">Est. 1965 • Authentic Chettinadu Masalas</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AboutUs;
