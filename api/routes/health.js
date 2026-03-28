var express = require('express');
var router = express.Router();
var downloader = require('../utils/downloader');

// yt-dlp health tracking
var ytdlpStatus = 'ok';
var ytdlpVersion = null;
var failCount = 0;
var FAIL_THRESHOLD = 3;
var CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

// Send Telegram alert on yt-dlp failure
function sendTelegramAlert(message) {
  var token = process.env.TELEGRAM_BOT_TOKEN;
  var chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  var fetch;
  try { fetch = require('node-fetch'); } catch (e) { return; }

  var text = '[aawebtools] yt-dlp Health Alert\n\n' + message +
    '\nTime: ' + new Date().toISOString();

  fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: text })
  }).catch(function () {});
}

// Periodic yt-dlp health check
function checkYtdlp() {
  downloader.checkHealth()
    .then(function (version) {
      ytdlpVersion = version;
      if (failCount >= FAIL_THRESHOLD) {
        sendTelegramAlert('yt-dlp recovered. Version: ' + version);
      }
      failCount = 0;
      ytdlpStatus = 'ok';
    })
    .catch(function () {
      failCount++;
      ytdlpStatus = 'degraded';
      if (failCount === FAIL_THRESHOLD) {
        sendTelegramAlert('yt-dlp failed ' + FAIL_THRESHOLD +
          ' times in a row. Service degraded.');
      }
    });
}

// Run initial check and start interval
checkYtdlp();
setInterval(checkYtdlp, CHECK_INTERVAL);

// GET /health — PRD 12.3 structure
router.get('/', function (req, res) {
  var hasKey = !!process.env.ANTHROPIC_API_KEY;
  var humStatus = hasKey ? 'ok' : 'no_key';
  var humMsg = hasKey ? 'Claude API configured' : 'ANTHROPIC_API_KEY not configured';

  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    services: {
      tiktok_api: {
        status: ytdlpStatus,
        message: ytdlpStatus === 'ok' ? 'yt-dlp available' : 'yt-dlp degraded (' + failCount + ' failures)'
      },
      twitter_api: {
        status: ytdlpStatus,
        message: ytdlpStatus === 'ok' ? 'yt-dlp available' : 'yt-dlp degraded (' + failCount + ' failures)'
      },
      humanizer_api: {
        status: humStatus,
        message: humMsg
      }
    },
    uptime_seconds: Math.floor(process.uptime()),
    ytdlp_version: ytdlpVersion
  });
});

module.exports = router;
