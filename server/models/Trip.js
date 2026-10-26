const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  clientId: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

tripSchema.index({ owner: 1, clientId: 1 }, { unique: true });

module.exports = mongoose.model('Trip', tripSchema);
