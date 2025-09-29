 import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    email: { type: String, unique: true },
    passwordHash: String,
    createdAt: { type: Date, default: Date.now },
    stats: [statSchema]
});

const User = mongoose.model("User", userSchema);

export default  User