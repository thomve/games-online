const { v4: uuidv4 } = require('uuid');

const MAX_LEVEL = 20;

// XP required to reach each level (index = level - 1)
const XP_TABLE = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200, 4000, 5000, 6200, 7600, 9200, 11000, 13000, 15500, 18500, 22000];

function xpForLevel(level) {
  return XP_TABLE[Math.min(level - 1, MAX_LEVEL - 1)] || 0;
}

function xpForNextLevel(level) {
  if (level >= MAX_LEVEL) return null;
  return XP_TABLE[level] || null;
}

const BASE_STATS = {
  health: 100, maxHealth: 100,
  mana: 60, maxMana: 60,
  force: 5,
  dexterity: 5,
  haste: 5,
  stamina: 5,
  intellect: 5,
  armor: 0,
  damage: 8,
};

function createCharacter(name) {
  return {
    id: uuidv4(),
    name,
    level: 1,
    xp: 0,
    gold: 20,
    stats: { ...BASE_STATS },
    equipment: {
      weapon: null,
      head: null,
      chest: null,
      legs: null,
      hands: null,
      feet: null,
      neck: null,
      ring: null,
    },
    inventory: [],
    itemLevel: 0,
    createdAt: new Date().toISOString(),
    defeatedBosses: [],
    completedDungeons: [],
  };
}

function computeStats(character) {
  const base = {
    maxHealth: 100 + (character.level - 1) * 12 + (character.stats.stamina || 5) * 4,
    maxMana: 60 + (character.level - 1) * 8 + (character.stats.intellect || 5) * 3,
    force: 5 + Math.floor((character.level - 1) * 0.8),
    dexterity: 5 + Math.floor((character.level - 1) * 0.6),
    haste: 5 + Math.floor((character.level - 1) * 0.5),
    stamina: 5 + Math.floor((character.level - 1) * 0.7),
    intellect: 5 + Math.floor((character.level - 1) * 0.6),
    armor: 0,
    damage: 5 + character.level * 2,
  };

  // Add equipment bonuses
  for (const item of Object.values(character.equipment)) {
    if (!item) continue;
    if (item.stats) {
      for (const [k, v] of Object.entries(item.stats)) {
        if (k === 'health') { base.maxHealth += v; continue; }
        if (k === 'mana') { base.maxMana += v; continue; }
        base[k] = (base[k] || 0) + v;
      }
    }
    if (item.damage) base.damage += item.damage;
    if (item.armor) base.armor += item.armor;
  }

  // Haste increases effective damage by reducing cooldowns
  base.attackSpeed = 1 + base.haste * 0.01;
  base.critChance = Math.min(50, 5 + base.dexterity * 0.5); // % crit chance
  base.critMultiplier = 1.5 + base.force * 0.01;

  return base;
}

function computeItemLevel(equipment) {
  const equippedItems = Object.values(equipment).filter(Boolean);
  if (equippedItems.length === 0) return 0;
  const total = equippedItems.reduce((sum, item) => sum + item.itemLevel, 0);
  return Math.round(total / equippedItems.length);
}

function gainXP(character, amount) {
  if (character.level >= MAX_LEVEL) return { leveledUp: false, levelsGained: 0 };

  character.xp += amount;
  let levelsGained = 0;

  while (character.level < MAX_LEVEL) {
    const needed = xpForNextLevel(character.level);
    if (needed === null || character.xp < needed) break;
    character.xp -= needed;
    character.level++;
    levelsGained++;

    // Level up bonuses
    const computedStats = computeStats(character);
    character.stats = computedStats;
    // Restore health/mana on level up
    character.stats.health = computedStats.maxHealth;
    character.stats.mana = computedStats.maxMana;
  }

  return { leveledUp: levelsGained > 0, levelsGained };
}

function equipItem(character, item) {
  const slot = item.slot;
  if (!Object.prototype.hasOwnProperty.call(character.equipment, slot)) {
    return { success: false, error: 'Invalid equipment slot' };
  }

  // Return old item to inventory if any
  const old = character.equipment[slot];
  if (old) {
    character.inventory.push(old);
  }

  character.equipment[slot] = item;

  // Remove from inventory
  const idx = character.inventory.findIndex(i => i.id === item.id);
  if (idx !== -1) character.inventory.splice(idx, 1);

  // Recompute stats
  character.stats = computeStats(character);
  character.itemLevel = computeItemLevel(character.equipment);

  return { success: true };
}

function unequipItem(character, slot) {
  const item = character.equipment[slot];
  if (!item) return { success: false, error: 'Nothing equipped in that slot' };

  character.inventory.push(item);
  character.equipment[slot] = null;
  character.stats = computeStats(character);
  character.itemLevel = computeItemLevel(character.equipment);

  return { success: true, item };
}

function addToInventory(character, items) {
  const MAX_INVENTORY = 40;
  const added = [];
  const overflow = [];

  for (const item of items) {
    if (character.inventory.length < MAX_INVENTORY) {
      character.inventory.push(item);
      added.push(item);
    } else {
      overflow.push(item);
    }
  }
  return { added, overflow };
}

function useConsumable(character, itemId) {
  const idx = character.inventory.findIndex(i => i.id === itemId);
  if (idx === -1) return { success: false, error: 'Item not in inventory' };

  const item = character.inventory[idx];
  if (item.slot !== 'consumable') return { success: false, error: 'Item is not consumable' };

  const stats = character.stats;
  const effect = {};

  if (item.effect?.health) {
    const healed = Math.min(item.effect.health, stats.maxHealth - stats.health);
    stats.health = Math.min(stats.maxHealth, stats.health + item.effect.health);
    effect.healthRestored = healed;
  }
  if (item.effect?.mana) {
    const restored = Math.min(item.effect.mana, stats.maxMana - stats.mana);
    stats.mana = Math.min(stats.maxMana, stats.mana + item.effect.mana);
    effect.manaRestored = restored;
  }

  character.inventory.splice(idx, 1);
  return { success: true, effect };
}

module.exports = { createCharacter, computeStats, computeItemLevel, gainXP, equipItem, unequipItem, addToInventory, useConsumable, xpForNextLevel, MAX_LEVEL, XP_TABLE };
