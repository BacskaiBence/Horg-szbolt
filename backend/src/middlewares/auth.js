import jwt from "jsonwebtoken";
import { SECRET } from "../index.js";

export function auth(req,res,next){
    const token = req.cookies.token;
    const payload=jwt.verify(token,SECRET);
    req.userId = payload.id;
    next();
}