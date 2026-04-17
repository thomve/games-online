const MOBS = [
  // Forest Zone (lvl 1-5)
  { id: 'wolf', name: 'Forest Wolf', zone: 'forest', minLevel: 1, maxLevel: 4, baseHealth: 40, baseDamage: 6, baseArmor: 2, xpReward: 15, goldReward: 3, icon: '🐺' },
  { id: 'goblin', name: 'Goblin Scout', zone: 'forest', minLevel: 1, maxLevel: 4, baseHealth: 30, baseDamage: 5, baseArmor: 1, xpReward: 12, goldReward: 5, icon: '👺' },
  { id: 'boar', name: 'Wild Boar', zone: 'forest', minLevel: 2, maxLevel: 5, baseHealth: 60, baseDamage: 8, baseArmor: 3, xpReward: 18, goldReward: 4, icon: '🐗' },
  { id: 'bandit', name: 'Bandit Thug', zone: 'forest', minLevel: 3, maxLevel: 6, baseHealth: 55, baseDamage: 10, baseArmor: 4, xpReward: 22, goldReward: 8, icon: '🗡️' },
  // Swamp Zone (lvl 4-9)
  { id: 'toad', name: 'Swamp Toad', zone: 'swamp', minLevel: 4, maxLevel: 7, baseHealth: 70, baseDamage: 12, baseArmor: 3, xpReward: 28, goldReward: 6, icon: '🐸' },
  { id: 'snake', name: 'Venomous Snake', zone: 'swamp', minLevel: 4, maxLevel: 8, baseHealth: 50, baseDamage: 15, baseArmor: 2, xpReward: 30, goldReward: 5, icon: '🐍' },
  { id: 'troll', name: 'Swamp Troll', zone: 'swamp', minLevel: 6, maxLevel: 9, baseHealth: 120, baseDamage: 18, baseArmor: 6, xpReward: 45, goldReward: 12, icon: '👹' },
  { id: 'witch', name: 'Bog Witch', zone: 'swamp', minLevel: 6, maxLevel: 9, baseHealth: 80, baseDamage: 22, baseArmor: 3, xpReward: 50, goldReward: 15, icon: '🧙' },
  // Mountains (lvl 8-13)
  { id: 'harpy', name: 'Stone Harpy', zone: 'mountains', minLevel: 8, maxLevel: 12, baseHealth: 100, baseDamage: 25, baseArmor: 5, xpReward: 65, goldReward: 18, icon: '🦅' },
  { id: 'golem', name: 'Rock Golem', zone: 'mountains', minLevel: 9, maxLevel: 13, baseHealth: 200, baseDamage: 20, baseArmor: 15, xpReward: 80, goldReward: 20, icon: '🪨' },
  { id: 'wyvern', name: 'Mountain Wyvern', zone: 'mountains', minLevel: 10, maxLevel: 13, baseHealth: 150, baseDamage: 30, baseArmor: 8, xpReward: 90, goldReward: 25, icon: '🐉' },
  // Volcano (lvl 12-17)
  { id: 'fire_elemental', name: 'Fire Elemental', zone: 'volcano', minLevel: 12, maxLevel: 16, baseHealth: 180, baseDamage: 40, baseArmor: 6, xpReward: 120, goldReward: 30, icon: '🔥' },
  { id: 'demon', name: 'Lava Demon', zone: 'volcano', minLevel: 13, maxLevel: 17, baseHealth: 220, baseDamage: 45, baseArmor: 10, xpReward: 140, goldReward: 35, icon: '😈' },
  { id: 'magma_giant', name: 'Magma Giant', zone: 'volcano', minLevel: 14, maxLevel: 17, baseHealth: 320, baseDamage: 38, baseArmor: 18, xpReward: 160, goldReward: 40, icon: '🌋' },
  // Shadow Realm (lvl 16-20)
  { id: 'shadow_wraith', name: 'Shadow Wraith', zone: 'shadow_realm', minLevel: 16, maxLevel: 19, baseHealth: 280, baseDamage: 55, baseArmor: 8, xpReward: 200, goldReward: 50, icon: '👻' },
  { id: 'void_knight', name: 'Void Knight', zone: 'shadow_realm', minLevel: 17, maxLevel: 20, baseHealth: 380, baseDamage: 60, baseArmor: 20, xpReward: 250, goldReward: 60, icon: '⚔️' },
];

const BOSSES = [
  { id: 'goblin_king', name: 'Goblin King', dungeon: 'goblin_lair', level: 5, baseHealth: 400, baseDamage: 18, baseArmor: 8, xpReward: 200, goldReward: 50, icon: '👑', description: 'The cunning ruler of the goblin clan.' },
  { id: 'swamp_hydra', name: 'Hydra of the Swamp', dungeon: 'sunken_temple', level: 9, baseHealth: 800, baseDamage: 35, baseArmor: 12, xpReward: 450, goldReward: 100, icon: '🐲', description: 'A three-headed beast lurking in ancient ruins.' },
  { id: 'stone_titan', name: 'Stone Titan', dungeon: 'crystal_caverns', level: 13, baseHealth: 1400, baseDamage: 50, baseArmor: 25, xpReward: 800, goldReward: 180, icon: '🗿', description: 'An ancient colossus awakened by tremors.' },
  { id: 'inferno_lord', name: 'Lord of Inferno', dungeon: 'volcano_fortress', level: 17, baseHealth: 2200, baseDamage: 75, baseArmor: 30, xpReward: 1400, goldReward: 300, icon: '👿', description: 'A demon prince who commands the flames.' },
  { id: 'shadow_emperor', name: 'Shadow Emperor', dungeon: 'void_citadel', level: 20, baseHealth: 4000, baseDamage: 100, baseArmor: 40, xpReward: 3000, goldReward: 600, icon: '🌑', description: 'The final challenge awaiting the worthy hero.' },
];

function scaleMob(mobTemplate, level) {
  const scale = 1 + (level - 1) * 0.2;
  return {
    ...mobTemplate,
    level,
    health: Math.round(mobTemplate.baseHealth * scale),
    maxHealth: Math.round(mobTemplate.baseHealth * scale),
    damage: Math.round(mobTemplate.baseDamage * scale),
    armor: Math.round(mobTemplate.baseArmor * scale),
    xpReward: Math.round(mobTemplate.xpReward * scale),
    goldReward: Math.round(mobTemplate.goldReward * scale),
  };
}

function scaleBoss(bossTemplate) {
  const level = bossTemplate.level;
  const scale = 1 + (level - 1) * 0.25;
  return {
    ...bossTemplate,
    health: Math.round(bossTemplate.baseHealth * scale),
    maxHealth: Math.round(bossTemplate.baseHealth * scale),
    damage: Math.round(bossTemplate.baseDamage * scale),
    armor: Math.round(bossTemplate.baseArmor * scale),
    isBoss: true,
  };
}

function getRandomMobForZone(zone, playerLevel) {
  const eligible = MOBS.filter(m => m.zone === zone && m.minLevel <= playerLevel + 2 && m.maxLevel >= playerLevel - 2);
  if (eligible.length === 0) return null;
  const template = eligible[Math.floor(Math.random() * eligible.length)];
  const level = Math.max(1, Math.min(20, playerLevel + Math.floor(Math.random() * 3) - 1));
  return scaleMob(template, level);
}

module.exports = { MOBS, BOSSES, scaleMob, scaleBoss, getRandomMobForZone };
