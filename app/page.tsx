import dynamic from 'next/dynamic';

const PhaserGame = dynamic(() => import('@/components/PhaserGame'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="text-gray-400 text-xl">Loading DeadGrid...</div>
    </div>
  )
});

export default function Home() {
  return <PhaserGame />;
}
