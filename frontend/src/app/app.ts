import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameStateService } from './core/services/game-state.service';
import { CreateCharacterComponent } from './features/character/create-character/create-character.component';
import { CharacterPanelComponent } from './features/character/character-panel/character-panel.component';
import { WorldComponent } from './features/world/world.component';
import { CombatComponent } from './features/combat/combat.component';
import { InventoryComponent } from './features/inventory/inventory.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    CreateCharacterComponent,
    CharacterPanelComponent,
    WorldComponent,
    CombatComponent,
    InventoryComponent,
  ],
  template: `
    <!-- Notifications -->
    <div class="notifications">
      @for (note of state.notifications(); track $index) {
        <div class="notification">{{ note }}</div>
      }
    </div>

    @if (state.currentView() === 'create') {
      <app-create-character />
    } @else {
      <div class="game-layout">
        <!-- Sidebar -->
        <aside class="sidebar">
          <div class="sidebar-brand">⚔️ <span>Realm</span></div>
          <nav class="sidebar-nav">
            <button [class.active]="state.currentView() === 'world'" (click)="state.navigateTo('world')" [disabled]="isInCombat()">🗺️ World</button>
            <button [class.active]="state.currentView() === 'inventory'" (click)="state.navigateTo('inventory')" [disabled]="isInCombat()">🎒 Inventory <span class="inv-badge">{{ invCount() }}</span></button>
            <button [class.active]="state.currentView() === 'character'" (click)="state.navigateTo('character')" [disabled]="isInCombat()">👤 Character</button>
          </nav>

          <!-- Mini char info always visible -->
          <div class="sidebar-char">
            <div class="char-name">{{ state.character()?.name }}</div>
            <div class="char-level">Level {{ state.character()?.level }} · iLvl {{ state.character()?.itemLevel }}</div>
            <div class="mini-bars">
              <div class="mini-bar-track">
                <div class="mini-bar hp" [style.width.%]="state.healthPercent()"></div>
              </div>
              <div class="mini-bar-track">
                <div class="mini-bar mp" [style.width.%]="state.manaPercent()"></div>
              </div>
              <div class="mini-bar-track">
                <div class="mini-bar xp" [style.width.%]="state.xpPercent()"></div>
              </div>
            </div>
            <div class="char-gold">💰 {{ state.character()?.gold }}</div>
          </div>
        </aside>

        <!-- Main content -->
        <main class="main-content">
          @if (state.currentView() === 'combat') {
            <app-combat />
          } @else if (state.currentView() === 'world') {
            <app-world />
          } @else if (state.currentView() === 'inventory') {
            <app-inventory />
          } @else if (state.currentView() === 'character') {
            <app-character-panel />
          }
        </main>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }
    .notifications { position: fixed; top: 16px; right: 16px; z-index: 999; display: flex; flex-direction: column; gap: 8px; pointer-events: none; }
    .notification {
      background: #111827; color: white; border-radius: 8px; padding: 10px 16px;
      font-size: 13px; font-weight: 500; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideIn 0.25s ease; pointer-events: none;
    }
    @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }

    .game-layout { display: flex; min-height: 100vh; background: #f9fafb; }

    .sidebar {
      width: 220px; background: white; border-right: 1px solid #e5e7eb;
      display: flex; flex-direction: column; padding: 20px 0; flex-shrink: 0; position: sticky; top: 0; height: 100vh;
    }
    .sidebar-brand { font-size: 17px; font-weight: 800; color: #111827; padding: 0 20px 20px; display: flex; align-items: center; gap: 8px; }
    .sidebar-brand span { color: #6366f1; }
    .sidebar-nav { display: flex; flex-direction: column; gap: 2px; padding: 0 10px; }
    .sidebar-nav button {
      display: flex; align-items: center; gap: 8px; padding: 10px 12px; border: none;
      background: transparent; border-radius: 8px; font-size: 14px; font-weight: 500; color: #374151;
      cursor: pointer; transition: all 0.15s; text-align: left; width: 100%;
    }
    .sidebar-nav button:hover:not(:disabled) { background: #f3f4f6; }
    .sidebar-nav button.active { background: #eef2ff; color: #6366f1; font-weight: 700; }
    .sidebar-nav button:disabled { opacity: 0.4; cursor: not-allowed; }
    .inv-badge { margin-left: auto; background: #6366f1; color: white; border-radius: 10px; padding: 1px 6px; font-size: 10px; }

    .sidebar-char { margin-top: auto; padding: 16px 20px; border-top: 1px solid #f3f4f6; }
    .char-name { font-size: 13px; font-weight: 700; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .char-level { font-size: 11px; color: #9ca3af; margin-bottom: 8px; }
    .mini-bars { display: flex; flex-direction: column; gap: 3px; margin-bottom: 8px; }
    .mini-bar-track { height: 5px; background: #f3f4f6; border-radius: 3px; overflow: hidden; }
    .mini-bar { height: 100%; border-radius: 3px; transition: width 0.4s; }
    .mini-bar.hp { background: #ef4444; }
    .mini-bar.mp { background: #3b82f6; }
    .mini-bar.xp { background: #f59e0b; }
    .char-gold { font-size: 12px; color: #6b7280; }

    .main-content { flex: 1; overflow-y: auto; min-height: 100vh; }
  `]
})
export class App implements OnInit {
  constructor(public state: GameStateService) {}

  ngOnInit() {
    this.state.loadCharacter();
  }

  isInCombat() {
    return this.state.currentView() === 'combat';
  }

  invCount() {
    return this.state.character()?.inventory?.length || 0;
  }
}
