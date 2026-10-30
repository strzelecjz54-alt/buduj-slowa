import test from 'node:test';
import assert from 'node:assert/strict';
import { phrases } from '../data.js';
import { optionsFor, recordAnswer, lessonDone, pointsForMistakes, reviewQuestions } from '../learning.js';
test('import contains the full 304-phrase source and 15 modules',()=>{
 assert.equal(phrases.length,304);assert.equal(phrases.filter(p=>p.priority).length,20);
 for(const [index,p] of phrases.entries()){for(const key of ['pl','ru','en','de'])assert.ok(p[key]);assert.equal(p.id,index);assert.ok(p.moduleId>=1&&p.moduleId<=15);}
 assert.equal(phrases[0].pl,'Proszę ruszyć! (po ustaleniu kierunku)');
 assert.equal(phrases.at(-1).pl,'Na jakim kanale pracujemy?');
});
test('each language gets four distinct quiz answers including the right answer',()=>{for(const lang of ['ru','en','de'])for(const p of phrases){const options=optionsFor(p,phrases,lang);assert.equal(options.length,4);assert.equal(new Set(options).size,4);assert.ok(options.includes(p[lang]));}});
test('mistakes go to review and correct answers clear review independently by language',()=>{const stats={cards:{},xp:0};recordAnswer(stats,'ru',0,false);assert.equal(stats.cards['ru:0'].review,true);assert.equal(stats.xp,0);recordAnswer(stats,'ru',0,true);assert.equal(stats.cards['ru:0'].review,false);assert.equal(stats.xp,10);assert.equal(lessonDone(stats,'ru',[0]),true);assert.equal(lessonDone(stats,'de',[0]),false);assert.equal(lessonDone(stats,'ru',[0,1]),false);});

test('a phrase solved after a mistake remains in review and earns XP once solved',()=>{const stats={cards:{},xp:0};recordAnswer(stats,'ru',0,false,true);recordAnswer(stats,'ru',0,false,true);assert.equal(stats.xp,0);recordAnswer(stats,'ru',0,true,true);assert.equal(stats.cards['ru:0'].review,true);assert.equal(stats.cards['ru:0'].misses,2);assert.equal(stats.xp,10);recordAnswer(stats,'ru',0,true,false);assert.equal(stats.cards['ru:0'].review,false);});

test('points decrease after each wrong choice and wrong answers award nothing',()=>{
  for(const [mistakes,expected] of [[0,10],[1,7],[2,4],[3,1]]){
    const stats={cards:{},xp:50};
    for(let i=0;i<mistakes;i++)assert.equal(recordAnswer(stats,'ru',0,false,true,i+1),0);
    assert.equal(recordAnswer(stats,'ru',0,true,mistakes>0,mistakes),expected);
    assert.equal(stats.xp,50+expected);
    assert.equal(pointsForMistakes(mistakes),expected);
  }
});
test('review is exactly ten learned phrases for the selected language without repeats if possible',()=>{
  const stats={cards:{},xp:0};
  assert.deepEqual(reviewQuestions(phrases,stats,'ru'),[]);
  for(let i=0;i<15;i++)stats.cards[`ru:${i}`]={hits:1};
  stats.cards['ru:50']={hits:0,misses:3};stats.cards['de:70']={hits:2};
  const questions=reviewQuestions(phrases,stats,'ru');
  assert.equal(questions.length,10);assert.equal(new Set(questions.map(p=>p.id)).size,10);
  assert.ok(questions.every(p=>p.id<15));
  assert.equal(reviewQuestions(phrases,stats,'de').length,10);
  assert.ok(reviewQuestions(phrases,stats,'de').every(p=>p.id===70));
});
test('small learned pools are repeated evenly to fill a ten-question series',()=>{
  const stats={cards:{'en:1':{hits:1},'en:3':{hits:1},'en:5':{hits:1}},xp:0};
  const q=reviewQuestions(phrases,stats,'en');assert.equal(q.length,10);
  for(let i=1;i<q.length;i++)assert.notEqual(q[i].id,q[i-1].id);
  const counts=[1,3,5].map(id=>q.filter(p=>p.id===id).length);assert.ok(Math.max(...counts)-Math.min(...counts)<=1);
});

test("phonetic transcription is absent from all phrase data",()=>{assert.ok(phrases.every(p=>!("phon" in p)));});

test('quiz excludes equivalent vehicle-stop commands in every language',()=>{
 for(const lang of ['ru','en','de'])for(let run=0;run<30;run++){
  const options=optionsFor(phrases[5],phrases,lang);
  assert.ok(options.includes(phrases[5][lang]));assert.ok(!options.includes(phrases[6][lang]));
 }
});
test('all four options differ after normalizing punctuation and case',()=>{
  const normalize=s=>s.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}\s]/gu,' ').replace(/\s+/g,' ').trim();
  for(const lang of ['ru','en','de'])for(const phrase of phrases) {
    const options=optionsFor(phrase,phrases,lang).map(normalize);
    assert.equal(new Set(options).size,4);
  }
});

import { modules, lessons } from '../course.js';
test('course covers each phrase once in 68 ordered lessons of 4 or 5 phrases',()=>{
 assert.equal(modules.length,15);assert.equal(lessons.length,68);
 assert.equal(new Set(lessons.map(l=>l.id)).size,68);
 assert.deepEqual(lessons.flatMap(l=>l.phrases.map(p=>p.id)),phrases.map(p=>p.id));
 for(const module of modules){assert.ok(module.lessons.length>0);for(const lesson of module.lessons){assert.ok(lesson.phrases.length>=4&&lesson.phrases.length<=5);assert.ok(lesson.phrases.every(p=>p.moduleId===module.id));}}
});

import { readFileSync } from 'node:fs';
test('all four language fields exactly match the uploaded numbered dictionary',()=>{
 const text=readFileSync(new URL('../exports/slownik_PL_RU_EN_DE.txt',import.meta.url),'utf8');
 const lines=text.split(/\r?\n/).filter(line=>/^\d+\. .+\|.+\|.+\|.+$/.test(line));
 assert.equal(lines.length,304);
 for(const [index,line] of lines.entries()){
  const fields=line.replace(/^\d+\. /,'').split('|').map(s=>s.trim());
  assert.deepEqual(fields,['pl','ru','en','de'].map(key=>phrases[index][key]));
 }
});
