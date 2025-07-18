const express = require('express');
const passport = require('passport');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validateSignUp, validateLogin } = require('../middlewares/validation.middleware');
const { authenticateJWT } = require('../middlewares/auth.middleware');

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 * @access  Public
 */
router.post('/signup', validateSignUp, authController.signUp);

/**
 * @route   POST /api/auth/login
 * @desc    Login a user
 * @access  Public
 */
router.post('/login', validateLogin, authController.login);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticateJWT, authController.getCurrentUser);

/**
 * @route   GET /api/auth/google
 * @desc    Initiate Google OAuth authentication
 * @access  Public
 */
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

/**
 * @route   GET /api/auth/google/callback
 * @desc    Google OAuth callback
 * @access  Public
 */
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/login'
  }),
  authController.googleCallback
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout a user
 * @access  Public
 */
router.post('/logout', authController.logout);

module.exports = router;
