import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Character, Zone, Dungeon, Combat, Item } from '../models/game.models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // Character
  createCharacter(name: string): Observable<Character> {
    return this.http.post<Character>(`${this.base}/character/create`, { name });
  }

  getCharacter(): Observable<Character> {
    return this.http.get<Character>(`${this.base}/character`);
  }

  equipItem(itemId: string): Observable<{ character: Character }> {
    return this.http.post<{ character: Character }>(`${this.base}/character/equip`, { itemId });
  }

  unequipItem(slot: string): Observable<{ character: Character }> {
    return this.http.post<{ character: Character }>(`${this.base}/character/unequip`, { slot });
  }

  useItem(itemId: string): Observable<{ character: Character; effect: any }> {
    return this.http.post<{ character: Character; effect: any }>(`${this.base}/character/use-item`, { itemId });
  }

  deleteItem(itemId: string): Observable<{ character: Character }> {
    return this.http.delete<{ character: Character }>(`${this.base}/character/inventory/${itemId}`);
  }

  // World
  getZones(): Observable<Zone[]> {
    return this.http.get<Zone[]>(`${this.base}/world/zones`);
  }

  getDungeons(): Observable<Dungeon[]> {
    return this.http.get<Dungeon[]>(`${this.base}/world/dungeons`);
  }

  explore(zoneId: string): Observable<{ combatId: string; mob: any; combat: Combat }> {
    return this.http.post<{ combatId: string; mob: any; combat: Combat }>(`${this.base}/world/explore/${zoneId}`, {});
  }

  startDungeon(dungeonId: string): Observable<{ combatId: string; mob: any; combat: Combat }> {
    return this.http.post<{ combatId: string; mob: any; combat: Combat }>(`${this.base}/world/dungeon/${dungeonId}/start`, {});
  }

  getCombat(combatId: string): Observable<Combat> {
    return this.http.get<Combat>(`${this.base}/world/combat/${combatId}`);
  }

  takeTurn(combatId: string): Observable<{ combat: Combat }> {
    return this.http.post<{ combat: Combat }>(`${this.base}/world/combat/${combatId}/turn`, {});
  }

  fleeCombat(combatId: string): Observable<{ combat: Combat; character: Character }> {
    return this.http.post<{ combat: Combat; character: Character }>(`${this.base}/world/combat/${combatId}/flee`, {});
  }

  // Shop
  getShopItems(): Observable<Item[]> {
    return this.http.get<Item[]>(`${this.base}/character/shop`);
  }

  buyItem(templateId: string): Observable<{ character: Character; item: Item }> {
    return this.http.post<{ character: Character; item: Item }>(`${this.base}/character/shop/buy`, { templateId });
  }
}
