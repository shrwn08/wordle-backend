import mongoose from "mongoose";

const statSchema = new mongoose.Schema({
    category: String,
    played: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    maxStreak: { type: Number, default: 0 }
});

const Stats = mongoose.model("Stats", statSchema);

export default Stats;