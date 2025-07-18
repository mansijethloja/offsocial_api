const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

/**
 * Auth Service for handling user authentication and registration
 */
class AuthService {
  /**
   * Create a JWT token for the user
   * @param {Object} user - User object
   * @returns {String} JWT token
   */
  generateToken(user) {
    const payload = {
      userId: user._id,
      email: user.email
    };
    
    return jwt.sign(
      payload, 
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Object} New user and token
   */
  async signUp(userData) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Create new user
      const user = new User({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        authProvider: 'local'
      });

      // Save user to database
      await user.save();

      // Generate token
      const token = this.generateToken(user);

      return {
        user,
        token
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Login a user
   * @param {String} email - User email
   * @param {String} password - User password
   * @returns {Object} User and token
   */
  async login(email, password) {
    try {
      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // If user is registered via Google but trying to login with password
      if (user.authProvider === 'google' && !user.password) {
        throw new Error('Please login with Google');
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Generate token
      const token = this.generateToken(user);

      return {
        user,
        token
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Handle Google OAuth authentication
   * @param {Object} profile - Google profile data
   * @returns {Object} User and token
   */
  async googleAuth(profile) {
    try {
      // Check if user already exists with this Google ID
      let user = await User.findOne({ googleId: profile.id });
      
      // If user doesn't exist with Google ID, check if email exists
      if (!user && profile.emails && profile.emails.length > 0) {
        const email = profile.emails[0].value;
        user = await User.findOne({ email });
        
        // If user exists with email but not Google ID, update user with Google ID
        if (user) {
          user.googleId = profile.id;
          user.authProvider = 'google';
          if (profile.photos && profile.photos.length > 0) {
            user.profilePicture = profile.photos[0].value;
          }
          await user.save();
        } else {
          // Create new user with Google profile data
          user = new User({
            firstName: profile.name.givenName || '',
            lastName: profile.name.familyName || '',
            email: email,
            googleId: profile.id,
            authProvider: 'google',
            profilePicture: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null
          });
          await user.save();
        }
      }

      // Generate token
      const token = this.generateToken(user);

      return {
        user,
        token
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AuthService();
