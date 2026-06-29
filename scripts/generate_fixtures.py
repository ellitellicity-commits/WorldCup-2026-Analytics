"""Generate frontend/src/data/fixtures.json from the trained model.

The 72 WC2026 group-stage fixtures with real win/draw/win predictions, group
letters, venues, and each team's championship odds (denormalized from
odds.json). Reuses the same prediction pipeline as notebook 04.

Predictions are deterministic (no sampling), so re-running reproduces the same
file. Run from anywhere:  python scripts/generate_fixtures.py

Requires: pandas, numpy, scikit-learn (joblib), xgboost, networkx.
"""
import json
from itertools import combinations  # noqa: F401  (kept for parity with notebook pipeline)
from pathlib import Path

import pandas as pd
import numpy as np
import joblib
import networkx as nx

# Repo-relative paths — reproducible from any clone (script lives in scripts/).
REPO = Path(__file__).resolve().parents[1]
MODEL = REPO / 'models' / 'wc2026_xgb_model.pkl'
MATCHES_CSV = REPO / 'data' / 'raw' / 'wc2026' / 'matches_detailed.csv'
ELO_CSV = REPO / 'data' / 'raw' / 'wc2026' / 'elo_ratings_wc2026.csv'
RESULTS_CSV = REPO / 'data' / 'raw' / 'historical' / 'results.csv'
ODDS_JSON = REPO / 'frontend' / 'src' / 'data' / 'odds.json'
OUT_JSON = REPO / 'frontend' / 'src' / 'data' / 'fixtures.json'

bundle = joblib.load(MODEL)
model, le, feature_cols = bundle['model'], bundle['label_encoder'], bundle['feature_cols']

matches = pd.read_csv(MATCHES_CSV)
elo = pd.read_csv(ELO_CSV)
results_hist = pd.read_csv(RESULTS_CSV)
results_hist['date'] = pd.to_datetime(results_hist['date'])

# Standardize 2026 match-data names to the Elo name set (same map as notebook 04).
TEAM_NAME_FIX = {
    'Cabo Verde': 'Cape Verde', 'Congo DR': 'DR Congo', "Côte d'Ivoire": 'Ivory Coast',
    'IR Iran': 'Iran', 'Türkiye': 'Turkey', 'USA': 'United States',
}
matches['home_std'] = matches['home_team_name'].replace(TEAM_NAME_FIX)
matches['away_std'] = matches['away_team_name'].replace(TEAM_NAME_FIX)

# Reconstruct the 12 groups from the schedule (teams only play within their group).
G = nx.Graph()
for _, r in matches.iterrows():
    G.add_edge(r['home_std'], r['away_std'])
group_of = {}
for i, comp in enumerate(nx.connected_components(G)):
    for team in comp:
        group_of[team] = chr(65 + i)

# 2026 host nations. When a host plays at home we apply a *measured* advantage
# (Method C below): neutral averaging cancels the structural home-slot bias, but
# the host feature stays ON in both orderings so the genuine host-nation signal
# survives — ~+5 to +9pts, not the +17-22pts the raw home-slot prediction gives.
HOSTS = {'United States', 'Canada', 'Mexico'}


def get_team_elo(team, year=2026):
    rows = elo[(elo['country'] == team) & (elo['year'] == year)]
    return None if len(rows) == 0 else rows.sort_values('snapshot_date')['rating'].iloc[-1]


def get_team_form(team):
    home = results_hist[results_hist['home_team'] == team]
    away = results_hist[results_hist['away_team'] == team]
    hp = pd.DataFrame({'date': home['date'], 'gf': home['home_score'], 'ga': home['away_score']})
    ap = pd.DataFrame({'date': away['date'], 'gf': away['away_score'], 'ga': away['home_score']})
    log = pd.concat([hp, ap]).sort_values('date').tail(5)
    if len(log) == 0:
        return 1.0, 1.3, 1.3
    log['pts'] = np.where(log['gf'] > log['ga'], 3, np.where(log['gf'] == log['ga'], 1, 0))
    return log['pts'].mean(), log['gf'].mean(), log['ga'].mean()


def predict_match(home, away, home_is_host=0, away_is_host=0):
    he, ae = get_team_elo(home), get_team_elo(away)
    if he is None or ae is None:
        return None
    hp, hgf, hga = get_team_form(home)
    ap, agf, aga = get_team_form(away)
    feats = pd.DataFrame([{
        'elo_diff': he - ae, 'home_elo': he, 'away_elo': ae,
        'home_form_pts': hp, 'away_form_pts': ap, 'form_pts_diff': hp - ap,
        'home_form_gf': hgf, 'away_form_gf': agf, 'home_form_ga': hga, 'away_form_ga': aga,
        'home_is_host': home_is_host, 'away_is_host': away_is_host,
        'host_diff': home_is_host - away_is_host, 'is_knockout': 0,
    }])[feature_cols]
    p = model.predict_proba(feats)[0]
    return {le.classes_[i]: float(p[i]) for i in range(len(p))}


def _average(p1, p2):
    """Average two orderings into a home-perspective distribution (p2 is flipped)."""
    hw = (p1['Home Win'] + p2['Away Win']) / 2
    dr = (p1['Draw'] + p2['Draw']) / 2
    aw = (p1['Away Win'] + p2['Home Win']) / 2
    s = hw + dr + aw
    return hw / s, dr / s, aw / s


def _neutral(home, away):
    """Neutral venue: cancel home-field bias by averaging both orderings.
    Identical to predict_wc_match(host_team=None), the method behind odds.json."""
    return _average(predict_match(home, away), predict_match(away, home))


def _host_neutralized(home, away, host):
    """Method C: keep the host feature ON in BOTH orderings so the structural
    home-slot bias cancels but the genuine host-nation signal survives. Works
    whichever slot the host occupies — a host at home in the away slot (e.g.
    CZE v MEX in Mexico City) still gets the advantage."""
    if host == home:
        p1 = predict_match(home, away, home_is_host=1, away_is_host=0)
        p2 = predict_match(away, home, home_is_host=0, away_is_host=1)
    else:  # host == away (host plays at home but is the nominal away team)
        p1 = predict_match(home, away, home_is_host=0, away_is_host=1)
        p2 = predict_match(away, home, home_is_host=1, away_is_host=0)
    return _average(p1, p2)


def predict_fixture(home, away, host=None):
    """Neutral for everyone; a measured host advantage when a 2026 host plays in
    its own country (venue-based, either slot) — with a neutral floor so a host
    never drops below a neutral venue."""
    neutral = _neutral(home, away)
    if host in (home, away):
        boosted = _host_neutralized(home, away, host)
        host_win = boosted[0] if host == home else boosted[2]
        floor = neutral[0] if host == home else neutral[2]
        if host_win >= floor:  # genuine boost — take it; otherwise floor to neutral
            return boosted
    return neutral


# Championship odds + the snapshot date come from odds.json, so fixtures stay in
# the same "as of" snapshot as the Monte Carlo output the cards display.
odds_payload = json.load(open(ODDS_JSON))
odds = {t['team']: t['championship_odds'] for t in odds_payload['teams']}
generated = odds_payload['generated']

# Map venue country -> host nation. Every 2026 venue is in a host country, but a
# host only gets the advantage when it is itself competing (Brazil in LA gets none).
COUNTRY_TO_HOST = {
    'USA': 'United States', 'United States': 'United States',
    'CAN': 'Canada', 'Canada': 'Canada',
    'MEX': 'Mexico', 'Mexico': 'Mexico',
}

fixtures = []
for _, r in matches.iterrows():
    home, away = r['home_std'], r['away_std']
    venue_host = COUNTRY_TO_HOST.get(str(r['country']))
    host = home if venue_host == home else away if venue_host == away else None
    hw, dr, aw = predict_fixture(home, away, host)
    status = str(r['status']).lower()
    completed = status == 'completed' and pd.notna(r['home_score']) and pd.notna(r['away_score'])
    fixtures.append({
        'id': int(r['match_id']) if pd.notna(r['match_id']) else None,
        'date': str(r['date']),
        'kickoff': (str(r['kickoff_time_utc']) if pd.notna(r.get('kickoff_time_utc')) else None),
        'group': group_of.get(home),
        'venue': {'stadium': r['stadium_name'], 'city': r['city']},
        'status': 'completed' if completed else 'scheduled',
        'home': {'name': home, 'code': r['home_fifa_code'], 'championship_odds': round(odds.get(home, 0.0), 4)},
        'away': {'name': away, 'code': r['away_fifa_code'], 'championship_odds': round(odds.get(away, 0.0), 4)},
        'prediction': {'home_win': round(hw, 3), 'draw': round(dr, 3), 'away_win': round(aw, 3)},
        'result': ({'home_score': int(r['home_score']), 'away_score': int(r['away_score'])} if completed else None),
    })

fixtures.sort(key=lambda f: (f['date'], f['group'] or 'Z'))

payload = {'generated': generated, 'count': len(fixtures), 'fixtures': fixtures}
with open(OUT_JSON, 'w') as f:
    json.dump(payload, f, indent=2)

size_kb = OUT_JSON.stat().st_size / 1024
n_done = sum(1 for f in fixtures if f['status'] == 'completed')
print(f"[OK] {OUT_JSON.relative_to(REPO)}  ({len(fixtures)} fixtures, {n_done} completed, {size_kb:.1f} KB)")
bad = [f['id'] for f in fixtures if abs(sum(f['prediction'].values()) - 1.0) > 0.02]
print('prediction sums ~1.0 for all:', len(bad) == 0)
print('\nSample (first 3):')
for f in fixtures[:3]:
    p = f['prediction']
    print(f"  G{f['group']} {f['home']['code']} v {f['away']['code']:4s} "
          f"[{f['status']:9s}] H{p['home_win']*100:4.0f}% D{p['draw']*100:4.0f}% A{p['away_win']*100:4.0f}%"
          + (f"  ({f['result']['home_score']}-{f['result']['away_score']})" if f['result'] else ''))
