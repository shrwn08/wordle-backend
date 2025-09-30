import express from 'express';
import jwt from 'jsonwebtoken';

import Stats from '../models/stats.models.js';
import {signin, signup, verify} from "../controllers/auth.controller.js";

const router = express.Router();


// Sign up
router.post('/signup', signup);

// Sign in
router.post('/signin', signin);

// Verify token (optional - for frontend to check if token is valid)
router.get('/verify', verify);

export default router;