import test from 'node:test';
import assert from 'node:assert/strict';
import { phrases } from '../data.js';
import { wordParts, lookupWord, phraseMeanings } from '../word-lookup.js';

test('every word in all three course languages has offline meanings',()=>{
  for(const lang of ['ru','en','de'])for(const phrase of phrases){
    const parts=wordParts(phrase[lang]);
    assert.equal(parts.map(p=>p.text).join(''),phrase[lang]);
    for(const part of parts.filter(p=>p.word)){
      const entry=lookupWord(part.text,lang);
      assert.ok(entry?.meanings.length,`${lang}: ${part.text}`);
      assert.ok(entry.meanings.every(s=>typeof s==='string'&&s.trim()));
    }
  }
});
test('technical words and inflected forms retain their construction meaning',()=>{
  for(const [lang,word,meaning] of [['ru','краном','dźwig'],['ru','стрелу','wysięgnik'],['de','Last','ładunek'],['de','Hände','ręce'],['de','Anschlagmittel','zawiesie'],['en','slings','zawiesia'],['en','earthing','uziemienie']]){
    assert.ok(lookupWord(word,lang).meanings.join(' ').includes(meaning),`${lang}: ${word}`);
  }
});
test('contractions stay intact, curly apostrophes normalize, unknown words are honest',()=>{
  assert.deepEqual(wordParts("Don't move!"),[{text:"Don't",word:true},{text:' ',word:false},{text:'move',word:true},{text:'!',word:false}]);
  assert.deepEqual(lookupWord('DON’T','en'),lookupWord("don't",'en'));
  assert.equal(lookupWord('not-in-this-dictionary','en'),null);
});
test('full phrase meanings come from the course and preserve distinct contexts',()=>{
  assert.deepEqual(phraseMeanings(phrases[0].de,'de',phrases),[phrases[0].pl]);
  assert.ok(phraseMeanings('Груз.','ru',phrases).includes('Ładunek (przewożony).'));
  assert.ok(phraseMeanings('Груз.','ru',phrases).includes('Ładunek (podnoszony).'));
});
