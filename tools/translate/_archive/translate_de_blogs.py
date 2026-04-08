#!/usr/bin/env python3
"""
Translate German blog articles from English to German.
Handles structural changes (nav, footer, metadata, links) and text content translation.
"""

import re
import os

BASE = "/Users/karimnarimi/Downloads/aawebtools.com/frontend"

# German nav/footer/mobile-nav blocks (from de/blog/index.html)
DE_NAV = '''  <nav class="nav">
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
            <a href="/fr/blog/{fr_slug}/">Fran\\u00e7ais</a>
            <a href="/es/blog/">Espa\\u00f1ol</a>
            <a href="/de/blog/{de_slug}/" class="active">Deutsch</a>
            <a href="/pt/blog/">Portugu\\u00eas</a>
            <a href="/ar/blog/">\\u0627\\u0644\\u0639\\u0631\\u0628\\u064a\\u0629</a>
            <a href="/id/blog/">Bahasa Indonesia</a>
            <a href="/hi/blog/">\\u0939\\u093f\\u0928\\u094d\\u0926\\u0940</a>
          </div>
        </div>
        <a href="/de/#tools" class="btn-primary btn-sm">Alle Tools</a>
        <button class="nav__hamburger" aria-label="Men\\u00fc" aria-expanded="false"><span></span><span></span><span></span></button>
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
  </div>'''

DE_FOOTER = '''  <footer class="footer">
    <div class="footer__grid">
      <div>
        <div class="footer__logo"><img src="/assets/img/logo-light.png" alt="AAWebTools" height="44"></div>
        <p class="footer__tagline">Kostenlose Tools f\\u00fcr alle, weltweit</p>
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
        <a href="/de/datenschutz/" class="footer__link">Datenschutzerkl\\u00e4rung</a>
        <a href="/de/nutzungsbedingungen/" class="footer__link">Nutzungsbedingungen</a>
        <a href="/de/ueber-uns/" class="footer__link">\\u00dcber uns</a>
        <a href="/de/kontakt/" class="footer__link">Kontakt</a>
        <a href="/de/blog/" class="footer__link">Blog</a>
      </div>
    </div>
    <div class="footer__bottom">Mit &#10084;&#65039; gemacht | F\\u00fcr immer kostenlos | Ohne Anmeldung</div>
  </footer>'''


def translate_file(filepath, config):
    """Apply structural and text translations to a German blog article."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. lang="en" -> lang="de"
    content = content.replace('<html lang="en">', '<html lang="de">')

    # 2. Replace <title>
    content = re.sub(r'<title>.*?</title>', f'<title>{config["title"]}</title>', content)

    # 3. Replace meta description
    content = re.sub(
        r'<meta name="description" content=".*?">',
        f'<meta name="description" content="{config["description"]}">',
        content
    )

    # 4. Replace canonical
    content = re.sub(
        r'<link rel="canonical" href=".*?">',
        f'<link rel="canonical" href="https://aawebtools.com/de/blog/{config["de_slug"]}/">',
        content
    )

    # 5. Replace hreflang block
    old_hreflang = re.findall(r'  <link rel="alternate" hreflang=.*?\n', content)
    if old_hreflang:
        first_hreflang = content.find('  <link rel="alternate" hreflang=')
        last_hreflang = content.rfind('  <link rel="alternate" hreflang=')
        last_end = content.find('\n', last_hreflang) + 1

        new_hreflang = f'''  <link rel="alternate" hreflang="en" href="https://aawebtools.com/blog/{config["en_slug"]}/">
  <link rel="alternate" hreflang="fr" href="https://aawebtools.com/fr/blog/{config.get("fr_slug", config["en_slug"])}/">
  <link rel="alternate" hreflang="de" href="https://aawebtools.com/de/blog/{config["de_slug"]}/">
  <link rel="alternate" hreflang="x-default" href="https://aawebtools.com/blog/{config["en_slug"]}/">
'''
        content = content[:first_hreflang] + new_hreflang + content[last_end:]

    # 6. OG tags
    content = re.sub(
        r'<meta property="og:title" content=".*?">',
        f'<meta property="og:title" content="{config["og_title"]}">',
        content
    )
    content = re.sub(
        r'<meta property="og:description" content=".*?">',
        f'<meta property="og:description" content="{config["og_description"]}">',
        content
    )
    content = re.sub(
        r'<meta property="og:url" content=".*?">',
        f'<meta property="og:url" content="https://aawebtools.com/de/blog/{config["de_slug"]}/">',
        content
    )

    # Add og:locale if not present
    if 'og:locale' not in content:
        content = content.replace(
            '<meta property="og:site_name" content="AAWebTools">',
            '<meta property="og:site_name" content="AAWebTools">\n  <meta property="og:locale" content="de_DE">'
        )

    # 7. Twitter tags
    content = re.sub(
        r'<meta name="twitter:title" content=".*?">',
        f'<meta name="twitter:title" content="{config["og_title"]}">',
        content
    )
    content = re.sub(
        r'<meta name="twitter:description" content=".*?">',
        f'<meta name="twitter:description" content="{config["og_description"]}">',
        content
    )

    # 8. Replace nav block
    nav_start = content.find('  <nav class="nav">')
    nav_end = content.find('  </div>\n\n  <!-- Hero banner', nav_start)
    if nav_end == -1:
        nav_end = content.find('  </div>\n\n  <!-- Hero', nav_start)
    if nav_end == -1:
        # Find the end of mobile nav div
        mobile_end = content.find('</div>\n\n  <!-- Hero')
        if mobile_end != -1:
            nav_end = mobile_end

    # More robust: find from nav start to just before header
    header_start = content.find('  <!-- Hero banner')
    if header_start == -1:
        header_start = content.find('  <header class="article-hero">')

    if nav_start != -1 and header_start != -1:
        # Find the end of the mobile nav div before the hero
        pre_hero = content[nav_start:header_start]
        # Replace entire nav + mobile nav section
        de_nav = DE_NAV.replace('{en_slug}', config['en_slug'])
        de_nav = de_nav.replace('{fr_slug}', config.get('fr_slug', ''))
        de_nav = de_nav.replace('{de_slug}', config['de_slug'])
        content = content[:nav_start] + de_nav + '\n\n' + content[header_start:]

    # 9. Replace footer block
    footer_start = content.find('  <footer class="footer">')
    footer_end = content.find('  </footer>') + len('  </footer>')
    if footer_start != -1 and footer_end != -1:
        content = content[:footer_start] + DE_FOOTER + content[footer_end:]

    # 10. Apply text translations from config
    for old, new in config.get('translations', []):
        content = content.replace(old, new)

    # 11. Update schema.org breadcrumb
    content = content.replace('"name": "Home"', '"name": "Startseite"')
    content = re.sub(
        r'"item": "https://aawebtools\.com/"(\s*\})',
        r'"item": "https://aawebtools.com/de/"\1',
        content
    )
    content = re.sub(
        r'"item": "https://aawebtools\.com/blog/"',
        r'"item": "https://aawebtools.com/de/blog/"',
        content
    )

    # 12. Update internal links from /tool/ to /de/tool/
    # But only for href links, not for external links
    link_mappings = {
        'href="/ai-humanizer/"': 'href="/de/ki-humanisierer/"',
        'href="/ai-detector/"': 'href="/de/ki-detektor/"',
        'href="/tiktok-downloader/"': 'href="/de/tiktok-herunterladen/"',
        'href="/twitter-video-downloader/"': 'href="/de/twitter-video-herunterladen/"',
        'href="/invoice-generator/"': 'href="/de/rechnungsgenerator/"',
        'href="/paystub-generator/"': 'href="/de/gehaltsabrechnungs-generator/"',
        'href="/image-toolkit/"': 'href="/de/bild-werkzeuge/"',
        'href="/blog/"': 'href="/de/blog/"',
        'href="/contact/"': 'href="/de/kontakt/"',
        'href="/about/"': 'href="/de/ueber-uns/"',
        'href="/privacy/"': 'href="/de/datenschutz/"',
        'href="/terms/"': 'href="/de/nutzungsbedingungen/"',
        'href="/"': 'href="/de/"',
        'href="/#tools"': 'href="/de/#tools"',
    }
    for old_link, new_link in link_mappings.items():
        content = content.replace(old_link, new_link)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"  Translated: {filepath}")


# ============================================================
# ARTICLE CONFIGURATIONS
# ============================================================

articles = [
    {
        "path": f"{BASE}/de/blog/ki-humanisierer-vs-turnitin-2026/index.html",
        "de_slug": "ki-humanisierer-vs-turnitin-2026",
        "en_slug": "ai-humanizers-vs-turnitin-2026",
        "fr_slug": "humanisateur-ia-vs-turnitin-2026",
        "title": "KI-Humanisierer vs Turnitin 2026: 5 Tools im Blindtest | AAWebTools",
        "description": "Wir haben 5 KI-Humanisierer-Tools gegen Turnitin, GPTZero, Copyleaks und weitere mit 50 Aufs\u00e4tzen getestet. Erfahren Sie, welche die KI-Erkennung 2026 tats\u00e4chlich umgehen.",
        "og_title": "KI-Humanisierer vs Turnitin 2026 -- 50 Aufs\u00e4tze im Blindtest",
        "og_description": "Wir haben 5 KI-Humanisierer-Tools gegen Turnitin, GPTZero, Copyleaks und weitere mit 50 Aufs\u00e4tzen getestet. Erfahren Sie, welche die KI-Erkennung 2026 tats\u00e4chlich umgehen.",
        "translations": [
            # Hero
            ("AI Tools", "KI-Tools"),
            ("AI Humanizers vs Turnitin -- We Blind-Tested 50 Essays (2026 Results)", "KI-Humanisierer vs Turnitin -- 50 Aufs\u00e4tze im Blindtest (Ergebnisse 2026)"),
            ("By <strong>AAWebTools Team</strong> &middot; Published March 27, 2026 &middot; 16 min read", "Von <strong>AAWebTools Team</strong> &middot; Ver\u00f6ffentlicht am 27. M\u00e4rz 2026 &middot; 16 Min. Lesezeit"),
            # Breadcrumb
            ('>Home</a> &rsaquo; <a href="/de/blog/">Blog</a> &rsaquo; AI Humanizers vs Turnitin 2026', '>Startseite</a> &rsaquo; <a href="/de/blog/">Blog</a> &rsaquo; KI-Humanisierer vs Turnitin 2026'),
            # TOC
            ("In This Article", "In diesem Artikel"),
            (">The AI Humanizer Arms Race</a>", ">Das KI-Humanisierer-Wettr\u00fcsten</a>"),
            (">Our Testing Methodology</a>", ">Unsere Testmethodik</a>"),
            (">The 5 AI Humanizers We Tested</a>", ">Die 5 getesteten KI-Humanisierer</a>"),
            (">Results: Bypass Rates by Tool</a>", ">Ergebnisse: Umgehungsraten nach Tool</a>"),
            (">Full Comparison Matrix</a>", ">Vollst\u00e4ndige Vergleichsmatrix</a>"),
            (">Manual Rewriting vs AI Humanizers</a>", ">Manuelles Umschreiben vs KI-Humanisierer</a>"),
            (">What About Turnitin Specifically?</a>", ">Was ist mit Turnitin im Speziellen?</a>"),
            (">Frequently Asked Questions</a>", ">H\u00e4ufig gestellte Fragen</a>"),
            # Stats strip
            ("Humanizers Tested", "Humanisierer getestet"),
            ("Detectors Used", "Detektoren verwendet"),
            ("Essay Samples", "Aufsatz-Stichproben"),
            ("Total Tests", "Tests insgesamt"),
            # Section headings
            ("<h2 id=\"introduction\">The AI Humanizer Arms Race</h2>", "<h2 id=\"introduction\">Das KI-Humanisierer-Wettr\u00fcsten</h2>"),
            ("<h2 id=\"methodology\">Our Testing Methodology</h2>", "<h2 id=\"methodology\">Unsere Testmethodik</h2>"),
            ("<h2 id=\"results\">Results: Bypass Rates by Tool</h2>", "<h2 id=\"results\">Ergebnisse: Umgehungsraten nach Tool</h2>"),
            ("<h2 id=\"comparison-matrix\">Full Comparison Matrix</h2>", "<h2 id=\"comparison-matrix\">Vollst\u00e4ndige Vergleichsmatrix</h2>"),
            ("<h2 id=\"manual-vs-ai\">Manual Rewriting vs AI Humanizers</h2>", "<h2 id=\"manual-vs-ai\">Manuelles Umschreiben vs KI-Humanisierer</h2>"),
            ("<h2 id=\"turnitin-deep-dive\">What About Turnitin Specifically?</h2>", "<h2 id=\"turnitin-deep-dive\">Was ist mit Turnitin im Speziellen?</h2>"),
            ("<h2 id=\"faq\">Frequently Asked Questions</h2>", "<h2 id=\"faq\">H\u00e4ufig gestellte Fragen</h2>"),
            ("<h2>Final Thoughts</h2>", "<h2>Abschlie\u00dfende Gedanken</h2>"),
            # Sub-headings
            ("<h3>The sample set: 50 GPT-4o essays</h3>", "<h3>Die Stichprobe: 50 GPT-4o-Aufs\u00e4tze</h3>"),
            ("<h3>The processing pipeline</h3>", "<h3>Die Verarbeitungspipeline</h3>"),
            ("<h3>Turnitin's 2026 upgrades</h3>", "<h3>Turnitins Updates 2026</h3>"),
            ("<h3>How humanizers performed against Turnitin</h3>", "<h3>Wie Humanisierer gegen Turnitin abschnitten</h3>"),
            ("<h3>The bypasser detection catch</h3>", "<h3>Die Bypasser-Erkennung als Falle</h3>"),
            # Callout labels
            ("Key Finding", "Kernergebnis"),
            ("Pro Tip", "Profi-Tipp"),
            ("Privacy Alert", "Datenschutzhinweis"),
            # Paragraphs - Introduction
            ("The battle between AI detection tools and AI humanizers has escalated into a full-blown arms race.", "Der Kampf zwischen KI-Erkennungstools und KI-Humanisierern hat sich zu einem regelrechten Wettr\u00fcsten entwickelt."),
            ("On one side, platforms like Turnitin, GPTZero, and Copyleaks are deploying increasingly sophisticated models to identify AI-generated text.", "Auf der einen Seite setzen Plattformen wie Turnitin, GPTZero und Copyleaks immer ausgefeiltere Modelle ein, um KI-generierten Text zu identifizieren."),
            ("On the other, a growing ecosystem of \"humanizer\" tools promises to rewrite AI output so that it reads as authentically human.", "Auf der anderen Seite verspricht ein wachsendes \u00d6kosystem von \"Humanisierer\"-Tools, KI-Ausgaben so umzuschreiben, dass sie authentisch menschlich klingen."),
            ("in early 2026, this dynamic is creating real anxiety among educators, students, and content professionals who need clarity about what actually works.", "Anfang 2026 sorgt diese Dynamik f\u00fcr echte Verunsicherung bei Lehrenden, Studierenden und Content-Profis, die Klarheit dar\u00fcber brauchen, was tats\u00e4chlich funktioniert."),
            ("In January 2026, Turnitin announced a major update to its AI detection system:", "Im Januar 2026 k\u00fcndigte Turnitin ein gro\u00dfes Update seines KI-Erkennungssystems an:"),
            ("a dedicated \"bypasser detection\" layer trained specifically to identify text that has been processed through paraphrasing and humanizing tools.", "eine dedizierte \"Bypasser-Erkennungsschicht\", die speziell darauf trainiert wurde, Text zu identifizieren, der durch Paraphrasierungs- und Humanisierungs-Tools verarbeitet wurde."),
            ("According to Turnitin's own research, this new layer can detect mechanically rewritten text with up to 92% accuracy", "Laut Turnitins eigener Forschung kann diese neue Schicht mechanisch umgeschriebenen Text mit bis zu 92% Genauigkeit erkennen"),
            ("even when the underlying AI content would otherwise pass its standard detection.", "-- selbst wenn der zugrunde liegende KI-Inhalt die Standard-Erkennung ansonsten bestehen w\u00fcrde."),
            ("That claim raised an obvious question: do AI humanizers still work at all?", "Diese Behauptung warf eine offensichtliche Frage auf: Funktionieren KI-Humanisierer \u00fcberhaupt noch?"),
            ("We decided to find out.", "Wir haben es herausgefunden."),
            ("Over three weeks, we ran a controlled study:", "\u00dcber drei Wochen hinweg f\u00fchrten wir eine kontrollierte Studie durch:"),
            ("50 GPT-4o-generated essays, processed through five popular AI humanizers, then tested against five leading AI detectors.", "50 mit GPT-4o generierte Aufs\u00e4tze, verarbeitet durch f\u00fcnf beliebte KI-Humanisierer, dann gegen f\u00fcnf f\u00fchrende KI-Detektoren getestet."),
            ("The results were more nuanced than either side of the debate suggests.", "Die Ergebnisse waren differenzierter, als beide Seiten der Debatte nahelegen."),
            # Callout finding
            ("AI humanizers achieved a <strong>73% average bypass rate</strong> across all detectors in our tests, but manual rewriting still beats them at <strong>91%</strong>. The gap between the best and worst humanizer was 23 percentage points.", "KI-Humanisierer erzielten in unseren Tests eine <strong>durchschnittliche Umgehungsrate von 73%</strong> \u00fcber alle Detektoren hinweg, doch manuelles Umschreiben schl\u00e4gt sie mit <strong>91%</strong>. Der Abstand zwischen dem besten und schlechtesten Humanisierer betrug 23 Prozentpunkte."),
            ("This article presents the full data.", "Dieser Artikel pr\u00e4sentiert die vollst\u00e4ndigen Daten."),
            ("We cover which humanizers beat which detectors, where they fail, how Turnitin's new features change the equation, and whether manual rewriting is still the gold standard.", "Wir zeigen, welche Humanisierer welche Detektoren schlagen, wo sie versagen, wie Turnitins neue Funktionen die Gleichung ver\u00e4ndern und ob manuelles Umschreiben noch der Goldstandard ist."),
            ("If you are a student, educator, writer, or content professional trying to navigate this landscape, the numbers below will give you an honest, evidence-based picture of where things stand in 2026.", "Wenn Sie Studierende/r, Lehrende/r, Autor/in oder Content-Profi sind und sich in dieser Landschaft zurechtfinden m\u00fcssen, geben Ihnen die folgenden Zahlen ein ehrliches, evidenzbasiertes Bild der Lage 2026."),
            ("For context, we also used our own tools throughout this study.", "Zur Einordnung: Wir haben in dieser Studie auch unsere eigenen Tools verwendet."),
            ("was one of the five tools tested, and the", "war eines der f\u00fcnf getesteten Tools, und der"),
            ("was one of the five detectors used.", "war einer der f\u00fcnf verwendeten Detektoren."),
            ("We report both their strengths and their limitations transparently.", "Wir berichten transparent sowohl \u00fcber ihre St\u00e4rken als auch ihre Grenzen."),
            # Methodology section
            ("We designed this study to be as controlled and reproducible as possible.", "Wir haben diese Studie so kontrolliert und reproduzierbar wie m\u00f6glich gestaltet."),
            ("Every variable that we could standardize, we did.", "Jede Variable, die wir standardisieren konnten, haben wir standardisiert."),
            ("Here is exactly how the test was structured.", "So war der Test genau aufgebaut."),
            ("We generated 50 essays using OpenAI's GPT-4o model (March 2026 version), spread evenly across five genres:", "Wir haben 50 Aufs\u00e4tze mit OpenAIs GPT-4o-Modell (Version M\u00e4rz 2026) generiert, gleichm\u00e4\u00dfig auf f\u00fcnf Genres verteilt:"),
            ("<strong>Academic essays</strong> (10)", "<strong>Akademische Aufs\u00e4tze</strong> (10)"),
            ("topics ranging from the causes of World War I to the ethics of gene editing, each 800-1,200 words, written in formal academic register with thesis statements and cited-style argumentation.", "-- Themen von den Ursachen des Ersten Weltkriegs bis zur Ethik der Genbearbeitung, jeweils 800-1.200 W\u00f6rter, in formalem akademischen Stil mit Thesen und zitiertypischer Argumentation."),
            ("<strong>Blog posts</strong> (10)", "<strong>Blog-Beitr\u00e4ge</strong> (10)"),
            ("conversational how-to guides and opinion pieces on topics like remote work productivity and sustainable travel, 600-900 words each.", "-- umgangssprachliche Anleitungen und Meinungsbeitr\u00e4ge zu Themen wie Remote-Work-Produktivit\u00e4t und nachhaltiges Reisen, jeweils 600-900 W\u00f6rter."),
            ("<strong>Business writing</strong> (10)", "<strong>Gesch\u00e4ftstexte</strong> (10)"),
            ("executive summaries, product descriptions, and market analyses in professional corporate tone, 500-800 words each.", "-- Executive Summaries, Produktbeschreibungen und Marktanalysen in professionellem Unternehmensstil, jeweils 500-800 W\u00f6rter."),
            ("<strong>Creative nonfiction</strong> (10)", "<strong>Kreatives Sachbuch</strong> (10)"),
            ("personal essays, travel narratives, and memoir-style pieces that required stylistic voice and emotional texture, 700-1,000 words each.", "-- pers\u00f6nliche Essays, Reiseberichte und Memoir-Texte, die stilistische Stimme und emotionale Tiefe erforderten, jeweils 700-1.000 W\u00f6rter."),
            ("<strong>Technical writing</strong> (10)", "<strong>Technische Texte</strong> (10)"),
            ("software documentation, API guides, and technical explanations that use specialized vocabulary and structured formatting, 600-900 words each.", "-- Softwaredokumentation, API-Anleitungen und technische Erkl\u00e4rungen mit Fachvokabular und strukturierter Formatierung, jeweils 600-900 W\u00f6rter."),
            ("Each of the 50 essays was processed through all five humanizer tools using their default settings.", "Jeder der 50 Aufs\u00e4tze wurde mit den Standardeinstellungen durch alle f\u00fcnf Humanisierer-Tools verarbeitet."),
            ("We did not tweak any \"intensity\" sliders or select specialized modes unless they were the tool's default recommendation.", "Wir haben keine \"Intensit\u00e4ts\"-Regler ver\u00e4ndert oder spezielle Modi ausgew\u00e4hlt, es sei denn, sie waren die Standardempfehlung des Tools."),
            ("This gave us 250 humanized outputs (50 essays multiplied by 5 humanizers), plus the 50 originals as a control group.", "Das ergab 250 humanisierte Ausgaben (50 Aufs\u00e4tze mal 5 Humanisierer) plus die 50 Originale als Kontrollgruppe."),
            # Flow diagram
            ("GPT-4o Text", "GPT-4o-Text"),
            ("50 essays, 5 genres", "50 Aufs\u00e4tze, 5 Genres"),
            ("5 Humanizers", "5 Humanisierer"),
            ("Default settings", "Standardeinstellungen"),
            ("5 Detectors", "5 Detektoren"),
            ("Per tool, per essay", "Pro Tool, pro Aufsatz"),
            ("Score Matrix", "Ergebnis-Matrix"),
            ("250 test results", "250 Testergebnisse"),
            # Tool cards - shared labels
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
            # Tool 1 AAWebTools
            ("is the tool we built, so let us be upfront about that.", "ist das Tool, das wir entwickelt haben -- das stellen wir von Anfang an klar."),
            ("It is included in this comparison because excluding our own product would be less transparent than including it.", "Es ist in diesem Vergleich enthalten, weil das Ausschlie\u00dfen unseres eigenen Produkts weniger transparent w\u00e4re als es einzubeziehen."),
            ("It runs entirely in your browser", "Es l\u00e4uft vollst\u00e4ndig in Ihrem Browser"),
            ("your text is never sent to any server", "Ihr Text wird niemals an einen Server gesendet"),
            ("There is no signup, no word limit, and no cost.", "Es gibt keine Anmeldung, kein Wortlimit und keine Kosten."),
            ("The AAWebTools humanizer achieved the highest average bypass rate in our test at 82%.", "Der AAWebTools Humanisierer erzielte die h\u00f6chste durchschnittliche Umgehungsrate in unserem Test mit 82%."),
            ("Best Overall (Free)", "Insgesamt am besten (kostenlos)"),
            ("Most Popular (Paid)", "Am beliebtesten (kostenpflichtig)"),
            ("Best for Students", "Am besten f\u00fcr Studierende"),
            ("Fastest Processing", "Schnellste Verarbeitung"),
            ("Best as Paraphraser (Not Humanizer)", "Am besten als Paraphrasierer (nicht als Humanisierer)"),
            # Results section
            ("Average Bypass Rate by Humanizer", "Durchschnittliche Umgehungsrate nach Humanisierer"),
            ("Here is how each humanizer performed on average across all five detectors.", "So hat jeder Humanisierer im Durchschnitt \u00fcber alle f\u00fcnf Detektoren abgeschnitten."),
            ("The bars represent the percentage of the 50 essay samples that successfully bypassed detection after humanization.", "Die Balken zeigen den Prozentsatz der 50 Aufsatz-Stichproben, die nach der Humanisierung die Erkennung erfolgreich umgangen haben."),
            ("Several patterns stand out.", "Mehrere Muster stechen hervor."),
            ("First, the gap between the best performer (AAWebTools at 82%) and the worst (QuillBot at 59%) is 23 percentage points", "Erstens betr\u00e4gt der Abstand zwischen dem besten Ergebnis (AAWebTools mit 82%) und dem schlechtesten (QuillBot mit 59%) 23 Prozentpunkte"),
            ("a massive difference when the stakes are a flagged assignment or a rejected article.", "-- ein gewaltiger Unterschied, wenn es um eine markierte Arbeit oder einen abgelehnten Artikel geht."),
            ("Second, every humanizer performed worse against Turnitin than against any other detector", "Zweitens schnitten alle Humanisierer gegen Turnitin schlechter ab als gegen jeden anderen Detektor"),
            ("which confirms that Turnitin's bypasser detection layer is having a real impact.", ", was best\u00e4tigt, dass Turnitins Bypasser-Erkennungsschicht eine reale Wirkung hat."),
            ("Third, dedicated humanizer tools consistently outperformed QuillBot's paraphraser, reinforcing that paraphrasing and humanizing are fundamentally different tasks.", "Drittens \u00fcbertrafen spezialisierte Humanisierer-Tools durchgehend QuillBots Paraphrasierer, was best\u00e4tigt, dass Paraphrasieren und Humanisieren grunds\u00e4tzlich unterschiedliche Aufgaben sind."),
            ("The control group -- raw, unprocessed GPT-4o text -- was detected 94% of the time across all five detectors.", "Die Kontrollgruppe -- roher, unverarbeiteter GPT-4o-Text -- wurde in 94% der F\u00e4lle von allen f\u00fcnf Detektoren erkannt."),
            ("That means even the worst humanizer in our test (QuillBot at 59%) meaningfully reduced detection compared to doing nothing at all.", "Das bedeutet, dass selbst der schlechteste Humanisierer in unserem Test (QuillBot mit 59%) die Erkennung im Vergleich zum Nichtstun deutlich reduzierte."),
            # Comparison matrix
            ("The table below shows bypass rates for every humanizer-detector combination.", "Die folgende Tabelle zeigt die Umgehungsraten f\u00fcr jede Humanisierer-Detektor-Kombination."),
            ("Each cell represents the percentage of the 50 essays that successfully bypassed that specific detector after being processed by that specific humanizer.", "Jede Zelle zeigt den Prozentsatz der 50 Aufs\u00e4tze, die nach Verarbeitung durch den jeweiligen Humanisierer den jeweiligen Detektor erfolgreich umgangen haben."),
            ("Higher is better (from the humanizer's perspective).", "H\u00f6her ist besser (aus Sicht des Humanisierers)."),
            ("<th>Humanizer</th>", "<th>Humanisierer</th>"),
            ("<th>Average</th>", "<th>Durchschnitt</th>"),
            ("A few key takeaways from the matrix.", "Einige wichtige Erkenntnisse aus der Matrix."),
            ("Turnitin is the hardest detector for every humanizer to beat", "Turnitin ist der schwierigste Detektor f\u00fcr jeden Humanisierer"),
            ("no tool achieved above 74% against it.", "-- kein Tool erreichte mehr als 74% dagegen."),
            ("ZeroGPT is the easiest to bypass, with every humanizer achieving at least 76%.", "ZeroGPT ist am leichtesten zu umgehen -- jeder Humanisierer erreichte mindestens 76%."),
            ("Copyleaks sits in the middle, and GPTZero is slightly more forgiving than Copyleaks.", "Copyleaks liegt in der Mitte, und GPTZero ist etwas nachsichtiger als Copyleaks."),
            ("Our own AAWebTools detector performed consistently in the mid-range, which is what we would expect from a browser-based model competing against server-side systems.", "Unser eigener AAWebTools-Detektor lag durchgehend im Mittelfeld, was wir von einem browserbasierten Modell im Wettbewerb mit serverbasierten Systemen erwarten w\u00fcrden."),
            # Manual vs AI section
            ("We ran one additional experiment.", "Wir f\u00fchrten ein zus\u00e4tzliches Experiment durch."),
            ("For 20 of the 50 essays, a human editor manually rewrote the GPT-4o output.", "F\u00fcr 20 der 50 Aufs\u00e4tze schrieb ein menschlicher Redakteur die GPT-4o-Ausgabe manuell um."),
            ("This meant reading the AI text, understanding the argument, and writing it fresh in their own voice", "Das bedeutete, den KI-Text zu lesen, das Argument zu verstehen und es in eigenen Worten neu zu schreiben"),
            ("preserving the ideas but completely replacing the language.", "-- die Ideen bewahren, aber die Sprache vollst\u00e4ndig ersetzen."),
            ("The manual rewrite took an average of 22 minutes per essay.", "Das manuelle Umschreiben dauerte durchschnittlich 22 Minuten pro Aufsatz."),
            ("The manually rewritten essays achieved a <strong>91% bypass rate</strong> across all five detectors.", "Die manuell umgeschriebenen Aufs\u00e4tze erreichten eine <strong>Umgehungsrate von 91%</strong> \u00fcber alle f\u00fcnf Detektoren."),
            ("That is 9 percentage points above the best AI humanizer (AAWebTools at 82%) and 32 points above the worst (QuillBot at 59%).", "Das sind 9 Prozentpunkte \u00fcber dem besten KI-Humanisierer (AAWebTools mit 82%) und 32 Punkte \u00fcber dem schlechtesten (QuillBot mit 59%)."),
            ("AI Humanizer", "KI-Humanisierer"),
            ("Manual Rewrite", "Manuelles Umschreiben"),
            ("~30 <span>seconds</span>", "~30 <span>Sekunden</span>"),
            ("~22 <span>minutes</span>", "~22 <span>Minuten</span>"),
            ("Average bypass: 73%", "Durchschnittliche Umgehung: 73%"),
            ("Average bypass: 91%", "Durchschnittliche Umgehung: 91%"),
            ("The math is straightforward.", "Die Rechnung ist einfach."),
            ("If detection is a serious concern", "Wenn Erkennung ein ernstes Anliegen ist"),
            ("for instance, if you are submitting an academic paper that will go through Turnitin", "-- beispielsweise wenn Sie eine akademische Arbeit einreichen, die durch Turnitin geht"),
            ("manual rewriting delivers meaningfully better results.", "-- liefert manuelles Umschreiben deutlich bessere Ergebnisse."),
            ("But it costs 44 times as much time.", "Aber es kostet 44-mal so viel Zeit."),
            ("For lower-stakes situations like blog posts, marketing copy, or social media content, an AI humanizer provides a practical balance of speed and effectiveness.", "F\u00fcr weniger kritische Situationen wie Blog-Beitr\u00e4ge, Marketing-Texte oder Social-Media-Inhalte bietet ein KI-Humanisierer eine praktische Balance zwischen Geschwindigkeit und Effektivit\u00e4t."),
            ("for a first pass, then manually edit the output for 5-10 minutes.", "f\u00fcr einen ersten Durchgang, dann bearbeiten Sie die Ausgabe manuell 5-10 Minuten lang."),
            ("In our informal tests, this \"hybrid\" approach achieved a <strong>88% bypass rate</strong> in roughly one-third the time of a full manual rewrite.", "In unseren informellen Tests erzielte dieser \"hybride\" Ansatz eine <strong>Umgehungsrate von 88%</strong> in etwa einem Drittel der Zeit eines vollst\u00e4ndigen manuellen Umschreibens."),
            ("The quality difference matters too.", "Auch der Qualit\u00e4tsunterschied z\u00e4hlt."),
            ("Manually rewritten text reads more naturally, retains the writer's authentic voice, and avoids the occasional awkward phrasing that even the best humanizers sometimes produce.", "Manuell umgeschriebener Text liest sich nat\u00fcrlicher, beh\u00e4lt die authentische Stimme des Autors bei und vermeidet die gelegentlich unbeholfenen Formulierungen, die selbst die besten Humanisierer manchmal produzieren."),
            ("If you are writing for an audience that values prose quality -- academic reviewers, editors, discerning readers -- the manual pass is worth the extra time.", "Wenn Sie f\u00fcr ein Publikum schreiben, das Prosaqualit\u00e4t sch\u00e4tzt -- akademische Gutachter, Lektoren, anspruchsvolle Leser -- lohnt sich der manuelle Durchgang."),
            ("That said, for content teams producing dozens of articles per week, running every piece through a manual rewrite is not scalable.", "Allerdings ist es f\u00fcr Content-Teams, die Dutzende von Artikeln pro Woche produzieren, nicht skalierbar, jeden Text manuell umzuschreiben."),
            ("In those contexts, an AI humanizer as a first pass -- followed by a light human edit -- is the most practical workflow we have seen.", "In diesen Kontexten ist ein KI-Humanisierer als erster Durchgang -- gefolgt von einer leichten menschlichen \u00dcberarbeitung -- der praktischste Workflow, den wir gesehen haben."),
            # Turnitin deep dive
            ("Turnitin deserves its own section because it is the AI detector that matters most to the largest number of people.", "Turnitin verdient einen eigenen Abschnitt, weil es der KI-Detektor ist, der f\u00fcr die meisten Menschen am wichtigsten ist."),
            ("Over 16,000 institutions worldwide use Turnitin, and its AI detection feature is now enabled by default in most deployments.", "\u00dcber 16.000 Institutionen weltweit nutzen Turnitin, und seine KI-Erkennungsfunktion ist in den meisten Implementierungen standardm\u00e4\u00dfig aktiviert."),
            ("If you are a student, Turnitin is almost certainly the detector your work is being checked against.", "Wenn Sie Studierende/r sind, ist Turnitin mit ziemlicher Sicherheit der Detektor, gegen den Ihre Arbeit gepr\u00fcft wird."),
            ("In its March 2026 update, Turnitin introduced three significant changes to its AI detection system:", "Im M\u00e4rz-2026-Update f\u00fchrte Turnitin drei bedeutende \u00c4nderungen an seinem KI-Erkennungssystem ein:"),
            ("<strong>Bypasser detection layer</strong>", "<strong>Bypasser-Erkennungsschicht</strong>"),
            ("a second model that specifically looks for signs of mechanical rewriting:", "ein zweites Modell, das gezielt nach Anzeichen mechanischen Umschreibens sucht:"),
            ("unnatural synonym substitutions, inconsistent register shifts, and the distinctive sentence patterns that paraphrasing tools produce.", "unnat\u00fcrliche Synonymersetzungen, inkonsistente Registerwechsel und die charakteristischen Satzmuster, die Paraphrasierungs-Tools erzeugen."),
            ("This layer runs alongside the standard AI detection model, and results are presented separately in the instructor dashboard.", "Diese Schicht l\u00e4uft parallel zum Standard-KI-Erkennungsmodell, und die Ergebnisse werden im Dozenten-Dashboard separat angezeigt."),
            ("<strong>Expanded training data</strong>", "<strong>Erweiterte Trainingsdaten</strong>"),
            ("Turnitin confirmed that its 2026 model was trained on text from GPT-4o, Claude 3.5, Gemini 1.5 Pro, and several open-source models released in late 2025.", "Turnitin best\u00e4tigte, dass sein 2026-Modell mit Texten von GPT-4o, Claude 3.5, Gemini 1.5 Pro und mehreren Ende 2025 ver\u00f6ffentlichten Open-Source-Modellen trainiert wurde."),
            ("The previous version had not been trained on these newer models.", "Die Vorg\u00e4ngerversion war nicht mit diesen neueren Modellen trainiert worden."),
            ("<strong>Confidence scoring improvements</strong>", "<strong>Verbesserte Konfidenz-Bewertung</strong>"),
            ("the AI probability score is now calculated per-paragraph rather than per-document, giving instructors a more granular view of which sections may have been AI-generated or modified.", "der KI-Wahrscheinlichkeitswert wird jetzt pro Absatz statt pro Dokument berechnet, was Dozenten eine detailliertere Ansicht gibt, welche Abschnitte m\u00f6glicherweise KI-generiert oder modifiziert wurden."),
            ("Turnitin was the hardest detector in our study. Here are the Turnitin-specific bypass rates:", "Turnitin war der schwierigste Detektor in unserer Studie. Hier sind die Turnitin-spezifischen Umgehungsraten:"),
            ("74% bypass", "74% Umgehung"),
            ("66% bypass", "66% Umgehung"),
            ("58% bypass", "58% Umgehung"),
            ("48% bypass", "48% Umgehung"),
            ("42% bypass", "42% Umgehung"),
            ("88% bypass", "88% Umgehung"),
            ("4% bypass", "4% Umgehung"),
            ("<strong>Manual rewrite</strong>", "<strong>Manuelles Umschreiben</strong>"),
            ("<strong>Raw GPT-4o (no humanization)</strong>", "<strong>Roher GPT-4o (ohne Humanisierung)</strong>"),
            ("Two things stand out.", "Zwei Dinge fallen auf."),
            ("First, even the best AI humanizer only achieved a 74% bypass rate against Turnitin", "Erstens erzielte selbst der beste KI-Humanisierer nur eine Umgehungsrate von 74% gegen Turnitin"),
            ("meaning roughly one in four humanized essays was still flagged.", "-- das hei\u00dft, etwa jeder vierte humanisierte Aufsatz wurde dennoch markiert."),
            ("For academic submissions where being flagged triggers a formal integrity review, those are not comfortable odds.", "Bei akademischen Einreichungen, bei denen eine Markierung eine formelle Integrit\u00e4tspr\u00fcfung ausl\u00f6st, sind das keine beruhigenden Chancen."),
            ("Second, the gap between humanizers and manual rewriting is largest specifically against Turnitin (14 percentage points between AAWebTools at 74% and manual at 88%).", "Zweitens ist der Abstand zwischen Humanisierern und manuellem Umschreiben gerade gegen Turnitin am gr\u00f6\u00dften (14 Prozentpunkte zwischen AAWebTools mit 74% und manuell mit 88%)."),
            ("Turnitin <strong>stores every submission</strong> in its database and uses it to train future models.", "Turnitin <strong>speichert jede Einreichung</strong> in seiner Datenbank und verwendet sie zum Training zuk\u00fcnftiger Modelle."),
            ("Once you submit text through Turnitin, that text becomes part of its permanent repository.", "Sobald Sie Text \u00fcber Turnitin einreichen, wird dieser Text Teil seines permanenten Archivs."),
            ("This means your writing -- and its statistical fingerprint -- will be compared against all future submissions.", "Das bedeutet, Ihr Schreibstil -- und sein statistischer Fingerabdruck -- wird mit allen zuk\u00fcnftigen Einreichungen verglichen."),
            ("If privacy is a concern, check whether your institution requires Turnitin submission or offers alternatives.", "Wenn Datenschutz ein Anliegen ist, pr\u00fcfen Sie, ob Ihre Institution eine Turnitin-Einreichung verlangt oder Alternativen anbietet."),
            ("Turnitin's new bypasser detection layer creates an additional risk that most users are not aware of.", "Turnitins neue Bypasser-Erkennungsschicht birgt ein zus\u00e4tzliches Risiko, das den meisten Nutzern nicht bewusst ist."),
            ("Even if your humanized text passes the standard AI detection check (i.e., it reads as \"human-written\"), the bypasser layer may flag it as \"potentially rewritten to evade detection.\"", "Selbst wenn Ihr humanisierter Text die Standard-KI-Erkennung besteht (d.h. als \"menschlich geschrieben\" gelesen wird), kann die Bypasser-Schicht ihn als \"m\u00f6glicherweise umgeschrieben zur Umgehung der Erkennung\" markieren."),
            ("This is a separate flag that instructors can see, and some institutions are beginning to treat this flag as grounds for further investigation.", "Dies ist eine separate Markierung, die Dozenten sehen k\u00f6nnen, und einige Institutionen beginnen, diese Markierung als Grund f\u00fcr weitere Untersuchungen zu behandeln."),
            ("In our tests, 18% of the essays that passed Turnitin's AI detection were nonetheless flagged by the bypasser layer.", "In unseren Tests wurden 18% der Aufs\u00e4tze, die Turnitins KI-Erkennung bestanden, dennoch von der Bypasser-Schicht markiert."),
            ("This means the effective bypass rate against Turnitin is actually lower than the numbers above suggest, depending on how your institution interprets the bypasser flag.", "Das bedeutet, die effektive Umgehungsrate gegen Turnitin ist tats\u00e4chlich niedriger als die obigen Zahlen nahelegen, je nachdem wie Ihre Institution die Bypasser-Markierung interpretiert."),
            ("The bottom line: if you are using an AI humanizer specifically to pass Turnitin in an academic setting, understand that the tool is increasingly capable of detecting not just AI text, but the act of trying to disguise it.", "Fazit: Wenn Sie einen KI-Humanisierer speziell nutzen, um Turnitin in einem akademischen Umfeld zu bestehen, m\u00fcssen Sie verstehen, dass das Tool zunehmend in der Lage ist, nicht nur KI-Text zu erkennen, sondern auch den Versuch, ihn zu verschleiern."),
            # CTA
            ("<strong>Test Your Text Now</strong>", "<strong>Testen Sie Ihren Text jetzt</strong>"),
            ("Run your text through our free AI detector and humanizer. No signup, no limits, completely private.", "Pr\u00fcfen Sie Ihren Text mit unserem kostenlosen KI-Detektor und Humanisierer. Ohne Anmeldung, ohne Limits, v\u00f6llig privat."),
            ("Open AI Detector", "KI-Detektor \u00f6ffnen"),
            ("Open AI Humanizer", "KI-Humanisierer \u00f6ffnen"),
            # FAQ
            ("Does humanized AI text pass Turnitin?", "Besteht humanisierter KI-Text bei Turnitin?"),
            ("It depends on the humanizer and the quality of its output.", "Das h\u00e4ngt vom Humanisierer und der Qualit\u00e4t seiner Ausgabe ab."),
            ("In our tests, the best AI humanizers achieved a 74% bypass rate against Turnitin's 2026 AI detection system.", "In unseren Tests erzielten die besten KI-Humanisierer eine Umgehungsrate von 74% gegen Turnitins KI-Erkennungssystem 2026."),
            ("However, Turnitin's newest \"bypasser detection\" feature can identify text that has been mechanically rewritten", "Allerdings kann Turnitins neueste \"Bypasser-Erkennung\" Text identifizieren, der mechanisch umgeschrieben wurde"),
            ("which means some humanized text may still be flagged -- not as AI-written, but as deliberately altered.", ", was bedeutet, dass mancher humanisierte Text dennoch markiert werden kann -- nicht als KI-geschrieben, sondern als absichtlich ver\u00e4ndert."),
            ("Manual rewriting after humanization significantly improves pass rates, pushing the rate up to 88% in our tests.", "Manuelles Umschreiben nach der Humanisierung verbessert die Bestehensraten erheblich und steigert die Rate in unseren Tests auf 88%."),
            ("Which AI humanizer is best for academic writing?", "Welcher KI-Humanisierer ist am besten f\u00fcr akademisches Schreiben?"),
            ("For academic writing specifically, the", "Speziell f\u00fcr akademisches Schreiben schnitt der"),
            ("performed best in our tests because it preserves technical vocabulary and academic tone while restructuring sentence patterns.", "in unseren Tests am besten ab, weil er Fachvokabular und akademischen Ton bewahrt und gleichzeitig Satzmuster umstrukturiert."),
            ("also scored well in academic contexts.", "schnitt ebenfalls gut in akademischen Kontexten ab."),
            ("However, no humanizer alone produces submission-ready academic text.", "Allerdings produziert kein Humanisierer allein einreichungsfertigen akademischen Text."),
            ("We recommend using a humanizer for an initial pass and then manually editing to add your own voice, examples, and analysis.", "Wir empfehlen, einen Humanisierer f\u00fcr einen ersten Durchgang zu verwenden und dann manuell zu bearbeiten, um Ihre eigene Stimme, Beispiele und Analyse hinzuzuf\u00fcgen."),
            ("Is using an AI humanizer considered cheating?", "Gilt die Nutzung eines KI-Humanisierers als Betrug?"),
            ("This depends entirely on your institution's academic integrity policy and the nature of the assignment.", "Das h\u00e4ngt vollst\u00e4ndig von der akademischen Integrit\u00e4tsrichtlinie Ihrer Institution und der Art der Aufgabe ab."),
            ("Many universities now have specific policies covering AI-generated content and tools designed to disguise it.", "Viele Universit\u00e4ten haben inzwischen spezifische Richtlinien f\u00fcr KI-generierte Inhalte und Tools, die diese verschleiern sollen."),
            ("Using an AI humanizer to submit fully AI-generated work as your own original writing would violate most academic integrity codes.", "Einen KI-Humanisierer zu verwenden, um vollst\u00e4ndig KI-generierte Arbeit als eigene Originalarbeit einzureichen, w\u00fcrde gegen die meisten akademischen Integrit\u00e4tskodizes versto\u00dfen."),
            ("However, using humanizers to polish your own AI-assisted drafts or for non-academic purposes like content marketing is generally accepted.", "Allerdings ist die Verwendung von Humanisierern zum Verfeinern eigener KI-unterst\u00fctzter Entw\u00fcrfe oder f\u00fcr nicht-akademische Zwecke wie Content-Marketing allgemein akzeptiert."),
            ("Always check your institution's specific policies before submitting work.", "Pr\u00fcfen Sie immer die spezifischen Richtlinien Ihrer Institution, bevor Sie Arbeiten einreichen."),
            ("How does Turnitin detect AI in 2026?", "Wie erkennt Turnitin KI im Jahr 2026?"),
            ("Turnitin's 2026 AI detection system uses a multi-layered approach.", "Turnitins KI-Erkennungssystem 2026 verwendet einen mehrschichtigen Ansatz."),
            ("It analyzes perplexity (word predictability), burstiness (sentence variation), and stylometric patterns through a trained classification model.", "Es analysiert Perplexit\u00e4t (Wortvorhersagbarkeit), Burstigkeit (Satzvarianz) und stilometrische Muster durch ein trainiertes Klassifikationsmodell."),
            ("In 2026, Turnitin added a \"bypasser detection\" layer specifically trained to identify text that has been processed through paraphrasing or humanizing tools.", "2026 f\u00fcgte Turnitin eine \"Bypasser-Erkennungsschicht\" hinzu, die speziell darauf trainiert wurde, Text zu identifizieren, der durch Paraphrasierungs- oder Humanisierungs-Tools verarbeitet wurde."),
            ("It also performs per-paragraph scoring rather than whole-document scoring, and its training data now includes output from GPT-4o, Claude 3.5, Gemini 1.5 Pro, and several open-source models.", "Es f\u00fchrt auch eine absatzweise Bewertung statt einer Gesamtdokument-Bewertung durch, und seine Trainingsdaten umfassen jetzt Ausgaben von GPT-4o, Claude 3.5, Gemini 1.5 Pro und mehreren Open-Source-Modellen."),
            ("Can I humanize text for free?", "Kann ich Text kostenlos humanisieren?"),
            ("is completely free with no character limits, no signup required, and no usage caps.", "ist v\u00f6llig kostenlos ohne Zeichenbegrenzung, ohne erforderliche Anmeldung und ohne Nutzungslimits."),
            ("It runs entirely in your browser, so your text is never sent to external servers.", "Es l\u00e4uft vollst\u00e4ndig in Ihrem Browser, sodass Ihr Text niemals an externe Server gesendet wird."),
            ("Other tools like Phrasly and WriteHuman offer limited free tiers, but impose word limits or require account creation for continued use.", "Andere Tools wie Phrasly und WriteHuman bieten begrenzte Gratis-Versionen, setzen aber Wortlimits durch oder erfordern eine Kontoerstellung f\u00fcr die weitere Nutzung."),
            ("QuillBot's paraphraser has a free tier as well but with reduced functionality compared to its premium version.", "QuillBots Paraphrasierer hat ebenfalls eine Gratis-Version, aber mit reduzierter Funktionalit\u00e4t im Vergleich zur Premium-Version."),
            ("What's the best free AI humanizer?", "Was ist der beste kostenlose KI-Humanisierer?"),
            ("Based on our testing of 50 essays against 5 detectors, the", "Basierend auf unseren Tests von 50 Aufs\u00e4tzen gegen 5 Detektoren ist der"),
            ("is the best free option.", "die beste kostenlose Option."),
            ("It achieved an 82% average bypass rate, offers unlimited usage with no signup, and processes text privately in your browser.", "Er erzielte eine durchschnittliche Umgehungsrate von 82%, bietet unbegrenzte Nutzung ohne Anmeldung und verarbeitet Text privat in Ihrem Browser."),
            ("For users willing to pay, Undetectable.ai achieved the highest overall bypass rate at 78% but requires a subscription", "F\u00fcr zahlungsbereite Nutzer erzielte Undetectable.ai die h\u00f6chste Gesamt-Umgehungsrate von 78%, erfordert aber ein Abonnement"),
            ("For users willing to pay, Undetectable.ai achieved a 78% bypass rate but requires a subscription starting at $9.99/month.", "F\u00fcr zahlungsbereite Nutzer erzielte Undetectable.ai eine Umgehungsrate von 78%, erfordert aber ein Abonnement ab $9,99/Monat."),
            ("The best approach for important documents is to use a free humanizer for the initial pass and then manually refine the output for 5-10 minutes.", "Der beste Ansatz f\u00fcr wichtige Dokumente ist, einen kostenlosen Humanisierer f\u00fcr den ersten Durchgang zu verwenden und dann die Ausgabe manuell 5-10 Minuten lang zu verfeinern."),
            ("The best approach is to use a free humanizer for the initial pass and then manually refine the output.", "Der beste Ansatz ist, einen kostenlosen Humanisierer f\u00fcr den ersten Durchgang zu verwenden und dann die Ausgabe manuell zu verfeinern."),
            # Closing
            ("The AI humanizer vs AI detector arms race is real, and neither side has won.", "Das Wettr\u00fcsten zwischen KI-Humanisierern und KI-Detektoren ist real, und keine Seite hat gewonnen."),
            ("Detectors -- especially Turnitin with its new bypasser detection layer -- are more capable than ever, but they are not infallible.", "Detektoren -- insbesondere Turnitin mit seiner neuen Bypasser-Erkennungsschicht -- sind leistungsf\u00e4higer als je zuvor, aber nicht unfehlbar."),
            ("Humanizers can meaningfully reduce detection rates, but they cannot guarantee invisibility.", "Humanisierer k\u00f6nnen die Erkennungsraten deutlich senken, aber keine Unsichtbarkeit garantieren."),
            ("And manual rewriting, while time-consuming, remains the most reliable approach.", "Und manuelles Umschreiben bleibt, obwohl zeitaufw\u00e4ndig, der zuverl\u00e4ssigste Ansatz."),
            ("If you take one thing from this 250-test study, let it be this:", "Wenn Sie eine Sache aus dieser 250-Test-Studie mitnehmen, dann diese:"),
            ("<strong>the best strategy is a hybrid one</strong>.", "<strong>Die beste Strategie ist eine hybride</strong>."),
            ("Use an AI humanizer for speed and efficiency, then invest a few minutes in manual editing to add authentic voice and catch any awkward phrasings.", "Nutzen Sie einen KI-Humanisierer f\u00fcr Geschwindigkeit und Effizienz, investieren Sie dann einige Minuten in manuelle Bearbeitung, um authentische Stimme hinzuzuf\u00fcgen und unbeholfene Formulierungen zu korrigieren."),
            ("This combination delivered the best balance of speed, quality, and bypass reliability in our testing.", "Diese Kombination lieferte in unseren Tests die beste Balance aus Geschwindigkeit, Qualit\u00e4t und Umgehungszuverl\u00e4ssigkeit."),
            ("For those looking for free, private tools to start with, the", "F\u00fcr diejenigen, die nach kostenlosen, privaten Tools suchen, sind der"),
            ("are both available with no signup, no limits, and no data collection.", "beide ohne Anmeldung, ohne Limits und ohne Datenerfassung verf\u00fcgbar."),
            ("They are not perfect -- no tool is -- but they represent the best free starting point we have found.", "Sie sind nicht perfekt -- kein Tool ist es -- aber sie sind der beste kostenlose Ausgangspunkt, den wir gefunden haben."),
            ("We will re-run this study in Q3 2026 when both detectors and humanizers will have evolved further.", "Wir werden diese Studie im 3. Quartal 2026 wiederholen, wenn sich sowohl Detektoren als auch Humanisierer weiterentwickelt haben."),
            ("If you have suggestions for tools to include in the next round, or if you have run your own tests and want to share data,", "Wenn Sie Vorschl\u00e4ge f\u00fcr Tools haben, die in die n\u00e4chste Runde aufgenommen werden sollen, oder wenn Sie eigene Tests durchgef\u00fchrt haben und Daten teilen m\u00f6chten,"),
            ("get in touch", "kontaktieren Sie uns"),
            # Author box
            ("Written by AAWebTools Team", "Verfasst vom AAWebTools Team"),
            ("Published March 27, 2026", "Ver\u00f6ffentlicht am 27. M\u00e4rz 2026"),
            ("Published March 28, 2026", "Ver\u00f6ffentlicht am 28. M\u00e4rz 2026"),
            ("More articles &rarr;", "Weitere Artikel &rarr;"),
            # Schema
            ("\"AI Humanizers vs Turnitin -- We Blind-Tested 50 Essays (2026 Results)\"", "\"KI-Humanisierer vs Turnitin -- 50 Aufs\u00e4tze im Blindtest (Ergebnisse 2026)\""),
            ("\"We tested 5 AI humanizer tools against Turnitin, GPTZero, Copyleaks, and more using 50 essays. See which humanizers actually bypass AI detection in 2026.\"", "\"Wir haben 5 KI-Humanisierer-Tools gegen Turnitin, GPTZero, Copyleaks und weitere mit 50 Aufs\u00e4tzen getestet. Erfahren Sie, welche die KI-Erkennung 2026 tats\u00e4chlich umgehen.\""),
            ("\"AI Humanizers vs Turnitin 2026\"", "\"KI-Humanisierer vs Turnitin 2026\""),
        ]
    },
]

if __name__ == "__main__":
    print("Starting German blog translations...")
    for article in articles:
        translate_file(article["path"], article)
    print("Done!")
