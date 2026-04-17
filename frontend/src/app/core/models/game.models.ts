export type ItemSlot = 'weapon' | 'head' | 'chest' | 'legs' | 'hands' | 'feet' | 'neck' | 'ring' | 'consumable';
export type ItemQuality = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface ItemStats {
  health?: number;
  mana?: number;
  force?: number;
  dexterity?: number;
  haste?: number;
  stamina?: number;
  intellect?: number;
}

export interface Item {
  id: string;
  templateId: string;
  name: string;
  slot: ItemSlot;
  type?: string;
  quality: ItemQuality;
  qualityColor: string;
  itemLevel: number;
  stats?: ItemStats;
  damage?: number;
  armor?: number;
  effect?: { health?: number; mana?: number };
}

export interface CharacterStats {
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  force: number;
  dexterity: number;
  haste: number;
  stamina: number;
  intellect: number;
  armor: number;
  damage: number;
  critChance?: number;
  critMultiplier?: number;
  attackSpeed?: number;
}

export interface Equipment {
  weapon: Item | null;
  head: Item | null;
  chest: Item | null;
  legs: Item | null;
  hands: Item | null;
  feet: Item | null;
  neck: Item | null;
  ring: Item | null;
  [slot: string]: Item | null;
}

export interface Character {
  id: string;
  name: string;
  level: number;
  xp: number;
  nextLevelXp: number | null;
  maxLevel: number;
  gold: number;
  stats: CharacterStats;
  equipment: Equipment;
  inventory: Item[];
  itemLevel: number;
  defeatedBosses: string[];
  completedDungeons: string[];
  createdAt: string;
}

export interface Mob {
  id: string;
  name: string;
  zone: string;
  level: number;
  health: number;
  maxHealth: number;
  damage: number;
  armor: number;
  xpReward: number;
  goldReward: number;
  icon: string;
  isBoss?: boolean;
  description?: string;
}

export interface CombatLogEntry {
  actor: 'player' | 'mob' | 'system';
  type: 'attack' | 'crit' | 'victory' | 'defeat' | 'loot' | 'flee' | 'timeout';
  damage?: number;
  message: string;
  mobHealthAfter: number;
  playerHealthAfter: number;
}

export interface Combat {
  id: string;
  character: { stats: CharacterStats };
  mob: Mob;
  log: CombatLogEntry[];
  turn: number;
  status: 'ongoing' | 'victory' | 'defeat' | 'fled';
  loot: Item[];
  xpGained: number;
  goldGained: number;
  leveledUp?: boolean;
  levelsGained?: number;
  characterAfter?: Character;
}

export interface Zone {
  id: string;
  name: string;
  description: string;
  recommendedLevel: string;
  minLevel: number;
  maxLevel: number;
  icon: string;
  color: string;
  accessible: boolean;
}

export interface Dungeon {
  id: string;
  name: string;
  zone: string;
  description: string;
  requiredLevel: number;
  recommendedLevel: string;
  bossId: string;
  icon: string;
  mobCount: number;
  accessible: boolean;
  completed: boolean;
  bossDefeated: boolean;
}
