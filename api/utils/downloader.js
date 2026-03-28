// downloader.js — yt-dlp subprocess wrapper
// Section 5: Full implementation for TikTok + Twitter

var childProcess = require('child_process');
var path = require('path');
var fs = require('fs');

var TIMEOUT = 30000;
var TEMP_DIR = path.join(__dirname, '..', 'tmp');

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Get video/media info as JSON without downloading
function getMediaInfo(url) {
  return new Promise(function (resolve, reject) {
    var args = [
      '--no-warnings',
      '--no-playlist',
      '--no-download',
      '-j',
      url
    ];

    childProcess.execFile('yt-dlp', args, { timeout: TIMEOUT }, function (error, stdout) {
      if (error) {
        reject(new Error('Failed to fetch media info'));
        return;
      }
      try {
        resolve(JSON.parse(stdout));
      } catch (e) {
        reject(new Error('Failed to parse media info'));
      }
    });
  });
}

// Get direct download URL for video (best mp4)
function getVideoUrl(url) {
  return new Promise(function (resolve, reject) {
    var args = [
      '--no-warnings',
      '--no-playlist',
      '-f', 'best[ext=mp4]/best',
      '-g',
      url
    ];

    childProcess.execFile('yt-dlp', args, { timeout: TIMEOUT }, function (error, stdout) {
      if (error) {
        reject(new Error('Failed to get video URL'));
        return;
      }
      var directUrl = stdout.trim().split('\n')[0];
      if (!directUrl) {
        reject(new Error('No download URL returned'));
        return;
      }
      resolve(directUrl);
    });
  });
}

// Get direct download URL for audio (best audio → mp3)
function getAudioUrl(url) {
  return new Promise(function (resolve, reject) {
    var args = [
      '--no-warnings',
      '--no-playlist',
      '-f', 'bestaudio',
      '-g',
      url
    ];

    childProcess.execFile('yt-dlp', args, { timeout: TIMEOUT }, function (error, stdout) {
      if (error) {
        reject(new Error('Failed to get audio URL'));
        return;
      }
      var directUrl = stdout.trim().split('\n')[0];
      if (!directUrl) {
        reject(new Error('No audio URL returned'));
        return;
      }
      resolve(directUrl);
    });
  });
}

// Check if yt-dlp is available and working
function checkHealth() {
  return new Promise(function (resolve, reject) {
    childProcess.execFile('yt-dlp', ['--version'], { timeout: 5000 }, function (error, stdout) {
      if (error) {
        reject(new Error('yt-dlp not available'));
        return;
      }
      resolve(stdout.trim());
    });
  });
}

// Clean up old temp files (older than 1 hour)
function cleanupTemp() {
  try {
    var files = fs.readdirSync(TEMP_DIR);
    var now = Date.now();
    files.forEach(function (file) {
      var filePath = path.join(TEMP_DIR, file);
      var stat = fs.statSync(filePath);
      if (now - stat.mtimeMs > 3600000) {
        fs.unlinkSync(filePath);
      }
    });
  } catch (e) {
    // Ignore cleanup errors
  }
}

// Run cleanup every 30 minutes
setInterval(cleanupTemp, 1800000);

module.exports = {
  getMediaInfo: getMediaInfo,
  getVideoUrl: getVideoUrl,
  getAudioUrl: getAudioUrl,
  checkHealth: checkHealth,
  cleanupTemp: cleanupTemp
};
