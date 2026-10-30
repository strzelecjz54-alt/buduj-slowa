import test from 'node:test';
import assert from 'node:assert/strict';
import { phrases } from '../data.js';
import { optionsFor, recordAnswer, lessonDone } from '../learning.js';
test('import contains all 139 phrases with the first 20 prioritized',()=>{assert.equal(phrases.length,139);assert.equal(phrases.filter(p=>p.priority).length,20);for(const p of phrases){for(const k of ['pl','ru','en','de','phon'])assert.ok(p[k]);assert.equal(p.id,phrases.indexOf(p));}assert.equal(phrases[19].pl,'Proszę czekać na mój znak.');assert.equal(phrases.at(-1).pl,'Kto odpowiada za transport?');});
test('each language gets four distinct quiz answers including the right answer',()=>{for(const lang of ['ru','en','de'])for(const p of phrases){const options=optionsFor(p,phrases,lang);assert.equal(options.length,4);assert.equal(new Set(options).size,4);assert.ok(options.includes(p[lang]));}});
test('mistakes go to review and correct answers clear review independently by language',()=>{const stats={cards:{},xp:0};recordAnswer(stats,'ru',0,false);assert.equal(stats.cards['ru:0'].review,true);assert.equal(stats.xp,0);recordAnswer(stats,'ru',0,true);assert.equal(stats.cards['ru:0'].review,false);assert.equal(stats.xp,10);assert.equal(lessonDone(stats,'ru',[0]),true);assert.equal(lessonDone(stats,'de',[0]),false);assert.equal(lessonDone(stats,'ru',[0,1]),false);});
