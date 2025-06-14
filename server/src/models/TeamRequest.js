const mongoose = require('mongoose');

const teamRequestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  skills: [{
    type: String,
    trim: true
  }],
  projectType: {
    type: String,
    required: true
  },
  contactInfo: {
    type: String,
    required: true
  },
  ownerFingerprint: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
teamRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const TeamRequest = mongoose.model('TeamRequest', teamRequestSchema);

module.exports = TeamRequest; 