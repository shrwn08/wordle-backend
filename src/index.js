import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import statsRoutes from './routes/stats.routes.js';
import  {connectDB} from "./DB/database.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));






// Routes
app.use('/api/auth', authRoutes);
app.use('/api/stats', statsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

connectDB();


app.listen(PORT, () => console.log(`App Listening on port ${PORT}`));

