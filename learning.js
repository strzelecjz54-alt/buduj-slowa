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
export function optionsFor(answer, pool, lang) {
  const alternatives = [...new Set(pool.filter(p => p.id !== answer.id).map(p => p[lang]))].filter(v => v !== answer[lang]);
  return shuffled([answer[lang], ...shuffled(alternatives).slice(0, 3)]);
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
