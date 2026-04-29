const mongoose = require('mongoose');

const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true,
    default: 'Point'
  },
  coordinates: {
    type: [Number],
    required: true
  }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['reporter', 'volunteer', 'ngo', 'admin'],
    default: 'reporter'
  },
  location: {
    type: pointSchema,
    required: false
  },
  volunteerType: {
    type: [String],
    enum: ['feeder', 'transporter', 'foster', 'donor'],
    default: []
  },
  city: String,
  state: String,
  avatar: String,
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });

userSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', userSchema);
