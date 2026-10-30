from pathlib import Path
import re,json,csv,argparse
parser=argparse.ArgumentParser(description='Import the numbered four-language construction dictionary.')
parser.add_argument('source',type=Path)
args=parser.parse_args()
root=Path(__file__).resolve().parents[1];source=args.source;rows=[];modules=[];module=None
for line in source.read_text().splitlines():
 if line.startswith("UWAGI DO KOREKTY"):break
 heading=re.match(r'^(\d{2})\. (.+)$',line)
 if heading and '|' not in line:
  number=int(heading[1]);assert 1<=number<=15
  module={'id':number,'title':heading[2][0]+heading[2][1:].lower()};modules.append(module)
 row=re.match(r'^(\d+)\. (.+\|.+\|.+\|.+)$',line)
 if row:
  assert module is not None
  cells=[s.strip() for s in row[2].split('|')];assert len(cells)==4
  number=int(row[1]);assert number==len(rows)+1
  rows.append(dict(zip(['pl','ru','en','de'],cells),id=number-1,priority=number<=20,moduleId=module['id'],category=module['title']))
assert len(rows)==304 and len(modules)==15
(root/'data.js').write_text('export const phrases = '+json.dumps(rows,ensure_ascii=False,indent=2)+';\n\nexport const courseModules = '+json.dumps(modules,ensure_ascii=False,indent=2)+';\n')
(root/'exports/slownik_PL_RU_EN_DE.txt').write_text(source.read_text())
with (root/'exports/slownik_PL_RU_EN_DE.csv').open('w',encoding='utf-8-sig',newline='') as f:
 w=csv.writer(f,delimiter=';',lineterminator='\n');w.writerow(['Nr','Moduł','Kategoria','Polski','Rosyjski','Angielski','Niemiecki'])
 for r in rows:w.writerow([r['id']+1,r['moduleId'],r['category'],*[r[k] for k in ['pl','ru','en','de']]])
for m in modules:print(m['id'],m['title'],sum(r['moduleId']==m['id'] for r in rows))
