import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameStateService } from '../../core/services/game-state.service';
import { ApiService } from '../../core/services/api.service';
import { Zone, Dungeon } from '../../core/models/game.models';

@Component({
  selector: 'app-world',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="world-page">
      <h2 class="section-title">World Map</h2>
      <p class="section-sub">Choose a zone to explore or a dungeon to challenge.</p>

      <div class="tabs">
        <button [class.active]="tab === 'zones'" (click)="tab = 'zones'">Zones</button>
        <button [class.active]="tab === 'dungeons'" (click)="tab = 'dungeons'">Dungeons</button>
      </div>

      @if (tab === 'zones') {
        <div class="zone-grid">
          @for (zone of state.zones(); track zone.id) {
            <div class="zone-card" [class.locked]="!zone.accessible" (click)="explore(zone)">
              <div class="zone-icon">{{ zone.icon }}</div>
              <div class="zone-info">
                <div class="zone-name">{{ zone.name }}</div>
                <div class="zone-level">Lvl {{ zone.recommendedLevel }}</div>
                <div class="zone-desc">{{ zone.description }}</div>
              </div>
              <div class="zone-action">
                @if (!zone.accessible) {
                  <span class="locked-label">🔒 Locked</span>
                } @else {
                  <button class="btn-explore" [disabled]="exploring">
                    {{ exploring === zone.id ? '...' : 'Explore' }}
                  </button>
                }
              </div>
            </div>
          }
        </div>
      }

      @if (tab === 'dungeons') {
        <div class="dungeon-list">
          @for (dungeon of state.dungeons(); track dungeon.id) {
            <div class="dungeon-card" [class.locked]="!dungeon.accessible" [class.completed]="dungeon.completed">
              <div class="dungeon-icon">{{ dungeon.icon }}</div>
              <div class="dungeon-info">
                <div class="dungeon-name">
                  {{ dungeon.name }}
                  @if (dungeon.bossDefeated) { <span class="badge-done">✓ Cleared</span> }
                </div>
                <div class="dungeon-level">Required: Lv.{{ dungeon.requiredLevel }} · Recommended: {{ dungeon.recommendedLevel }}</div>
                <div class="dungeon-desc">{{ dungeon.description }}</div>
              </div>
              <div class="dungeon-action">
                @if (!dungeon.accessible) {
                  <span class="locked-label">🔒 Lv.{{ dungeon.requiredLevel }}</span>
                } @else {
                  <button class="btn-dungeon" (click)="enterDungeon(dungeon)" [disabled]="exploring">
                    {{ dungeon.bossDefeated ? 'Retry' : 'Enter' }}
                  </button>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .world-page { padding: 24px; max-width: 700px; }
    .section-title { font-size: 22px; font-weight: 700; color: #111827; margin: 0 0 4px; }
    .section-sub { font-size: 14px; color: #6b7280; margin: 0 0 20px; }
    .tabs { display: flex; gap: 4px; margin-bottom: 20px; background: #f3f4f6; border-radius: 8px; padding: 4px; width: fit-content; }
    .tabs button { padding: 6px 18px; border: none; border-radius: 6px; background: transparent; cursor: pointer; font-size: 14px; font-weight: 500; color: #6b7280; transition: all 0.15s; }
    .tabs button.active { background: white; color: #111827; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .zone-grid { display: flex; flex-direction: column; gap: 10px; }
    .zone-card {
      display: flex; align-items: center; gap: 14px; padding: 14px 16px;
      border: 1.5px solid #e5e7eb; border-radius: 12px; background: white;
      cursor: pointer; transition: border-color 0.15s, box-shadow 0.15s;
    }
    .zone-card:hover:not(.locked) { border-color: #a5b4fc; box-shadow: 0 2px 8px rgba(99,102,241,0.08); }
    .zone-card.locked { opacity: 0.5; cursor: not-allowed; }
    .zone-icon { font-size: 28px; flex-shrink: 0; }
    .zone-info { flex: 1; min-width: 0; }
    .zone-name { font-weight: 700; font-size: 15px; color: #111827; }
    .zone-level { font-size: 12px; color: #6b7280; margin: 2px 0 4px; }
    .zone-desc { font-size: 12px; color: #9ca3af; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .zone-action { flex-shrink: 0; }
    .btn-explore { background: #6366f1; color: white; border: none; border-radius: 8px; padding: 8px 16px; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.15s; }
    .btn-explore:hover:not(:disabled) { background: #4f46e5; }
    .btn-explore:disabled { opacity: 0.6; }
    .locked-label { font-size: 12px; color: #9ca3af; }
    .dungeon-list { display: flex; flex-direction: column; gap: 10px; }
    .dungeon-card { display: flex; align-items: center; gap: 14px; padding: 14px 16px; border: 1.5px solid #e5e7eb; border-radius: 12px; background: white; }
    .dungeon-card.locked { opacity: 0.5; }
    .dungeon-card.completed { border-color: #bbf7d0; background: #f0fdf4; }
    .dungeon-icon { font-size: 28px; flex-shrink: 0; }
    .dungeon-info { flex: 1; min-width: 0; }
    .dungeon-name { font-weight: 700; font-size: 15px; color: #111827; display: flex; align-items: center; gap: 8px; }
    .dungeon-level { font-size: 12px; color: #6b7280; margin: 2px 0 4px; }
    .dungeon-desc { font-size: 12px; color: #9ca3af; }
    .dungeon-action { flex-shrink: 0; }
    .btn-dungeon { background: #f59e0b; color: white; border: none; border-radius: 8px; padding: 8px 16px; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.15s; }
    .btn-dungeon:hover:not(:disabled) { background: #d97706; }
    .btn-dungeon:disabled { opacity: 0.6; cursor: not-allowed; }
    .badge-done { background: #dcfce7; color: #16a34a; border-radius: 20px; padding: 2px 8px; font-size: 11px; font-weight: 600; }
  `]
})
export class WorldComponent implements OnInit {
  tab: 'zones' | 'dungeons' = 'zones';
  exploring: string | null = null;

  constructor(public state: GameStateService, private api: ApiService) {}

  ngOnInit() {
    this.state.loadZones();
  }

  explore(zone: Zone) {
    if (!zone.accessible || this.exploring) return;
    this.exploring = zone.id;
    this.api.explore(zone.id).subscribe({
      next: ({ combat }) => {
        this.exploring = null;
        this.state.startCombat(combat);
      },
      error: () => { this.exploring = null; }
    });
  }

  enterDungeon(dungeon: Dungeon) {
    if (!dungeon.accessible || this.exploring) return;
    this.exploring = dungeon.id;
    this.api.startDungeon(dungeon.id).subscribe({
      next: ({ combat }) => {
        this.exploring = null;
        this.state.startCombat(combat);
      },
      error: (e) => {
        this.exploring = null;
        this.state.addNotification(e?.error?.error || 'Could not enter dungeon');
      }
    });
  }
}
