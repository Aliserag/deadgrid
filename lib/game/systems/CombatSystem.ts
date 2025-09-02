import { GameSystem } from './GameSystem';
import { IGameState, IEntity } from '../core/interfaces';

export interface CombatCalculation {
  baseDamage: number;
  criticalChance: number;
  hitChance: number;
  range: number;
}

export class CombatSystem extends GameSystem {
  private combatModifiers: Map<string, (calc: CombatCalculation) => CombatCalculation> = new Map();
  
  constructor() {
    super('CombatSystem');
  }
  
  initialize(state: IGameState): void {
    // Register default combat modifiers
    this.registerModifier('weather', (calc) => {
      const weather = state.getWorld().getWeather();
      if (weather.type === 'fog') {
        calc.hitChance *= 0.7;
      } else if (weather.type === 'storm') {
        calc.hitChance *= 0.5;
        calc.range *= 0.8;
      }
      return calc;
    });
  }
  
  update(state: IGameState, deltaTime: number): void {
    // Combat system doesn't need regular updates
    // It responds to combat events
  }
  
  cleanup(): void {
    this.combatModifiers.clear();
  }
  
  registerModifier(name: string, modifier: (calc: CombatCalculation) => CombatCalculation): void {
    this.combatModifiers.set(name, modifier);
  }
  
  unregisterModifier(name: string): void {
    this.combatModifiers.delete(name);
  }
  
  calculateDamage(attacker: IEntity, target: IEntity, weapon?: any): number {
    let calculation: CombatCalculation = {
      baseDamage: weapon?.damage || 10,
      criticalChance: 0.1,
      hitChance: 0.8,
      range: weapon?.range || 1
    };
    
    // Apply all modifiers
    for (const modifier of this.combatModifiers.values()) {
      calculation = modifier(calculation);
    }
    
    // Check if attack hits
    if (Math.random() > calculation.hitChance) {
      return 0; // Miss
    }
    
    // Check for critical hit
    const isCritical = Math.random() < calculation.criticalChance;
    let damage = calculation.baseDamage;
    
    if (isCritical) {
      damage *= 2;
    }
    
    // Apply armor reduction if target has armor
    const armor = target.properties?.armor || 0;
    damage = Math.max(1, damage - armor);
    
    return Math.floor(damage);
  }
  
  performAttack(attacker: IEntity, target: IEntity, weapon?: any): {
    damage: number;
    hit: boolean;
    critical: boolean;
    killed: boolean;
  } {
    const damage = this.calculateDamage(attacker, target, weapon);
    const hit = damage > 0;
    const critical = damage > (weapon?.damage || 10) * 1.5;
    
    if (hit) {
      const targetHealth = target.properties?.health || 0;
      target.properties = {
        ...target.properties,
        health: Math.max(0, targetHealth - damage)
      };
    }
    
    const killed = target.properties?.health === 0;
    
    return { damage, hit, critical, killed };
  }
  
  calculateDistance(entity1: IEntity, entity2: IEntity): number {
    const dx = entity1.position.x - entity2.position.x;
    const dy = entity1.position.y - entity2.position.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  isInRange(attacker: IEntity, target: IEntity, weapon?: any): boolean {
    const range = weapon?.range || 1;
    const distance = this.calculateDistance(attacker, target);
    return distance <= range;
  }
  
  getTargetsInRange(entity: IEntity, range: number, entities: IEntity[]): IEntity[] {
    return entities.filter(target => {
      if (target.id === entity.id) return false;
      return this.calculateDistance(entity, target) <= range;
    });
  }
}