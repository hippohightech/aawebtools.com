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

// POST /download/tiktok/video — download video (MP4 HD + MP3 audio)
router.post('/video', async function (req, res) {
  try {
    var url = req.body && req.body.url;
    if (!validator.isValidTikTokUrl(url)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Invalid TikTok URL. Please paste a valid TikTok video link.',
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

    // Audio extraction is optional — don't block on failure
    var audioFile = null;
    try {
      audioFile = await downloader.downloadAudio(trimmedUrl);
    } catch (e) {
      audioFile = null;
    }

    res.json({
      success: true,
      data: {
        title: info.title || info.description || 'TikTok Video',
        thumbnail: info.thumbnail || null,
        duration: info.duration || 0,
        author: info.uploader || info.creator || null,
        video_url: '/api/download/file/' + videoFile,
        audio_url: audioFile ? '/api/download/file/' + audioFile : null
      },
      message: 'Video ready for download'
    });
  } catch (err) {
    res.status(503).json(ERROR_RESPONSE);
  }
});

// POST /download/tiktok/photo — download photos/slideshow
router.post('/photo', async function (req, res) {
  try {
    var url = req.body && req.body.url;
    if (!validator.isValidTikTokUrl(url)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Invalid TikTok URL. Please paste a valid TikTok photo link.',
        code: 'INVALID_URL'
      });
    }

    var info = await downloader.getMediaInfo(url.trim());

    // Extract image URLs from yt-dlp output
    var images = [];
    if (info.entries && info.entries.length) {
      images = info.entries.map(function (e) { return e.url || e.webpage_url; });
    } else if (info.thumbnails && info.thumbnails.length) {
      images = info.thumbnails
        .filter(function (t) { return t.width && t.width >= 500; })
        .map(function (t) { return t.url; });
    } else if (info.thumbnail) {
      images = [info.thumbnail];
    }

    res.json({
      success: true,
      data: {
        title: info.title || info.description || 'TikTok Photo',
        images: images,
        author: info.uploader || info.creator || null
      },
      message: 'Photos ready for download'
    });
  } catch (err) {
    res.status(503).json(ERROR_RESPONSE);
  }
});

// POST /download/tiktok/profile — download profile picture
router.post('/profile', async function (req, res) {
  try {
    var username = req.body && req.body.username;
    if (!username || !validator.isValidTikTokUsername(username)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Invalid username. Enter a TikTok username like @username.',
        code: 'INVALID_USERNAME'
      });
    }

    var cleanUsername = username.trim().replace(/^@/, '');
    var profileUrl = 'https://www.tiktok.com/@' + cleanUsername;
    var info = await downloader.getMediaInfo(profileUrl);

    var avatarUrl = info.thumbnail || info.thumbnails && info.thumbnails[0] && info.thumbnails[0].url || null;

    res.json({
      success: true,
      data: {
        username: cleanUsername,
        avatar_url: avatarUrl,
        display_name: info.uploader || cleanUsername
      },
      message: 'Profile picture ready'
    });
  } catch (err) {
    res.status(503).json(ERROR_RESPONSE);
  }
});

module.exports = router;
