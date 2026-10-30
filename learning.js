export function shuffled(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export function pointsForMistakes(mistakes) { return [10, 7, 4, 1][Math.min(3, Math.max(0, Math.floor(mistakes)))]; }
export function reviewQuestions(phrases, stats, lang) {
  const learned = phrases.filter(p => stats.cards[`${lang}:${p.id}`]?.hits > 0);
  if (!learned.length) return [];
  const result = [];
  while (result.length < 10) {
    const batch = shuffled(learned);
    if (batch.length > 1 && result.at(-1)?.id === batch[0].id) batch.push(batch.shift());
    result.push(...batch.slice(0, 10 - result.length));
  }
  return result;
}
// Equivalent commands must never be offered as competing answers.
const equivalentGroups = [[0,20],[5,6,23],[8,22],[9,40],[10,41],[11,27,42],[12,32],[13,33],[14,34],[15,36],[16,52],[17,53],[18,60],[19,119],[29,112]];
export function normalizedAnswer(text) {
  return text.normalize('NFKC').toLocaleLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();
}
function answerKeys(phrase, pool, lang) {
  const group = equivalentGroups.find(ids => ids.includes(phrase.id));
  const related = group ? pool.filter(p => group.includes(p.id)) : [phrase];
  return new Set([phrase, ...related].flatMap(p => p[lang].split(' / ').map(normalizedAnswer)));
}
export function optionsFor(answer, pool, lang) {
  const seen = answerKeys(answer, pool, lang);
  const alternatives = [];
  for (const phrase of shuffled(pool)) {
    if (phrase.id === answer.id) continue;
    const keys = answerKeys(phrase, pool, lang);
    if ([...keys].some(key => seen.has(key))) continue;
    alternatives.push(phrase[lang]);
    for (const key of keys) seen.add(key);
    if (alternatives.length === 3) break;
  }
  return shuffled([answer[lang], ...alternatives]);
}
export function recordAnswer(stats, lang, id, correct, needsReview = false, mistakes = 0) {
  const key = `${lang}:${id}`;
  const entry = stats.cards[key] || { hits: 0, misses: 0 };
  if (correct) entry.hits++; else entry.misses++;
  entry.review = !correct || needsReview;
  stats.cards[key] = entry;
  const points = correct ? pointsForMistakes(mistakes) : 0;
  stats.xp += points;
  return points;
}
export function lessonDone(stats, lang, ids) { return ids.every(id => stats.cards[`${lang}:${id}`]?.hits > 0); }
