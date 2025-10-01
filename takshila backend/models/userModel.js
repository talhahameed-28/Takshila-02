const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  expiresAt: { type: Date, index: { expires: 0 } }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);

