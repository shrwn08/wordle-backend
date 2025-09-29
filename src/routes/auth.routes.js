import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.models.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
    const { email, password } = req.body;
    if(!email || !password) return res.status(400).json({msg:"missing"});
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: "Email in use" });
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const user = await User.create({ email, passwordHash: hash, stats: [] });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" });
    res.json({ token, user: { email: user.email, id: user._id } });
});
// signin
router.post("/signin", async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if(!user) return res.status(400).json({ msg: "Invalid credentials" });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if(!ok) return res.status(400).json({ msg: "Invalid credentials" });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" });
    res.json({ token, user: { email: user.email, id: user._id } });
});

export default router;