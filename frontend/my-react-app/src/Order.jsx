import React, { useState } from 'react';

const Order = () => {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      alert('Bejelentkezés szükséges!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ address }),
      });

      if (!response.ok) throw new Error('Hiba a rendelés leadásakor');

      alert('Rendelés sikeresen leadva!');
      window.location.href = '/products';
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '400px' }}>
      <h2>Rendelés leadása</h2>
      <input
        placeholder="Szállítási cím"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        required
      />
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Küldés...' : 'Rendelés leadása'}
      </button>
    </form>
  );
};

export default Order;