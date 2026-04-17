// Item templates grouped by slot and quality
const QUALITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
const QUALITY_COLORS = { common: '#6b7280', uncommon: '#22c55e', rare: '#3b82f6', epic: '#a855f7', legendary: '#f97316' };
const QUALITY_MULTIPLIERS = { common: 1, uncommon: 1.3, rare: 1.7, epic: 2.3, legendary: 3.2 };

const ITEM_TEMPLATES = [
  // Weapons
  { id: 'sword_1', name: 'Iron Sword', slot: 'weapon', type: 'sword', baseStats: { force: 4, dexterity: 1 }, baseDamage: 8, baseItemLevel: 1 },
  { id: 'sword_2', name: 'Steel Blade', slot: 'weapon', type: 'sword', baseStats: { force: 7, dexterity: 2 }, baseDamage: 14, baseItemLevel: 5 },
  { id: 'sword_3', name: 'Mithril Longsword', slot: 'weapon', type: 'sword', baseStats: { force: 12, dexterity: 4 }, baseDamage: 22, baseItemLevel: 10 },
  { id: 'sword_4', name: 'Runic Claymore', slot: 'weapon', type: 'sword', baseStats: { force: 20, dexterity: 6 }, baseDamage: 34, baseItemLevel: 15 },
  { id: 'staff_1', name: 'Apprentice Staff', slot: 'weapon', type: 'staff', baseStats: { mana: 20, force: 1 }, baseDamage: 6, baseItemLevel: 1 },
  { id: 'staff_2', name: 'Arcane Staff', slot: 'weapon', type: 'staff', baseStats: { mana: 40, force: 2 }, baseDamage: 11, baseItemLevel: 5 },
  { id: 'staff_3', name: 'Ethereal Rod', slot: 'weapon', type: 'staff', baseStats: { mana: 70, force: 3 }, baseDamage: 18, baseItemLevel: 10 },
  { id: 'dagger_1', name: 'Sharp Dagger', slot: 'weapon', type: 'dagger', baseStats: { dexterity: 5, haste: 3 }, baseDamage: 6, baseItemLevel: 1 },
  { id: 'dagger_2', name: 'Rogue Blade', slot: 'weapon', type: 'dagger', baseStats: { dexterity: 9, haste: 5 }, baseDamage: 10, baseItemLevel: 5 },
  { id: 'bow_1', name: 'Short Bow', slot: 'weapon', type: 'bow', baseStats: { dexterity: 6, haste: 2 }, baseDamage: 9, baseItemLevel: 2 },
  { id: 'bow_2', name: 'Elven Bow', slot: 'weapon', type: 'bow', baseStats: { dexterity: 11, haste: 4 }, baseDamage: 16, baseItemLevel: 8 },
  // Helmets
  { id: 'helm_1', name: 'Leather Cap', slot: 'head', baseStats: { health: 15 }, baseArmor: 5, baseItemLevel: 1 },
  { id: 'helm_2', name: 'Chain Coif', slot: 'head', baseStats: { health: 30 }, baseArmor: 12, baseItemLevel: 5 },
  { id: 'helm_3', name: 'Plate Helm', slot: 'head', baseStats: { health: 55, force: 3 }, baseArmor: 22, baseItemLevel: 10 },
  { id: 'helm_4', name: 'Warmaster Helm', slot: 'head', baseStats: { health: 90, force: 6 }, baseArmor: 36, baseItemLevel: 15 },
  // Chest
  { id: 'chest_1', name: 'Padded Tunic', slot: 'chest', baseStats: { health: 25 }, baseArmor: 8, baseItemLevel: 1 },
  { id: 'chest_2', name: 'Chain Hauberk', slot: 'chest', baseStats: { health: 50 }, baseArmor: 18, baseItemLevel: 5 },
  { id: 'chest_3', name: 'Plate Breastplate', slot: 'chest', baseStats: { health: 90, force: 4 }, baseArmor: 35, baseItemLevel: 10 },
  { id: 'chest_4', name: 'Warlord Chestplate', slot: 'chest', baseStats: { health: 140, force: 8 }, baseArmor: 55, baseItemLevel: 15 },
  // Legs
  { id: 'legs_1', name: 'Rough Leggings', slot: 'legs', baseStats: { health: 20 }, baseArmor: 6, baseItemLevel: 1 },
  { id: 'legs_2', name: 'Chain Leggings', slot: 'legs', baseStats: { health: 40 }, baseArmor: 14, baseItemLevel: 5 },
  { id: 'legs_3', name: 'Plate Greaves', slot: 'legs', baseStats: { health: 70, dexterity: 2 }, baseArmor: 28, baseItemLevel: 10 },
  // Hands
  { id: 'hands_1', name: 'Worn Gloves', slot: 'hands', baseStats: { dexterity: 3 }, baseArmor: 4, baseItemLevel: 1 },
  { id: 'hands_2', name: 'Battle Gauntlets', slot: 'hands', baseStats: { force: 3, dexterity: 2 }, baseArmor: 10, baseItemLevel: 6 },
  { id: 'hands_3', name: 'Rune Gauntlets', slot: 'hands', baseStats: { force: 5, dexterity: 4, haste: 2 }, baseArmor: 18, baseItemLevel: 12 },
  // Boots
  { id: 'boots_1', name: 'Tattered Boots', slot: 'feet', baseStats: { haste: 3 }, baseArmor: 4, baseItemLevel: 1 },
  { id: 'boots_2', name: 'Swiftstrider Boots', slot: 'feet', baseStats: { haste: 6, dexterity: 2 }, baseArmor: 9, baseItemLevel: 5 },
  { id: 'boots_3', name: 'Ironclad Sabatons', slot: 'feet', baseStats: { haste: 4, health: 30 }, baseArmor: 16, baseItemLevel: 10 },
  // Accessories
  { id: 'ring_1', name: 'Copper Ring', slot: 'ring', baseStats: { health: 10 }, baseItemLevel: 1 },
  { id: 'ring_2', name: 'Silver Ring', slot: 'ring', baseStats: { health: 20, dexterity: 1 }, baseItemLevel: 4 },
  { id: 'ring_3', name: 'Gold Ring', slot: 'ring', baseStats: { health: 35, force: 2 }, baseItemLevel: 8 },
  { id: 'ring_4', name: 'Arcane Band', slot: 'ring', baseStats: { mana: 30, health: 20 }, baseItemLevel: 6 },
  { id: 'amulet_1', name: 'Bone Necklace', slot: 'neck', baseStats: { health: 15 }, baseItemLevel: 1 },
  { id: 'amulet_2', name: 'Silver Amulet', slot: 'neck', baseStats: { health: 30, mana: 15 }, baseItemLevel: 5 },
  { id: 'amulet_3', name: 'Enchanted Pendant', slot: 'neck', baseStats: { health: 50, mana: 30, force: 2 }, baseItemLevel: 10 },
  // Consumables
  { id: 'potion_hp_s', name: 'Small Health Potion', slot: 'consumable', type: 'potion', effect: { health: 50 }, baseItemLevel: 1 },
  { id: 'potion_hp_m', name: 'Health Potion', slot: 'consumable', type: 'potion', effect: { health: 120 }, baseItemLevel: 5 },
  { id: 'potion_hp_l', name: 'Large Health Potion', slot: 'consumable', type: 'potion', effect: { health: 250 }, baseItemLevel: 10 },
  { id: 'potion_mp_s', name: 'Small Mana Potion', slot: 'consumable', type: 'potion', effect: { mana: 40 }, baseItemLevel: 1 },
  { id: 'potion_mp_m', name: 'Mana Potion', slot: 'consumable', type: 'potion', effect: { mana: 100 }, baseItemLevel: 5 },
];

function generateItem(templateId, qualityOverride, levelOverride) {
  const template = ITEM_TEMPLATES.find(t => t.id === templateId);
  if (!template) return null;

  const quality = qualityOverride || QUALITIES[Math.floor(Math.random() * 3)]; // mostly common/uncommon/rare
  const mult = QUALITY_MULTIPLIERS[quality];
  const itemLevel = levelOverride || template.baseItemLevel;

  const stats = {};
  if (template.baseStats) {
    for (const [k, v] of Object.entries(template.baseStats)) {
      stats[k] = Math.round(v * mult * (1 + itemLevel * 0.08));
    }
  }

  return {
    id: `${template.id}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    templateId: template.id,
    name: quality !== 'common' ? `${capitalize(quality)} ${template.name}` : template.name,
    slot: template.slot,
    type: template.type,
    quality,
    qualityColor: QUALITY_COLORS[quality],
    itemLevel: Math.round(itemLevel * mult),
    stats,
    damage: template.baseDamage ? Math.round(template.baseDamage * mult * (1 + itemLevel * 0.08)) : undefined,
    armor: template.baseArmor ? Math.round(template.baseArmor * mult * (1 + itemLevel * 0.08)) : undefined,
    effect: template.effect,
  };
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

function generateLoot(mobLevel, isBoss = false) {
  const items = [];
  const eligibleTemplates = ITEM_TEMPLATES.filter(t => t.slot !== 'consumable' && t.baseItemLevel <= mobLevel + 2);

  const dropCount = isBoss ? Math.floor(Math.random() * 3) + 2 : (Math.random() < 0.5 ? 1 : 0);

  for (let i = 0; i < dropCount; i++) {
    const template = eligibleTemplates[Math.floor(Math.random() * eligibleTemplates.length)];
    if (!template) continue;

    let quality;
    if (isBoss) {
      const r = Math.random();
      quality = r < 0.1 ? 'legendary' : r < 0.3 ? 'epic' : r < 0.6 ? 'rare' : 'uncommon';
    } else {
      const r = Math.random();
      quality = r < 0.02 ? 'epic' : r < 0.1 ? 'rare' : r < 0.3 ? 'uncommon' : 'common';
    }
    items.push(generateItem(template.id, quality, mobLevel));
  }

  // Always drop a potion from bosses or small chance from mobs
  if (isBoss || Math.random() < 0.3) {
    const potions = ITEM_TEMPLATES.filter(t => t.slot === 'consumable');
    const p = potions[Math.floor(Math.random() * potions.length)];
    items.push(generateItem(p.id, 'common', mobLevel));
  }

  return items;
}

module.exports = { ITEM_TEMPLATES, generateItem, generateLoot, QUALITIES, QUALITY_COLORS };
