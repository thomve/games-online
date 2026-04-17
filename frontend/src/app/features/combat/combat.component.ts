import { Component, ElementRef, ViewChild, AfterViewChecked, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameStateService } from '../../core/services/game-state.service';
import { ApiService } from '../../core/services/api.service';
import { CombatLogEntry } from '../../core/models/game.models';

@Component({
  selector: 'app-combat',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="combat-page">
      @if (combat(); as c) {
        <div class="combat-arena">

          <!-- Mob -->
          <div class="fighter mob-side">
            <div class="fighter-icon boss-icon" [class.boss]="c.mob.isBoss">{{ c.mob.icon }}</div>
            <div class="fighter-name">
              {{ c.mob.name }}
              @if (c.mob.isBoss) { <span class="boss-badge">BOSS</span> }
              <span class="fighter-level">Lv.{{ c.mob.level }}</span>
            </div>
            <div class="health-bar-wrapper">
              <div class="health-track">
                <div class="health-fill mob-hp" [style.width.%]="mobHpPercent()"></div>
              </div>
              <span class="hp-text">{{ c.mob.health }} / {{ c.mob.maxHealth }}</span>
            </div>
          </div>

          <div class="vs-divider">VS</div>

          <!-- Player -->
          <div class="fighter player-side">
            <div class="fighter-icon">🧙</div>
            <div class="fighter-name">
              {{ state.character()?.name }}
              <span class="fighter-level">Lv.{{ state.character()?.level }}</span>
            </div>
            <div class="health-bar-wrapper">
              <div class="health-track">
                <div class="health-fill player-hp" [style.width.%]="playerHpPercent()"></div>
              </div>
              <span class="hp-text">{{ c.character.stats.health }} / {{ c.character.stats.maxHealth }}</span>
            </div>
          </div>
        </div>

        <!-- Combat Log -->
        <div class="combat-log" #logContainer>
          @for (entry of c.log; track $index) {
            <div class="log-entry" [ngClass]="entry.actor + ' ' + entry.type">
              <span class="entry-icon">{{ getEntryIcon(entry) }}</span>
              <span class="entry-msg">{{ entry.message }}</span>
            </div>
          }
        </div>

        <!-- Actions -->
        <div class="combat-actions">
          @if (c.status === 'ongoing') {
            <button class="btn-attack" (click)="attack()" [disabled]="acting">
              ⚔️ Attack
            </button>
            <button class="btn-flee" (click)="flee()" [disabled]="acting">
              🏃 Flee
            </button>
          } @else {
            <div class="combat-result" [class.victory]="c.status === 'victory'" [class.defeat]="c.status === 'defeat'">
              @if (c.status === 'victory') {
                <div class="result-title">🏆 Victory!</div>
                <div class="result-info">+{{ c.xpGained }} XP · +{{ c.goldGained }} Gold</div>
                @if (c.leveledUp) {
                  <div class="level-up-msg">🎉 Level Up! You are now level {{ state.character()?.level }}!</div>
                }
                @if (c.loot?.length) {
                  <div class="loot-preview">
                    @for (item of c.loot; track item.id) {
                      <span class="loot-item" [style.color]="item.qualityColor">{{ item.name }}</span>
                    }
                  </div>
                }
              } @else if (c.status === 'defeat') {
                <div class="result-title">💀 Defeated</div>
                <div class="result-info">You lost 10% gold and respawned at low health.</div>
              } @else {
                <div class="result-title">🏃 Fled!</div>
              }
              <button class="btn-continue" (click)="endCombat()">Continue →</button>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .combat-page { padding: 20px; display: flex; flex-direction: column; gap: 16px; max-width: 600px; }
    .combat-arena { display: flex; align-items: center; gap: 12px; background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; }
    .fighter { flex: 1; text-align: center; }
    .fighter-icon { font-size: 40px; line-height: 1; margin-bottom: 8px; }
    .fighter-icon.boss { font-size: 52px; }
    .fighter-name { font-size: 14px; font-weight: 700; color: #111827; display: flex; align-items: center; justify-content: center; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; }
    .fighter-level { font-size: 11px; color: #9ca3af; font-weight: 500; }
    .boss-badge { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; border-radius: 20px; padding: 1px 6px; font-size: 10px; font-weight: 800; }
    .health-bar-wrapper { display: flex; flex-direction: column; align-items: center; gap: 3px; }
    .health-track { width: 100%; height: 10px; background: #f3f4f6; border-radius: 5px; overflow: hidden; }
    .health-fill { height: 100%; border-radius: 5px; transition: width 0.5s ease; }
    .mob-hp { background: #ef4444; }
    .player-hp { background: #22c55e; }
    .hp-text { font-size: 11px; color: #6b7280; }
    .vs-divider { font-size: 13px; font-weight: 700; color: #9ca3af; flex-shrink: 0; }
    .combat-log {
      background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px;
      padding: 12px; height: 180px; overflow-y: auto; display: flex; flex-direction: column; gap: 4px;
    }
    .log-entry { display: flex; align-items: flex-start; gap: 7px; font-size: 12px; line-height: 1.5; }
    .log-entry.player { color: #111827; }
    .log-entry.player.crit .entry-msg { color: #7c3aed; font-weight: 700; }
    .log-entry.mob { color: #dc2626; }
    .log-entry.mob.crit .entry-msg { font-weight: 700; }
    .log-entry.system { color: #059669; font-weight: 600; }
    .log-entry.system.loot { color: #d97706; }
    .entry-icon { flex-shrink: 0; }
    .combat-actions { display: flex; gap: 10px; flex-wrap: wrap; }
    .btn-attack {
      flex: 1; padding: 12px; background: #6366f1; color: white; border: none;
      border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; transition: background 0.15s;
    }
    .btn-attack:hover:not(:disabled) { background: #4f46e5; }
    .btn-attack:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-flee {
      padding: 12px 20px; background: white; color: #6b7280; border: 1.5px solid #d1d5db;
      border-radius: 10px; font-size: 14px; cursor: pointer; transition: all 0.15s;
    }
    .btn-flee:hover:not(:disabled) { border-color: #9ca3af; background: #f9fafb; }
    .btn-flee:disabled { opacity: 0.6; cursor: not-allowed; }
    .combat-result { width: 100%; padding: 20px; border-radius: 12px; text-align: center; }
    .combat-result.victory { background: #f0fdf4; border: 1.5px solid #86efac; }
    .combat-result.defeat { background: #fef2f2; border: 1.5px solid #fca5a5; }
    .result-title { font-size: 22px; font-weight: 800; margin-bottom: 4px; }
    .result-info { font-size: 13px; color: #6b7280; margin-bottom: 8px; }
    .level-up-msg { background: #fef9c3; border: 1px solid #fde047; border-radius: 8px; padding: 6px 10px; font-size: 13px; font-weight: 700; color: #854d0e; margin-bottom: 8px; }
    .loot-preview { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; margin-bottom: 12px; }
    .loot-item { font-size: 12px; font-weight: 600; background: white; border-radius: 6px; padding: 3px 8px; border: 1px solid #e5e7eb; }
    .btn-continue { background: #6366f1; color: white; border: none; border-radius: 8px; padding: 10px 24px; font-size: 14px; font-weight: 700; cursor: pointer; margin-top: 4px; }
    .btn-continue:hover { background: #4f46e5; }
  `]
})
export class CombatComponent implements AfterViewChecked {
  @ViewChild('logContainer') logContainer?: ElementRef;
  state = inject(GameStateService);
  private api = inject(ApiService);
  combat = this.state.combat;
  acting = false;
  private lastLogLength = 0;

  ngAfterViewChecked() {
    const log = this.combat()?.log;
    if (log && log.length !== this.lastLogLength) {
      this.lastLogLength = log.length;
      this.scrollLog();
    }
  }

  scrollLog() {
    if (this.logContainer) {
      const el = this.logContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }

  mobHpPercent() {
    const c = this.combat();
    if (!c) return 0;
    return Math.round((c.mob.health / c.mob.maxHealth) * 100);
  }

  playerHpPercent() {
    const c = this.combat();
    if (!c) return 0;
    return Math.round((c.character.stats.health / c.character.stats.maxHealth) * 100);
  }

  attack() {
    const c = this.combat();
    if (!c || this.acting) return;
    this.acting = true;
    this.api.takeTurn(c.id).subscribe({
      next: ({ combat }) => {
        this.state.combat.set(combat);
        if (combat.status !== 'ongoing' && combat.characterAfter) {
          this.state.character.set(combat.characterAfter);
        }
        this.acting = false;
      },
      error: () => { this.acting = false; }
    });
  }

  flee() {
    const c = this.combat();
    if (!c || this.acting) return;
    this.acting = true;
    this.api.fleeCombat(c.id).subscribe({
      next: ({ combat, character }) => {
        this.state.combat.set(combat);
        this.state.character.set(character);
        this.acting = false;
      },
      error: () => { this.acting = false; }
    });
  }

  endCombat() {
    this.state.endCombat();
  }

  getEntryIcon(entry: CombatLogEntry): string {
    if (entry.actor === 'system') return entry.type === 'loot' ? '🎁' : entry.type === 'victory' ? '🏆' : '⚡';
    if (entry.type === 'crit') return '💥';
    if (entry.actor === 'player') return '⚔️';
    return '🗡️';
  }
}
