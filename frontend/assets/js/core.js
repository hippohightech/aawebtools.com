/* core.js — aawebtools.com
   Section 3: Scroll reveal, mobile menu, EN/FR language toggle.
   No frameworks. No animation libraries. */

(function () {
  'use strict';

  /* ===========================================================
     SCROLL REVEAL — Intersection Observer
     =========================================================== */
  function initScrollReveal() {
    var elements = document.querySelectorAll('.reveal');
    if (!elements.length) return;

    if (!('IntersectionObserver' in window)) {
      elements.forEach(function (el) { el.classList.add('revealed'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    elements.forEach(function (el) { observer.observe(el); });
  }

  /* ===========================================================
     MOBILE MENU
     =========================================================== */
  function initMobileMenu() {
    var btn = document.querySelector('.nav__hamburger');
    var menu = document.getElementById('mobileNav');
    if (!btn || !menu) return;

    btn.addEventListener('click', function () {
      var isOpen = menu.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', isOpen);
    });

    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        menu.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ===========================================================
     EN/FR LANGUAGE TOGGLE
     Reads data-en / data-fr attributes on elements.
     Stores preference in localStorage key "lang".
     Default: "en".
     =========================================================== */
  var LANG_KEY = 'lang';

  function getLang() {
    return localStorage.getItem(LANG_KEY) || 'en';
  }

  function setLang(lang) {
    localStorage.setItem(LANG_KEY, lang);
    applyLang(lang);
  }

  function applyLang(lang) {
    var attr = 'data-' + lang;
    document.querySelectorAll('[data-en]').forEach(function (el) {
      var val = el.getAttribute(attr);
      if (val !== null) {
        if (el.tagName === 'INPUT' && el.type !== 'submit') {
          el.placeholder = val;
        } else {
          el.textContent = val;
        }
      }
    });

    document.documentElement.lang = lang === 'fr' ? 'fr' : 'en';

    document.querySelectorAll('.lang-toggle__btn').forEach(function (btn) {
      var btnLang = btn.getAttribute('data-lang');
      btn.classList.toggle('lang-toggle__btn--active', btnLang === lang);
    });
  }

  function initLanguageToggle() {
    document.querySelectorAll('.lang-toggle__btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setLang(btn.getAttribute('data-lang'));
      });
    });

    applyLang(getLang());
  }

  /* ===========================================================
     404 PAGE — Load tool cards from tools.json
     =========================================================== */
  function initToolCards() {
    var grid = document.getElementById('toolsGrid');
    if (!grid) return;

    var lang = getLang();

    fetch('/tools.json')
      .then(function (res) { return res.json(); })
      .then(function (tools) {
        var html = '';
        tools.forEach(function (tool) {
          var title = lang === 'fr' && tool.title_fr ? tool.title_fr : tool.title;
          var desc = lang === 'fr' && tool.description_fr ? tool.description_fr : tool.description;
          var badgeHtml = tool.badge
            ? '<span class="badge">' + tool.badge + '</span>'
            : '';
          html += '<a href="' + tool.path + '" class="tool-card reveal revealed">' +
            '<div class="tool-card__top">' +
              '<span class="badge">' + tool.category + '</span>' +
              badgeHtml +
            '</div>' +
            '<div class="tool-card__icon">' + getToolIcon(tool.icon) + '</div>' +
            '<h3 class="tool-card__title" data-en="' + tool.title + '" data-fr="' + (tool.title_fr || tool.title) + '">' + title + '</h3>' +
            '<p class="tool-card__desc" data-en="' + tool.description + '" data-fr="' + (tool.description_fr || tool.description) + '">' + desc + '</p>' +
            '<span class="tool-card__link" data-en="Use Tool →" data-fr="Utiliser →">' + (lang === 'fr' ? 'Utiliser →' : 'Use Tool →') + '</span>' +
          '</a>';
        });
        grid.innerHTML = html;
      })
      .catch(function () {});
  }

  function getToolIcon(id) {
    var icons = {
      tiktok: '<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="18" stroke="currentColor" stroke-width="2"/><path d="M16 14l12 6-12 6V14z" fill="currentColor"/></svg>',
      twitter: '<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 8v16m0 0l-6-6m6 6l6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M10 28h20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
      invoice: '<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="6" width="24" height="28" rx="2" stroke="currentColor" stroke-width="2"/><path d="M14 14h12M14 20h12M14 26h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
      detector: '<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="18" cy="18" r="10" stroke="currentColor" stroke-width="2"/><path d="M26 26l6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="18" cy="15" r="2" fill="currentColor"/><path d="M14 22c1-2 3-3 4-3s3 1 4 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
      humanizer: '<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12h2v16h-2zM20 8l2 2-2 2M24 14l2 2-2 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M28 20c0 6-4 12-8 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
      paystub: '<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="6" width="24" height="28" rx="2" stroke="currentColor" stroke-width="2"/><path d="M20 16v8m-3-4.5L20 16l3 3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="20" cy="28" r="1.5" fill="currentColor"/></svg>',
      image: '<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="8" width="28" height="24" rx="3" stroke="currentColor" stroke-width="2"/><circle cx="15" cy="17" r="3" fill="currentColor"/><path d="M6 28l8-8 5 5 4-4 11 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    };
    return icons[id] || '';
  }

  /* ===========================================================
     INIT
     =========================================================== */
  function init() {
    initScrollReveal();
    initMobileMenu();
    initLanguageToggle();
    initToolCards();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
