import express from "express";
import sql from "mysql2/promise";
import cors from "cors";
import jwt from "jsonwebtoken";
import argon from "argon2";

const app = express();
app.use(express.json());
app.use(cors());

const db = sql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "fishing_shop"
});

const SECRET = "nagyon_titkos_kulcs_2025_horgaszbolt";

const logger = (req, res, next) => {
  console.log(`${req.method} - ${req.url}`);
  next();
};

const errorHandler = (err, req, res, next) => {
  if (err.message.includes("Invalid")) {
    return res.status(400).json({ message: err.message });
  }
  if (err.message.includes("Failed")) {
    return res.status(404).json({ message: err.message });
  }
  if (err.message.includes("exists")) {
    return res.status(409).json({ message: err.message });
  }
  res.status(500).json({ message: "Belső szerverhiba", details: err.message });
};

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Nincs token" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, SECRET);
    req.userId = payload.id;
    req.isAdmin = payload.isAdmin;
    next();
  } catch (err) {
    res.status(401).json({ message: "Érvénytelen token" });
  }
};

const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (!req.isAdmin) {
      return res.status(403).json({ message: "Csak admin férhet hozzá" });
    }
    next();
  });
};

app.use(logger);

app.post("/register", async (req, res) => {
  let conn;
  try {
    conn = await db.getConnection();
    const { username, password, email, phone_number, address } = req.body;

    if (!username || !password || !email || !phone_number || !address) {
      return res.status(400).json({ message: "Minden mező kötelező" });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "A jelszónak legalább 8 karakternek kell lennie" });
    }

    const hash = await argon.hash(password);

    const [exists] = await conn.query("SELECT id FROM users WHERE email = ?", [email]);
    if (exists.length > 0) {
      return res.status(409).json({ message: "Ezzel az emaillel már létezik fiók" });
    }

    await conn.query(
      `INSERT INTO users (username, pasword, email, phone_number, address, entitlement) 
       VALUES (?, ?, ?, ?, ?, 0)`,
      [username.trim(), hash, email.toLowerCase().trim(), phone_number.trim(), address.trim()]
    );

    res.status(201).json({ message: "Sikeres regisztráció!" });
  } catch (err) {
    errorHandler(err, req, res);
  } finally {
    if (conn) conn.release();
  }
});

app.post("/login", async (req, res) => {
  let conn;
  try {
    conn = await db.getConnection();
    const { email, password } = req.body;

    const [rows] = await conn.query(
      "SELECT id, pasword, entitlement FROM users WHERE email = ?",
      [email.trim()]
    );
    if (rows.length === 0) {
      return res.status(401).json({ message: "Hibás email vagy jelszó" });
    }

    const user = rows[0];
    const valid = await argon.verify(user.pasword, password);
    if (!valid) {
      return res.status(401).json({ message: "Hibás email vagy jelszó" });
    }

    const token = jwt.sign(
      { id: user.id, isAdmin: user.entitlement === 1 },
      SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });
  } catch (err) {
    errorHandler(err, req, res);
  } finally {
    if (conn) conn.release();
  }
});

app.get("/profile", verifyToken, async (req, res) => {
  let conn;
  try {
    conn = await db.getConnection();
    const [rows] = await conn.query(
      "SELECT username AS name, email FROM users WHERE id = ?",
      [req.userId]
    );
    conn.release();
    if (rows.length === 0) return res.status(404).json({ message: "Felhasználó nem található" });

    res.json({
      name: rows[0].name,
      email: rows[0].email,
      isAdmin: req.isAdmin
    });
  } catch (err) {
    errorHandler(err, req, res);
  }
});


app.get("/products", async (req, res) => {
  let conn;
  try {
    conn = await db.getConnection();
    const [rows] = await conn.query(
      "SELECT id AS _id, name, description, price, quantity, image FROM products"
    );
    conn.release();
    res.json(rows);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

app.get("/products/:id", async (req, res) => {
  let conn;
  try {
    conn = await db.getConnection();
    const [rows] = await conn.query(
      "SELECT id AS _id, name, description, price, quantity, image FROM products WHERE id = ?",
      [req.params.id]
    );
    conn.release();
    if (rows.length === 0) return res.status(404).json({ message: "Termék nem található" });
    res.json(rows[0]);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

app.post("/products", verifyAdmin, async (req, res) => {
  let conn;
  try {
    conn = await db.getConnection();
    const { name, description, price, quantity, image } = req.body;

    await conn.query(
      "INSERT INTO products (name, description, price, quantity, image) VALUES (?, ?, ?, ?, ?)",
      [name, description, price, quantity, image || ""]
    );
    conn.release();
    res.json({ message: "Termék sikeresen feltöltve" });
  } catch (err) {
    errorHandler(err, req, res);
  }
});

app.get("/cart", verifyToken, async (req, res) => {
  let conn;
  try {
    conn = await db.getConnection();
    const [rows] = await conn.query(`
      SELECT c.id AS cartItemId, p.id AS _id, p.name, p.price, c.quantity
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
    `, [req.userId]);
    conn.release();
    res.json({ items: rows });
  } catch (err) {
    errorHandler(err, req, res);
  }
});

app.post("/cart/add", verifyToken, async (req, res) => {
  let conn;
  try {
    conn = await db.getConnection();
    const { productId } = req.body;

    const [existing] = await conn.query(
      "SELECT id FROM cart WHERE user_id = ? AND product_id = ?",
      [req.userId, productId]
    );

    if (existing.length > 0) {
      await conn.query(
        "UPDATE cart SET quantity = quantity + 1 WHERE id = ?",
        [existing[0].id]
      );
    } else {
      await conn.query(
        "INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, 1)",
        [req.userId, productId]
      );
    }
    conn.release();
    res.json({ message: "Termék hozzáadva a kosárhoz" });
  } catch (err) {
    errorHandler(err, req, res);
  }
});

app.delete("/cart/remove/:itemId", verifyToken, async (req, res) => {
  let conn;
  try {
    conn = await db.getConnection();
    await conn.query(
      "DELETE FROM cart WHERE id = ? AND user_id = ?",
      [req.params.itemId, req.userId]
    );
    conn.release();
    res.json({ message: "Termék eltávolítva a kosárból" });
  } catch (err) {
    errorHandler(err, req, res);
  }
});

app.post("/orders", verifyToken, async (req, res) => {
  let conn;
  try {
    conn = await db.getConnection();
    const { address } = req.body;

    const [cartItems] = await conn.query(
      "SELECT product_id, quantity FROM cart WHERE user_id = ?",
      [req.userId]
    );

    if (cartItems.length === 0) {
      return res.status(400).json({ message: "A kosár üres" });
    }

    for (let item of cartItems) {
      await conn.query(
        "INSERT INTO orders (user_id, product_id, quantity, address) VALUES (?, ?, ?, ?)",
        [req.userId, item.product_id, item.quantity, address]
      );
    }

    await conn.query("DELETE FROM cart WHERE user_id = ?", [req.userId]);
    conn.release();

    res.json({ message: "Rendelés sikeresen leadva" });
  } catch (err) {
    errorHandler(err, req, res);
  }
});-

app.get("/users", verifyAdmin, async (req, res) => {
  let conn;
  try {
    conn = await db.getConnection();
    const [rows] = await conn.query(
      "SELECT id AS _id, username AS name, email FROM users"
    );
    conn.release();
    res.json(rows);
  } catch (err) {
    errorHandler(err, req, res);
  }
});
app.use(errorHandler);

app.listen(5000, () => {
  console.log("A szerver fut a http://localhost:5000 címen");
});