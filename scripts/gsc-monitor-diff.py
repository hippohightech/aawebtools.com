#!/usr/bin/env python3
"""
gsc-monitor-diff.py — Autonomous GSC state-machine tracker.

Runs against the GSC API, compares today's state to the baseline and
any previous monitor snapshot. Writes a dated JSON snapshot + a
human-readable diff summary. Designed to be called on a schedule
(cron/launchd every 2-3 days) or ad-hoc.

Focus: the specific state-machine question that decides the 2026-05-01
stop-loss — have any tool pages transitioned from
"Crawled - currently not indexed" → "Indexed"?

Outputs:
  .planning/gsc-monitor-<date>.json   — full state snapshot
  .planning/gsc-monitor-<date>.md     — human-readable diff vs baseline

Exit code:
  0 = nothing interesting
  1 = ERROR (auth, API, etc.)
  2 = STATE CHANGE detected on a tool page (action signal)
"""

import json
import os
import sys
import urllib.parse
import urllib.request
from datetime import date
from pathlib import Path

from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# Key path: prefer env var (for VPS deployment), fall back to local Mac path
KEY = os.environ.get('GSC_KEY_PATH', str(Path.home() / 'Downloads' / 'aawebtools-7c621461d98e.json'))
SCOPES = ['https://www.googleapis.com/auth/webmasters.readonly']
SITE = 'sc-domain:aawebtools.com'
BASELINE_PATH = Path('.planning/gsc-baseline-2026-04-17.json')

# Telegram bot — from memory: @aawebtoolsbot, chat ID Karim (7218295146)
TELEGRAM_TOKEN = os.environ.get('TELEGRAM_TOKEN', '8540417783:AAET8lhTaAZJdCM1dQ4Q2fjzx-NNZwp26wY')
TELEGRAM_CHAT_ID = os.environ.get('TELEGRAM_CHAT_ID', '7218295146')


def telegram_send(text):
    """Fire-and-forget. Truncates at Telegram's 4096-char limit."""
    if not TELEGRAM_TOKEN or not TELEGRAM_CHAT_ID:
        return
    text = text[:4000]
    url = f'https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage'
    data = urllib.parse.urlencode({
        'chat_id': TELEGRAM_CHAT_ID,
        'text': text,
        'parse_mode': 'Markdown',
        'disable_web_page_preview': 'true',
    }).encode('utf-8')
    try:
        urllib.request.urlopen(url, data=data, timeout=10).read()
    except Exception as e:
        print(f'[telegram] send failed: {e}', file=sys.stderr)

# The URLs whose state changes are load-bearing for the stop-loss decision
CRITICAL_URLS = [
    'https://aawebtools.com/invoice-generator/',   # the canary
    'https://aawebtools.com/paystub-generator/',
    'https://aawebtools.com/ai-detector/',
    'https://aawebtools.com/ai-humanizer/',
    # language homepages for context
    'https://aawebtools.com/',
    'https://aawebtools.com/fr/',
    'https://aawebtools.com/es/',
    'https://aawebtools.com/de/',
    'https://aawebtools.com/pt/',
    'https://aawebtools.com/ar/',
    'https://aawebtools.com/id/',
    'https://aawebtools.com/hi/',
]


def coverage_of(baseline, url):
    """Pull coverageState from a baseline snapshot entry."""
    entry = baseline.get('url_inspections', {}).get(url) or {}
    idx = entry.get('indexStatusResult') or entry  # baseline uses different nest
    return idx.get('coverageState', '—')


def inspect(svc, url):
    try:
        r = svc.urlInspection().index().inspect(body={
            'inspectionUrl': url, 'siteUrl': SITE,
        }).execute()
        return r.get('inspectionResult', {}).get('indexStatusResult', {})
    except HttpError as e:
        return {'error': f'{e.resp.status} {e.resp.reason}'}


def is_indexed(coverage_state):
    if not coverage_state:
        return False
    c = coverage_state.lower()
    return 'indexed' in c and 'not' not in c


def state_category(coverage_state):
    """Group into coarse buckets for the state-machine."""
    if not coverage_state:
        return 'unknown'
    c = coverage_state.lower()
    if 'submitted and indexed' in c or ('indexed' in c and 'not' not in c):
        return 'INDEXED'
    if 'crawled' in c and 'not indexed' in c:
        return 'CRAWLED_NOT_INDEXED'
    if 'discovered' in c and 'not indexed' in c:
        return 'DISCOVERED_NOT_INDEXED'
    if 'error' in c or 'excluded' in c:
        return 'EXCLUDED'
    return coverage_state


def main():
    if not BASELINE_PATH.exists():
        print(f'ERROR: baseline not found at {BASELINE_PATH}', file=sys.stderr)
        return 1

    baseline = json.loads(BASELINE_PATH.read_text())
    today = date.today().isoformat()

    creds = service_account.Credentials.from_service_account_file(KEY, scopes=SCOPES)
    svc = build('searchconsole', 'v1', credentials=creds, cache_discovery=False)

    # Snapshot current state
    current = {}
    for url in CRITICAL_URLS:
        current[url] = inspect(svc, url)

    # Also pull 14-day analytics for the period since baseline
    try:
        from datetime import date as d, timedelta
        # baseline is 2026-04-17; use a rolling 14-day window ending 3 days ago
        end = (d.today() - timedelta(days=3)).isoformat()
        start = '2026-04-15'  # 2 days before baseline snapshot for margin
        analytics = svc.searchanalytics().query(siteUrl=SITE, body={
            'startDate': start, 'endDate': end,
            'dimensions': ['page'], 'rowLimit': 100,
        }).execute()
    except HttpError as e:
        analytics = {'error': str(e)}

    snapshot = {
        'captured_at': today,
        'urls': current,
        'analytics_since_baseline': analytics.get('rows', []) if isinstance(analytics, dict) else [],
    }

    out_json = Path(f'.planning/gsc-monitor-{today}.json')
    out_json.parent.mkdir(exist_ok=True)
    out_json.write_text(json.dumps(snapshot, indent=2))

    # Build diff report
    lines = [
        f'# GSC Monitor — {today}',
        '',
        f'Baseline: {BASELINE_PATH.name} (2026-04-17)',
        f'Stop-loss deadline: 2026-05-01',
        '',
        '## State-machine transitions since baseline',
        '',
    ]
    state_changes = 0
    tool_indexed = 0
    for url in CRITICAL_URLS:
        short = url.replace('https://aawebtools.com', '') or '/'
        baseline_cov = coverage_of(baseline, url)
        current_cov = current[url].get('coverageState', current[url].get('error', '—'))
        baseline_cat = state_category(baseline_cov)
        current_cat = state_category(current_cov)
        is_tool = short in ('/invoice-generator/', '/paystub-generator/', '/ai-detector/', '/ai-humanizer/')
        if baseline_cat != current_cat:
            state_changes += 1
            marker = '🔔' if current_cat == 'INDEXED' else ('⬆' if is_tool else '↔')
            lines.append(f'  {marker} `{short}` : `{baseline_cat}` → **`{current_cat}`**')
        else:
            lines.append(f'  · `{short}` : `{current_cat}` (unchanged)')
        if is_tool and current_cat == 'INDEXED':
            tool_indexed += 1

    lines.extend([
        '',
        f'**Tool pages indexed:** {tool_indexed} / 4',
        f'**State changes since baseline:** {state_changes}',
        '',
    ])

    # Analytics delta
    if isinstance(snapshot['analytics_since_baseline'], list) and snapshot['analytics_since_baseline']:
        lines.append('## Search traffic since 2026-04-15 (rolling)')
        lines.append('')
        total_imp = sum(int(r['impressions']) for r in snapshot['analytics_since_baseline'])
        total_clk = sum(int(r['clicks']) for r in snapshot['analytics_since_baseline'])
        lines.append(f'  **Totals:** {total_imp} impressions, {total_clk} clicks')
        for r in sorted(snapshot['analytics_since_baseline'],
                        key=lambda x: -x['impressions'])[:10]:
            p = r['keys'][0].replace('https://aawebtools.com', '')
            lines.append(f'  - {int(r["impressions"]):>4} imp, {int(r["clicks"]):>2} clk, pos {r["position"]:>4.1f}  {p}')

    # Decision hint
    lines.extend([
        '',
        '## Automatic verdict',
        '',
    ])
    if tool_indexed >= 1:
        lines.append('🟢 **At least one tool page indexed.** AdSense resubmission becomes viable once traffic shows. Consider paystub/detector/humanizer expansions as next canaries.')
    elif state_changes == 0:
        lines.append('⚪ No state transitions yet. Keep waiting — Google re-crawl window is typically 7-21 days.')
    else:
        lines.append('🟡 State transitions detected but no tool page indexed yet. Trajectory ambiguous; continue monitoring.')
    lines.append('')

    out_md = Path(f'.planning/gsc-monitor-{today}.md')
    out_md.write_text('\n'.join(lines))

    print(f'✓ Wrote {out_json} and {out_md}')
    print('\n'.join(lines[:-1]))

    # Telegram notify only on change (avoid every-2-days-empty-spam)
    if tool_indexed >= 1:
        telegram_send(
            f'🔔 *aawebtools GSC alert* ({today})\n'
            f'*{tool_indexed} of 4 tool pages INDEXED* — AdSense resubmission window opens.\n\n'
            f'Details: `.planning/gsc-monitor-{today}.md`\n'
            f'Check `/invoice-generator/` first (the canary).'
        )
        return 2
    if state_changes > 0:
        # Summarize the transitions
        transitions = [ln for ln in lines if ' → **`' in ln]
        telegram_send(
            f'📊 *aawebtools GSC state change* ({today})\n\n'
            + '\n'.join(transitions[:10])
            + '\n\nNo tool page indexed yet. Trajectory ambiguous.'
        )
        return 2

    # Stop-loss deadline reminder (7 days and 1 day before 2026-05-01)
    from datetime import date as _d
    days_to_stoploss = (_d(2026, 5, 1) - _d.today()).days
    if days_to_stoploss in (7, 1):
        telegram_send(
            f'⏰ *aawebtools stop-loss in {days_to_stoploss} day(s)* — no tool pages indexed yet.\n'
            f'If still unchanged at 2026-05-01, kill aawebtools editorial track and pivot to topnation.ca.'
        )
    return 0


if __name__ == '__main__':
    sys.exit(main())
