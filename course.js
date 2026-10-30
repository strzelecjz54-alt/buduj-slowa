import { phrases, courseModules } from './data.js?v=13';
// Keep the source order and module boundaries; avoid a tiny last lesson.
export const modules = courseModules.map(module => {
  const pool = phrases.filter(p => p.moduleId === module.id);
  const count = Math.ceil(pool.length / 5);
  const size = Math.floor(pool.length / count);
  const remainder = pool.length % count;
  let offset = 0;
  const lessons = Array.from({ length: count }, (_, index) => {
    const length = size + (index < remainder ? 1 : 0);
    const cards = pool.slice(offset, offset + length);
    offset += length;
    return { id: `${module.id}-${index + 1}`, number: index + 1, phrases: cards };
  });
  return { ...module, phrases: pool, lessons };
});
export const lessons = modules.flatMap(module => module.lessons);
