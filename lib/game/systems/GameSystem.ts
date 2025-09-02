import { IGameState } from '../core/interfaces';

export abstract class GameSystem {
  protected name: string;
  protected enabled: boolean = true;
  
  constructor(name: string) {
    this.name = name;
  }
  
  abstract initialize(state: IGameState): void;
  abstract update(state: IGameState, deltaTime: number): void;
  abstract cleanup(): void;
  
  enable(): void {
    this.enabled = true;
  }
  
  disable(): void {
    this.enabled = false;
  }
  
  isEnabled(): boolean {
    return this.enabled;
  }
  
  getName(): string {
    return this.name;
  }
}