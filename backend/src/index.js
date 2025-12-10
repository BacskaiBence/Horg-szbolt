import express from "express";
import sql from "mysql2/promise";
import cors from "cors";
import jwt from "jsonwebtoken";
import argon from "argon2";
import cp from "cookie-parser"
import { logger } from "./middlewares/logger.js";
import { error } from "./middlewares/error.js";
import { auth } from "./middlewares/auth.js";

const app=express();
app.use(express.json());
app.use(cors());
app.use(cp());

const db=sql.createPool({
    host : "localhost",
    password : "",
    user : "root",
    database : "fishing_shop"
})

app.use(logger);

export const SECRET="asd";

app.get("/set-cookies", (req,res)=>{
    res.cookie('theme', 'dark',{
        maxAge: 900000,
        httpOnly: false
    });
    
    res.cookie('auth_token','$2a$12$524A4405b5Zz6RT4SVH6KOg60GDcenrNxwZNcUa3r75onuIB.8E1W',{
        maxAge: 60*60*100,
        httpOnly: true,
        secure: false,
        sameSite: 'strict'
    })

    res.send('Sütik beállítva. LEkérhető /read-cookies al')
});

app.get("/read-cookies", (req,res)=>{
    const allCookies = req.cookies;
    const theme =req.cookies.theme;
    const authToken= req.cookies.auth_token;

    res.json({allCookies,theme,authToken})
})

app.get("/clear-cookies", (req,res)=>{
    res.clearCookie('theme');
    res.clearCookie('auth_token');

    res.send('A sütik törölve. ')
})

app.post("/regUser", async (req, res, next) => {
    let conn;
    try {
      conn = await db.getConnection();
      const body = req.body;
  
      // 1. Validáció
      if (!body || typeof body !== "object" || Object.keys(body).length !== 5) {
        return res.status(400).json({ message: "Hibás kérés, pontosan 5 mező szükséges" });
      }
  
      const { username, password, email, phone_number, address } = body;
  
      if (typeof username !== "string" || !username.trim()) 
        return res.status(400).json({ message: "Érvénytelen felhasználónév" });
  
      if (typeof password !== "string" || password.length < 8)
        return res.status(400).json({ message: "A jelszónak legalább 8 karakternek kell lennie" });
  
      if (typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email))
        return res.status(400).json({ message: "Érvénytelen email cím" });
  
      if (typeof phone_number !== "string" || !phone_number.trim())
        return res.status(400).json({ message: "Érvénytelen telefonszám" });
  
      if (typeof address !== "string" || !address.trim())
        return res.status(400).json({ message: "Érvénytelen cím" });
  
      // 2. Jelszó hash
      const hash = await argon.hash(password);
  
      // 3. Létezik-e már az email?
      const [exists] = await conn.query(
        `SELECT id FROM users WHERE email = ? LIMIT 1`,
        [email]
      );
  
      if (exists.length > 0) {
        return res.status(409).json({ message: "Ezzel az email címmel már létezik fiók" });
      }
  
      // 4. Felhasználó beszúrása
      const [result] = await conn.query(
        `INSERT INTO users (username, pasword, email, phone_number, address, entitlement) 
         VALUES (?, ?, ?, ?, ?, 0)`,
        [username.trim(), hash, email.toLowerCase().trim(), phone_number.trim(), address.trim()]
      );
  
      if (result.affectedRows !== 1) {
        return res.status(500).json({ message: "Sikertelen regisztráció, próbáld újra később" });
      }
  
      // 5. Sikeres válasz
      return res.status(201).json({ message: "Sikeres regisztráció!" });
  
    } catch (err) {
      // Bármilyen váratlan hiba ide kerül
      console.error("Regisztrációs hiba:", err);
      // Ha még nem küldtünk választ, akkor most küldünk egy általánosat
      if (!res.headersSent) {
        return res.status(500).json({ message: "Szerveroldali hiba történt" });
      }
      // Ha már küldtünk, akkor csak átadjuk tovább (pl. egy globális error handlernek)
      next(err);
  
    } finally {
      if (conn) db.releaseConnection(conn);
    }
  });
  app.post("/logUser", async (req, res, next) => {
    let conn = null;
    try {
      conn = await db.getConnection();
      const { username, password } = req.body;
  
      // 1. Validáció
      if (!username || !password || typeof username !== "string" || typeof password !== "string") {
        return res.status(400).json({ message: "Hiányzó vagy érvénytelen adatok" });
      }
  
      // 2. Felhasználó keresése
      const [rows] = await conn.query(
        "SELECT id, password FROM users WHERE username = ? LIMIT 1",
        [username.trim()]
      );
  
      if (!rows || rows.length === 0) {
        return res.status(401).json({ message: "Hibás felhasználónév vagy jelszó" });
      }
  
      const user = rows[0];
  
      // 3. Jelszó ellenőrzése
      // FONTOS: az oszlop neve nálad password (nem hash!)
      const valid = await argon.verify(user.password, password);
      if (!valid) {
        return res.status(401).json({ message: "Hibás felhasználónév vagy jelszó" });
      }
  
      // 4. JWT token generálása
      const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: "7d" });
  
      // 5. Cookie beállítása
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // HTTPS-en csak secure
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 nap
      });
  
      // 6. Sikeres válasz
      return res.json({ message: "Sikeres bejelentkezés" });
  
    } catch (err) {
      console.error("Bejelentkezési hiba:", err);
      // Ha már elküldtük a választ, ne próbáljunk még egyszer
      if (!res.headersSent) {
        return res.status(500).json({ message: "Szerveroldali hiba történt" });
      }
      next(err); // átadjuk a globális error handlernek
  
    } finally {
      if (conn) db.releaseConnection(conn);
    }
  });

app.delete("/users/:id", auth, async (req,res)=>{
    const conn= await db.getConnection();
    const userId=parseInt(req.params.id)
    if (isNaN(userId)) {
        throw new Error("Invalid user id");
    }
    const [values]=await conn.query(`DELETE FROM users WHERE users.id=?;`,[userId]);
    if (values.affectedRows!=1) {
        throw new Error("Failed to delete");
    }
    db.releaseConnection(conn)
    res.status(202).json({message : "Succesfully deleted"})
})

app.put("/users/:id", auth,  async (req,res)=>{
    const conn= await db.getConnection();
    const userId=parseInt(req.params.id)
    if (isNaN(userId)) {
        throw new Error("Invalid user id");
    }
    if (Object.keys(body)!=5) {
        throw new Error("Invalid body");
    }
    if (typeof(body.username)!="string") {
        throw new Error("Invalid name");
    }
    if (typeof(body.password)!="string") {
        throw new Error("Invalid password");
    }
    if (typeof(body.email)!="string") {
        throw new Error("Invalid email");
    }
    if (typeof(body.phone_number)!="string") {
        throw new Error("Invalid phone_number");
    }
    if (typeof(body.address)!="string") {
        throw new Error("Invalid address");
    }

    const [values]=await conn.query(`UPDATE users SET username=?, password=?, email=?, phone_number=?, address=? WHERE users.id=?;`,[body.username || null,body.password || null,body.email || null,body.phone_number || null,body.address || null,userId]);
    if (values.affectedRows!=1) {
        throw new Error("Failed to update");
    }
    db.releaseConnection(conn)
    res.status(202).json({message : "Succesfully updated"})
})


app.get("/products/get", async (req,res)=>{
    const conn= await db.getConnection();
    const [values]=await conn.query(`SELECT * FROM products;`);
    if (!values|| values.length<1) {
        throw new Error("Failed to get products");
    }
    db.releaseConnection(conn)
    res.json({values})
})

app.post("/products/add", auth, async (req,res)=>{
    const conn= await db.getConnection();
    const body=req.body;
    if (Object.keys(body)!=5) {
        throw new Error("Invalid body");
    }
    if (!body.name||typeof(body.name)!="string") {
        throw new Error("Invalid name");
    }
    if (!body.description||typeof(body.description)!="string") {
        throw new Error("Invalid description");
    }
    if (!body.price||typeof(body.price)!="number") {
        throw new Error("Invalid price");
    }
    if (!body.quantity||typeof(body.quantity)!="number") {
        throw new Error("Invalid quantity");
    }
    if (!body.image||typeof(body.image)!="string") {
        throw new Error("Invalid image");
    }

    const [values]=await conn.query(`SELECT * FROM products WHERE products.name=?;`, [body.name]);
    if (values) {
        throw new Error("Product already exists");
    }

    const [insertProduct]=await conn.query(`INSERT INTO products(name,description,price,quantity,image) VALUES (?,?,?,?,?)`,[body.name,body.description,body.price,body.quantity,body.image])
    if (insertProduct.affectedRows!=1) {
        throw new Error("Failed to insert product");
    }

    db.releaseConnection(conn)
    res.status(201).json({message: "Product uploaded"})
})

app.delete("/products/:id", auth, async (req,res)=>{
    const conn= await db.getConnection();
    const productId=parseInt(req.params.id)
    if (isNaN(productId)) {
        throw new Error("Invalid product id");
    }

    const [values]=await conn.query(`DELETE FROM products WHERE products.id=?;`,[productId]);
    if (values.affectedRows!=1) {
        throw new Error("Failed to delete");
    }
    db.releaseConnection(conn)
    res.status(202).json({message : "Succesfully deleted"})
})

app.put("/products/:id", auth,  async (req,res)=>{
    const conn= await db.getConnection();
    const productId=parseInt(req.params.id)
    if (isNaN(productId)) {
        throw new Error("Invalid product id");
    }
    if (Object.keys(body)!=5) {
        throw new Error("Invalid body");
    }
    if (typeof(body.name)!="string") {
        throw new Error("Invalid name");
    }
    if (typeof(body.description)!="string") {
        throw new Error("Invalid description");
    }
    if (typeof(body.price)!="number") {
        throw new Error("Invalid price");
    }
    if (typeof(body.quantity)!="number") {
        throw new Error("Invalid quantity");
    }
    if (typeof(body.image)!="string") {
        throw new Error("Invalid image");
    }

    const [values]=await conn.query(`UPDATE products SET name=?, description=?, price=?, quantity=?, image=? WHERE products.id=?;`,[body.name || null,body.description || null,body.price || null,body.quantity || null,body.image || null,productId]);
    if (values.affectedRows!=1) {
        throw new Error("Failed to update");
    }
    db.releaseConnection(conn)
    res.status(202).json({message : "Succesfully updated"})
})

app.get("/order", auth, async (req,res)=>{
    const conn= await db.getConnection();
    const [values]=await conn.query(`SELECT * FROM orders INNER JOIN users ON users.id=orders.user_id INNER JOIN products ON products.id=orders.product_id;`);
    if (!values|| values.length<1) {
        throw new Error("Failed to get order");
    }
    db.releaseConnection(conn)
    res.json({values})
})

app.delete("/order/:id", auth, async (req,res)=>{
    const conn= await db.getConnection();
    const orderId=parseInt(req.params.id)
    if (isNaN(orderId)) {
        throw new Error("Invalid order id");
    }

    const [values]=await conn.query(`DELETE FROM orders WHERE orders.id=?;`,[orderId]);
    if (values.affectedRows!=1) {
        throw new Error("Failed to delete");
    }
    db.releaseConnection(conn)
    res.status(202).json({message : "Succesfully deleted"})
})

app.use(error)

app.listen(3000, async ()=>{
    console.log("A szerver elindult!")
})