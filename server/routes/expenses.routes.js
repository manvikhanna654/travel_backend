const express = require('express');
const Expense = require('../models/Expense');
const Trip = require('../models/Trip');
const requireAuth = require('../middleware/auth.middleware');

const router = express.Router();
router.use(requireAuth);

async function userCanAccessTrip(tripId, userId) {
  return Trip.exists({ _id: tripId, $or: [{ owner: userId }, { members: userId }] });
}

router.get('/trip/:tripId', async (req, res, next) => {
  try {
    if (!await userCanAccessTrip(req.params.tripId, req.user._id)) return res.status(404).json({ success: false, message: 'Trip not found' });
    const expenses = await Expense.find({ trip: req.params.tripId }).sort({ createdAt: -1 });
    res.json({ success: true, expenses });
  } catch (error) { next(error); }
});

router.post('/trip/:tripId', async (req, res, next) => {
  try {
    if (!await userCanAccessTrip(req.params.tripId, req.user._id)) return res.status(404).json({ success: false, message: 'Trip not found' });
    const expense = await Expense.create({ ...req.body, trip: req.params.tripId, paidBy: req.body.paidBy || req.user._id });
    res.status(201).json({ success: true, expense });
  } catch (error) { next(error); }
});

router.delete('/:expenseId', async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.expenseId);
    if (!expense || !await userCanAccessTrip(expense.trip, req.user._id)) return res.status(404).json({ success: false, message: 'Expense not found' });
    await expense.deleteOne();
    res.json({ success: true, message: 'Expense deleted' });
  } catch (error) { next(error); }
});

module.exports = router;
