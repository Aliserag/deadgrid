'use client';

import { useEffect, useRef } from 'react';
import * as Phaser from 'phaser';
import { GameScene } from '@/lib/game/scenes/GameScene';
import { GAME_CONFIG } from '@/lib/game/constants';

export default function PhaserGame() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined' && containerRef.current && !gameRef.current) {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        parent: containerRef.current,
        width: GAME_CONFIG.VIEWPORT_WIDTH * GAME_CONFIG.TILE_SIZE,
        height: GAME_CONFIG.VIEWPORT_HEIGHT * GAME_CONFIG.TILE_SIZE,
        backgroundColor: '#0a0a0a',
        scene: [GameScene],
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { x: 0, y: 0 },
            debug: false
          }
        },
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH
        }
      };
      
      gameRef.current = new Phaser.Game(config);
    }
    
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
      <div ref={containerRef} className="border-2 border-gray-800" />
      <div className="mt-4 text-gray-400 text-sm space-y-1">
        <p>Use WASD or Arrow Keys to move</p>
        <p>Press SPACE to wait a turn</p>
        <p>Press E to interact</p>
      </div>
    </div>
  );
}