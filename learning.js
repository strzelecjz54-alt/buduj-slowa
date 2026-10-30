export function shuffled(items) { return [...items].sort(() => Math.random() - 0.5); }
export function optionsFor(answer, pool, lang) {
  const alternatives = [...new Set(pool.filter(p => p.id !== answer.id).map(p => p[lang]))].filter(v => v !== answer[lang]);
  return shuffled([answer[lang], ...shuffled(alternatives).slice(0, 3)]);
}
export function recordAnswer(stats, lang, id, correct, needsReview = false) {
  const key = `${lang}:${id}`;
  const entry = stats.cards[key] || { hits: 0, misses: 0 };
  if (correct) entry.hits++; else entry.misses++;
  entry.review = !correct || needsReview;
  stats.cards[key] = entry;
  if (correct) stats.xp += 10;
}
export function lessonDone(stats, lang, ids) { return ids.every(id => stats.cards[`${lang}:${id}`]?.hits > 0); }
