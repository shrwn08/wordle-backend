import jwt from "jsonwebtoken";
import User from "../models/user.models.js";
import dotenv from "dotenv";

dotenv.config();

export const requireAuth = async (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ msg: "No token" });
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(payload.id);
        if (!req.user) return res.status(401).json({ msg: "Invalid token" });
        next();
    } catch (err) {
        return res.status(401).json({ msg: "Token invalid" });
    }
};
