import {useState} from 'react';
import './App.css'
import { BrowserRouter, Route, Routes, NavLink } from 'react-router-dom'
import Login from "./Login";
import Regist from "./Regist";
import Home from "./Home";
import Upload from "./Upload";
import Profil from "./Profil";
import Kosar from "./Kosar";
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
  }

  return (
    <>

      <BrowserRouter>
        <nav className="navbar">
          <div className="nav-logo">🎣 Horgászbolt</div>

          <div className="nav-links">
            {isLoggedIn ? (
              // Bejelentkezett
              <>
                <NavLink to="/" className="nav-item">Kezdőlap</NavLink>
                <NavLink to="/kosar" className="nav-item">Kosár</NavLink>
                <NavLink to="/profil" className="nav-item">Profil</NavLink>
                <NavLink to="/upload" className="nav-item">Upload</NavLink>
                <button className="logout-btn" onClick={handleLogout}>Kijelentkezés</button>
              </>
            ) : (
              // NEM Bejeletkezett
              <>
                <NavLink to="/" className="nav-item">Kezdőlap</NavLink>
                <NavLink to="/login" className="nav-item">Bejelentkezés</NavLink>
                <NavLink to="/regist" className="nav-item">Regisztráció</NavLink>
              </>
            )}
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} isLoggedIn={isLoggedIn} setUser={setUser}/>} />
          <Route path="/regist" element={<Regist />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/profil" element={<Profil />} />
          <Route path="/kosar" element={<Kosar />} />
        </Routes>

      </BrowserRouter>
    </>
  );
}

export default App;
