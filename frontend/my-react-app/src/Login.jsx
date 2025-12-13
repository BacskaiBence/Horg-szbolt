import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

function Login({ setIsLoggedIn, setIsAdmin }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage(null);

    try {
      const res = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);

        setIsLoggedIn(true);

        try {
          const profileRes = await fetch('http://localhost:5000/profile', {
            headers: { Authorization: `Bearer ${data.token}` },
          });
          const profileData = await profileRes.json();
          setIsAdmin(profileData.isAdmin || false);
        } catch (err) {
          setIsAdmin(false);
        }

        setMessage({ type: 'success', text: 'Sikeres bejelentkezés! Átirányítás...' });

        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        setMessage({ type: 'danger', text: data.message || 'Hibás email vagy jelszó' });
      }
    } catch (err) {
      setMessage({ type: 'danger', text: 'Nem érhető el a szerver.' });
    }
  };

  return (
    <div className="login-container">
      <h1 className="title">🐟 Bejelentkezés 🐟</h1>

      {message && (
        <div
          className={`alert alert-${message.type}`}
          style={{
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
            color: message.type === 'success' ? '#155724' : '#721c24',
            border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
            textAlign: 'center',
            fontWeight: '500',
          }}
        >
          {message.text}
        </div>
      )}

      <form className="form" onSubmit={handleLogin}>
        <label>
          Email:
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Email címed..."
          />
        </label>

        <label>
          Jelszó:
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Jelszavad..."
          />
        </label>

        <button type="submit">Bejelentkezés</button>
      </form>
    </div>
  );
}

export default Login;