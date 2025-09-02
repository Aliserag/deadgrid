import * as Phaser from 'phaser';

export class CombatScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CombatScene' });
  }

  create() {
    // Combat scene placeholder - can be expanded for turn-based combat
    const text = this.add.text(640, 360, 'Combat Scene - Coming Soon', {
      fontSize: '32px',
      fontFamily: 'monospace',
      color: '#ffffff',
    });
    text.setOrigin(0.5);
  }
}