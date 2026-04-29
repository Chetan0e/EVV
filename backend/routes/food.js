const express = require('express');
const router = express.Router();
const FoodDonation = require('../models/FoodDonation');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadFromBuffer } = require('../utils/cloudinary');

router.post('/', auth, upload.array('images', 2), async (req, res) => {
  try {
    const { foodDescription, quantity, expiresIn, lat, lng, address } = req.body;
    
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
          } catch(err) {
             console.error("Cloudinary upload failed:", err);
          }
        }
      }
    }

    const food = new FoodDonation({
      donor: req.user.id,
      foodDescription,
      quantity,
      expiresIn: parseInt(expiresIn),
      location,
      images
    });

    await food.save();

    const io = req.app.get('io');
    if (io) io.emit('food:available', food);

    res.status(201).json({ success: true, data: food });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/available', async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;
    let query = { status: 'available' };
    
    if (lat && lng && radius) {
      query.location = {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(radius) * 1000
        }
      };
    }

    const foods = await FoodDonation.find(query).populate('donor', 'name');
    res.json({ success: true, data: foods });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id/claim', auth, async (req, res) => {
  try {
    const food = await FoodDonation.findById(req.params.id);
    if (!food) return res.status(404).json({ success: false, message: 'Not found' });
    
    food.claimedBy = req.user.id;
    food.status = 'claimed';
    await food.save();

    res.json({ success: true, data: food });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id/delivered', auth, async (req, res) => {
  try {
    const food = await FoodDonation.findById(req.params.id);
    if (!food) return res.status(404).json({ success: false, message: 'Not found' });
    
    food.status = 'delivered';
    await food.save();

    res.json({ success: true, data: food });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
