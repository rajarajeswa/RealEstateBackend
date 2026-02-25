import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../App.css';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../api/client';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/checkout';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!email || !password) {
            setError('Email and password are required');
            return;
        }
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('email', email.trim());
            formData.append('password', password);
            const { data } = await apiFetch('/api/auth/login', {
                method: 'POST',
                body: formData
            });
            if (data.success) {
                login(data.user, data.token);
                navigate(from, { replace: true });
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            setError(err.message || 'Connection error. Is the backend running?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-vh-100 py-5" style={{ fontFamily: 'var(--font-body)', backgroundColor: 'var(--athangudi-cream)' }}>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-5">
                        <div className="chettinad-card p-5">
                            <div className="text-center mb-4">
                                <div className="d-inline-block mb-2" style={{ width: '60px', height: '3px', backgroundColor: 'var(--chettinad-terracotta)' }} />
                                <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--chettinad-maroon)', fontWeight: 600 }}>Login</h2>
                                <p className="text-muted">Sign in to checkout</p>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Email</label>
                                    <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="your@email.com" />
                                </div>
                                <div className="mb-4">
                                    <label className="form-label">Password</label>
                                    <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                </div>
                                {error && <div className="alert alert-danger">{error}</div>}
                                <button type="submit" className="btn btn-chettinad-primary w-100 mb-3" disabled={loading}>
                                    {loading ? 'Logging in...' : 'Login'}
                                </button>
                                <p className="text-center text-muted mb-0">
                                    Don't have an account? <Link to="/register" style={{ color: 'var(--chettinad-terracotta)', fontWeight: 600 }}>Register</Link>
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
