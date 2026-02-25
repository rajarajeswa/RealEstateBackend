import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import HomePage from './pages/homepage/home'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import AddPremix from './pages/admin/addpremix'
import Dashboard from './pages/admin/Dashboard'
import SambarPremix from './pages/premix/sambarpremix'
import RasamPremix from './pages/premix/rasampremix'
import CurryPremix from './pages/premix/currypremix'
import SpecialityPremix from './pages/premix/specialitypremix'
import Checkout from './pages/checkout/Checkout'
import PaymentSuccess from './pages/checkout/PaymentSuccess'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import AboutUs from './pages/about/AboutUs'
import Orders from './pages/admin/Orders'
import MyOrders from './pages/orders/MyOrders'

function App() {
  return (
    <AuthProvider>
    <CartProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/add" element={<AddPremix />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
          <Route path="/sambar-powder" element={<SambarPremix />} />
          <Route path="/rasam-powder" element={<RasamPremix />} />
          <Route path="/curry-powder" element={<CurryPremix />} />
          <Route path="/speciality-powder" element={<SpecialityPremix />} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/payment-success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<AboutUs />} />
        </Routes>
      </Router>
    </CartProvider>
    </AuthProvider>
  )
}

export default App
