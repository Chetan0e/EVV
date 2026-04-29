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

const volunteerTaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  taskType: { 
    type: String, 
    enum: ['rescue', 'feed', 'transport', 'foster'],
    required: true
  },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'NGO' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  location: { type: pointSchema, required: true },
  status: { type: String, enum: ['open', 'assigned', 'completed'], default: 'open' },
  urgency: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  reward: String // optional — "certificate", "mention"
}, { timestamps: true });

volunteerTaskSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('VolunteerTask', volunteerTaskSchema);
