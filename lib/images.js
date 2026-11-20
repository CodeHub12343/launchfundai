// Stable Unsplash photo IDs. Loaded via CSS background-image so no Next.js
// remote image config is required. Preserve aspect with cover.
const u = (id, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

export const img = {
  // Campaign thumbnails
  smartLight: u('1558002038-1055907df827'),
  coldBrew: u('1559056199-641a0ac8b55e'),
  laptop: u('1517336714731-489689fd1ca8'),
  tabletop: u('1511512578047-dfb367046420'),
  jacket: u('1490481651871-ab68de25d43d'),
  workbench: u('1581235720704-06d3acfcb36f'),
  compass: u('1519904981063-b0cf448d479e'),
  headphones: u('1505740420928-5e560c06d30e'),
  keyboard: u('1587829741301-dc798b83add3'),

  // Hero / studio
  heroProduct: u('1558002038-1055907df827', 1600),
  studioDesk: u('1517336714731-489689fd1ca8', 1600),
  teamWorking: u('1552664730-d307ca884978', 1400),

  // Avatars (generic placeholders; not currently wired into UI)
  avatar1: u('1494790108377-be9c29b29330', 160),
  avatar2: u('1500648767791-00dcc994a43e', 160),
  avatar3: u('1438761681033-6461ffad8d80', 160),
  avatar4: u('1507003211169-0a1dd7228f2d', 160),
  avatar5: u('1487412720507-e7ab37603c6f', 160),
  avatar6: u('1472099645785-5658abf4ff4e', 160),
};

export const campaignGallery = [img.smartLight, img.laptop, img.tabletop, img.headphones];

export const category = {
  hardware: u('1518770660439-4636190af475', 800),
  tech: u('1517336714731-489689fd1ca8', 800),
  games: u('1511512578047-dfb367046420', 800),
  food: u('1559056199-641a0ac8b55e', 800),
  fashion: u('1490481651871-ab68de25d43d', 800),
  home: u('1581235720704-06d3acfcb36f', 800),
  publishing: u('1481627834876-b7833e8f5570', 800),
  travel: u('1473968512647-3e447244af8f', 800),
};

export const caseStudy = u('1552664730-d307ca884978', 1400);
export const pressWorkspace = u('1522071820081-009f0129c71c', 1200);
