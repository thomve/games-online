import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameStateService } from '../../../core/services/game-state.service';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-character-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="panel">
      @if (char(); as c) {
      <div class="panel-header">
        <h2>{{ c.name }}</h2>
        <div class="level-badge">Lv.{{ c.level }}</div>
      </div>

      <!-- Bars -->
      <div class="bars">
        <div class="bar-row">
          <span class="bar-label">❤️ HP</span>
          <div class="bar-track">
            <div class="bar-fill hp" [style.width.%]="state.healthPercent()"></div>
          </div>
          <span class="bar-value">{{ c.stats.health }} / {{ c.stats.maxHealth }}</span>
        </div>
        <div class="bar-row">
          <span class="bar-label">💙 MP</span>
          <div class="bar-track">
            <div class="bar-fill mp" [style.width.%]="state.manaPercent()"></div>
          </div>
          <span class="bar-value">{{ c.stats.mana }} / {{ c.stats.maxMana }}</span>
        </div>
        <div class="bar-row">
          <span class="bar-label">✨ XP</span>
          <div class="bar-track">
            <div class="bar-fill xp" [style.width.%]="state.xpPercent()"></div>
          </div>
          <span class="bar-value">
            @if (c.level === c.maxLevel) { MAX }
            @else { {{ c.xp }} / {{ c.nextLevelXp }} }
          </span>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="stats-section">
        <h3>Stats</h3>
        <div class="stats-grid">
          <div class="stat-item"><span class="stat-icon">⚔️</span><span class="stat-name">Force</span><span class="stat-val">{{ c.stats.force }}</span></div>
          <div class="stat-item"><span class="stat-icon">🎯</span><span class="stat-name">Dexterity</span><span class="stat-val">{{ c.stats.dexterity }}</span></div>
          <div class="stat-item"><span class="stat-icon">⚡</span><span class="stat-name">Haste</span><span class="stat-val">{{ c.stats.haste }}</span></div>
          <div class="stat-item"><span class="stat-icon">💪</span><span class="stat-name">Stamina</span><span class="stat-val">{{ c.stats.stamina }}</span></div>
          <div class="stat-item"><span class="stat-icon">🧠</span><span class="stat-name">Intellect</span><span class="stat-val">{{ c.stats.intellect }}</span></div>
          <div class="stat-item"><span class="stat-icon">🛡️</span><span class="stat-name">Armor</span><span class="stat-val">{{ c.stats.armor }}</span></div>
          <div class="stat-item"><span class="stat-icon">💥</span><span class="stat-name">Damage</span><span class="stat-val">{{ c.stats.damage }}</span></div>
          <div class="stat-item"><span class="stat-icon">🎲</span><span class="stat-name">Crit%</span><span class="stat-val">{{ c.stats.critChance?.toFixed(1) }}%</span></div>
        </div>
      </div>

      <!-- Item Level -->
      <div class="ilevel-badge">
        <span>Item Level</span>
        <strong>{{ c.itemLevel || 0 }}</strong>
      </div>

      <!-- Equipment -->
      <div class="equip-section">
        <h3>Equipment</h3>
        <div class="equip-slots">
          @for (slot of equipSlots; track slot.key) {
            <div class="equip-slot" [class.filled]="c.equipment[slot.key]" (click)="unequip(slot.key)">
              <span class="slot-icon">{{ slot.icon }}</span>
              @if (c.equipment[slot.key]; as item) {
                <div class="slot-item">
                  <div class="item-dot" [style.background]="item.qualityColor"></div>
                  <span class="item-name" [style.color]="item.qualityColor">{{ item.name }}</span>
                  <span class="item-ilvl">iLvl {{ item.itemLevel }}</span>
                </div>
              } @else {
                <span class="slot-empty">{{ slot.label }}</span>
              }
            </div>
          }
        </div>
      </div>

      <div class="gold-row">
        <span>💰 Gold</span>
        <strong>{{ c.gold }}</strong>
      </div>
      }
    </div>
  `,
  styles: [`
    .panel { padding: 20px; }
    .panel-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
    h2 { font-size: 20px; font-weight: 700; color: #111827; margin: 0; }
    .level-badge { background: #6366f1; color: white; border-radius: 20px; padding: 3px 12px; font-size: 13px; font-weight: 700; }
    h3 { font-size: 12px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; margin: 16px 0 8px; }
    .bars { display: flex; flex-direction: column; gap: 8px; }
    .bar-row { display: flex; align-items: center; gap: 8px; }
    .bar-label { font-size: 11px; width: 32px; flex-shrink: 0; }
    .bar-track { flex: 1; height: 8px; background: #f3f4f6; border-radius: 4px; overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 4px; transition: width 0.4s ease; }
    .bar-fill.hp { background: #ef4444; }
    .bar-fill.mp { background: #3b82f6; }
    .bar-fill.xp { background: #f59e0b; }
    .bar-value { font-size: 11px; color: #6b7280; width: 70px; text-align: right; flex-shrink: 0; }
    .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; }
    .stat-item { display: flex; align-items: center; gap: 6px; padding: 5px 8px; background: #f9fafb; border-radius: 6px; }
    .stat-icon { font-size: 13px; }
    .stat-name { font-size: 11px; color: #6b7280; flex: 1; }
    .stat-val { font-size: 12px; font-weight: 700; color: #111827; }
    .ilevel-badge { display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, #f0f0ff, #e8e8ff); border: 1px solid #c7d2fe; border-radius: 8px; padding: 8px 12px; margin: 8px 0; font-size: 13px; }
    .ilevel-badge strong { font-size: 18px; color: #6366f1; }
    .equip-slots { display: flex; flex-direction: column; gap: 4px; }
    .equip-slot { display: flex; align-items: center; gap: 8px; padding: 7px 10px; border: 1px solid #e5e7eb; border-radius: 8px; cursor: pointer; transition: background 0.15s; min-height: 36px; }
    .equip-slot:hover { background: #f9fafb; }
    .equip-slot.filled { border-color: #d1d5db; }
    .slot-icon { font-size: 14px; width: 18px; text-align: center; flex-shrink: 0; }
    .slot-item { display: flex; align-items: center; gap: 6px; flex: 1; min-width: 0; }
    .item-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
    .item-name { font-size: 12px; font-weight: 600; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .item-ilvl { font-size: 10px; color: #9ca3af; flex-shrink: 0; }
    .slot-empty { font-size: 12px; color: #9ca3af; font-style: italic; }
    .gold-row { display: flex; justify-content: space-between; align-items: center; margin-top: 12px; padding: 10px 12px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; font-size: 14px; }
  `]
})
export class CharacterPanelComponent {
  state = inject(GameStateService);
  private api = inject(ApiService);
  char = this.state.character;

  equipSlots = [
    { key: 'weapon', icon: '⚔️', label: 'Weapon' },
    { key: 'head', icon: '🪖', label: 'Head' },
    { key: 'chest', icon: '🦺', label: 'Chest' },
    { key: 'legs', icon: '👖', label: 'Legs' },
    { key: 'hands', icon: '🥊', label: 'Hands' },
    { key: 'feet', icon: '👟', label: 'Feet' },
    { key: 'neck', icon: '📿', label: 'Neck' },
    { key: 'ring', icon: '💍', label: 'Ring' },
  ];

  unequip(slot: string) {
    const eq = this.char()?.equipment as Record<string, unknown>;
    if (!eq?.[slot]) return;
    this.api.unequipItem(slot).subscribe(({ character }) => {
      this.state.character.set(character);
    });
  }
}
