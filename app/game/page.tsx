'use client';

import dynamic from 'next/dynamic';

const SimpleGame = dynamic(() => import('@/components/SimpleGame'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="text-green-400 text-2xl animate-pulse">Loading DeadGrid...</div>
    </div>
  )
});

export default function GamePage() {
  return <SimpleGame />;
}