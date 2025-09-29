import express from "express";
import dotenv from "dotenv";
import  {connectDB} from "./DB/database.js";


dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

connectDB();


app.listen(PORT, () => console.log(`App Listening on port ${PORT}`));

