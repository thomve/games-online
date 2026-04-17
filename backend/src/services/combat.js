const { gainXP, computeStats } = require('./character');
const { generateLoot } = require('../data/items');

function rollDamage(attacker, isPlayer = true) {
  let base = isPlayer ? (attacker.stats?.damage || attacker.damage || 8) : (attacker.damage || 8);
  const variance = 0.15;
  const roll = base * (1 - variance + Math.random() * variance * 2);

  const critChance = isPlayer ? (attacker.stats?.critChance || 5) : 5;
  const isCrit = Math.random() * 100 < critChance;
  const critMult = isPlayer ? (attacker.stats?.critMultiplier || 1.5) : 1.5;

  const dmg = Math.round(isCrit ? roll * critMult : roll);
  return { damage: dmg, isCrit };
}

function mitigate(damage, armor) {
  // Armor reduces damage: DR% = armor / (armor + 100)
  const dr = armor / (armor + 100);
  return Math.max(1, Math.round(damage * (1 - dr)));
}

function startCombat(character, mob) {
  return {
    id: `combat_${Date.now()}`,
    character: { ...character },
    mob: { ...mob },
    log: [],
    turn: 1,
    status: 'ongoing', // ongoing | victory | defeat
    loot: [],
    xpGained: 0,
    goldGained: 0,
  };
}

function playerAttack(combat) {
  if (combat.status !== 'ongoing') return combat;

  const { damage, isCrit } = rollDamage(combat.character, true);
  const reduced = mitigate(damage, combat.mob.armor || 0);
  combat.mob.health = Math.max(0, combat.mob.health - reduced);

  const entry = {
    actor: 'player',
    type: isCrit ? 'crit' : 'attack',
    damage: reduced,
    message: isCrit
      ? `You strike a CRITICAL hit for ${reduced} damage!`
      : `You attack for ${reduced} damage.`,
    mobHealthAfter: combat.mob.health,
    playerHealthAfter: combat.character.stats.health,
  };
  combat.log.push(entry);

  if (combat.mob.health <= 0) {
    combat.status = 'victory';
    resolveCombatVictory(combat);
  }

  return combat;
}

function mobAttack(combat) {
  if (combat.status !== 'ongoing') return combat;

  const { damage, isCrit } = rollDamage(combat.mob, false);
  const reduced = mitigate(damage, combat.character.stats?.armor || 0);
  combat.character.stats.health = Math.max(0, combat.character.stats.health - reduced);

  const entry = {
    actor: 'mob',
    type: isCrit ? 'crit' : 'attack',
    damage: reduced,
    message: isCrit
      ? `${combat.mob.name} lands a CRITICAL hit for ${reduced} damage!`
      : `${combat.mob.name} attacks for ${reduced} damage.`,
    mobHealthAfter: combat.mob.health,
    playerHealthAfter: combat.character.stats.health,
  };
  combat.log.push(entry);

  if (combat.character.stats.health <= 0) {
    combat.status = 'defeat';
    entry.message += ' You have been defeated!';
  }

  return combat;
}

function processTurn(combat) {
  if (combat.status !== 'ongoing') return combat;

  // Player attacks first (haste could change order in future)
  playerAttack(combat);
  if (combat.status === 'victory') return combat;

  // Mob retaliates
  mobAttack(combat);
  combat.turn++;

  return combat;
}

function resolveCombatVictory(combat) {
  const mob = combat.mob;
  const xp = mob.xpReward || 20;
  const gold = mob.goldReward || 5;

  combat.xpGained = xp;
  combat.goldGained = gold;

  const loot = generateLoot(mob.level || 1, mob.isBoss || false);
  combat.loot = loot;

  combat.log.push({
    actor: 'system',
    type: 'victory',
    message: `${mob.name} has been slain! You gain ${xp} XP and ${gold} gold.`,
    mobHealthAfter: 0,
    playerHealthAfter: combat.character.stats.health,
  });

  if (loot.length > 0) {
    combat.log.push({
      actor: 'system',
      type: 'loot',
      message: `Loot obtained: ${loot.map(i => i.name).join(', ')}`,
      mobHealthAfter: 0,
      playerHealthAfter: combat.character.stats.health,
    });
  }
}

function applyCombatResult(character, combat) {
  if (combat.status === 'victory') {
    character.gold += combat.goldGained;
    const { leveledUp, levelsGained } = gainXP(character, combat.xpGained);
    character.stats.health = combat.character.stats.health;
    return { leveledUp, levelsGained };
  } else if (combat.status === 'defeat') {
    // Penalize: lose 10% gold, restore to 20% health
    character.gold = Math.max(0, Math.floor(character.gold * 0.9));
    const computed = computeStats(character);
    character.stats = computed;
    character.stats.health = Math.floor(computed.maxHealth * 0.2);
    return { leveledUp: false, levelsGained: 0 };
  }
  return { leveledUp: false, levelsGained: 0 };
}

// Simulate full auto-combat (for non-interactive mode)
function simulateCombat(character, mob) {
  const combat = startCombat(character, mob);
  const MAX_TURNS = 50;

  while (combat.status === 'ongoing' && combat.turn <= MAX_TURNS) {
    processTurn(combat);
  }

  if (combat.status === 'ongoing') {
    combat.status = 'defeat';
    combat.log.push({ actor: 'system', type: 'timeout', message: 'The fight dragged on too long and you fled!' });
  }

  return combat;
}

module.exports = { startCombat, playerAttack, mobAttack, processTurn, applyCombatResult, simulateCombat };
