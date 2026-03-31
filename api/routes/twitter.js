var express = require('express');
var router = express.Router();
var validator = require('../utils/validator');
var downloader = require('../utils/downloader');

var ERROR_RESPONSE = {
  success: false,
  data: null,
  message: "We're fixing this. Check back in 2 hours.",
  code: 'SERVICE_UNAVAILABLE'
};

// POST /download/twitter/video — download video/GIF/image
router.post('/video', async function (req, res) {
  try {
    var url = req.body && req.body.url;
    if (!validator.isValidTwitterUrl(url)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Invalid Twitter/X URL. Please paste a valid tweet link.',
        code: 'INVALID_URL'
      });
    }

    var trimmedUrl = url.trim();

    // Fetch info and download video in parallel
    var results = await Promise.all([
      downloader.getMediaInfo(trimmedUrl),
      downloader.downloadVideo(trimmedUrl)
    ]);
    var info = results[0];
    var videoFile = results[1];

    // Audio extraction is optional
    var audioFile = null;
    try {
      audioFile = await downloader.downloadAudio(trimmedUrl);
    } catch (e) {
      audioFile = null;
    }

    res.json({
      success: true,
      data: {
        title: info.title || info.description || 'Twitter Video',
        thumbnail: info.thumbnail || null,
        duration: info.duration || 0,
        author: info.uploader || info.creator || null,
        video_url: '/api/download/file/' + videoFile,
        audio_url: audioFile ? '/api/download/file/' + audioFile : null,
        format: 'mp4'
      },
      message: 'Video ready for download'
    });
  } catch (err) {
    res.status(503).json(ERROR_RESPONSE);
  }
});

module.exports = router;
