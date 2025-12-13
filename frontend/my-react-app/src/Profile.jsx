import React, { useState, useEffect } from 'react';

const Profile = () => {
  const [user, setUser] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setError('Bejelentkezés szükséges.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Hiba a profil betöltésekor');

        const data = await response.json();
        setUser(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(user),
      });

      if (!response.ok) throw new Error('Hiba a frissítéskor');
      alert('Profil frissítve!');
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="container"><p>Betöltés...</p></div>;
  if (error) return <div className="container"><div className="error">{error}</div></div>;

  return (
    <form onSubmit={updateProfile} style={{ maxWidth: '400px' }}>
      <h2>Profil</h2>
      <input
        name="name"
        placeholder="Név"
        value={user.name}
        onChange={(e) => setUser({ ...user, name: e.target.value })}
        required
      />
      <input
        name="email"
        type="email"
        placeholder="Email"
        value={user.email}
        onChange={(e) => setUser({ ...user, email: e.target.value })}
        required
      />
      <button type="submit">Frissítés</button>
    </form>
  );
};

export default Profile;