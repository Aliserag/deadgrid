'use client';

import dynamic from 'next/dynamic';

const TurnBasedGame = dynamic(() => import('@/components/TurnBasedGame'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="text-red-600 text-3xl animate-pulse">Initializing DeadGrid...</div>
    </div>
  )
});

export default function Home() {
  return <TurnBasedGame />;
}
