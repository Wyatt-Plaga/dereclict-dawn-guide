'use client';

import dynamic from 'next/dynamic';

// Import StateLogger with dynamic import to avoid hydration issues
const StateLogger = dynamic(() => import('@/app/components/StateLogger'), {
  ssr: false,
});

export function StateLoggerWrapper() {
  return <StateLogger />;
}

export default StateLoggerWrapper; 