#!/usr/bin/env python3
"""
Fix structural elements of German blog articles:
- lang="en" -> lang="de"
- Replace nav/footer/mobile-nav with German versions
- Update canonical/hreflang URLs
- Update internal links to /de/ versions
- Update metadata (title, description, OG tags)
- Update schema.org
"""

import re
import os

BASE = "/Users/karimnarimi/Downloads/aawebtools.com/frontend"

# German nav (from de/blog/index.html)
DE_NAV = """  <nav class="nav">
    <div class="nav__inner">
      <a href="/de/" class="nav__logo"><img src="/assets/img/logo-light.png" alt="AAWebTools" height="56"></a>
      <div class="nav__links">
        <div class="nav__dropdown"><a href="#" class="nav__link">Downloader</a><div class="nav__dropdown-menu"><a href="/de/tiktok-herunterladen/" class="nav__dropdown-item">TikTok Downloader</a><a href="/de/twitter-video-herunterladen/" class="nav__dropdown-item">Twitter Downloader</a></div></div>
        <div class="nav__dropdown"><a href="#" class="nav__link">Generatoren</a><div class="nav__dropdown-menu"><a href="/de/rechnungsgenerator/" class="nav__dropdown-item">Rechnungsgenerator</a><a href="/de/gehaltsabrechnungs-generator/" class="nav__dropdown-item">Gehaltsabrechnungs-Generator</a><a href="/de/bild-werkzeuge/" class="nav__dropdown-item">Bild-Werkzeuge</a></div></div>
        <div class="nav__dropdown"><a href="#" class="nav__link">KI-Tools</a><div class="nav__dropdown-menu"><a href="/de/ki-detektor/" class="nav__dropdown-item">KI-Inhaltsdetektor</a><a href="/de/ki-humanisierer/" class="nav__dropdown-item">KI-Text-Humanisierer</a></div></div>
        <a href="/de/blog/" class="nav__link">Blog</a>
      </div>
      <div class="nav__right">
        <div class="lang-selector">
          <button class="lang-selector__trigger" id="langToggle">&#127760; DE &#9662;</button>
          <div class="lang-selector__menu" id="langMenu">
            <a href="/blog/{en_slug}/">English</a>
            <a href="/fr/blog/{fr_slug}/">Fran\u00e7ais</a>
            <a href="/es/blog/">Espa\u00f1ol</a>
            <a href="/de/blog/{de_slug}/" class="active">Deutsch</a>
            <a href="/pt/blog/">Portugu\u00eas</a>
            <a href="/ar/blog/">\u0627\u0644\u0639\u0631\u0628\u064a\u0629</a>
            <a href="/id/blog/">Bahasa Indonesia</a>
            <a href="/hi/blog/">\u0939\u093f\u0928\u094d\u0926\u0940</a>
          </div>
        </div>
        <a href="/de/#tools" class="btn-primary btn-sm">Alle Tools</a>
        <button class="nav__hamburger" aria-label="Men\u00fc" aria-expanded="false"><span></span><span></span><span></span></button>
      </div>
    </div>
  </nav>
  <div class="nav__mobile" id="mobileNav">
    <a href="/de/tiktok-herunterladen/" class="nav__mobile-link">TikTok Downloader</a>
    <a href="/de/twitter-video-herunterladen/" class="nav__mobile-link">Twitter Downloader</a>
    <a href="/de/rechnungsgenerator/" class="nav__mobile-link">Rechnungsgenerator</a>
    <a href="/de/ki-detektor/" class="nav__mobile-link">KI-Inhaltsdetektor</a>
    <a href="/de/ki-humanisierer/" class="nav__mobile-link">KI-Text-Humanisierer</a>
    <a href="/de/gehaltsabrechnungs-generator/" class="nav__mobile-link">Gehaltsabrechnungs-Generator</a>
    <a href="/de/bild-werkzeuge/" class="nav__mobile-link">Bild-Werkzeuge</a>
    <a href="/de/blog/" class="nav__mobile-link">Blog</a>
  </div>"""

DE_FOOTER = """  <footer class="footer">
    <div class="footer__grid">
      <div>
        <div class="footer__logo"><img src="/assets/img/logo-light.png" alt="AAWebTools" height="44"></div>
        <p class="footer__tagline">Kostenlose Tools f\u00fcr alle, weltweit</p>
        <p class="footer__copyright">&copy; 2026 AAWebTools. Alle Rechte vorbehalten. Erstellt von <a href="https://scopecove.com/" target="_blank" rel="noopener" class="footer__link" style="display:inline;">ScopeCove</a></p>
      </div>
      <div>
        <h4 class="footer__heading">Tools</h4>
        <a href="/de/tiktok-herunterladen/" class="footer__link">TikTok Downloader</a>
        <a href="/de/twitter-video-herunterladen/" class="footer__link">Twitter Video Downloader</a>
        <a href="/de/rechnungsgenerator/" class="footer__link">Rechnungsgenerator</a>
        <a href="/de/ki-detektor/" class="footer__link">KI-Inhaltsdetektor</a>
        <a href="/de/ki-humanisierer/" class="footer__link">KI-Text-Humanisierer</a>
        <a href="/de/gehaltsabrechnungs-generator/" class="footer__link">Gehaltsabrechnungs-Generator</a>
        <a href="/de/bild-werkzeuge/" class="footer__link">Bild-Werkzeuge</a>
      </div>
      <div>
        <h4 class="footer__heading">Rechtliches</h4>
        <a href="/de/datenschutz/" class="footer__link">Datenschutzerkl\u00e4rung</a>
        <a href="/de/nutzungsbedingungen/" class="footer__link">Nutzungsbedingungen</a>
        <a href="/de/ueber-uns/" class="footer__link">\u00dcber uns</a>
        <a href="/de/kontakt/" class="footer__link">Kontakt</a>
        <a href="/de/blog/" class="footer__link">Blog</a>
      </div>
    </div>
    <div class="footer__bottom">Mit &#10084;&#65039; gemacht | F\u00fcr immer kostenlos | Ohne Anmeldung</div>
  </footer>"""


ARTICLES = {
    "ki-humanisierer-vs-turnitin-2026": {
        "en_slug": "ai-humanizers-vs-turnitin-2026",
        "fr_slug": "humanisateur-ia-vs-turnitin-2026",
        "title": "KI-Humanisierer vs Turnitin 2026: 5 Tools im Blindtest | AAWebTools",
        "description": "Wir haben 5 KI-Humanisierer-Tools gegen Turnitin, GPTZero, Copyleaks und weitere mit 50 Aufs\u00e4tzen getestet. Erfahren Sie, welche die KI-Erkennung 2026 tats\u00e4chlich umgehen.",
        "og_title": "KI-Humanisierer vs Turnitin 2026 -- 50 Aufs\u00e4tze im Blindtest",
        "og_description": "Wir haben 5 KI-Humanisierer-Tools gegen Turnitin, GPTZero, Copyleaks und weitere mit 50 Aufs\u00e4tzen getestet. Erfahren Sie, welche die KI-Erkennung 2026 tats\u00e4chlich umgehen.",
    },
    "koennen-lehrer-chatgpt-erkennen-2026": {
        "en_slug": "can-teachers-detect-chatgpt-2026",
        "fr_slug": "can-teachers-detect-chatgpt-2026",
        "title": "K\u00f6nnen Lehrer ChatGPT 2026 erkennen? Die Wahrheit \u00fcber KI-Erkennung | AAWebTools",
        "description": "Wir haben die Tools getestet, die Schulen tats\u00e4chlich verwenden. Genauigkeitsraten, Falsch-Positive, das ESL-Bias-Problem und welche Universit\u00e4ten KI-Detektoren verboten haben.",
        "og_title": "K\u00f6nnen Lehrer ChatGPT 2026 erkennen? Die Wahrheit \u00fcber KI-Erkennung",
        "og_description": "Wir haben die Tools getestet, die Schulen tats\u00e4chlich verwenden. Genauigkeitsraten, Falsch-Positive, das ESL-Bias-Problem und welche Universit\u00e4ten KI-Detektoren verboten haben.",
    },
    "bild-auf-100kb-komprimieren-kostenlos": {
        "en_slug": "compress-image-to-100kb-free",
        "fr_slug": "compresser-image-100ko-gratuit",
        "title": "Bild auf 100KB komprimieren -- Kostenlose Anleitung f\u00fcr Reisepass, Visum und Beh\u00f6rden 2026 | AAWebTools",
        "description": "Komprimieren Sie Bilder auf genau 100KB f\u00fcr Reisep\u00e4sse, Visa und Beh\u00f6rdenformulare. Kostenlos, direkt im Browser. Schritt-f\u00fcr-Schritt-Anleitung f\u00fcr 12 L\u00e4nder.",
        "og_title": "Bild auf 100KB komprimieren -- Reisepass-, Visum- und Upload-Anleitung (2026)",
        "og_description": "Komprimieren Sie Bilder auf genau 100KB f\u00fcr Reisep\u00e4sse, Visa und Beh\u00f6rdenformulare. Kostenlos, direkt im Browser. Schritt-f\u00fcr-Schritt-Anleitung f\u00fcr 12 L\u00e4nder.",
    },
    "tiktok-slideshows-herunterladen-2026": {
        "en_slug": "download-tiktok-slideshows-2026",
        "fr_slug": "download-tiktok-slideshows-2026",
        "title": "TikTok-Diashows herunterladen 2026: 7 Tools im Test | AAWebTools",
        "description": "TikTok-Diashows, Videos und Fotos ohne Wasserzeichen herunterladen. Wir haben 7 Tools nach den USDS-Eigent\u00fcmer\u00e4nderungen getestet -- welche funktionieren noch?",
        "og_title": "TikTok-Diashows und Videos herunterladen 2026: 7 Tools im Test",
        "og_description": "TikTok-Diashows, Videos und Fotos ohne Wasserzeichen herunterladen. Wir haben 7 Tools nach den USDS-Eigent\u00fcmer\u00e4nderungen getestet -- welche funktionieren noch?",
    },
    "gehaltsabrechnung-selbstaendige-2026": {
        "en_slug": "pay-stub-generator-self-employed",
        "fr_slug": "bulletin-de-paie-freelance-2026",
        "title": "Gehaltsabrechnungs-Generator f\u00fcr Selbst\u00e4ndige 2026 | AAWebTools",
        "description": "Erstellen Sie professionelle Gehaltsabrechnungen als Freelancer. Anleitung f\u00fcr Mietantr\u00e4ge, Kredite, Steuern und die neue IRS-1099-Schwelle von $2.000.",
        "og_title": "Kostenloser Gehaltsabrechnungs-Generator f\u00fcr Selbst\u00e4ndige -- Miet-, Kredit- und Steuer-Anleitung (2026)",
        "og_description": "Erstellen Sie professionelle Gehaltsabrechnungen als Freelancer. Anleitung f\u00fcr Mietantr\u00e4ge, Kredite, Steuern und die neue IRS-1099-Schwelle von $2.000.",
    },
    "beste-kostenlose-ki-detektoren-2026": {
        "en_slug": "best-free-ai-content-detectors-2026",
        "fr_slug": "best-free-ai-content-detectors-2026",
        "title": "Beste kostenlose KI-Inhaltsdetektoren 2026 -- Genauigkeitsvergleich | AAWebTools",
        "description": "Wir haben GPTZero, QuillBot, Copyleaks, ZeroGPT und AAWebTools mit 30 Textproben getestet. Erfahren Sie, wie jedes Tool bei der KI-Erkennung abgeschnitten hat.",
        "og_title": "Beste kostenlose KI-Inhaltsdetektoren 2026 -- Genauigkeitsvergleich",
        "og_description": "Wir haben GPTZero, QuillBot, Copyleaks, ZeroGPT und AAWebTools mit 30 Textproben getestet. Erfahren Sie, wie jedes Tool bei der KI-Erkennung abgeschnitten hat.",
    },
}

# Common text replacements that apply across all articles
COMMON_TRANSLATIONS = [
    # Nav/UI elements that might be in article body
    ("AI Tools", "KI-Tools"),
    # Author box
    ("Written by AAWebTools Team", "Verfasst vom AAWebTools Team"),
    ("Published March 27, 2026", "Ver\u00f6ffentlicht am 27. M\u00e4rz 2026"),
    ("Published March 28, 2026", "Ver\u00f6ffentlicht am 28. M\u00e4rz 2026"),
    ("More articles &rarr;", "Weitere Artikel &rarr;"),
    # Breadcrumb
    (">Home</a>", ">Startseite</a>"),
    # TOC
    ("In This Article", "In diesem Artikel"),
    # Callout labels
    ("Key Finding", "Kernergebnis"),
    ("Pro Tip", "Profi-Tipp"),
    ("Privacy Alert", "Datenschutzhinweis"),
    ("Worth Noting", "Bemerkenswert"),
    ("For Educators", "F\u00fcr Lehrende"),
    # Tool card labels
    ("Strengths", "St\u00e4rken"),
    ("Weaknesses", "Schw\u00e4chen"),
    ("Price:", "Preis:"),
    ("Free Tier:", "Gratis-Version:"),
    ("Privacy:", "Datenschutz:"),
    ("Bypass Rate:", "Umgehungsrate:"),
    ("Free, unlimited", "Kostenlos, unbegrenzt"),
    ("Browser-based, private", "Browserbasiert, privat"),
    ("Cloud-based", "Cloudbasiert"),
    ("No signup", "Keine Anmeldung"),
    ("Used By:", "Genutzt von:"),
    ("Free Limit:", "Gratis-Limit:"),
    ("Signup:", "Anmeldung:"),
    ("Required", "Erforderlich"),
    ("None", "Keine"),
    ("Best For:", "Am besten f\u00fcr:"),
    ("Access:", "Zugang:"),
    ("Institutional license only", "Nur Institutionslizenz"),
    ("Institutional license", "Institutionslizenz"),
    ("Market:", "Markt:"),
    ("Cloud; stores all submissions", "Cloud; speichert alle Einreichungen"),
    ("Cloud; account required", "Cloud; Konto erforderlich"),
    ("Cloud; SOC 2 certified", "Cloud; SOC 2 zertifiziert"),
    ("Cloud; GDPR, EU servers", "Cloud; DSGVO, EU-Server"),
    ("100% browser-based; no data sent", "100% browserbasiert; keine Daten gesendet"),
    ("Cloud; no account needed", "Cloud; kein Konto n\u00f6tig"),
    # CTA elements
    ("Open AI Detector", "KI-Detektor \u00f6ffnen"),
    ("Open AI Humanizer", "KI-Humanisierer \u00f6ffnen"),
    ("Check Your Writing Free &rarr;", "Ihren Text kostenlos pr\u00fcfen &rarr;"),
    # FAQ label
    ("Frequently Asked Questions", "H\u00e4ufig gestellte Fragen"),
    # Time units
    ("<span>seconds</span>", "<span>Sekunden</span>"),
    ("<span>minutes</span>", "<span>Minuten</span>"),
    # Verdict badges
    ("Best Overall (Free)", "Insgesamt am besten (kostenlos)"),
    ("Most Popular (Paid)", "Am beliebtesten (kostenpflichtig)"),
    ("Best for Students", "Am besten f\u00fcr Studierende"),
    ("Fastest Processing", "Schnellste Verarbeitung"),
    ("Best as Paraphraser (Not Humanizer)", "Am besten als Paraphrasierer (nicht als Humanisierer)"),
    ("Most Widely Used in Schools", "Am h\u00e4ufigsten in Schulen verwendet"),
    ("Popular With K-12 Schools", "Beliebt bei Schulen"),
    ("Dominant in European Universities", "Vorherrschend an europ\u00e4ischen Universit\u00e4ten"),
    # Schema
    ('"name": "Home"', '"name": "Startseite"'),
]


def fix_structure(filepath, de_slug, config):
    """Apply structural fixes to a German blog file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    en_slug = config["en_slug"]
    fr_slug = config.get("fr_slug", en_slug)

    # 1. lang="en" -> lang="de"
    content = content.replace('<html lang="en">', '<html lang="de">')

    # 2. Title
    content = re.sub(r'<title>.*?</title>', f'<title>{config["title"]}</title>', content)

    # 3. Meta description
    content = re.sub(
        r'<meta name="description" content=".*?">',
        f'<meta name="description" content="{config["description"]}">',
        content
    )

    # 4. Canonical
    content = re.sub(
        r'<link rel="canonical" href="https://aawebtools\.com/blog/.*?">',
        f'<link rel="canonical" href="https://aawebtools.com/de/blog/{de_slug}/">',
        content
    )

    # 5. Replace ALL hreflang lines
    # Remove existing hreflang lines
    content = re.sub(r'  <link rel="alternate" hreflang="[^"]*" href="[^"]*">\n', '', content)
    # Insert new hreflang block after canonical
    hreflang_block = f"""  <link rel="alternate" hreflang="en" href="https://aawebtools.com/blog/{en_slug}/">
  <link rel="alternate" hreflang="fr" href="https://aawebtools.com/fr/blog/{fr_slug}/">
  <link rel="alternate" hreflang="de" href="https://aawebtools.com/de/blog/{de_slug}/">
  <link rel="alternate" hreflang="x-default" href="https://aawebtools.com/blog/{en_slug}/">
"""
    content = content.replace(
        f'<link rel="canonical" href="https://aawebtools.com/de/blog/{de_slug}/">',
        f'<link rel="canonical" href="https://aawebtools.com/de/blog/{de_slug}/">\n{hreflang_block}',
        1
    )

    # 6. OG tags
    content = re.sub(r'<meta property="og:title" content=".*?">', f'<meta property="og:title" content="{config["og_title"]}">', content)
    content = re.sub(r'<meta property="og:description" content=".*?">', f'<meta property="og:description" content="{config["og_description"]}">', content)
    content = re.sub(r'<meta property="og:url" content="https://aawebtools\.com/blog/.*?">', f'<meta property="og:url" content="https://aawebtools.com/de/blog/{de_slug}/">', content)

    # Add og:locale
    if 'og:locale' not in content:
        content = content.replace(
            '<meta property="og:site_name" content="AAWebTools">',
            '<meta property="og:site_name" content="AAWebTools">\n  <meta property="og:locale" content="de_DE">'
        )

    # 7. Twitter tags
    content = re.sub(r'<meta name="twitter:title" content=".*?">', f'<meta name="twitter:title" content="{config["og_title"]}">', content)
    content = re.sub(r'<meta name="twitter:description" content=".*?">', f'<meta name="twitter:description" content="{config["og_description"]}">', content)

    # 8. Replace nav + mobile nav
    # Find nav start
    nav_start = content.find('  <nav class="nav">')
    # Find header start (after mobile nav)
    header_markers = ['  <!-- Hero banner', '  <header class="article-hero">']
    header_start = -1
    for marker in header_markers:
        pos = content.find(marker)
        if pos != -1 and (header_start == -1 or pos < header_start):
            header_start = pos

    if nav_start != -1 and header_start != -1:
        nav_block = DE_NAV.replace('{en_slug}', en_slug).replace('{fr_slug}', fr_slug).replace('{de_slug}', de_slug)
        content = content[:nav_start] + nav_block + '\n\n' + content[header_start:]

    # 9. Replace footer
    footer_start = content.find('  <footer class="footer">')
    footer_end = content.find('  </footer>')
    if footer_start != -1 and footer_end != -1:
        footer_end += len('  </footer>')
        content = content[:footer_start] + DE_FOOTER + content[footer_end:]

    # 10. Update internal links
    # Only update href links that point to English tool pages
    link_map = [
        ('href="/ai-humanizer/"', 'href="/de/ki-humanisierer/"'),
        ('href="/ai-detector/"', 'href="/de/ki-detektor/"'),
        ('href="/tiktok-downloader/"', 'href="/de/tiktok-herunterladen/"'),
        ('href="/twitter-video-downloader/"', 'href="/de/twitter-video-herunterladen/"'),
        ('href="/invoice-generator/"', 'href="/de/rechnungsgenerator/"'),
        ('href="/paystub-generator/"', 'href="/de/gehaltsabrechnungs-generator/"'),
        ('href="/image-toolkit/"', 'href="/de/bild-werkzeuge/"'),
        ('href="/blog/"', 'href="/de/blog/"'),
        ('href="/contact/"', 'href="/de/kontakt/"'),
        ('href="/about/"', 'href="/de/ueber-uns/"'),
        ('href="/privacy/"', 'href="/de/datenschutz/"'),
        ('href="/terms/"', 'href="/de/nutzungsbedingungen/"'),
    ]
    for old, new in link_map:
        content = content.replace(old, new)

    # Fix root href links (but not /de/ or /fr/ etc)
    # href="/" -> href="/de/" and href="/#tools" -> href="/de/#tools"
    content = content.replace('href="/#tools"', 'href="/de/#tools"')
    # Be careful with href="/" - only match exact, not /de/ etc
    content = re.sub(r'href="/(?=["\s#])', 'href="/de/', content)
    # Fix double /de/de/
    content = content.replace('/de/de/', '/de/')

    # 11. Schema.org breadcrumb updates
    content = content.replace('"item": "https://aawebtools.com/"', '"item": "https://aawebtools.com/de/"')
    content = content.replace('"item": "https://aawebtools.com/blog/"', '"item": "https://aawebtools.com/de/blog/"')

    # 12. Apply common text translations
    for old, new in COMMON_TRANSLATIONS:
        content = content.replace(old, new)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"  Fixed: {de_slug}")


if __name__ == "__main__":
    print("Fixing German blog article structure...")
    for de_slug, config in ARTICLES.items():
        filepath = f"{BASE}/de/blog/{de_slug}/index.html"
        if os.path.exists(filepath):
            fix_structure(filepath, de_slug, config)
        else:
            print(f"  MISSING: {filepath}")
    print("Done!")
