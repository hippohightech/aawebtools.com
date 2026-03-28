var express = require('express');
var router = express.Router();
var validator = require('../utils/validator');

var SYSTEM_PROMPT = 'Rewrite the following text to sound more natural and human-written. Vary sentence length, use contractions where appropriate, add slight imperfections in structure that humans naturally produce. Keep the meaning and information identical. Return only the rewritten text, nothing else.';
var MAX_CHARS = 1000;
var ERROR_RESPONSE = {
  success: false,
  data: null,
  message: 'Service temporarily unavailable. Please try again in a moment.',
  code: 'SERVICE_UNAVAILABLE'
};

// Simple per-IP rate limiter: 3 requests/minute
var ipTimestamps = {};
function isRateLimited(ip) {
  var now = Date.now();
  var stamps = ipTimestamps[ip] || [];
  stamps = stamps.filter(function (t) { return now - t < 60000; });
  ipTimestamps[ip] = stamps;
  if (stamps.length >= 3) return true;
  stamps.push(now);
  return false;
}

// Clean old entries every 5 minutes
setInterval(function () {
  var now = Date.now();
  Object.keys(ipTimestamps).forEach(function (ip) {
    ipTimestamps[ip] = ipTimestamps[ip].filter(function (t) { return now - t < 60000; });
    if (!ipTimestamps[ip].length) delete ipTimestamps[ip];
  });
}, 300000);

// POST /humanizer
router.post('/', async function (req, res) {
  try {
    var ip = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.ip;
    if (isRateLimited(ip)) {
      return res.status(429).json(ERROR_RESPONSE);
    }

    var text = req.body && req.body.text;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false, data: null,
        message: 'Text is required.',
        code: 'INVALID_INPUT'
      });
    }

    text = validator.sanitizeText(text, MAX_CHARS);
    if (!text.length) {
      return res.status(400).json({
        success: false, data: null,
        message: 'Text is required.',
        code: 'INVALID_INPUT'
      });
    }

    var Anthropic;
    try { Anthropic = require('@anthropic-ai/sdk'); } catch (e) {
      return res.status(503).json(ERROR_RESPONSE);
    }

    var client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    var response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: text }]
    });

    var humanized = response.content && response.content[0] && response.content[0].text;
    if (!humanized) {
      return res.status(503).json(ERROR_RESPONSE);
    }

    res.json({
      success: true,
      data: { humanized: humanized },
      message: 'ok'
    });
  } catch (err) {
    res.status(503).json(ERROR_RESPONSE);
  }
});

module.exports = router;
