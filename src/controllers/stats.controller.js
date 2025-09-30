import Stats from '../models/stats.models.js';
import User from '../models/user.models.js';

// Save game result
export const saveGameResult = async (req, res) => {
    try {
        const userId = req.userId; // From auth middleware
        const { category, won, guesses, word } = req.body;

        // Validation
        if (!category || typeof won !== 'boolean' || typeof guesses !== 'number' || !word) {
            return res.status(400).json({
                success: false,
                message: 'Category, won (boolean), guesses (number), and word are required'
            });
        }

        // Validate category
        const validCategories = ['animals', 'countries', 'tech', 'movies'];
        if (!validCategories.includes(category)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category. Must be one of: animals, countries, tech, movies'
            });
        }

        // Validate guesses
        if (guesses < 0 || guesses > 6) {
            return res.status(400).json({
                success: false,
                message: 'Guesses must be between 0 and 6'
            });
        }

        // Find or create stats
        let stats = await Stats.findOne({ userId });
        if (!stats) {
            stats = await Stats.create({ userId });
        }

        // Record the game using the model method
        stats.recordGame(category, won, guesses, word);

        // Save updated stats
        await stats.save();

        res.json({
            success: true,
            message: 'Game result saved successfully',
            stats
        });
    } catch (error) {
        console.error('Save game result error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save game result'
        });
    }
};

// Get user stats by userId
export const getUserStats = async (req, res) => {
    try {
        const { userId } = req.params;
        const requestingUserId = req.userId; // From auth middleware

        // Optional: Check if user is requesting their own stats or implement privacy rules
        // For now, allowing any authenticated user to view stats

        // Verify user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Find stats
        let stats = await Stats.findOne({ userId });

        // If stats don't exist, create them
        if (!stats) {
            stats = await Stats.create({ userId });
        }

        res.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch stats'
        });
    }
};

// Get leaderboard
export const getLeaderboard = async (req, res) => {
    try {
        const { limit = 10, sortBy = 'gamesWon' } = req.query;

        // Valid sort options
        const validSortOptions = ['gamesWon', 'maxStreak', 'totalGames', 'winRate'];
        const sortField = validSortOptions.includes(sortBy) ? sortBy : 'gamesWon';

        // Fetch all stats and populate user email
        let leaderboard = await Stats.find()
            .populate('userId', 'email')
            .lean();

        // Filter out stats without users (in case of deleted users)
        leaderboard = leaderboard.filter(stat => stat.userId);

        // Calculate win rate and add to each entry
        leaderboard = leaderboard.map(stat => ({
            ...stat,
            winRate: stat.totalGames > 0 ? (stat.gamesWon / stat.totalGames) * 100 : 0,
            user: {
                id: stat.userId._id,
                email: stat.userId.email
            }
        }));

        // Sort based on the sortField
        leaderboard.sort((a, b) => {
            if (sortField === 'winRate') {
                // Sort by win rate, then by total games as tiebreaker
                if (b.winRate === a.winRate) {
                    return b.totalGames - a.totalGames;
                }
                return b.winRate - a.winRate;
            }
            return b[sortField] - a[sortField];
        });

        // Limit results
        leaderboard = leaderboard.slice(0, parseInt(limit));

        // Remove userId field and keep only necessary data
        leaderboard = leaderboard.map((stat, index) => ({
            rank: index + 1,
            user: stat.user,
            totalGames: stat.totalGames,
            gamesWon: stat.gamesWon,
            gamesLost: stat.gamesLost,
            winRate: Math.round(stat.winRate * 100) / 100, // Round to 2 decimal places
            currentStreak: stat.currentStreak,
            maxStreak: stat.maxStreak,
            categoryStats: stat.categoryStats
        }));

        res.json({
            success: true,
            leaderboard
        });
    } catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch leaderboard'
        });
    }
};