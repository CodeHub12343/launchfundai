export const CATEGORY_GROUPS = [
  {
    group: 'Technology',
    items: [
      { key: 'Hardware', icon: '🔌', hint: 'Electronics, gadgets, accessories' },
      { key: 'Tech', icon: '💻', hint: 'Software, apps, SaaS, AI tools' },
      { key: 'Robotics', icon: '🤖', hint: 'Robots, drones, automation' },
      { key: 'Wearables', icon: '⌚', hint: 'Watches, fitness trackers, AR' },
    ],
  },
  {
    group: 'Creative',
    items: [
      { key: 'Games', icon: '🎮', hint: 'Video games, tabletop, card' },
      { key: 'Film & Video', icon: '🎬', hint: 'Shorts, features, documentary' },
      { key: 'Music', icon: '🎵', hint: 'Albums, instruments, labels' },
      { key: 'Art', icon: '🎨', hint: 'Fine art, illustration, prints' },
      { key: 'Photography', icon: '📷', hint: 'Books, exhibitions, gear' },
      { key: 'Publishing', icon: '📚', hint: 'Books, zines, comics' },
      { key: 'Design', icon: '✏️', hint: 'Product, graphic, industrial' },
    ],
  },
  {
    group: 'Lifestyle',
    items: [
      { key: 'Fashion', icon: '👕', hint: 'Apparel, footwear, accessories' },
      { key: 'Beauty', icon: '💄', hint: 'Skincare, cosmetics, grooming' },
      { key: 'Home', icon: '🏠', hint: 'Furniture, kitchen, decor' },
      { key: 'Food & Beverage', icon: '🍴', hint: 'Snacks, drinks, kitchen goods' },
      { key: 'Health & Wellness', icon: '🧘', hint: 'Fitness, mental, nutrition' },
      { key: 'Sports & Outdoors', icon: '⛺', hint: 'Gear, apparel, adventure' },
      { key: 'Travel', icon: '✈️', hint: 'Gear, guides, experiences' },
      { key: 'Pets', icon: '🐾', hint: 'Food, toys, tech for pets' },
    ],
  },
  {
    group: 'Community',
    items: [
      { key: 'Education', icon: '🎓', hint: 'Courses, kits, tools for learning' },
      { key: 'Social Impact', icon: '🌱', hint: 'Nonprofits, climate, equity' },
      { key: 'Toys', icon: '🧸', hint: 'Kids, collectibles, puzzles' },
      { key: 'Crafts & DIY', icon: '🧵', hint: 'Kits, materials, how-to' },
      { key: 'Automotive', icon: '🚗', hint: 'EVs, parts, after-market' },
      { key: 'Other', icon: '✨', hint: "Doesn't fit the list above" },
    ],
  },
];

export const CATEGORIES = CATEGORY_GROUPS.flatMap((g) => g.items.map((i) => i.key));

export function iconFor(key) {
  for (const g of CATEGORY_GROUPS) {
    const hit = g.items.find((i) => i.key === key);
    if (hit) return hit.icon;
  }
  return '✨';
}
