import mongoose from 'mongoose';

const gameRecordSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
        enum: ['animals', 'countries', 'tech', 'movies']
    },
    won: {
        type: Boolean,
        required: true
    },
    guesses: {
        type: Number,
        required: true,
        min: 0,
        max: 6
    },
    word: {
        type: String,
        required: true
    },
    playedAt: {
        type: Date,
        default: Date.now
    }
});

const statsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    totalGames: {
        type: Number,
        default: 0
    },
    gamesWon: {
        type: Number,
        default: 0
    },
    gamesLost: {
        type: Number,
        default: 0
    },
    currentStreak: {
        type: Number,
        default: 0
    },
    maxStreak: {
        type: Number,
        default: 0
    },
    categoryStats: {
        animals: {
            played: { type: Number, default: 0 },
            won: { type: Number, default: 0 },
            lost: { type: Number, default: 0 }
        },
        countries: {
            played: { type: Number, default: 0 },
            won: { type: Number, default: 0 },
            lost: { type: Number, default: 0 }
        },
        tech: {
            played: { type: Number, default: 0 },
            won: { type: Number, default: 0 },
            lost: { type: Number, default: 0 }
        },
        movies: {
            played: { type: Number, default: 0 },
            won: { type: Number, default: 0 },
            lost: { type: Number, default: 0 }
        }
    },
    guessDistribution: {
        1: { type: Number, default: 0 },
        2: { type: Number, default: 0 },
        3: { type: Number, default: 0 },
        4: { type: Number, default: 0 },
        5: { type: Number, default: 0 },
        6: { type: Number, default: 0 }
    },
    gameHistory: [gameRecordSchema],
    lastPlayedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Method to update stats after a game
statsSchema.methods.recordGame = function(category, won, guesses, word) {
    this.totalGames += 1;

    if (won) {
        this.gamesWon += 1;
        this.guessDistribution[guesses] += 1;

        // Update streak
        const today = new Date().setHours(0, 0, 0, 0);
        const lastPlayed = this.lastPlayedAt ? new Date(this.lastPlayedAt).setHours(0, 0, 0, 0) : null;

        if (!lastPlayed || today - lastPlayed === 86400000) {
            this.currentStreak += 1;
        } else if (today === lastPlayed) {
            // Same day, don't change streak
        } else {
            this.currentStreak = 1;
        }

        if (this.currentStreak > this.maxStreak) {
            this.maxStreak = this.currentStreak;
        }
    } else {
        this.gamesLost += 1;
        this.currentStreak = 0;
    }

    // Update category stats
    if (this.categoryStats[category]) {
        this.categoryStats[category].played += 1;
        if (won) {
            this.categoryStats[category].won += 1;
        } else {
            this.categoryStats[category].lost += 1;
        }
    }

    // Add to history
    this.gameHistory.push({
        category,
        won,
        guesses,
        word,
        playedAt: new Date()
    });

    // Keep only last 100 games in history
    if (this.gameHistory.length > 100) {
        this.gameHistory = this.gameHistory.slice(-100);
    }

    this.lastPlayedAt = new Date();
};

const Stats = mongoose.model('Stats', statsSchema);

export default Stats;