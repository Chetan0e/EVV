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

const foodDonationSchema = new mongoose.Schema({
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  foodDescription: { type: String, required: true },
  quantity: { type: String, required: true },
  expiresIn: { type: Number, required: true }, // in hours
  location: { type: pointSchema, required: true },
  status: { 
    type: String, 
    enum: ['available', 'claimed', 'delivered'],
    default: 'available'
  },
  claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  images: [String]
}, { timestamps: true });

foodDonationSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('FoodDonation', foodDonationSchema);
