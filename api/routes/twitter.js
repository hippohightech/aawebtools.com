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

    var info = await downloader.getMediaInfo(url.trim());
    var videoUrl = await downloader.getVideoUrl(url.trim());
    var audioUrl;
    try {
      audioUrl = await downloader.getAudioUrl(url.trim());
    } catch (e) {
      audioUrl = null;
    }

    res.json({
      success: true,
      data: {
        title: info.title || info.description || 'Twitter Video',
        thumbnail: info.thumbnail || null,
        duration: info.duration || 0,
        author: info.uploader || info.creator || null,
        video_url: videoUrl,
        audio_url: audioUrl,
        format: info.ext || 'mp4'
      },
      message: 'Video ready for download'
    });
  } catch (err) {
    res.status(503).json(ERROR_RESPONSE);
  }
});

module.exports = router;
