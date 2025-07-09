const { validationResult } = require('express-validator');
const authService = require('../services/auth.service');

/**
 * Auth Controller for handling authentication-related requests
 */
class AuthController {
  /**
   * Register a new user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async signUp(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
          statusCode: 400
        });
      }

      const { email, password } = req.body;
      // Set firstName and lastName to empty strings if not provided
      const firstName = req.body.firstName || '';
      const lastName = req.body.lastName || '';
      
      // Call auth service to create user
      const { user, token } = await authService.signUp({
        firstName,
        lastName,
        email,
        password
      });

      // Return success response
      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: { user, token },
        statusCode: 201
      });
    } catch (error) {
      // Handle specific errors
      if (error.message === 'User with this email already exists') {
        return res.status(409).json({
          success: false,
          message: error.message,
          statusCode: 409
        });
      }

      // Handle generic errors
      return res.status(500).json({
        success: false,
        message: 'Error registering user',
        error: error.message,
        statusCode: 500
      });
    }
  }

  /**
   * Login a user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async login(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
          statusCode: 400
        });
      }

      const { email, password } = req.body;
      
      // Call auth service to authenticate user
      const { user, token } = await authService.login(email, password);

      // Return success response
      return res.status(200).json({
        success: true,
        message: 'User logged in successfully',
        data: { user, token },
        statusCode: 200
      });
    } catch (error) {
      // Handle authentication errors
      if (error.message === 'Invalid email or password' || 
          error.message === 'Please login with Google') {
        return res.status(401).json({
          success: false,
          message: error.message,
          statusCode: 401
        });
      }

      // Handle generic errors
      return res.status(500).json({
        success: false,
        message: 'Error logging in',
        error: error.message,
        statusCode: 500
      });
    }
  }

  /**
   * Google OAuth callback handler
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async googleCallback(req, res) {
    try {
      // User will be attached to req by passport
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Google authentication failed',
          statusCode: 401
        });
      }

      // Generate token for the authenticated user
      const token = authService.generateToken(req.user);

      // Get frontend URL from environment variables or use a default
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      
      // Redirect to frontend with token as query parameter
      return res.redirect(`${frontendUrl}/auth/google/callback?token=${token}`);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error during Google authentication',
        error: error.message,
        statusCode: 500
      });
    }
  }

  /**
   * Get current user profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCurrentUser(req, res) {
    try {
      // req.user is set by the auth middleware
      return res.status(200).json({
        success: true,
        message: 'User profile retrieved successfully',
        data: { user: req.user },
        statusCode: 200
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error retrieving user profile',
        error: error.message,
        statusCode: 500
      });
    }
  }

  /**
   * Logout a user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async logout(req, res) {
    try {
      // JWT is stateless, so we don't need to do anything on the server side
      // The frontend will handle removing the token

      return res.status(200).json({
        success: true,
        message: 'Logged out successfully',
        statusCode: 200
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error during logout',
        error: error.message,
        statusCode: 500
      });
    }
  }
}

module.exports = new AuthController();
