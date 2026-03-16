const mongoose = require('mongoose');

let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI not set');
  await mongoose.connect(process.env.MONGODB_URI);
  isConnected = true;
}

const guestSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  group:     { type: String, default: '', trim: true },
  note:      { type: String, default: '', trim: true },
  isTeacher: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
const Guest = mongoose.models.Guest || mongoose.model('Guest', guestSchema);

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    await connectDB();
    const id = req.query.id;

    if (req.method === 'GET') {
      const guests = await Guest.find().sort({ createdAt: 1 });
      return res.status(200).json(guests);
    }
    if (req.method === 'POST') {
      const guest = await Guest.create(req.body);
      return res.status(201).json(guest);
    }
    if (req.method === 'PUT' && id) {
      const guest = await Guest.findByIdAndUpdate(id, req.body, { new: true });
      return res.status(200).json(guest);
    }
    if (req.method === 'DELETE' && id) {
      await Guest.findByIdAndDelete(id);
      return res.status(200).json({ ok: true });
    }
    res.status(404).json({ error: 'Not found' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
