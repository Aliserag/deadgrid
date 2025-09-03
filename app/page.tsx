'use client';

import dynamic from 'next/dynamic';

const FinalDeadGrid = dynamic(() => import('@/components/game/FinalDeadGrid'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="text-red-600 text-3xl animate-pulse">Loading DeadGrid...</div>
    </div>
  )
});

export default function Home() {
  return <FinalDeadGrid />;
}
