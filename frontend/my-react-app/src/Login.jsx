import { useState } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';

function Login({ isLoggedIn, setIsLoggedIn, setUser }) {
    // 1. STATE a bejelentkezési adatokhoz
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    // 2. STATE a visszajelző üzenetekhez
    const [message, setMessage] = useState(null);
    
    // 3. HOOK a navigációhoz (megfelelő helyen!)
    const navigate = useNavigate();

    // 4. Általános adatkezelő függvény
    const handleChange = (e) => {
        // Frissíti a megfelelő mezőt a formData state-ben
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 5. Bejelentkezési logika
    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage(null); // Törli az előző üzenetet

        try {
            const res = await fetch('http://localhost:3000/logUser', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // JSON.stringify-jal küldi el a state-ben lévő adatokat
                body: JSON.stringify(formData)
            });
            
            const data = await res.json();
            
            if (res.ok) {
                // SIKERES BEJELENTKEZÉS
                setMessage({ type: 'success', text: 'Sikeres bejelentkezés! Átirányítás a főoldalra...' });
                
                setIsLoggedIn(true);
                setUser(data.username); // Feltételezve, hogy a szerver adja vissza a felhasználónevet
                
                // Automatikus átirányítás 2 másodperc után
                setTimeout(() => {
                    navigate('/');
                }, 2000);
                
            } else {
                // SIKERTELEN BEJELENTKEZÉS (pl. rossz jelszó)
                setMessage({ type: 'danger', text: data.message || 'Hibás email vagy jelszó.' });
            }
        } catch (err) {
            // HÁLÓZATI/SZERVER HIBA
            setMessage({ type: 'danger', text: err.message });
        }
    };

    return (
        <>
            <div className="login-container">
                <h1 className="title">🐟 Bejelentkezés 🐟</h1>
                <p className="subtitle">Lépj be, és dobd be a horgot a legjobb ajánlatokra!</p>

                {/* Visszajelző üzenet megjelenítése (success/danger) */}
                {message && (
                    <div className={`alert alert-${message.type}`} style={{ 
                        padding: '10px', 
                        borderRadius: '5px', 
                        marginBottom: '1rem',
                        backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
                        color: message.type === 'success' ? '#155724' : '#721c24',
                        border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
                    }}>
                        {message.text}
                    </div>
                )}

                <form className="form" onSubmit={handleLogin}>
                    <label>Email:
                        <input 
                            type="email" 
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="Email címed..." 
                        />
                    </label>

                    <label>Jelszó:
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
        </>
    );
}

export default Login;