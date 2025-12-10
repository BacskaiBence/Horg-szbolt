function Login() {
    return (
        <>
            <div className="login-container">
                <h1 className="title">🐟 Bejelentkezés 🐟</h1>
                <p className="subtitle">Lépj be, és dobd be a horgot a legjobb ajánlatokra!</p>

                <form className="form">
                    <label>Email:
                        <input type="text" name="email" placeholder="Email címed..." />
                    </label>

                    <label>Jelszó:
                        <input type="password" name="password" placeholder="Jelszavad..." />
                    </label>

                    <button name="loginbutton" type="submit">Bejelentkezés</button>
                </form>
            </div>
        </>
    );
}

export default Login;
