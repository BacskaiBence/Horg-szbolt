import { useState } from "react";

function Regist() {
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [address, setAddress] = useState("")
    const [phone_number, setPhone_number] = useState("")
    const [error, setError] = useState("")

    const handleRegister = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch("http://localhost:3000/regist", {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({ username, email, password, address, phone_number })
            })
            const data = await res.json()

            if (res.ok) {
                setError("Siker")
                setUsername("")
                setEmail("")
                setPassword("")
                setAddress("")
                setPhone_number("")
                setError("")
            } else {
                setError(data.message)
            }
        } catch (error) {
            setError(error)
        }
    }

    return (
        <>
            <div className="login-container">
                <h1 className="title">🐟 Regisztráció 🐟</h1>
                <p className="subtitle">Regisztrálj az akciókért!</p>
                <div>
                    <form className="form" onSubmit={handleRegister}>
                        <label>Felhasználónév:
                            <input type="text" value={username} onChange={(e) => setUsername = (e.target.value)} placeholder="username" />
                        </label>
                        <label>Email:
                            <input type="text" value={email} onChange={(e) => setEmail = (e.target.value)} placeholder="email" />
                        </label>
                        <label>Jelszó:
                            <input type="password" value={password} onChange={(e) => setPassword = (e.target.value)} placeholder="password" />
                        </label>
                        <label>Lakcím
                            <input type="text" value={address} onChange={(e) => setAddress = (e.target.value)} placeholder="address" />
                        </label>
                        <label>Telefonszám:
                            <input type="text" value={phone_number} onChange={(e) => setPhone_number = (e.target.value)} placeholder="phone number" />
                        </label>
                        <button type="submit">Regisztráció</button>
                    </form>
                </div>
            </div>
        </>
    )
}

export default Regist;