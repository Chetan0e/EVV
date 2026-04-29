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
  },
  address: String
});

const ngoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  registrationNumber: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  location: { type: pointSchema, required: true },
  city: { type: String, required: true },
  coverImage: String,
  description: String,
  operatingHours: String,
  animalsHandled: { type: Number, default: 0 },
  volunteersCount: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });

ngoSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('NGO', ngoSchema);
