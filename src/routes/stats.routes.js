import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import {
    saveGameResult,
    getUserStats,
    getLeaderboard
} from '../controllers/stats.controller.js';

const statsRouter = express.Router();

// All routes require authentication
statsRouter.use(authMiddleware);

// Save game result
statsRouter.post('/save', saveGameResult);

// Get user stats by userId
statsRouter.get('/user/:userId', getUserStats);

// Get leaderboard
statsRouter.get('/leaderboard', getLeaderboard);

export default statsRouter;