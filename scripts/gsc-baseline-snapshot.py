#!/usr/bin/env python3
"""
gsc-baseline-snapshot.py — Freeze pre-rewrite GSC state for before/after deltas.

Saves a dated JSON snapshot with:
  - urlInspection state for 12 key URLs (7 lang homepages + 5 tool pages)
  - searchanalytics 28-day data by: totals, page, query, country+query
  - sitemap submission state

Plus prints the "blind spot" country+query query from the analytics-lead
audit — data that may already prove Phase 4 readiness.
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

URLS_TO_INSPECT = [
    # Language homepages
    'https://aawebtools.com/',
    'https://aawebtools.com/fr/',
    'https://aawebtools.com/es/',
    'https://aawebtools.com/de/',
    'https://aawebtools.com/pt/',
    'https://aawebtools.com/ar/',
    'https://aawebtools.com/id/',
    'https://aawebtools.com/hi/',
    # Tool pages
    'https://aawebtools.com/ai-detector/',
    'https://aawebtools.com/ai-humanizer/',
    'https://aawebtools.com/invoice-generator/',
    'https://aawebtools.com/paystub-generator/',
    'https://aawebtools.com/image-toolkit/',
]


def main():
    creds = service_account.Credentials.from_service_account_file(KEY, scopes=SCOPES)
    svc = build('searchconsole', 'v1', credentials=creds, cache_discovery=False)

    today = date.today().isoformat()
    end = (date.today() - timedelta(days=3)).isoformat()
    start = (date.today() - timedelta(days=31)).isoformat()

    snapshot = {
        'captured_at': today,
        'site': SITE,
        'range': {'start': start, 'end': end},
        'url_inspections': {},
        'analytics': {},
        'sitemaps': [],
    }

    # URL inspections
    print(f'Inspecting {len(URLS_TO_INSPECT)} URLs...')
    for url in URLS_TO_INSPECT:
        try:
            r = svc.urlInspection().index().inspect(body={
                'inspectionUrl': url, 'siteUrl': SITE,
            }).execute()
            snapshot['url_inspections'][url] = r.get('inspectionResult', {})
        except HttpError as e:
            snapshot['url_inspections'][url] = {'error': f'{e.resp.status} {e.resp.reason}'}

    # Analytics: totals, by page, by query, by country, page+country
    for key, dims in [
        ('totals', []),
        ('by_page', ['page']),
        ('by_query', ['query']),
        ('by_country', ['country']),
        ('by_device', ['device']),
        ('by_page_country', ['page', 'country']),
        ('by_country_query', ['country', 'query']),
        ('by_page_query', ['page', 'query']),
    ]:
        try:
            r = svc.searchanalytics().query(siteUrl=SITE, body={
                'startDate': start, 'endDate': end,
                'dimensions': dims, 'rowLimit': 500,
            }).execute()
            snapshot['analytics'][key] = r.get('rows', [])
        except HttpError as e:
            snapshot['analytics'][key] = {'error': f'{e.resp.status} {e.resp.reason}'}

    # Sitemaps
    try:
        sm = svc.sitemaps().list(siteUrl=SITE).execute()
        snapshot['sitemaps'] = sm.get('sitemap', [])
    except HttpError as e:
        snapshot['sitemaps'] = {'error': f'{e.resp.status} {e.resp.reason}'}

    # Save
    out_path = Path('.planning') / f'gsc-baseline-{today}.json'
    out_path.parent.mkdir(exist_ok=True)
    out_path.write_text(json.dumps(snapshot, indent=2))
    print(f'✓ Snapshot saved: {out_path}')

    # ============ BLIND SPOT REPORT ============
    print('\n' + '=' * 70)
    print('BLIND SPOT: country+query data on indexed fr/es/de/pt homepages')
    print('=' * 70)
    by_cq = snapshot['analytics'].get('by_country_query', [])
    if isinstance(by_cq, list) and by_cq:
        print(f'Total country+query rows: {len(by_cq)}')
        # Group by country
        by_country = {}
        for row in by_cq:
            country = row['keys'][0]
            by_country.setdefault(country, []).append(row)
        for country in sorted(by_country.keys(),
                              key=lambda c: -sum(r['impressions'] for r in by_country[c])):
            rows = by_country[country]
            total_imp = sum(r['impressions'] for r in rows)
            total_clk = sum(r['clicks'] for r in rows)
            print(f'\n  {country.upper()}  {total_imp} imp, {total_clk} clk across {len(rows)} queries')
            for r in sorted(rows, key=lambda x: -x['impressions'])[:5]:
                print(f'    {int(r["impressions"]):>4} imp  pos {r["position"]:>4.1f}  "{r["keys"][1][:55]}"')
    else:
        print('(no country+query data)')

    # ============ PAGE-QUERY for tool pages ============
    print('\n' + '=' * 70)
    print('TOOL PAGE QUERIES (any tool page that has any query at all)')
    print('=' * 70)
    tool_paths = [
        '/ai-detector/', '/ai-humanizer/', '/invoice-generator/',
        '/paystub-generator/', '/image-toolkit/',
    ]
    by_pq = snapshot['analytics'].get('by_page_query', [])
    found = False
    if isinstance(by_pq, list):
        for row in by_pq:
            page = row['keys'][0]
            if any(t in page for t in tool_paths):
                found = True
                q = row['keys'][1]
                print(f'  {int(row["impressions"]):>4} imp  pos {row["position"]:>4.1f}  {page.replace("https://aawebtools.com","")} ← "{q[:40]}"')
    if not found:
        print('  (no queries on any tool page — confirms "nobody finds them")')

    # ============ OVERALL SUMMARY ============
    print('\n' + '=' * 70)
    print('BASELINE AT A GLANCE')
    print('=' * 70)
    totals = snapshot['analytics'].get('totals', [])
    if isinstance(totals, list) and totals:
        t = totals[0]
        print(f'  28-day totals: {int(t["impressions"])} impressions, {int(t["clicks"])} clicks, pos {t["position"]:.1f}')

    indexed = sum(
        1 for u, r in snapshot['url_inspections'].items()
        if isinstance(r, dict)
        and 'Indexed' in r.get('indexStatusResult', {}).get('coverageState', '')
        and 'not' not in r.get('indexStatusResult', {}).get('coverageState', '').lower()
    )
    print(f'  URLs indexed: {indexed} of {len(URLS_TO_INSPECT)}')
    print(f'  Sitemaps submitted: {len(snapshot["sitemaps"]) if isinstance(snapshot["sitemaps"], list) else 0}')


if __name__ == '__main__':
    main()
