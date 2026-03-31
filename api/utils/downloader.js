// downloader.js — yt-dlp subprocess wrapper
// Downloads files to temp dir and serves via proxy (fixes CDN 403 errors)

var childProcess = require('child_process');
var crypto = require('crypto');
var path = require('path');
var fs = require('fs');

var INFO_TIMEOUT = 30000;
var DOWNLOAD_TIMEOUT = 120000;
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

    childProcess.execFile('yt-dlp', args, { timeout: INFO_TIMEOUT }, function (error, stdout) {
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

// Download video to temp dir, return filename
function downloadVideo(url) {
  return new Promise(function (resolve, reject) {
    var id = crypto.randomUUID();
    var outPath = path.join(TEMP_DIR, id + '.mp4');
    var args = [
      '--no-warnings',
      '--no-playlist',
      '-f', 'best[ext=mp4]/best',
      '-o', outPath,
      url
    ];

    childProcess.execFile('yt-dlp', args, { timeout: DOWNLOAD_TIMEOUT }, function (error) {
      if (error) {
        reject(new Error('Failed to download video'));
        return;
      }
      if (!fs.existsSync(outPath)) {
        reject(new Error('Download file not created'));
        return;
      }
      resolve(id + '.mp4');
    });
  });
}

// Download and convert audio to MP3, return filename
function downloadAudio(url) {
  return new Promise(function (resolve, reject) {
    var id = crypto.randomUUID();
    var outTemplate = path.join(TEMP_DIR, id + '.%(ext)s');
    var expectedPath = path.join(TEMP_DIR, id + '.mp3');
    var args = [
      '--no-warnings',
      '--no-playlist',
      '-x',
      '--audio-format', 'mp3',
      '--audio-quality', '0',
      '-o', outTemplate,
      url
    ];

    childProcess.execFile('yt-dlp', args, { timeout: DOWNLOAD_TIMEOUT }, function (error) {
      if (error) {
        reject(new Error('Failed to extract audio'));
        return;
      }
      if (fs.existsSync(expectedPath)) {
        resolve(id + '.mp3');
      } else {
        reject(new Error('Audio file not created'));
      }
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
  downloadVideo: downloadVideo,
  downloadAudio: downloadAudio,
  checkHealth: checkHealth,
  cleanupTemp: cleanupTemp,
  TEMP_DIR: TEMP_DIR
};
