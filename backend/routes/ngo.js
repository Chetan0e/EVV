const express = require('express');
const router = express.Router();
const NGO = require('../models/NGO');
const VolunteerTask = require('../models/VolunteerTask');
const { auth, authorize } = require('../middleware/auth');

router.post('/register', auth, async (req, res) => {
  try {
    const { name, registrationNumber, email, lat, lng, address, city, description } = req.body;
    
    const location = {
      type: 'Point',
      coordinates: [parseFloat(lng), parseFloat(lat)],
      address
    };

    const ngo = new NGO({
      name,
      registrationNumber,
      phone: req.user.phone,
      email,
      location,
      city,
      description
    });

    await ngo.save();
    res.status(201).json({ success: true, data: ngo });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;
    if (!lat || !lng) {
      const ngos = await NGO.find();
      return res.json({ success: true, data: ngos });
    }

    const ngos = await NGO.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(radius || 10) * 1000
        }
      }
    });

    res.json({ success: true, data: ngos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const ngo = await NGO.findById(req.params.id);
    if (!ngo) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: ngo });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/tasks', auth, authorize(['ngo']), async (req, res) => {
  try {
    const { title, description, taskType, lat, lng, address, urgency, reward } = req.body;
    
    const location = {
      type: 'Point',
      coordinates: [parseFloat(lng), parseFloat(lat)],
      address
    };

    // Note: Assuming the logged in user is associated with an NGO somehow
    // For simplicity, finding the first NGO or using user._id if the NGO model maps one-to-one
    const ngo = await NGO.findOne({ phone: req.user.phone });
    if (!ngo) return res.status(404).json({ success: false, message: 'NGO profile not found' });

    const task = new VolunteerTask({
      title,
      description,
      taskType,
      location,
      urgency,
      reward,
      postedBy: ngo._id
    });

    await task.save();
    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
