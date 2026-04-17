import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameStateService } from '../../core/services/game-state.service';
import { ApiService } from '../../core/services/api.service';
import { Item } from '../../core/models/game.models';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="inventory-page">
      <div class="inv-header">
        <h2>Inventory</h2>
        <span class="inv-count">{{ char()?.inventory?.length || 0 }} / 40</span>
      </div>

      @if (!char()?.inventory?.length) {
        <div class="empty-state">
          <span>🎒</span>
          <p>Your inventory is empty.<br>Go explore and defeat enemies!</p>
        </div>
      } @else {
        <div class="inv-filters">
          @for (f of filters; track f.key) {
            <button [class.active]="activeFilter === f.key" (click)="activeFilter = f.key">{{ f.label }}</button>
          }
        </div>

        <div class="inv-grid">
          @for (item of filteredItems(); track item.id) {
            <div class="inv-item" [class.selected]="selected?.id === item.id" (click)="select(item)">
              <div class="item-quality-bar" [style.background]="item.qualityColor"></div>
              <div class="item-slot-icon">{{ getSlotIcon(item.slot) }}</div>
              <div class="item-info">
                <div class="item-name" [style.color]="item.qualityColor">{{ item.name }}</div>
                <div class="item-meta">{{ item.slot }} · iLvl {{ item.itemLevel }}</div>
              </div>
              @if (isEquipped(item)) {
                <span class="equipped-tag">E</span>
              }
            </div>
          }
        </div>
      }

      <!-- Item Detail Panel -->
      @if (selected) {
        <div class="item-detail">
          <div class="detail-header">
            <span class="detail-icon">{{ getSlotIcon(selected.slot) }}</span>
            <div>
              <div class="detail-name" [style.color]="selected.qualityColor">{{ selected.name }}</div>
              <div class="detail-meta">{{ selected.quality | titlecase }} · {{ selected.slot }} · iLvl {{ selected.itemLevel }}</div>
            </div>
          </div>
          <div class="detail-stats">
            @if (selected.damage) { <div class="stat-row"><span>⚔️ Damage</span><strong>+{{ selected.damage }}</strong></div> }
            @if (selected.armor) { <div class="stat-row"><span>🛡️ Armor</span><strong>+{{ selected.armor }}</strong></div> }
            @for (stat of getStats(selected); track stat.key) {
              <div class="stat-row"><span>{{ stat.icon }} {{ stat.key | titlecase }}</span><strong>+{{ stat.value }}</strong></div>
            }
            @if (selected.effect?.health) { <div class="stat-row"><span>❤️ Restores</span><strong>{{ selected.effect!.health }} HP</strong></div> }
            @if (selected.effect?.mana) { <div class="stat-row"><span>💙 Restores</span><strong>{{ selected.effect!.mana }} MP</strong></div> }
          </div>
          <div class="detail-actions">
            @if (selected.slot === 'consumable') {
              <button class="btn-use" (click)="useItem(selected)">Use</button>
            } @else {
              <button class="btn-equip" (click)="equipItem(selected)">Equip</button>
            }
            <button class="btn-drop" (click)="dropItem(selected)">Drop</button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .inventory-page { padding: 20px; }
    .inv-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    h2 { font-size: 20px; font-weight: 700; color: #111827; margin: 0; }
    .inv-count { font-size: 13px; color: #6b7280; background: #f3f4f6; border-radius: 20px; padding: 3px 10px; }
    .empty-state { text-align: center; padding: 40px; color: #6b7280; }
    .empty-state span { font-size: 40px; display: block; margin-bottom: 12px; }
    .empty-state p { font-size: 14px; line-height: 1.6; }
    .inv-filters { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
    .inv-filters button { padding: 4px 12px; border: 1px solid #e5e7eb; border-radius: 20px; background: white; font-size: 12px; cursor: pointer; transition: all 0.15s; }
    .inv-filters button.active { background: #6366f1; color: white; border-color: #6366f1; }
    .inv-grid { display: flex; flex-direction: column; gap: 4px; margin-bottom: 16px; }
    .inv-item {
      display: flex; align-items: center; gap: 10px; padding: 8px 12px;
      border: 1px solid #e5e7eb; border-radius: 8px; cursor: pointer; position: relative;
      transition: background 0.1s; overflow: hidden; background: white;
    }
    .inv-item:hover { background: #f9fafb; }
    .inv-item.selected { border-color: #a5b4fc; background: #eef2ff; }
    .item-quality-bar { position: absolute; left: 0; top: 0; bottom: 0; width: 3px; }
    .item-slot-icon { font-size: 16px; flex-shrink: 0; margin-left: 6px; }
    .item-info { flex: 1; min-width: 0; }
    .item-name { font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .item-meta { font-size: 11px; color: #9ca3af; text-transform: capitalize; }
    .equipped-tag { background: #dcfce7; color: #16a34a; border-radius: 4px; padding: 1px 5px; font-size: 10px; font-weight: 700; flex-shrink: 0; }
    .item-detail { background: white; border: 1.5px solid #e5e7eb; border-radius: 12px; padding: 16px; }
    .detail-header { display: flex; gap: 12px; align-items: center; margin-bottom: 12px; }
    .detail-icon { font-size: 28px; }
    .detail-name { font-size: 15px; font-weight: 700; }
    .detail-meta { font-size: 12px; color: #6b7280; text-transform: capitalize; }
    .detail-stats { display: flex; flex-direction: column; gap: 4px; margin-bottom: 14px; }
    .stat-row { display: flex; justify-content: space-between; align-items: center; font-size: 13px; padding: 4px 8px; background: #f9fafb; border-radius: 6px; }
    .stat-row span { color: #6b7280; }
    .stat-row strong { color: #111827; }
    .detail-actions { display: flex; gap: 8px; }
    .btn-equip { flex: 1; background: #6366f1; color: white; border: none; border-radius: 8px; padding: 9px; font-size: 13px; font-weight: 700; cursor: pointer; }
    .btn-equip:hover { background: #4f46e5; }
    .btn-use { flex: 1; background: #22c55e; color: white; border: none; border-radius: 8px; padding: 9px; font-size: 13px; font-weight: 700; cursor: pointer; }
    .btn-use:hover { background: #16a34a; }
    .btn-drop { padding: 9px 16px; background: white; color: #ef4444; border: 1.5px solid #fca5a5; border-radius: 8px; font-size: 13px; cursor: pointer; }
    .btn-drop:hover { background: #fef2f2; }
  `]
})
export class InventoryComponent {
  state = inject(GameStateService);
  private api = inject(ApiService);
  char = this.state.character;
  selected: Item | null = null;
  activeFilter: string = 'all';

  filters = [
    { key: 'all', label: 'All' },
    { key: 'weapon', label: '⚔️ Weapons' },
    { key: 'armor', label: '🛡️ Armor' },
    { key: 'accessory', label: '💍 Accessories' },
    { key: 'consumable', label: '🧪 Consumables' },
  ];

  armorSlots = ['head', 'chest', 'legs', 'hands', 'feet'];
  accessorySlots = ['neck', 'ring'];

  statIcons: Record<string, string> = { force: '⚔️', dexterity: '🎯', haste: '⚡', stamina: '💪', intellect: '🧠', health: '❤️', mana: '💙' };


  filteredItems() {
    const inv = this.char()?.inventory || [];
    if (this.activeFilter === 'all') return inv;
    if (this.activeFilter === 'armor') return inv.filter(i => this.armorSlots.includes(i.slot));
    if (this.activeFilter === 'accessory') return inv.filter(i => this.accessorySlots.includes(i.slot));
    return inv.filter(i => i.slot === this.activeFilter);
  }

  select(item: Item) {
    this.selected = this.selected?.id === item.id ? null : item;
  }

  isEquipped(item: Item): boolean {
    const eq = this.char()?.equipment;
    if (!eq) return false;
    return Object.values(eq).some(e => e?.id === item.id);
  }

  getStats(item: Item) {
    if (!item.stats) return [];
    return Object.entries(item.stats).map(([key, value]) => ({
      key, value, icon: this.statIcons[key] || '•'
    }));
  }

  getSlotIcon(slot: string): string {
    const icons: Record<string, string> = { weapon: '⚔️', head: '🪖', chest: '🦺', legs: '👖', hands: '🥊', feet: '👟', neck: '📿', ring: '💍', consumable: '🧪' };
    return icons[slot] || '📦';
  }

  equipItem(item: Item) {
    this.api.equipItem(item.id).subscribe(({ character }) => {
      this.state.character.set(character);
      this.state.addNotification(`Equipped: ${item.name}`);
      this.selected = null;
    });
  }

  useItem(item: Item) {
    this.api.useItem(item.id).subscribe(({ character, effect }) => {
      this.state.character.set(character);
      const msgs = [];
      if (effect.healthRestored) msgs.push(`+${effect.healthRestored} HP`);
      if (effect.manaRestored) msgs.push(`+${effect.manaRestored} MP`);
      this.state.addNotification(`Used ${item.name}: ${msgs.join(', ')}`);
      this.selected = null;
    });
  }

  dropItem(item: Item) {
    this.api.deleteItem(item.id).subscribe(({ character }) => {
      this.state.character.set(character);
      this.state.addNotification(`Dropped: ${item.name}`);
      this.selected = null;
    });
  }
}
