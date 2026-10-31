import csv, json, math, sys, re, os

SRC = sys.argv[1]
OUT = sys.argv[2]
COUNTY = {'001': 'Atlantic', '003': 'Bergen', '005': 'Burlington', '007': 'Camden', '009': 'Cape May', '011': 'Cumberland',
          '013': 'Essex', '015': 'Gloucester', '017': 'Hudson', '019': 'Hunterdon', '021': 'Mercer', '023': 'Middlesex',
          '025': 'Monmouth', '027': 'Morris', '029': 'Ocean', '031': 'Passaic', '033': 'Salem', '035': 'Somerset',
          '037': 'Sussex', '039': 'Union', '041': 'Warren'}
TYPES = ('city', 'borough', 'township', 'town', 'village')


def miles(lat1, lon1, lat2, lon2):
    r = 3958.8
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp, dl = p2 - p1, math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


rows = []
with open(SRC, encoding='utf-8') as f:
    rd = csv.reader(f, delimiter='\t')
    header = [h.strip() for h in next(rd)]
    for r in rd:
        d = dict(zip(header, [c.strip() for c in r]))
        if d['NAME'].startswith('County subdivisions not defined'):   # water/placeholder rows
            continue
        raw = d['NAME']
        kind = next((t for t in TYPES if raw.lower().endswith(' ' + t)), '')
        base = raw[: -(len(kind) + 1)] if kind else raw
        rows.append({'raw': raw, 'base': base, 'kind': kind, 'county': COUNTY[d['GEOID'][2:5]],
                     'lat': float(d['INTPTLAT']), 'lon': float(d['INTPTLONG'])})

origin = next(r for r in rows if r['raw'] == 'Long Branch city')
for r in rows:
    r['miles'] = round(miles(origin['lat'], origin['lon'], r['lat'], r['lon']), 1)

within = sorted([r for r in rows if r['miles'] <= 25 and r['raw'] != 'Long Branch city'], key=lambda r: (r['county'], r['miles']))
near = sorted([r for r in rows if 25 < r['miles'] <= 28], key=lambda r: r['miles'])
json.dump({'origin': origin, 'within25': within, 'near': near}, open(OUT, 'w', encoding='utf-8'), indent=1)

print('origin (Census interior point):', origin['raw'], origin['lat'], origin['lon'])
print('municipalities within 25 miles (excluding Long Branch itself):', len(within))
by = {}
for r in within:
    by.setdefault(r['county'], []).append(r)
for c, lst in by.items():
    print(f'\n{c} County ({len(lst)}):')
    print('  ' + ', '.join(f"{r['raw']} {r['miles']}" for r in lst))
print('\nJust outside 25 mi (25-28):', ', '.join(f"{r['raw']} {r['miles']}" for r in near))
