const express = require('express');
const router = express.Router();
const VolunteerTask = require('../models/VolunteerTask');
const { auth } = require('../middleware/auth');

router.get('/tasks', auth, async (req, res) => {
  try {
    const tasks = await VolunteerTask.find({ status: 'open' }).populate('postedBy', 'name');
    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/tasks/:id/claim', auth, async (req, res) => {
  try {
    const task = await VolunteerTask.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Not found' });
    
    task.assignedTo = req.user.id;
    task.status = 'assigned';
    await task.save();

    const io = req.app.get('io');
    if (io) io.emit('task:claimed', task);

    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/my-tasks', auth, async (req, res) => {
  try {
    const tasks = await VolunteerTask.find({ assignedTo: req.user.id });
    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
