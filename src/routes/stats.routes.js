import express from 'express';
import Stats from '../models/stats.models.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const statsRouter = express.Router();

// Get user stats
statsRouter.get('/', authMiddleware, async (req, res) => {
    try {
        let stats = await Stats.findOne({ userId: req.userId });

        // Create stats if they don't exist
        if (!stats) {
            stats = await Stats.create({ userId: req.userId });
        }

        res.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching stats'
        });
    }
});

// Save game result
statsRouter.post('/game', authMiddleware, async (req, res) => {
    try {
        const { category, won, guesses, word } = req.body;

        // Validation
        if (!category || typeof won !== 'boolean' || !guesses || !word) {
            return res.status(400).json({
                success: false,
                message: 'Invalid game data'
            });
        }

        if (!['animals', 'countries', 'tech', 'movies'].includes(category)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category'
            });
        }

        if (guesses < 0 || guesses > 6) {
            return res.status(400).json({
                success: false,
                message: 'Invalid number of guesses'
            });
        }

        let stats = await Stats.findOne({ userId: req.userId });

        // Create stats if they don't exist
        if (!stats) {
            stats = await Stats.create({ userId: req.userId });
        }

        // Record the game
        stats.recordGame(category, won, guesses, word);
        await stats.save();

        res.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('Save game error:', error);
        res.status(500).json({
            success: false,
            message: 'Error saving game result'
        });
    }
});

// Get leaderboard
statsRouter.get('/leaderboard', authMiddleware, async (req, res) => {
    try {
        const { category } = req.query;

        let leaderboard;

        if (category && ['animals', 'countries', 'tech', 'movies'].includes(category)) {
            // Category-specific leaderboard
            leaderboard = await Stats.find()
                .populate('userId', 'email')
                .sort({ [`categoryStats.${category}.won`]: -1 })
                .limit(10)
                .lean();

            leaderboard = leaderboard.map(stat => ({
                email: stat.userId?.email || 'Anonymous',
                wins: stat.categoryStats[category].won,
                played: stat.categoryStats[category].played,
                winRate: stat.categoryStats[category].played > 0
                    ? ((stat.categoryStats[category].won / stat.categoryStats[category].played) * 100).toFixed(1)
                    : 0
            }));
        } else {
            // Global leaderboard
            leaderboard = await Stats.find()
                .populate('userId', 'email')
                .sort({ gamesWon: -1, maxStreak: -1 })
                .limit(10)
                .lean();

            leaderboard = leaderboard.map(stat => ({
                email: stat.userId?.email || 'Anonymous',
                wins: stat.gamesWon,
                played: stat.totalGames,
                streak: stat.maxStreak,
                winRate: stat.totalGames > 0
                    ? ((stat.gamesWon / stat.totalGames) * 100).toFixed(1)
                    : 0
            }));
        }

        res.json({
            success: true,
            leaderboard
        });
    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching leaderboard'
        });
    }
});

export default statsRouter;