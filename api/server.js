const express = require('express');
const cors = require('cors');
require('dotenv').config();

const healthRoutes = require('./routes/health');
const tiktokRoutes = require('./routes/tiktok');
const twitterRoutes = require('./routes/twitter');
const fileRoutes = require('./routes/file');
const humanizerRoutes = require('./routes/humanizer');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS — PRD Section 0.6
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://aawebtools.com'
    : '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Routes
app.use('/health', healthRoutes);
app.use('/download/tiktok', tiktokRoutes);
app.use('/download/twitter', twitterRoutes);
app.use('/download/file', fileRoutes);

app.use('/humanizer', humanizerRoutes);

// Legacy routes (backwards compat with Section 1 tests)
app.use('/tiktok', tiktokRoutes);
app.use('/twitter', twitterRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    data: null,
    message: 'Endpoint not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  res.status(500).json({
    success: false,
    data: null,
    message: 'Internal server error'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  if (process.env.NODE_ENV !== 'production') {
    process.stdout.write('API running on port ' + PORT + '\n');
  }
});
