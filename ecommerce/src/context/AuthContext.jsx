import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);
const TOKEN_KEY = 'kara_saaram_token';
const USER_KEY = 'kara_saaram_user';

// Helper to decode JWT and check expiration
function isTokenExpired(token) {
    try {
        if (!token) return true;
        const payload = JSON.parse(atob(token.split('.')[1]));
        // Check if token has expired (with 1 hour buffer for smooth UX)
        return payload.exp * 1000 < Date.now() - 3600000;
    } catch {
        return true;
    }
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            const u = localStorage.getItem(USER_KEY);
            const t = localStorage.getItem(TOKEN_KEY);
            // Clear if token is expired
            if (isTokenExpired(t)) {
                localStorage.removeItem(USER_KEY);
                localStorage.removeItem(TOKEN_KEY);
                return null;
            }
            return u && t ? JSON.parse(u) : null;
        } catch {
            return null;
        }
    });
    const [token, setToken] = useState(() => {
        const t = localStorage.getItem(TOKEN_KEY);
        return isTokenExpired(t) ? null : t;
    });
    const [showSessionExpired, setShowSessionExpired] = useState(false);

    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(TOKEN_KEY);
    }, []);

    useEffect(() => {
        if (user && token && !isTokenExpired(token)) {
            localStorage.setItem(USER_KEY, JSON.stringify(user));
            localStorage.setItem(TOKEN_KEY, token);
        } else {
            localStorage.removeItem(USER_KEY);
            localStorage.removeItem(TOKEN_KEY);
        }
    }, [user, token]);

    // Check token expiration periodically (every 5 minutes)
    useEffect(() => {
        const checkExpiration = () => {
            if (token && isTokenExpired(token)) {
                logout();
                setShowSessionExpired(true);
            }
        };
        const interval = setInterval(checkExpiration, 300000);
        return () => clearInterval(interval);
    }, [token, logout]);

    const login = (userData, authToken) => {
        setUser(userData);
        setToken(authToken);
        setShowSessionExpired(false);
    };

    const isAuthenticated = !!token && !!user && !isTokenExpired(token);

    const dismissSessionExpired = () => setShowSessionExpired(false);

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated, showSessionExpired, dismissSessionExpired }}>
            {children}
            {/* Session Expired Modal */}
            {showSessionExpired && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Session Expired</h5>
                                <button type="button" className="btn-close" onClick={dismissSessionExpired}></button>
                            </div>
                            <div className="modal-body">
                                <p>Your session has expired for security reasons. Please login again to continue.</p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => { dismissSessionExpired(); window.location.href = '/'; }}>Close</button>
                                <button type="button" className="btn btn-chettinad-primary" onClick={() => { dismissSessionExpired(); window.location.href = '/login'; }}>Login Again</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
