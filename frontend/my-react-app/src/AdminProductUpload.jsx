import React, { useState, useEffect } from 'react';

const AdminProductUpload = () => {
  const [formData, setFormData] = useState({ name: '', price: '', description: '', image: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const checkAdmin = async () => {
      if (!token) {
        window.location.href = '/';
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (data.isAdmin) {
          setIsAdmin(true);
        } else {
          alert('Csak admin férhet hozzá!');
          window.location.href = '/';
        }
      } catch (err) {
        window.location.href = '/';
      }
    };

    checkAdmin();
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/products', {  // POST termék hozzáadás
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Hiba a termék feltöltésekor');

      alert('Termék sikeresen feltöltve!');
      setFormData({ name: '', price: '', description: '', image: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) return <div className="container"><p>Betöltés...</p></div>;

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '500px' }}>
      <h2>Új termék feltöltése (Admin)</h2>
      <input name="name" placeholder="Termék neve" value={formData.name} onChange={handleChange} required />
      <input name="price" type="number" placeholder="Ár (Ft)" value={formData.price} onChange={handleChange} required />
      <input name="description" placeholder="Leírás" value={formData.description} onChange={handleChange} required />
      <input name="image" placeholder="Kép URL (vagy base64)" value={formData.image} onChange={handleChange} />
      
      {error && <div className="error">{error}</div>}
      
      <button type="submit" disabled={loading}>
        {loading ? 'Feltöltés...' : 'Termék feltöltése'}
      </button>
    </form>
  );
};

export default AdminProductUpload;