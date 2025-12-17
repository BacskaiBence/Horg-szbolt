import React, { useState, useEffect } from 'react';

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  const fetchCart = async () => {
    if (!token) {
      setError('Bejelentkezés szükséges a kosár megtekintéséhez.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/cart', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Hiba a kosár betöltésekor');

      const data = await response.json();
      setCart(data.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [token]);

  const removeFromCart = async (itemId) => {
    try {
      const response = await fetch(`http://localhost:5000/cart/remove/${itemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Hiba az eltávolításkor');
      fetchCart();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="container"><p>Betöltés...</p></div>;
  if (error) return <div className="container"><div className="error">{error}</div></div>;

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div>
      <h2 style={{ textAlign: 'center' }}>Kosár</h2>
      {cart.length === 0 ? (
        <p style={{ textAlign: 'center' }}>A kosár üres.</p>
      ) : (
        <>
          {cart.map((item) => (
            <div className="cart-item" key={item._id}>
              <div>
                <strong>{item.name}</strong><br />
               <button onClick={(item) => {item.quantity-1}}>-</button>  {item.quantity} db <button onClick={(item) => {item.quantity+1} }>+</button> × {item.price} Ft = {item.quantity * item.price} Ft
              </div>
              <button onClick={() => removeFromCart(item._id)}>Eltávolít</button>
            </div>
          ))}
          <p className="total">Összesen: {total} Ft</p>
          <div style={{ textAlign: 'center' }}>
            <button onClick={() => window.location.href = '/order'}>Tovább a rendeléshez</button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;