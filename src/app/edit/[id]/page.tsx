import React, { Suspense } from 'react';
import CharacterForm from '@/app/components/CharacterForm';
import Link from 'next/link';

// このページも動的にレンダリングする必要がある
export const dynamic = 'force-dynamic';

function LoadingComponent() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-lg text-gray-600">フォームを読み込んでいます...</p>
        <Link href="/" className="text-blue-600 hover:underline mt-4 block">ホームに戻る</Link>
      </div>
    </div>
  );
}

export default function EditPage() {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <CharacterForm />
    </Suspense>
  );
}