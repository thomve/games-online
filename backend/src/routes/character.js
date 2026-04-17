const express = require('express');
const router = express.Router();
const { createCharacter, equipItem, unequipItem, addToInventory, useConsumable, computeStats, xpForNextLevel, MAX_LEVEL } = require('../services/character');

// In-memory store (single character for now)
const store = { character: null };

router.post('/create', (req, res) => {
  const { name } = req.body;
  if (!name || name.trim().length < 2) return res.status(400).json({ error: 'Name must be at least 2 characters' });
  store.character = createCharacter(name.trim());
  res.json(store.character);
});

router.get('/', (req, res) => {
  if (!store.character) return res.status(404).json({ error: 'No character found' });
  const char = store.character;
  const nextLevelXp = xpForNextLevel(char.level);
  res.json({ ...char, nextLevelXp, maxLevel: MAX_LEVEL });
});

router.post('/equip', (req, res) => {
  if (!store.character) return res.status(404).json({ error: 'No character' });
  const { itemId } = req.body;
  const item = store.character.inventory.find(i => i.id === itemId);
  if (!item) return res.status(404).json({ error: 'Item not found in inventory' });

  const result = equipItem(store.character, item);
  if (!result.success) return res.status(400).json({ error: result.error });

  res.json({ character: store.character });
});

router.post('/unequip', (req, res) => {
  if (!store.character) return res.status(404).json({ error: 'No character' });
  const { slot } = req.body;
  const result = unequipItem(store.character, slot);
  if (!result.success) return res.status(400).json({ error: result.error });
  res.json({ character: store.character });
});

router.post('/use-item', (req, res) => {
  if (!store.character) return res.status(404).json({ error: 'No character' });
  const { itemId } = req.body;
  const result = useConsumable(store.character, itemId);
  if (!result.success) return res.status(400).json({ error: result.error });
  res.json({ character: store.character, effect: result.effect });
});

router.delete('/inventory/:itemId', (req, res) => {
  if (!store.character) return res.status(404).json({ error: 'No character' });
  const idx = store.character.inventory.findIndex(i => i.id === req.params.itemId);
  if (idx === -1) return res.status(404).json({ error: 'Item not found' });
  store.character.inventory.splice(idx, 1);
  res.json({ character: store.character });
});

module.exports = { router, store };
