const mongoose = require('mongoose');

/**
 * Password Reset Token Schema
 * Stores tokens for password reset functionality with automatic expiration
 */
const passwordResetTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    index: { expireAfterSeconds: 0 } // MongoDB TTL - automatically removes expired documents
  },
  used: {
    type: Boolean,
    default: false
  },
  usedAt: {
    type: Date
  }
}, {
  timestamps: true,
  collection: 'passwordresettokens'
});

// Indexes for performance
passwordResetTokenSchema.index({ token: 1, used: 1 });
passwordResetTokenSchema.index({ userId: 1, createdAt: -1 });
passwordResetTokenSchema.index({ email: 1, createdAt: -1 });

// Static methods

/**
 * Create a new password reset token for a user
 * @param {string} userId - User ID
 * @param {string} email - User email
 * @param {string} token - Reset token
 * @returns {Promise} - Created token document
 */
passwordResetTokenSchema.statics.createToken = async function(userId, email, token) {
  // Remove any existing unused tokens for this user
  await this.deleteMany({ userId, used: false });
  
  // Create new token
  return await this.create({
    userId,
    email,
    token,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  });
};

/**
 * Find valid token for password reset
 * @param {string} token - Reset token
 * @returns {Promise} - Token document if valid, null otherwise
 */
passwordResetTokenSchema.statics.findValidToken = async function(token) {
  return await this.findOne({
    token,
    used: false,
    expiresAt: { $gt: new Date() }
  }).populate('userId');
};

/**
 * Mark token as used
 * @param {string} token - Reset token
 * @returns {Promise} - Updated token document
 */
passwordResetTokenSchema.statics.markAsUsed = async function(token) {
  return await this.findOneAndUpdate(
    { token, used: false },
    { 
      used: true, 
      usedAt: new Date() 
    },
    { new: true }
  );
};

/**
 * Clean up expired or used tokens (maintenance function)
 * @returns {Promise} - Cleanup result
 */
passwordResetTokenSchema.statics.cleanup = async function() {
  const result = await this.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { used: true, usedAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } // Used tokens older than 7 days
    ]
  });
  
  console.log(`Cleaned up ${result.deletedCount} expired/used password reset tokens`);
  return result;
};

// Instance methods

/**
 * Check if token is valid (not expired and not used)
 * @returns {boolean} - True if valid
 */
passwordResetTokenSchema.methods.isValid = function() {
  return !this.used && this.expiresAt > new Date();
};

/**
 * Get time remaining until expiration in minutes
 * @returns {number} - Minutes remaining, 0 if expired
 */
passwordResetTokenSchema.methods.getTimeRemaining = function() {
  if (this.used || this.expiresAt <= new Date()) {
    return 0;
  }
  
  return Math.floor((this.expiresAt - new Date()) / (1000 * 60));
};

// Pre-save middleware
passwordResetTokenSchema.pre('save', function(next) {
  // Ensure token is not already used when creating
  if (this.isNew && this.used) {
    this.used = false;
    this.usedAt = undefined;
  }
  
  next();
});

// Export model
const PasswordResetToken = mongoose.model('PasswordResetToken', passwordResetTokenSchema);

module.exports = PasswordResetToken;