import { Injectable, signal, computed } from '@angular/core';
import { Character, Combat, Zone, Dungeon } from '../models/game.models';
import { ApiService } from './api.service';
import { tap } from 'rxjs/operators';

export type GameView = 'create' | 'world' | 'combat' | 'character' | 'inventory' | 'dungeon';

@Injectable({ providedIn: 'root' })
export class GameStateService {
  character = signal<Character | null>(null);
  combat = signal<Combat | null>(null);
  currentView = signal<GameView>('create');
  zones = signal<Zone[]>([]);
  dungeons = signal<Dungeon[]>([]);
  notifications = signal<string[]>([]);
  isLoading = signal(false);

  xpPercent = computed(() => {
    const c = this.character();
    if (!c || c.nextLevelXp === null) return 100;
    return Math.round((c.xp / c.nextLevelXp) * 100);
  });

  healthPercent = computed(() => {
    const c = this.character();
    if (!c) return 100;
    return Math.round((c.stats.health / c.stats.maxHealth) * 100);
  });

  manaPercent = computed(() => {
    const c = this.character();
    if (!c) return 100;
    return Math.round((c.stats.mana / c.stats.maxMana) * 100);
  });

  constructor(private api: ApiService) {}

  loadCharacter() {
    this.api.getCharacter().subscribe({
      next: (char) => {
        this.character.set(char);
        if (char) this.currentView.set('world');
      },
      error: () => this.currentView.set('create'),
    });
  }

  createCharacter(name: string) {
    this.isLoading.set(true);
    return this.api.createCharacter(name).pipe(
      tap((char) => {
        this.character.set(char);
        this.currentView.set('world');
        this.isLoading.set(false);
      })
    );
  }

  refreshCharacter() {
    return this.api.getCharacter().pipe(
      tap((char) => this.character.set(char))
    );
  }

  loadZones() {
    this.api.getZones().subscribe((zones) => this.zones.set(zones));
    this.api.getDungeons().subscribe((dungeons) => this.dungeons.set(dungeons));
  }

  startCombat(combat: Combat) {
    this.combat.set(combat);
    this.currentView.set('combat');
  }

  endCombat() {
    this.combat.set(null);
    this.currentView.set('world');
    this.refreshCharacter().subscribe();
    this.loadZones();
  }

  addNotification(message: string) {
    this.notifications.update(n => [...n, message]);
    setTimeout(() => this.notifications.update(n => n.slice(1)), 3500);
  }

  navigateTo(view: GameView) {
    this.currentView.set(view);
  }
}
