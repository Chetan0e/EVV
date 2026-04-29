const express = require('express');
const router = express.Router();
const RescueReport = require('../models/RescueReport');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadFromBuffer } = require('../utils/cloudinary');

router.post('/', auth, upload.array('images', 3), async (req, res) => {
  try {
    const { animalType, count, severity, description, lat, lng, address } = req.body;
    
    // Convert to numbers
    const location = {
      type: 'Point',
      coordinates: [parseFloat(lng), parseFloat(lat)],
      address
    };

    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        if (process.env.CLOUDINARY_CLOUD_NAME) {
          try {
            const result = await uploadFromBuffer(file.buffer);
            images.push(result.secure_url);
          } catch (uploadError) {
            console.error("Cloudinary upload failed:", uploadError);
            // Fallback to placeholder if upload fails
            images.push('https://via.placeholder.com/400x300?text=Upload+Failed');
          }
        } else {
           // Fallback to placeholder if Cloudinary is not configured
           images.push('https://via.placeholder.com/400x300?text=No+Cloudinary+Config');
        }
      }
    }

    const report = new RescueReport({
      reportedBy: req.user.id,
      animal: {
        type: animalType,
        count: parseInt(count) || 1,
        description
      },
      severity,
      location,
      images
    });

    await report.save();
    
    // Access io from app
    const io = req.app.get('io');
    if (io) io.emit('rescue:new', report);

    res.status(201).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const reports = await RescueReport.find().populate('reportedBy', 'name phone').sort('-createdAt');
    res.json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const report = await RescueReport.findById(req.params.id).populate('reportedBy', 'name');
    if (!report) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id/assign', auth, async (req, res) => {
  try {
    const report = await RescueReport.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Not found' });
    
    report.assignedTo = req.user.id;
    report.status = 'assigned';
    await report.save();

    const io = req.app.get('io');
    if (io) io.emit('rescue:assigned', report);

    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const report = await RescueReport.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Not found' });
    
    report.status = status;
    await report.save();

    const io = req.app.get('io');
    if (io) io.emit('rescue:statusUpdate', report);

    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
