const express = require('express');
const Trip = require('../models/Trip');
const requireAuth = require('../middleware/auth.middleware');

const router = express.Router();
router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const records = await Trip.find({ $or: [{ owner: req.user._id }, { members: req.user._id }] }).sort({ createdAt: -1 });
    const trips = records.map((record) => ({ ...record.data, id: record.clientId }));
    res.json({ success: true, trips });
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const data = req.body.trip || req.body;
    if (!data.id || !data.name || !data.dest) return res.status(400).json({ success: false, message: 'Trip id, name, and destination are required' });
    const trip = await Trip.findOneAndUpdate(
      { owner: req.user._id, clientId: String(data.id) },
      { clientId: String(data.id), data, owner: req.user._id, $addToSet: { members: req.user._id } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    res.status(201).json({ success: true, trip: { ...trip.data, id: trip.clientId } });
  } catch (error) { next(error); }
});

router.get('/:tripId', async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ clientId: req.params.tripId, $or: [{ owner: req.user._id }, { members: req.user._id }] });
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
    res.json({ success: true, trip: { ...trip.data, id: trip.clientId } });
  } catch (error) { next(error); }
});

router.delete('/:tripId', async (req, res, next) => {
  try {
    const trip = await Trip.findOneAndDelete({ clientId: req.params.tripId, owner: req.user._id });
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found or not owned by you' });
    res.json({ success: true, message: 'Trip deleted' });
  } catch (error) { next(error); }
});

module.exports = router;
