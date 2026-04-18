import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameStateService } from '../../core/services/game-state.service';
import { ApiService } from '../../core/services/api.service';
import { Item } from '../../core/models/game.models';

interface ShopItem extends Item {
  templateId: string;
  price: number;
}

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="shop-page">
      <div class="shop-header">
        <div>
          <h2>General Store</h2>
          <p class="shop-subtitle">Stock up before your next adventure</p>
        </div>
        <div class="gold-display">💰 {{ state.character()?.gold ?? 0 }} gold</div>
      </div>

      @if (loading) {
        <div class="loading">Loading wares...</div>
      } @else {
        <div class="shop-grid">
          @for (item of shopItems; track item.templateId) {
            <div class="shop-card">
              <div class="card-icon">{{ getIcon(item) }}</div>
              <div class="card-info">
                <div class="card-name">{{ item.name }}</div>
                <div class="card-effect">
                  @if (item.effect?.health) { Restores {{ item.effect!.health }} HP }
                  @if (item.effect?.mana) { Restores {{ item.effect!.mana }} MP }
                </div>
              </div>
              <div class="card-right">
                <div class="card-price">💰 {{ item.price }}</div>
                <button
                  class="btn-buy"
                  [disabled]="(state.character()?.gold ?? 0) < item.price || buying === item.templateId"
                  (click)="buy(item)"
                >
                  {{ buying === item.templateId ? '...' : 'Buy' }}
                </button>
              </div>
            </div>
          }
        </div>

        <div class="shop-hint">
          Potions can be used from the Inventory screen.
        </div>
      }
    </div>
  `,
  styles: [`
    .shop-page { padding: 20px; max-width: 600px; }
    .shop-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
    h2 { font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 4px; }
    .shop-subtitle { font-size: 13px; color: #6b7280; margin: 0; }
    .gold-display { background: #fef9c3; border: 1px solid #fde68a; border-radius: 20px; padding: 6px 14px; font-size: 14px; font-weight: 700; color: #92400e; }
    .loading { text-align: center; padding: 40px; color: #6b7280; font-size: 14px; }
    .shop-grid { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
    .shop-card {
      display: flex; align-items: center; gap: 12px; padding: 12px 16px;
      background: white; border: 1px solid #e5e7eb; border-radius: 12px;
    }
    .card-icon { font-size: 28px; flex-shrink: 0; }
    .card-info { flex: 1; min-width: 0; }
    .card-name { font-size: 14px; font-weight: 600; color: #111827; }
    .card-effect { font-size: 12px; color: #6b7280; margin-top: 2px; }
    .card-right { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; flex-shrink: 0; }
    .card-price { font-size: 13px; font-weight: 700; color: #92400e; }
    .btn-buy {
      background: #6366f1; color: white; border: none; border-radius: 8px;
      padding: 6px 16px; font-size: 13px; font-weight: 700; cursor: pointer; transition: background 0.15s;
    }
    .btn-buy:hover:not(:disabled) { background: #4f46e5; }
    .btn-buy:disabled { opacity: 0.4; cursor: not-allowed; }
    .shop-hint { font-size: 12px; color: #9ca3af; text-align: center; padding-top: 8px; }
  `]
})
export class ShopComponent implements OnInit {
  state = inject(GameStateService);
  private api = inject(ApiService);

  shopItems: ShopItem[] = [];
  loading = true;
  buying: string | null = null;

  ngOnInit() {
    this.api.getShopItems().subscribe({
      next: (items) => {
        this.shopItems = items as ShopItem[];
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  getIcon(item: ShopItem): string {
    if (item.effect?.health) return '🧪';
    if (item.effect?.mana) return '💙';
    return '🧴';
  }

  buy(item: ShopItem) {
    if (this.buying) return;
    this.buying = item.templateId;
    this.api.buyItem(item.templateId).subscribe({
      next: ({ character }) => {
        this.state.character.set(character);
        this.state.addNotification(`Bought: ${item.name}`);
        this.buying = null;
      },
      error: (err) => {
        this.state.addNotification(err.error?.error || 'Purchase failed');
        this.buying = null;
      }
    });
  }
}
