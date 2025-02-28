import StoreTest from '@/components/testing/StoreTest';
import { StoreBridge } from '@/components/providers/StoreBridge';
import { Suspense } from 'react';

export default function TestPage() {
  return (
    <main className="min-h-screen">
      <Suspense fallback={<div>Loading...</div>}>
        {/* Include StoreBridge to sync context and store */}
        <StoreBridge />
        <StoreTest />
      </Suspense>
    </main>
  );
} 