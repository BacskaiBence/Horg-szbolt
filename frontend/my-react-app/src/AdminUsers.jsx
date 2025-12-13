import React, { useState, useEffect } from 'react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const checkAndFetch = async () => {
      if (!token) {
        window.location.href = '/';
        return;
      }

      try {
        const profileRes = await fetch('http://localhost:5000/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const profileData = await profileRes.json();
        if (!profileData.isAdmin) {
          alert('Csak admin férhet hozzá!');
          window.location.href = '/';
          return;
        }
        setIsAdmin(true);

        const usersRes = await fetch('http://localhost:5000/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const usersData = await usersRes.json();
        setUsers(usersData);
      } catch (err) {
        setError('Hiba a felhasználók betöltésekor');
      } finally {
        setLoading(false);
      }
    };

    checkAndFetch();
  }, [token]);

  const updateUser = async (userId, updatedData) => {
    try {
      await fetch(`http://localhost:5000/users/${userId}`, { 
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });
      alert('Felhasználó frissítve!');
      window.location.reload();
    } catch (err) {
      alert('Hiba a frissítéskor');
    }
  };

  if (!isAdmin) return <div className="container"><p>Betöltés...</p></div>;
  if (loading) return <div className="container"><p>Betöltés...</p></div>;
  if (error) return <div className="container"><div className="error">{error}</div></div>;

  return (
    <div>
      <h2 style={{ textAlign: 'center' }}>Felhasználók kezelése (Admin)</h2>
      {users.map((user) => (
        <div className="cart-item" key={user._id}>
          <div>
            <strong>{user.name}</strong> ({user.email})
          </div>
          <button onClick={() => {
            const newName = prompt('Új név:', user.name);
            const newEmail = prompt('Új email:', user.email);
            if (newName && newEmail) {
              updateUser(user._id, { name: newName, email: newEmail });
            }
          }}>Szerkeszt</button>
        </div>
      ))}
    </div>
  );
};

export default AdminUsers;