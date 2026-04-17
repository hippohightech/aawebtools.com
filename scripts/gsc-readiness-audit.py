#!/usr/bin/env python3
"""
gsc-readiness-audit.py — Pull GSC data to answer: is aawebtools.com ready
for AdSense review resubmission?

Outputs a structured readiness report covering:
  1. Day-7 gate — indexation state of each language homepage
  2. Tool page indexation — the "thin content" dimension
  3. Retired URL removal — have the 21 410-Gones been picked up
  4. 28-day traffic — impressions / clicks / CTR by page
  5. Top queries — what we're actually ranking for
  6. Sitemap submission state + errors

Requires: google-api-python-client, google-auth
Key path + property identifier per memory/reference_gsc_api.md
"""

import json
import sys
from datetime import date, timedelta
from pathlib import Path

from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

KEY = str(Path.home() / 'Downloads' / 'aawebtools-7c621461d98e.json')
SCOPES = ['https://www.googleapis.com/auth/webmasters.readonly']
SITE = 'sc-domain:aawebtools.com'

# URLs to URL-Inspect. Keep under quota (~2000/day).
LANG_HOMEPAGES = [
    'https://aawebtools.com/',
    'https://aawebtools.com/fr/',
    'https://aawebtools.com/es/',
    'https://aawebtools.com/de/',
    'https://aawebtools.com/pt/',
    'https://aawebtools.com/ar/',
    'https://aawebtools.com/id/',
    'https://aawebtools.com/hi/',
]
TOOL_PAGES = [
    'https://aawebtools.com/ai-detector/',
    'https://aawebtools.com/ai-humanizer/',
    'https://aawebtools.com/invoice-generator/',
    'https://aawebtools.com/paystub-generator/',
    'https://aawebtools.com/image-toolkit/',
]
BLOG_PAGES = [
    'https://aawebtools.com/blog/',
    'https://aawebtools.com/blog/best-free-ai-content-detectors-2026/',
    'https://aawebtools.com/blog/compress-image-to-100kb-free/',
    'https://aawebtools.com/blog/ai-humanizers-vs-turnitin-2026/',
    'https://aawebtools.com/blog/can-teachers-detect-chatgpt-2026/',
    'https://aawebtools.com/blog/download-tiktok-slideshows-2026/',
    'https://aawebtools.com/blog/pay-stub-generator-self-employed/',
]
RETIRED_URLS = [
    'https://aawebtools.com/tiktok-downloader/',
    'https://aawebtools.com/twitter-video-downloader/',
    'https://aawebtools.com/fr/telechargeur-tiktok/',
    'https://aawebtools.com/pay-stub-generator/usa/',
    'https://aawebtools.com/pay-stub-generator/canada/',
]


def banner(msg):
    print(f'\n{"=" * 76}\n{msg}\n{"=" * 76}')


def inspect(svc, url):
    try:
        r = svc.urlInspection().index().inspect(body={
            'inspectionUrl': url,
            'siteUrl': SITE,
        }).execute()
        idx = r.get('inspectionResult', {}).get('indexStatusResult', {})
        return {
            'url': url,
            'verdict': idx.get('verdict', '—'),           # PASS / PARTIAL / FAIL / NEUTRAL
            'coverage': idx.get('coverageState', '—'),    # e.g. "Indexed, not submitted in sitemap"
            'robots': idx.get('robotsTxtState', '—'),
            'indexing': idx.get('indexingState', '—'),
            'last_crawl': idx.get('lastCrawlTime', '—'),
            'page_fetch': idx.get('pageFetchState', '—'),
            'referring': idx.get('referringUrls', []),
            'canonical': idx.get('googleCanonical', '—'),
            'user_canonical': idx.get('userCanonical', '—'),
        }
    except HttpError as e:
        return {'url': url, 'error': f'{e.resp.status} {e.resp.reason}'}


def search_analytics(svc, days=28, dimensions=None, row_limit=100):
    end = (date.today() - timedelta(days=3)).isoformat()  # 3-day lag
    start = (date.today() - timedelta(days=days + 3)).isoformat()
    body = {
        'startDate': start,
        'endDate': end,
        'dimensions': dimensions or [],
        'rowLimit': row_limit,
    }
    return svc.searchanalytics().query(siteUrl=SITE, body=body).execute()


def main():
    creds = service_account.Credentials.from_service_account_file(KEY, scopes=SCOPES)
    svc = build('searchconsole', 'v1', credentials=creds, cache_discovery=False)

    # ----- 1. Day-7 gate: language homepage indexation -----
    banner('1. DAY-7 GATE — Language homepage indexation')
    gate_pass = 0
    for url in LANG_HOMEPAGES:
        r = inspect(svc, url)
        if 'error' in r:
            print(f'  ✗ {url}  ERROR: {r["error"]}')
            continue
        indexed = r['verdict'] == 'PASS' and 'Indexed' in r['coverage']
        icon = '✓' if indexed else '·'
        if indexed:
            gate_pass += 1
        lang = url.replace('https://aawebtools.com/', '').strip('/') or 'en'
        print(f'  {icon} {lang:<5} verdict={r["verdict"]:<8} coverage="{r["coverage"]}"')
        if r.get('last_crawl', '—') != '—':
            print(f'         last_crawl={r["last_crawl"]}, robots={r["robots"]}')
    print(f'\n  → {gate_pass} of 8 English+localized homepages indexed')
    print(f'  → Day-7 gate rule: 4+ of 7 language (non-EN) homepages → ship Stage 2')
    non_en_indexed = sum(
        1 for url in LANG_HOMEPAGES[1:]
        if (r := inspect(svc, url)).get('verdict') == 'PASS' and 'Indexed' in r.get('coverage', '')
    )
    # Reuse: count non-EN from above loop instead of re-inspecting — keep it simple for now.

    # ----- 2. Tool pages — the "thin content" tell -----
    banner('2. TOOL PAGES — "thin content" signal')
    tool_indexed = 0
    tool_thin = 0
    for url in TOOL_PAGES:
        r = inspect(svc, url)
        if 'error' in r:
            print(f'  ✗ {url}  ERROR: {r["error"]}')
            continue
        short = url.replace('https://aawebtools.com/', '')
        coverage = r['coverage']
        if 'Indexed' in coverage:
            tool_indexed += 1
            print(f'  ✓ {short:<22} INDEXED  "{coverage}"')
        elif 'not indexed' in coverage.lower() or 'excluded' in coverage.lower():
            tool_thin += 1
            print(f'  ✗ {short:<22} NOT INDEXED  "{coverage}"')
            if r.get('referring'):
                print(f'         has {len(r["referring"])} referring internal links')
        else:
            print(f'  ? {short:<22} verdict={r["verdict"]} coverage="{coverage}"')
    print(f'\n  → {tool_indexed} of {len(TOOL_PAGES)} tool pages indexed, {tool_thin} explicitly not-indexed')

    # ----- 3. Retired URL 410 pickup -----
    banner('3. RETIRED URLs — Has Google picked up the 410 Gones?')
    still_live = 0
    for url in RETIRED_URLS:
        r = inspect(svc, url)
        if 'error' in r:
            print(f'  ? {url.replace("https://aawebtools.com","")}  ERROR: {r["error"]}')
            continue
        short = url.replace('https://aawebtools.com/', '')
        coverage = r['coverage']
        fetch = r.get('page_fetch', '—')
        if 'Indexed' in coverage and 'not' not in coverage.lower():
            still_live += 1
            print(f'  ⚠ {short:<40} STILL INDEXED  "{coverage}" fetch={fetch}')
        else:
            print(f'  ✓ {short:<40} NOT INDEXED  "{coverage}" fetch={fetch}')
    print(f'\n  → {still_live} of {len(RETIRED_URLS)} retired URLs still in Google index')

    # ----- 4. 28-day traffic totals -----
    banner('4. 28-DAY TRAFFIC — impressions, clicks (lag-adjusted)')
    try:
        totals = search_analytics(svc, days=28, dimensions=[])
        if totals.get('rows'):
            r = totals['rows'][0]
            print(f'  Impressions: {int(r["impressions"])}')
            print(f'  Clicks:      {int(r["clicks"])}')
            print(f'  CTR:         {r["ctr"]*100:.2f}%')
            print(f'  Avg pos:     {r["position"]:.1f}')
        else:
            print('  No impressions / clicks recorded in the last 28 days.')
            print('  (This is a strong AdSense-rejection signal — GSC shows nobody has found the site.)')
    except HttpError as e:
        print(f'  ERROR: {e}')

    # ----- 5. Top pages by impressions -----
    banner('5. TOP 10 PAGES by impressions (28d)')
    try:
        pages = search_analytics(svc, days=28, dimensions=['page'], row_limit=10)
        rows = pages.get('rows', [])
        if rows:
            for r in rows:
                path = r['keys'][0].replace('https://aawebtools.com', '')
                print(f'  {int(r["impressions"]):>5} imp  {int(r["clicks"]):>3} clk  {r["ctr"]*100:>5.1f}%  pos {r["position"]:>4.1f}  {path}')
        else:
            print('  (no rows)')
    except HttpError as e:
        print(f'  ERROR: {e}')

    # ----- 6. Top queries -----
    banner('6. TOP 15 QUERIES (28d)')
    try:
        queries = search_analytics(svc, days=28, dimensions=['query'], row_limit=15)
        rows = queries.get('rows', [])
        if rows:
            for r in rows:
                q = r['keys'][0][:50]
                print(f'  {int(r["impressions"]):>5} imp  {int(r["clicks"]):>3} clk  pos {r["position"]:>4.1f}  "{q}"')
        else:
            print('  (no queries — means Google has no data on what people are searching to find us)')
    except HttpError as e:
        print(f'  ERROR: {e}')

    # ----- 7. Sitemap state -----
    banner('7. SITEMAPS — submitted, errors, last read')
    try:
        sm = svc.sitemaps().list(siteUrl=SITE).execute()
        rows = sm.get('sitemap', [])
        if rows:
            for s in rows:
                path = s.get('path', '—').replace('https://aawebtools.com/', '')
                last_sub = s.get('lastSubmitted', '—')
                last_dl = s.get('lastDownloaded', '—')
                warnings = s.get('warnings', '0')
                errors = s.get('errors', '0')
                print(f'  {path:<22}  submitted={last_sub[:10]}  downloaded={last_dl[:10]}  err={errors} warn={warnings}')
        else:
            print('  (no sitemaps submitted)')
    except HttpError as e:
        print(f'  ERROR: {e}')

    # ----- Final readiness verdict -----
    banner('READINESS VERDICT')
    print('  (hand-graded below based on the numbers above)')


if __name__ == '__main__':
    main()
