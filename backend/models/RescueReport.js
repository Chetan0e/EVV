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

const rescueReportSchema = new mongoose.Schema({
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  animal: {
    type: { type: String, enum: ['dog', 'cat', 'cow', 'other'], required: true },
    count: { type: Number, default: 1 },
    description: String
  },
  severity: { type: String, enum: ['critical', 'moderate', 'minor'], required: true },
  images: [String],
  location: { type: pointSchema, required: true },
  status: { 
    type: String, 
    enum: ['reported', 'assigned', 'rescued', 'closed'],
    default: 'reported'
  },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedNGO: { type: mongoose.Schema.Types.ObjectId, ref: 'NGO' },
  notes: String
}, { timestamps: true });

rescueReportSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('RescueReport', rescueReportSchema);
