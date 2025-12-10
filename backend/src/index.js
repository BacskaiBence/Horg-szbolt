import express from "express";
import sql from "mysql2/promise";
import cors from "cors";
import jwt, { sign } from "jsonwebtoken";
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

const SECRET="asd";

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

app.post("/regUser", async (req,res)=>{
    const conn= await db.getConnection();
    const body=req.body;

    if (Object.keys(body)!=5) {
        throw new Error("Invalid body");
    }
    if (!body.username||typeof(body.username)!="string") {
        throw new Error("Invalid username");
    }
    if (!body.password||typeof(body.password)!="string") {
        throw new Error("Invalid password");
    }
    if (!body.email||typeof(body.email)!="string"||!body.email.includes("@")) {
        throw new Error("Invalid email");
    }
    if (!body.phone_number||typeof(body.phone_number)!="string") {
        throw new Error("Invalid phone number");
    }
    if (!body.address||typeof(body.address)!="string") {
        throw new Error("Invalid address");
    }
    if (body.password.length<8) {
        throw new Error("Invalid password length");
    }

    const hash= await argon.hash(body.password);

    const [exists]=await conn.query(`SELECT * FROM users WHERE users.email=?;`,[body.email])
    if (exists) {
        throw new Error("An account already exists in this email address");
    }

    const [upload]= await conn.query(`INSERT INTO users(username,password,email,phone_number,address,entitlement) VALUES (?,?,?,?,?,?)`,[body.username,hash,body.email,body.phone_number,body.address,0]);
    if (upload.affectedRows!=1) {
        throw new Error("Failed to insert");
    }
    db.releaseConnection(conn);
    res.status(201).json({ message: "Sikeres regisztáció!"});

})

app.post("/logUser", async (req,res)=>{
    const conn= await db.getConnection();
    const body=req.body;

    if (Object.keys(body)!=2) {
        throw new Error("Invalid body");
    }
    if (!body.username||typeof(body.username)!="string") {
        throw new Error("Invalid username");
    }
    if (!body.password||typeof(body.password)!="string") {
        throw new Error("Invalid password");
    }

    const [user] = await conn.query("SELECT * FROM users WHERE username = ?;",[body.username])

    if (!user || user.length<1) {
        throw new Error("Invalid username or password");
    }

    const valid= await argon.verify(user[0].hash,body.password)
    if (!valid) {
        throw new Error("Invalid username or password");
    }

    const token = jwt.sign({id: user[0].id},SECRET);
    res.cookie('token', token, {
        httpOnly: true,
        maxAge : 7*24*60*60*1000
    });
    db.releaseConnection(conn)
    res.json({message: "Succesfully logged in"})
})

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
    const conn= await db.getConnection();
    const [users]= await   conn.query(`SELECT * FROM users`);
    if (users.usename.includes("admin")) {

    }else{
        const [admin]= await conn.query(`INSERT INTO usersINSERT INTO users(username,password,email,phone_number,address,entitlement) VALUES ("admin","$2a$12$EeTK/OuWR7yD2NeuOQa.bO9r8E2rqz6NJZ46Wz0/TgmxoeCglmIlq",admin@gmail.com,null,null,1)`);
    }
    db.releaseConnection(conn)
    console.log("A szerver elindult!")
})