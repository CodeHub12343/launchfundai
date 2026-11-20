export function slugify(input) {
  return String(input || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

export function randSuffix(n = 4) {
  return Math.random().toString(36).slice(2, 2 + n);
}
