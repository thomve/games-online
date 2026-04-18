const express = require('express');
const router = express.Router();
const { createCharacter, equipItem, unequipItem, addToInventory, useConsumable, computeStats, xpForNextLevel, MAX_LEVEL } = require('../services/character');
const { generateItem } = require('../data/items');

// In-memory store (single character for now)
const store = { character: null };

const SHOP_CATALOG = [
  { templateId: 'potion_hp_s', price: 20 },
  { templateId: 'potion_hp_m', price: 50 },
  { templateId: 'potion_hp_l', price: 120 },
  { templateId: 'potion_mp_s', price: 15 },
  { templateId: 'potion_mp_m', price: 40 },
];

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

router.get('/shop', (req, res) => {
  const items = SHOP_CATALOG.map(entry => {
    const item = generateItem(entry.templateId, 'common');
    return { ...item, templateId: entry.templateId, price: entry.price };
  });
  res.json(items);
});

router.post('/shop/buy', (req, res) => {
  if (!store.character) return res.status(404).json({ error: 'No character' });
  const { templateId } = req.body;
  const entry = SHOP_CATALOG.find(e => e.templateId === templateId);
  if (!entry) return res.status(404).json({ error: 'Item not in shop' });
  if (store.character.gold < entry.price) return res.status(400).json({ error: 'Not enough gold' });

  const item = generateItem(entry.templateId, 'common');
  const { added } = addToInventory(store.character, [item]);
  if (!added.length) return res.status(400).json({ error: 'Inventory is full' });

  store.character.gold -= entry.price;
  res.json({ character: store.character, item });
});

router.delete('/inventory/:itemId', (req, res) => {
  if (!store.character) return res.status(404).json({ error: 'No character' });
  const idx = store.character.inventory.findIndex(i => i.id === req.params.itemId);
  if (idx === -1) return res.status(404).json({ error: 'Item not found' });
  store.character.inventory.splice(idx, 1);
  res.json({ character: store.character });
});

module.exports = { router, store };
