import { wordMeanings } from './word-data.js?v=13';
export function normalizeWord(word) { return word.normalize('NFKC').toLocaleLowerCase().replaceAll('’', "'"); }
export function wordParts(text) {
  const result = [];
  const pattern = /[\p{L}\p{M}\p{N}]+(?:[’'-][\p{L}\p{M}\p{N}]+)*/gu;
  let offset = 0;
  for (const match of text.matchAll(pattern)) {
    if (match.index > offset) result.push({ text: text.slice(offset, match.index), word: false });
    result.push({ text: match[0], word: true });
    offset = match.index + match[0].length;
  }
  if (offset < text.length) result.push({ text: text.slice(offset), word: false });
  return result;
}
export function lookupWord(word, lang) { return wordMeanings[lang]?.[normalizeWord(word)] || null; }
export function phraseMeanings(expression, lang, phrases) {
  return [...new Set(phrases.filter(p => p[lang] === expression).map(p => p.pl))];
}
