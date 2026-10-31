#!/usr/bin/env python3
"""Rebuilds every place the service-area towns appear in index.html from scripts/service-areas.json:

  1. the county/town chips in the "Service area" section   (<!-- areas:start --> ... <!-- areas:end -->)
  2. the county + headline-town lines in the footer          (<!-- footer-areas:start --> ... <!-- footer-areas:end -->)
  3. "areaServed" in the LocalBusiness structured data (JSON-LD)

To add or remove a town, edit scripts/service-areas.json and run:   python scripts/build-service-areas.py
(scripts/find-towns-in-radius.py shows how the list was produced from the U.S. Census Gazetteer.)
"""
import json
import re
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
data = json.loads((ROOT / 'scripts' / 'service-areas.json').read_text(encoding='utf-8'))
html_path = ROOT / 'index.html'
html = html_path.read_text(encoding='utf-8')
counties = data['counties']


def replace_between(text, tag, new):
    """Swap everything between the start/end marker comments for `new` (works on empty or filled blocks)."""
    pattern = re.compile(rf'^([ \t]*)<!-- {tag}:start -->.*?<!-- {tag}:end -->', re.S | re.M)
    m = pattern.search(text)
    assert m, f'marker {tag} not found in index.html'
    indent = m.group(1)
    block = f'{indent}<!-- {tag}:start -->\n{new}\n{indent}<!-- {tag}:end -->'
    return text[:m.start()] + block + text[m.end():]


def towns_li(towns, indent):
    return '\n'.join(f'{indent}<li>{escape(t["name"])}</li>' for t in towns)


def county_block(c, indent):
    n = len(c['towns'])
    return (f'{indent}<div class="county">\n'
            f'{indent}  <h3 class="county-name">{escape(c["name"])} <span class="county-count">{n} towns</span></h3>\n'
            f'{indent}  <ul class="town-list">\n{towns_li(c["towns"], indent + "    ")}\n{indent}  </ul>\n'
            f'{indent}</div>')


# 1) section chips: first county is the wide one, the rest are stacked beside it
first, rest = counties[0], counties[1:]
areas = (county_block(first, '      ') + '\n'
         '      <div class="county-stack">\n'
         + '\n'.join(county_block(c, '        ') for c in rest) + '\n'
         '      </div>')
html = replace_between(html, 'areas', areas)

# 2) footer: one link per county plus a few headline towns as plain text (the full list is in the Service area section)
def footer_line(c):
    shown = c['featured']
    more = len(c['towns']) - len(shown)
    return ', '.join(escape(t) for t in shown) + f' and {more} more nearby towns.'


footer = '\n'.join(
    f'      <div class="fa-county">\n'
    f'        <a class="col-head" href="#areas">{escape(c["name"])}</a>\n'
    f'        <p>{footer_line(c)}</p>\n'
    f'      </div>'
    for c in counties)
html = replace_between(html, 'footer-areas', footer)

# 3) structured data
ld_re = re.compile(r'(<script type="application/ld\+json">\n)(.*?)(\n  </script>)', re.S)
m = ld_re.search(html)
ld = json.loads(m.group(2))
biz = next(n for n in ld['@graph'] if n['@type'] == 'LocalBusiness')
biz['areaServed'] = [{'@type': 'AdministrativeArea', 'name': f'{c["name"]}, NJ'} for c in counties] + \
                    [{'@type': 'City', 'name': f'{t["name"]}, NJ'} for c in counties for t in c['towns']]
biz['description'] = ("House cleaning in Monmouth County, Ocean County and nearby Middlesex County, NJ: standard, deep, "
                      "move-in/move-out, post-construction and Airbnb cleaning, within about 25 miles of Long Branch.")
html = html[:m.start()] + m.group(1) + json.dumps(ld, indent=2, ensure_ascii=False) + m.group(3) + html[m.end():]

html_path.write_text(html, encoding='utf-8')
total = sum(len(c['towns']) for c in counties)
print(f'updated index.html: {total} towns across {len(counties)} counties')
