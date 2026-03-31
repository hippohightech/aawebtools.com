/* core.js — aawebtools.com
   Scroll reveal, mobile menu, language selector, tool cards.
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
     TOOL CARDS — Load from tools.json with full i18n
     =========================================================== */
  var TOOL_I18N = {
    linkText: { en:'Use Tool \u2192', fr:'Utiliser \u2192', es:'Usar herramienta \u2192', de:'Tool nutzen \u2192', pt:'Usar ferramenta \u2192', ar:'\u0627\u0633\u062a\u062e\u062f\u0645 \u0627\u0644\u0623\u062f\u0627\u0629 \u2190', id:'Gunakan alat \u2192', hi:'\u091f\u0942\u0932 \u0907\u0938\u094d\u0924\u0947\u092e\u093e\u0932 \u0915\u0930\u0947\u0902 \u2192' },
    categories: {
      downloader: { en:'downloader', fr:'t\u00e9l\u00e9chargeur', es:'descargador', de:'Downloader', pt:'baixador', ar:'\u0623\u062f\u0627\u0629 \u062a\u062d\u0645\u064a\u0644', id:'pengunduh', hi:'\u0921\u093e\u0909\u0928\u0932\u094b\u0921\u0930' },
      generator: { en:'generator', fr:'g\u00e9n\u00e9rateur', es:'generador', de:'Generator', pt:'gerador', ar:'\u0645\u0648\u0644\u0651\u062f', id:'pembuat', hi:'\u091c\u0928\u0930\u0947\u091f\u0930' },
      ai: { en:'ai', fr:'IA', es:'IA', de:'KI', pt:'IA', ar:'\u0630\u0643\u0627\u0621 \u0627\u0635\u0637\u0646\u0627\u0639\u064a', id:'AI', hi:'AI' },
      utility: { en:'utility', fr:'utilitaire', es:'utilidad', de:'Werkzeug', pt:'utilit\u00e1rio', ar:'\u0623\u062f\u0627\u0629', id:'utilitas', hi:'\u092f\u0942\u091f\u093f\u0932\u093f\u091f\u0940' }
    },
    badges: {
      'Most Popular': { en:'Most Popular', fr:'Plus populaire', es:'M\u00e1s popular', de:'Beliebtestes', pt:'Mais popular', ar:'\u0627\u0644\u0623\u0643\u062b\u0631 \u0634\u0639\u0628\u064a\u0629', id:'Terpopuler', hi:'\u0938\u092c\u0938\u0947 \u0932\u094b\u0915\u092a\u094d\u0930\u093f\u092f' },
      'Free PDF': { en:'Free PDF', fr:'PDF gratuit', es:'PDF gratis', de:'Kostenloses PDF', pt:'PDF gr\u00e1tis', ar:'PDF \u0645\u062c\u0627\u0646\u064a', id:'PDF gratis', hi:'\u092e\u0941\u092b\u093c\u094d\u0924 PDF' },
      'No Upload': { en:'No Upload', fr:'Sans upload', es:'Sin subir', de:'Kein Upload', pt:'Sem upload', ar:'\u0628\u062f\u0648\u0646 \u0631\u0641\u0639', id:'Tanpa upload', hi:'\u0905\u092a\u0932\u094b\u0921 \u0928\u0939\u0940\u0902' }
    }
  };

  function initToolCards() {
    var grid = document.getElementById('toolsGrid');
    if (!grid) return;

    var lang = document.documentElement.lang || 'en';

    fetch('/tools.json')
      .then(function (res) { return res.json(); })
      .then(function (tools) {
        var html = '';
        tools.forEach(function (tool) {
          var title = tool['title_' + lang] || tool.title;
          var desc = tool['description_' + lang] || tool.description;
          var path = tool['path_' + lang] || tool.path;
          var linkText = (TOOL_I18N.linkText[lang] || TOOL_I18N.linkText.en);
          var catObj = TOOL_I18N.categories[tool.category];
          var catText = catObj ? (catObj[lang] || catObj.en) : tool.category;
          var badgeHtml = '';
          if (tool.badge) {
            var bObj = TOOL_I18N.badges[tool.badge];
            var bText = bObj ? (bObj[lang] || bObj.en) : tool.badge;
            badgeHtml = '<span class="badge">' + bText + '</span>';
          }
          html += '<a href="' + path + '" class="tool-card reveal revealed">' +
            '<div class="tool-card__top">' +
              '<span class="badge">' + catText + '</span>' +
              badgeHtml +
            '</div>' +
            '<div class="tool-card__icon">' + getToolIcon(tool.icon) + '</div>' +
            '<h3 class="tool-card__title">' + title + '</h3>' +
            '<p class="tool-card__desc">' + desc + '</p>' +
            '<span class="tool-card__link">' + linkText + '</span>' +
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
     LANGUAGE SELECTOR DROPDOWN (multilingual)
     =========================================================== */
  function initLangSelector() {
    var trigger = document.getElementById('langToggle');
    var menu = document.getElementById('langMenu');
    if (!trigger || !menu) return;

    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      menu.classList.toggle('show');
    });

    document.addEventListener('click', function (e) {
      if (!menu.parentElement.contains(e.target)) {
        menu.classList.remove('show');
      }
    });
  }

  /* ===========================================================
     INIT
     =========================================================== */
  function init() {
    initScrollReveal();
    initMobileMenu();
    initToolCards();
    initLangSelector();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
