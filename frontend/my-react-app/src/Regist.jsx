import { useState } from "react";
import { useNavigate } from "react-router-dom";
 
function Regist() {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        phone_number: '',
        address: ''
    });
    const [message, setMessage] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (res.ok) {
                setMessage({ type: 'success', text: 'Sikeres regisztráció! Átirányítás a bejelentkezéshez...' });
                setFormData({ username: '', password: '', email: '',phone_number: '', address: ''  });
                
                // Auto-redirect to login after 2 seconds
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setMessage({ type: 'danger', text: data.message || 'Hiba történt a regisztráció során' });
            }
        } catch (err) {
            setMessage({ type: 'danger', text: 'Nem érhető el a szerver. Ellenőrizd a backend kapcsolatot!' });
        }
    };

    return (
        <>
            <div className="login-container">
                <h1 className="title">🐟 Regisztráció 🐟</h1>
                <p className="subtitle">Regisztrálj az akciókért!</p>
                <div>
                    <form className="form" onSubmit={handleRegister}>
                        <label>Felhasználónév:
                            <input  name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                placeholder="Válassz egy egyedi nevet" />
                        </label>
                        <label>Email:
                            <input  type="email" name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="Válassz egy egyedi nevet" />
                        </label>
                        <label>Jelszó:
                            <input  type="password"
                            name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="Válassz egy egyedi nevet" />
                        </label>
                        <label>Lakcím
                            <input  name="address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                                placeholder="Válassz egy egyedi nevet" />
                        </label>
                        <label>Telefonszám:
                            <input  name="phone_number"
                                value={formData.phone_number}
                                onChange={handleChange}
                                required
                                placeholder="Válassz egy egyedi nevet" />
                        </label>
                        <button type="submit">Regisztráció</button>
                    </form>
                </div>
            </div>
        </>
    )
}

export default Regist;