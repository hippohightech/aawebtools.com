// validator.js — Input validation for all API endpoints
// PRD Section 0.7 + 5.3: Server-side input sanitization

// PRD 5.3: TikTok URL regex — supports www, vm, vt subdomains
const TIKTOK_URL_REGEX = /^https?:\/\/(www\.|vm\.|vt\.)?tiktok\.com\//i;

// PRD 6.3: Twitter/X URL regex — supports www, mobile subdomains + x.com
const TWITTER_URL_REGEX = /^https?:\/\/(www\.|mobile\.)?twitter\.com\/|^https?:\/\/x\.com\//i;

// TikTok username: @username or plain username
const TIKTOK_USERNAME_REGEX = /^@?[a-zA-Z0-9_.]{1,50}$/;

var MAX_URL_LENGTH = 500;

function isValidTikTokUrl(url) {
  if (typeof url !== 'string') return false;
  var trimmed = url.trim();
  if (trimmed.length > MAX_URL_LENGTH) return false;
  return TIKTOK_URL_REGEX.test(trimmed);
}

function isValidTwitterUrl(url) {
  if (typeof url !== 'string') return false;
  var trimmed = url.trim();
  if (trimmed.length > MAX_URL_LENGTH) return false;
  return TWITTER_URL_REGEX.test(trimmed);
}

function isValidTikTokUsername(username) {
  if (typeof username !== 'string') return false;
  return TIKTOK_USERNAME_REGEX.test(username.trim());
}

function sanitizeText(input, maxLength) {
  if (typeof input !== 'string') return '';
  var clean = input
    .replace(/<[^>]*>/g, '')
    .replace(/(\b)(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|UNION|CREATE|EXEC)\b/gi, '')
    .replace(/\.\.\//g, '');
  if (maxLength && clean.length > maxLength) {
    clean = clean.substring(0, maxLength);
  }
  return clean.trim();
}

module.exports = {
  isValidTikTokUrl,
  isValidTwitterUrl,
  isValidTikTokUsername,
  sanitizeText
};
