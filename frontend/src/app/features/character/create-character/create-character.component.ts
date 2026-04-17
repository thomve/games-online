import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameStateService } from '../../../core/services/game-state.service';

@Component({
  selector: 'app-create-character',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="create-page">
      <div class="create-card">
        <div class="logo">⚔️</div>
        <h1>Realm of Ascension</h1>
        <p class="tagline">Begin your journey. Reach level 20. Become legend.</p>

        <div class="form-group">
          <label>Character Name</label>
          <input
            type="text"
            [(ngModel)]="name"
            placeholder="Enter your name..."
            (keyup.enter)="create()"
            [disabled]="state.isLoading()"
            maxlength="24"
          />
        </div>

        <button class="btn-primary btn-large" (click)="create()" [disabled]="!name.trim() || state.isLoading()">
          {{ state.isLoading() ? 'Creating...' : 'Begin Adventure' }}
        </button>

        <div class="game-info">
          <div class="info-item"><span>⚔️</span> Turn-based combat</div>
          <div class="info-item"><span>🗺️</span> 5 unique zones</div>
          <div class="info-item"><span>🏰</span> 5 dungeon bosses</div>
          <div class="info-item"><span>🎯</span> Max level 20</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .create-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f9fafb;
    }
    .create-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 16px;
      padding: 48px 40px;
      width: 100%;
      max-width: 420px;
      text-align: center;
      box-shadow: 0 4px 24px rgba(0,0,0,0.06);
    }
    .logo { font-size: 48px; margin-bottom: 12px; }
    h1 { font-size: 26px; font-weight: 700; color: #111827; margin: 0 0 8px; }
    .tagline { color: #6b7280; font-size: 14px; margin: 0 0 32px; }
    .form-group { margin-bottom: 20px; text-align: left; }
    label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px; }
    input {
      width: 100%; padding: 10px 14px; border: 1.5px solid #d1d5db;
      border-radius: 8px; font-size: 15px; box-sizing: border-box;
      transition: border-color 0.2s; outline: none;
    }
    input:focus { border-color: #6366f1; }
    .game-info {
      display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 28px;
    }
    .info-item {
      background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px;
      padding: 8px 10px; font-size: 12px; color: #6b7280;
    }
    .info-item span { margin-right: 4px; }
  `]
})
export class CreateCharacterComponent {
  name = '';

  constructor(public state: GameStateService) {}

  create() {
    if (!this.name.trim()) return;
    this.state.createCharacter(this.name.trim()).subscribe({
      error: (e) => console.error('Failed to create character', e)
    });
  }
}
