import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [hoveredLink, setHoveredLink] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const { cartCount } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate('/');
  };

  const navStyle = {
    backgroundColor: scrolled ? 'rgba(253, 248, 243, 0.98)' : 'rgba(253, 248, 243, 0.95)',
    backdropFilter: 'blur(10px)',
    boxShadow: scrolled ? '0 4px 20px rgba(44, 36, 32, 0.1)' : '0 2px 10px rgba(44, 36, 32, 0.05)',
    borderBottom: '1px solid rgba(114, 47, 55, 0.08)',
    transition: 'all 0.3s ease',
    padding: scrolled ? '0.75rem 0' : '1rem 0'
  };

  const brandStyle = {
    color: 'var(--primary-maroon)',
    fontWeight: 700,
    fontSize: '1.75rem',
    fontFamily: 'var(--font-display)',
    letterSpacing: '1px',
    textDecoration: 'none',
    lineHeight: 1
  };

  const brandTagline = {
    display: 'block',
    fontFamily: 'var(--font-accent)',
    fontSize: '0.9rem',
    color: 'var(--spice-turmeric)',
    fontWeight: 400,
    marginTop: '-2px'
  };

  const linkStyle = {
    color: 'var(--neutral-charcoal)',
    fontWeight: 600,
    margin: '0 8px',
    transition: 'all 0.3s ease',
    fontFamily: 'var(--font-body)',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    fontSize: '0.8rem',
    padding: '0.5rem 0.75rem',
    position: 'relative',
    textDecoration: 'none'
  };

  const getLinkActiveStyle = (linkName) => {
    if (hoveredLink === linkName) {
      return {
        ...linkStyle,
        color: 'var(--primary-maroon)'
      };
    }
    return linkStyle;
  };

  return (
    <nav 
      className="navbar navbar-expand-lg fixed-top" 
      style={navStyle}
    >
      <div className="container">
        <Link to="/" style={brandStyle}>
          Kara-Saaram
          <span style={brandTagline}>Authentic Chettinadu</span>
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
          style={{ 
            borderColor: 'var(--primary-maroon)', 
            borderRadius: 'var(--radius-sm)',
            padding: '0.5rem 0.75rem'
          }}
          aria-label="Toggle navigation"
        >
          <span 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '4px' 
            }}
          >
            <span style={{ width: '20px', height: '2px', background: 'var(--primary-maroon)' }} />
            <span style={{ width: '20px', height: '2px', background: 'var(--primary-maroon)' }} />
            <span style={{ width: '20px', height: '2px', background: 'var(--primary-maroon)' }} />
          </span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-lg-center">
            <li className="nav-item">
              <Link 
                className="nav-link" 
                to="/" 
                style={getLinkActiveStyle('home')}
                onMouseEnter={() => setHoveredLink('home')}
                onMouseLeave={() => setHoveredLink(null)}
              >
                Home
              </Link>
            </li>
            
            <li className="nav-item dropdown">
              <span
                className="nav-link dropdown-toggle"
                style={getLinkActiveStyle('products')}
                onMouseEnter={() => setHoveredLink('products')}
                onMouseLeave={() => setHoveredLink(null)}
                role="button"
                data-bs-toggle="dropdown"
              >
                Products
              </span>
              <ul 
                className="dropdown-menu"
                style={{
                  border: '1px solid rgba(114, 47, 55, 0.12)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '0.5rem 0',
                  minWidth: '200px'
                }}
              >
                {[
                  { name: 'Sambar Premix', path: '/sambar-powder' },
                  { name: 'Rasam Premix', path: '/rasam-powder' },
                  { name: 'Curry Premix', path: '/curry-powder' },
                  { name: 'Special Premix', path: '/speciality-powder' }
                ].map((item, i) => (
                  <li key={i}>
                    <Link 
                      to={item.path} 
                      className="dropdown-item"
                      style={{
                        padding: '0.6rem 1.25rem',
                        fontSize: '0.9rem',
                        color: 'var(--neutral-charcoal)'
                      }}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
            
            <li className="nav-item">
              <Link 
                className="nav-link" 
                to="/about" 
                style={getLinkActiveStyle('about')}
                onMouseEnter={() => setHoveredLink('about')}
                onMouseLeave={() => setHoveredLink(null)}
              >
                About Us
              </Link>
            </li>
            
            <li className="nav-item">
              <Link 
                className="nav-link d-flex align-items-center gap-2" 
                to="/checkout"
                style={getLinkActiveStyle('cart')}
                onMouseEnter={() => setHoveredLink('cart')}
                onMouseLeave={() => setHoveredLink(null)}
              >
                <svg 
                  width="18" 
                  height="18" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                Cart
                {cartCount > 0 && (
                  <span 
                    className="badge"
                    style={{ 
                      background: 'var(--primary-maroon)',
                      color: 'var(--gold-light)',
                      fontSize: '0.7rem',
                      padding: '0.25rem 0.5rem',
                      borderRadius: 'var(--radius-full)'
                    }}
                  >
                    {cartCount}
                  </span>
                )}
              </Link>
            </li>
            
            {isAuthenticated ? (
              <li className="nav-item position-relative" ref={dropdownRef}>
                <button 
                  className="nav-link btn btn-link d-flex align-items-center gap-2" 
                  style={{ 
                    ...getLinkActiveStyle('user'),
                    cursor: 'pointer', 
                    border: 'none', 
                    background: 'none',
                    color: 'var(--neutral-charcoal)'
                  }}
                  onClick={() => setShowDropdown(!showDropdown)}
                  onMouseEnter={() => setHoveredLink('user')}
                  onMouseLeave={() => setHoveredLink(null)}
                >
                  <span 
                    style={{
                      width: '32px',
                      height: '32px',
                      background: 'var(--primary-maroon)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--earth-ivory)',
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}
                  >
                    {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                  </span>
                  <span className="d-none d-lg-inline">
                    {user?.name || user?.email?.split('@')[0]}
                  </span>
                </button>
                
                {showDropdown && (
                  <ul 
                    className="position-absolute end-0 list-unstyled"
                    style={{ 
                      top: '100%',
                      minWidth: '180px', 
                      zIndex: 1000, 
                      background: 'var(--earth-ivory)',
                      border: '1px solid rgba(114, 47, 55, 0.12)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-lg)',
                      padding: '0.5rem 0',
                      marginTop: '0.5rem'
                    }}
                  >
                    <li>
                      <Link 
                        to="/my-orders" 
                        className="dropdown-item w-100 text-start px-3 py-2 d-flex align-items-center gap-2"
                        style={{ 
                          cursor: 'pointer',
                          color: 'var(--neutral-charcoal)',
                          fontSize: '0.9rem'
                        }}
                        onClick={() => setShowDropdown(false)}
                      >
                        My Orders
                      </Link>
                    </li>
                    <li>
                      <hr style={{ margin: '0.5rem 0', borderColor: 'rgba(114, 47, 55, 0.1)' }} />
                    </li>
                    <li>
                      <button 
                        className="dropdown-item w-100 text-start px-3 py-2 d-flex align-items-center gap-2" 
                        style={{ 
                          cursor: 'pointer', 
                          border: 'none', 
                          background: 'none',
                          color: 'var(--spice-chilli)',
                          fontSize: '0.9rem'
                        }}
                        onClick={handleLogout}
                      >
                        Logout
                      </button>
                    </li>
                  </ul>
                )}
              </li>
            ) : (
              <>
                <li className="nav-item">
                  <Link 
                    className="nav-link" 
                    to="/login" 
                    style={getLinkActiveStyle('login')}
                    onMouseEnter={() => setHoveredLink('login')}
                    onMouseLeave={() => setHoveredLink(null)}
                  >
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    className="btn btn-primary-chettinad btn-sm"
                    to="/register"
                    style={{ marginLeft: '8px' }}
                  >
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
      
      {/* Bottom accent line */}
      <div 
        className="position-absolute bottom-0 start-0 w-100" 
        style={{ 
          height: '3px', 
          background: 'linear-gradient(90deg, var(--primary-maroon), var(--gold-primary), var(--athangudi-teal), transparent)',
          opacity: scrolled ? 0.8 : 0.5 
        }}
      />
    </nav>
  );
};

export default Navbar;
