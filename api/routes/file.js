var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var downloader = require('../utils/downloader');

var MIME_TYPES = {
  mp4: 'video/mp4',
  mp3: 'audio/mpeg',
  webm: 'video/webm'
};

// GET /download/file/:filename — serve a temp file then delete it
router.get('/:filename', function (req, res) {
  var filename = req.params.filename;

  // Only allow UUID filenames with safe extensions
  if (!/^[a-f0-9-]+\.(mp4|mp3|webm)$/.test(filename)) {
    return res.status(400).json({ success: false, message: 'Invalid filename' });
  }

  var filePath = path.join(downloader.TEMP_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: 'File not found or expired' });
  }

  var ext = path.extname(filename).slice(1);
  var contentType = MIME_TYPES[ext] || 'application/octet-stream';
  var stat = fs.statSync(filePath);

  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Length', stat.size);
  res.setHeader('Content-Disposition', 'attachment; filename="download.' + ext + '"');

  var stream = fs.createReadStream(filePath);
  stream.pipe(res);
  stream.on('end', function () {
    // Clean up after serving
    fs.unlink(filePath, function () {});
  });
  stream.on('error', function () {
    res.status(500).json({ success: false, message: 'File read error' });
  });
});

module.exports = router;
