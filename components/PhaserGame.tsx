'use client';

import { useEffect, useRef } from 'react';
import * as Phaser from 'phaser';
import { gameConfig } from '@/lib/phaser/config';

export default function PhaserGame() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined' && containerRef.current && !gameRef.current) {
      gameRef.current = new Phaser.Game({
        ...gameConfig,
        parent: containerRef.current,
      });
    }
    
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <div className="mb-4">
        <h1 className="text-4xl font-bold text-red-600 tracking-wider">DEADGRID</h1>
        <p className="text-gray-400 text-center">Survive the Apocalypse</p>
      </div>
      <div ref={containerRef} className="border-4 border-red-900 shadow-2xl" />
      <div className="mt-4 bg-gray-900 p-4 rounded-lg border border-gray-700">
        <h3 className="text-white font-bold mb-2">Controls:</h3>
        <div className="text-gray-400 text-sm space-y-1">
          <p>🎮 WASD or Arrow Keys - Move</p>
          <p>⚔️ SPACE - Attack</p>
          <p>🤝 E - Interact</p>
          <p>🎒 I - Inventory</p>
          <p>🗺️ M - Toggle Map</p>
          <p>⏸️ ESC - Pause</p>
          <p>🔢 1-5 - Quick Slots</p>
        </div>
      </div>
    </div>
  );
}