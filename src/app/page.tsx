"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Character {
  id: string;
  name: string;
  instructions: string;
  voice: string;
  vocabLevel: string;
  responseLength: string;
  learningGoal: string;
}

export default function HomePage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const router = useRouter();

  useEffect(() => {
    loadCharacters();
  }, []);

  const loadCharacters = () => {
    let storedCharacters = localStorage.getItem('characters');
    if (!storedCharacters) {
      const sampleCharacter: Character = {
        id: '1',
        name: 'デフォルトアシスタント',
        instructions: 'You are a helpful assistant.',
        voice: 'alloy',
        vocabLevel: 'jhs',
        responseLength: 'normal',
        learningGoal: 'ユーザーの質問に親切に答える'
      };
      localStorage.setItem('characters', JSON.stringify([sampleCharacter]));
      storedCharacters = JSON.stringify([sampleCharacter]);
    }
    setCharacters(JSON.parse(storedCharacters));
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`キャラクター「${name}」を本当に削除しますか？`)) {
      const updatedCharacters = characters.filter(c => c.id !== id);
      localStorage.setItem('characters', JSON.stringify(updatedCharacters));
      setCharacters(updatedCharacters);
    }
  };
  
  const handleEdit = (id: string) => {
    router.push(`/edit/${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 md:p-8 max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">キャラクターを選択</h1>
          <Link href="/create" className="bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg shadow hover:bg-blue-700 transition-colors">
            新規作成
          </Link>
        </div>

        <div className="space-y-4">
          {characters.length > 0 ? (
            characters.map(char => (
              <div key={char.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-gray-100 p-3 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="font-bold text-xl text-gray-800">{char.name}</h2>
                      <p className="text-sm text-gray-500 mt-1">目標: {char.learningGoal || '未設定'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                     <button onClick={() => handleEdit(char.id)} className="p-2 text-gray-500 rounded-full hover:bg-gray-200 hover:text-gray-700 transition-colors" title="編集">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                         <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" />
                       </svg>
                     </button>
                     <button onClick={() => handleDelete(char.id, char.name)} className="p-2 text-red-500 rounded-full hover:bg-red-100 hover:text-red-700 transition-colors" title="削除">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                         <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                       </svg>
                     </button>
                    <Link href={`/chat/${char.id}`} className="bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-emerald-700 transition-colors ml-2">
                      チャット開始
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center bg-white border border-gray-200 rounded-xl shadow-sm py-16">
              <p className="text-gray-500">キャラクターがいません。「新規作成」から最初のキャラクターを作りましょう！</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}