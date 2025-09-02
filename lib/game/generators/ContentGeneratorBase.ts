import { IContentGenerator } from '../core/interfaces';

export abstract class ContentGeneratorBase<T> implements IContentGenerator<T> {
  protected seed: string;
  
  constructor(seed?: string) {
    this.seed = seed || this.generateSeed();
  }
  
  abstract generate(seed?: string): Promise<T>;
  
  abstract validate(content: T): boolean;
  
  protected generateSeed(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
  
  protected random(seed?: string): number {
    const s = seed || this.seed;
    let hash = 0;
    for (let i = 0; i < s.length; i++) {
      const char = s.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash) / 2147483647;
  }
  
  protected randomRange(min: number, max: number, seed?: string): number {
    return min + (this.random(seed) * (max - min));
  }
  
  protected randomChoice<T>(array: T[], seed?: string): T {
    const index = Math.floor(this.random(seed) * array.length);
    return array[index];
  }
  
  protected weightedRandom<T>(items: Array<{ item: T; weight: number }>, seed?: string): T {
    const totalWeight = items.reduce((sum, { weight }) => sum + weight, 0);
    let random = this.random(seed) * totalWeight;
    
    for (const { item, weight } of items) {
      random -= weight;
      if (random <= 0) {
        return item;
      }
    }
    
    return items[items.length - 1].item;
  }
}