const express = require('express');
const mongoose = require('mongoose');
const shortid = require('shortid');
const validUrl = require('valid-url');
const app = express();
const cron = require('node-cron');
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://sahilgala1234:galasahil@sociopedia.uatgf9y.mongodb.net/";

app.use(express.json());

// MongoDB Model
const urlSchema = new mongoose.Schema({
  longUrl: { type: String, required: true, unique: true },
  shortCode: { type: String, required: true, unique: true },
  visits: { type: Number, default: 0 },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } // 30 days
});
urlSchema.index({ longUrl: 1 });
urlSchema.index({ shortCode: 1 });
const Url = mongoose.model('Url', urlSchema);

// Shorten URL Endpoint
app.post('/shorten', async (req, res) => {
  try {
    const { longUrl } = req.body;
    const alias = req.query.alias;

    if (!validUrl.isUri(longUrl)) {
      return res.status(400).json({ error: 'Invalid URL' });
    }

    let url = await Url.findOne({ longUrl });

    if (url) {
      return res.json({ shortUrl: `${req.protocol}://${req.get('host')}/${url.shortCode}` });
    }

    const shortCode = alias || shortid.generate();
    if (alias && (await Url.findOne({ shortCode }))) {
      return res.status(400).json({ error: 'Alias already taken' });
    }

    url = new Url({ longUrl, shortCode });
    await url.save();

    const shortUrl = `${req.protocol}://${req.get('host')}/${shortCode}`;
    res.json({ shortUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Redirect Endpoint
app.get('/:shortCode', async (req, res) => {
  try {
    const url = await Url.findOne({ shortCode: req.params.shortCode });

    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    if (new Date() > url.expiresAt) {
      return res.status(410).json({ error: 'Short URL expired' });
    }

    url.visits++;
    await url.save();
    res.redirect(url.longUrl);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Stats Endpoint
app.get('/stats/:shortCode', async (req, res) => {
  try {
    const url = await Url.findOne({ shortCode: req.params.shortCode });

    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    res.json({ longUrl: url.longUrl, visits: url.visits });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Function to clean up expired URLs
const cleanupExpiredUrls = async () => {
    try {
      const now = new Date();
      const result = await Url.deleteMany({ expiresAt: { $lt: now } });
      console.log(`Cleaned up ${result.deletedCount} expired URLs.`);
    } catch (error) {
      console.error('Error cleaning up expired URLs:', error);
    }
  };
  
  // Schedule cleanup task to run daily at midnight
cron.schedule('0 0 * * *', cleanupExpiredUrls); // Runs at 00:00 every day

// MongoDB Connection
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));