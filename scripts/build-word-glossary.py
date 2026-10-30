from pathlib import Path
import sys,re,json,sqlite3
sys.path.insert(0,'/tmp/buduj-word-build')
try:
 import pymorphy3
except ImportError:
 raise SystemExit('Install build-only pymorphy3 in /tmp/buduj-word-build or on PYTHONPATH; see README.md.')
morph=pymorphy3.MorphAnalyzer()
import argparse
parser=argparse.ArgumentParser()
parser.add_argument('--databases',type=Path,default=Path('/tmp/wikdict'))
args=parser.parse_args()
root=Path(__file__).resolve().parents[1];rows=json.loads((root/'data.js').read_text().split('export const phrases = ',1)[1].split(';\n',1)[0])
words={lang:sorted(set(w.lower().replace('’',"'") for p in rows for w in re.findall(r"[^\W\d_]+(?:[’'-][^\W\d_]+)*",p[lang],re.UNICODE))) for lang in ['en','de','ru']}
manual={'en':{'is':'be','are':'be','am':'be','was':'be','were':'be','has':'have','does':'do','lost':'lose','caught':'catch','goes':'go','giving':'give','using':'use','moving':'move','lifting':'lift','loading':'load','unloading':'unload','securing':'secure','connecting':'connect','suspended':'suspend','tripped':'trip','needed':'need','wheels':'wheel'},'de':{'ihre':'ihr','ihren':'ihr','diesem':'dieser','dieses':'dieser','diesen':'dieser','sich':'sich','brauchen':'brauchen','fängt':'anfangen','fängt':'fangen','liegt':'liegen','steht':'stehen','haben':'haben','wird':'werden','kommt':'kommen','gibt':'geben','lassen':'lassen','drehen':'drehen'},'ru':{}}
overrides=json.loads((root/'word-overrides.json').read_text())
output={};unknown={}
for lang in words:
 db=sqlite3.connect(args.databases/(lang+'-pl.sqlite3'));index={}
 for lemma,translations,score,importance in db.execute('select * from simple_translation'):
  index.setdefault(lemma.casefold(),[]).append((lemma,translations,score or 0))
 output[lang]={};unknown[lang]=[]
 for word in words[lang]:
  if word in overrides[lang]:output[lang][word]=overrides[lang][word];continue
  candidates=[word]
  if lang=='ru':candidates += [p.normal_form for p in morph.parse(word)[:2]]
  if word in manual[lang]:candidates.append(manual[lang][word])
  if lang=='en':
   if word.endswith('s'):candidates+=[word[:-1],word[:-2]]
   if word.endswith('ing'):candidates+=[word[:-3],word[:-3]+'e']
   if word.endswith('ed'):candidates+=[word[:-2],word[:-1]]
  if lang=='de':
   if word.endswith('en'):candidates+=[word[:-2],word[:-1]]
   if word.endswith('e'):candidates+=[word[:-1],word[:-1]+'en']
   if word.endswith('n'):candidates += [word[:-1]]
   if word.endswith('t'):candidates += [word[:-1]+'en']
  result=None
  for candidate in candidates:
   if candidate.casefold() in index:
    lemma,translations,score=max(index[candidate.casefold()],key=lambda r:r[2]);meanings=[s.strip() for s in translations.split('|') if s.strip()]
    result={'lemma':lemma,'meanings':meanings[:8],'source':'wikdict'};break
  if result:output[lang][word]=result
  else:unknown[lang].append(word)
 print(lang,'covered',len(output[lang]),'/',len(words[lang]),'missing:',', '.join(unknown[lang]))
if any(unknown.values()):
 raise SystemExit('Add reviewed translations to word-overrides.json for the missing course words.')
(root/'word-data.js').write_text('// Adapted WikDict/Wiktionary data, CC BY-SA 4.0. See WORD_DICTIONARY_LICENSE.md.\nexport const wordMeanings = '+json.dumps(output,ensure_ascii=False,indent=2)+';\n')
