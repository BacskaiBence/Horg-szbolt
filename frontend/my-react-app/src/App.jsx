import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Registration from './Regist';
import Login from './Login';
import Products from './Products';
import Cart from './Cart';
import Profile from './Profile';
import Order from './Order';
import AdminProductUpload from './AdminProductUpload';
import AdminUsers from './AdminUsers';
import './App.css';

function Logout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    alert('Sikeres kijelentkezés!');
    navigate('/login');
    window.location.reload();
  };

  return <button onClick={handleLogout} className="logout-btn">Kijelentkezés</button>;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://localhost:5000/profile', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => {
          if (data.isAdmin !== undefined) {
            setIsLoggedIn(true);
            setIsAdmin(data.isAdmin);
          }
        })
        .catch(() => {
          localStorage.removeItem('token');
        });
    }
  }, []);

  return (
    <Router>
      <header className="header">
        <div className="container">
          <Link to="/" className='logo'>🎣 Horgász Bolt 🎣</Link>

          <nav>
            {isLoggedIn && (
              <>
                <Link to="/">Kezdőlap</Link>
                <Link to="/cart">Kosár</Link>
                <Link to="/profile">Profil</Link>
              </>
            )}

            {isAdmin && (
              <>
                <Link to="/admin/products/new">Termék feltöltése</Link>
                <Link to="/admin/users">Felhasználók kezelése</Link>
              </>
            )}

            {!isLoggedIn && (
              <>
                <Link to="/login">Bejelentkezés</Link>
                <Link to="/register">Regisztráció</Link>
              </>
            )}

            {isLoggedIn && <Logout />}
          </nav>
        </div>
      </header>

      <main className="container">
        <Routes>
          <Route path="/" element={<Products />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<Products />} />

          <Route 
            path="/login" 
            element={<Login setIsLoggedIn={setIsLoggedIn} setUser={() => {}} />} 
          />
          <Route path="/register" element={<Registration />} />

          {isLoggedIn ? (
            <>
              <Route path="/cart" element={<Cart />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/order" element={<Order />} />

              {isAdmin && (
                <>
                  <Route path="/admin/products/new" element={<AdminProductUpload />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                </>
              )}
            </>
          ) : (
            <Route path="*" element={<Login setIsLoggedIn={setIsLoggedIn} setUser={() => {}} />} />
          )}
        </Routes>
      </main>
    </Router>
  );
}

export default App;