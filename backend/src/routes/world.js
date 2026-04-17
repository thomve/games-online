const express = require('express');
const router = express.Router();
const { ZONES, DUNGEONS } = require('../data/zones');
const { getRandomMobForZone, BOSSES, scaleBoss } = require('../data/mobs');
const { startCombat, processTurn, applyCombatResult } = require('../services/combat');
const { addToInventory, computeStats } = require('../services/character');
const { store } = require('./character');

// Active combat sessions
const activeCombats = new Map();

router.get('/zones', (req, res) => {
  const char = store.character;
  const zones = ZONES.map(z => ({
    ...z,
    accessible: !char || char.level >= z.minLevel - 2,
  }));
  res.json(zones);
});

router.get('/dungeons', (req, res) => {
  const char = store.character;
  const dungeons = DUNGEONS.map(d => ({
    ...d,
    accessible: !char || char.level >= d.requiredLevel,
    completed: char ? char.completedDungeons?.includes(d.id) : false,
    bossDefeated: char ? char.defeatedBosses?.includes(d.bossId) : false,
  }));
  res.json(dungeons);
});

// Start a random encounter in a zone
router.post('/explore/:zoneId', (req, res) => {
  const char = store.character;
  if (!char) return res.status(404).json({ error: 'No character' });

  const zone = ZONES.find(z => z.id === req.params.zoneId);
  if (!zone) return res.status(404).json({ error: 'Zone not found' });

  const mob = getRandomMobForZone(zone.id, char.level);
  if (!mob) return res.status(400).json({ error: 'No mobs available for this zone' });

  const combat = startCombat(char, mob);
  activeCombats.set(combat.id, combat);

  res.json({ combatId: combat.id, mob, combat });
});

// Start dungeon encounter (mob or boss)
router.post('/dungeon/:dungeonId/start', (req, res) => {
  const char = store.character;
  if (!char) return res.status(404).json({ error: 'No character' });

  const dungeon = DUNGEONS.find(d => d.id === req.params.dungeonId);
  if (!dungeon) return res.status(404).json({ error: 'Dungeon not found' });

  if (char.level < dungeon.requiredLevel) {
    return res.status(400).json({ error: `Requires level ${dungeon.requiredLevel}` });
  }

  const boss = BOSSES.find(b => b.id === dungeon.bossId);
  if (!boss) return res.status(400).json({ error: 'Boss not found' });

  const scaledBoss = scaleBoss(boss);
  const combat = startCombat(char, scaledBoss);
  activeCombats.set(combat.id, combat);

  res.json({ combatId: combat.id, mob: scaledBoss, combat });
});

// Get combat state
router.get('/combat/:combatId', (req, res) => {
  const combat = activeCombats.get(req.params.combatId);
  if (!combat) return res.status(404).json({ error: 'Combat not found' });
  res.json(combat);
});

// Process one turn
router.post('/combat/:combatId/turn', (req, res) => {
  const combat = activeCombats.get(req.params.combatId);
  if (!combat) return res.status(404).json({ error: 'Combat not found' });
  if (combat.status !== 'ongoing') return res.json({ combat, alreadyFinished: true });

  processTurn(combat);

  // If combat ended, apply results to character
  if (combat.status !== 'ongoing') {
    const char = store.character;
    const { leveledUp, levelsGained } = applyCombatResult(char, combat);

    if (combat.status === 'victory') {
      const { added } = addToInventory(char, combat.loot);
      combat.addedToInventory = added;

      // Track boss defeat
      if (combat.mob.isBoss) {
        if (!char.defeatedBosses) char.defeatedBosses = [];
        if (!char.defeatedBosses.includes(combat.mob.id)) {
          char.defeatedBosses.push(combat.mob.id);
        }
        // Find dungeon for this boss and mark complete
        const { DUNGEONS } = require('../data/zones');
        const dungeon = DUNGEONS.find(d => d.bossId === combat.mob.id);
        if (dungeon) {
          if (!char.completedDungeons) char.completedDungeons = [];
          if (!char.completedDungeons.includes(dungeon.id)) {
            char.completedDungeons.push(dungeon.id);
          }
        }
      }
    }

    combat.leveledUp = leveledUp;
    combat.levelsGained = levelsGained;
    combat.characterAfter = { ...char };
    activeCombats.delete(req.params.combatId);
    activeCombats.set(req.params.combatId + '_done', combat);
  }

  res.json({ combat });
});

// Flee combat
router.post('/combat/:combatId/flee', (req, res) => {
  const combat = activeCombats.get(req.params.combatId);
  if (!combat) return res.status(404).json({ error: 'Combat not found' });

  const fleePenalty = Math.round((combat.character.stats.maxHealth || 100) * 0.05);
  const char = store.character;
  char.stats.health = Math.max(1, char.stats.health - fleePenalty);
  combat.status = 'fled';
  combat.log.push({ actor: 'system', type: 'flee', message: `You flee the battle, taking ${fleePenalty} damage in the process.` });

  activeCombats.delete(req.params.combatId);
  res.json({ combat, character: char });
});

module.exports = router;
