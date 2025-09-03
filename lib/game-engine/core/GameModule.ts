export abstract class GameModule {
  static readonly type: string;
  static readonly version: string;
  static readonly metadata: any;
  
  abstract initialize(engine: any): Promise<void>;
  abstract update(deltaTime: number): Promise<void>;
  abstract cleanup(): Promise<void>;
}