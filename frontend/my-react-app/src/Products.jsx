import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const Products = () => {
  const { id } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const url = id ? `/products/${id}` : '/products';
        const response = await fetch(`http://localhost:5000${url}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!response.ok) throw new Error('Hiba a termékek betöltésekor');

        const data = await response.json();
        setProducts(id ? [data] : data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [id, token]);

  const addToCart = async (productId) => {
    if (!token) {
      alert('Előbb jelentkezz be!');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) throw new Error('Hiba a kosárba tételkor');
      alert('Termék hozzáadva a kosárhoz!');
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="container"><p>Betöltés...</p></div>;
  if (error) return <div className="container"><div className="error">{error}</div></div>;

  return (
    <div className="product-grid">
      {products.map((product) => (
        <div className="product-card" key={product._id}>
          {product.image && <img src={product.image} alt={product.name} />}
          <h3>{product.name}</h3>
          <p className="price">{product.price} Ft</p>
          <p>{product.description}</p>
          <button onClick={() => addToCart(product._id)}>Kosárba tesz</button>
        </div>
      ))}
    </div>
  );
};

export default Products;